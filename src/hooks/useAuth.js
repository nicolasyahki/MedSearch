import { useState, useEffect } from 'react';
import { db } from '../db/database';
import { syncService } from '../api/syncService';
import { subscribeToPushNotifications } from './usePushNotifications';
import { hashPin } from '../utils/pinHash';

async function trySubscribePush(token) {
  if (!token) return;
  try {
    await subscribeToPushNotifications(token);
  } catch (error) {
    console.warn('[Push] Abonnement non activé :', error.message);
  }
}

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasAgent, setHasAgent] = useState(null); // null = chargement, true/false
  const [currentAgent, setCurrentAgent] = useState(null);

  // Vérifie l'existence d'un agent au montage
  useEffect(() => {
    checkAgent();
  }, []);

  /**
   * Vérifie si un agent existe dans la base de données Dexie
   */
  const checkAgent = async () => {
    try {
      const agents = await db.agents.toArray();
      if (agents.length > 0) {
        setHasAgent(true);
        setCurrentAgent(agents[0]);
      } else {
        setHasAgent(false);
        setCurrentAgent(null);
      }
    } catch (error) {
      console.error("Erreur lors de la vérification de l'agent", error);
      setHasAgent(false);
    }
  };

  /**
   * Enregistre le premier et unique agent sur l'appareil et sur le serveur
   */
  const registerAgent = async (nom, prenom, zone, pin, email) => {
    try {
      const agentsCount = await db.agents.count();
      if (agentsCount > 0) {
        throw new Error("Un agent est déjà enregistré sur cet appareil.");
      }

      const hashedPin = hashPin(pin);
      let syncToken = null;
      let refreshToken = null;

      // Inscription sur le serveur central obligatoire (nécessite d'être en ligne)
      if (!navigator.onLine) {
        throw new Error("Une connexion Internet est obligatoire pour enregistrer votre compte sur le serveur central.");
      }

      try {
        const backendResult = await syncService.register({ nom, prenom, zone, pin, email });
        if (backendResult && backendResult.tokens) {
          syncToken = backendResult.tokens.access;
          refreshToken = backendResult.tokens.refresh;
          console.log("Agent enregistré sur le backend avec succès, tokens reçus.");
        } else {
          throw new Error("Le serveur central n'a pas retourné de jetons d'accès.");
        }
      } catch (backendError) {
        console.error("Échec de l'inscription sur le serveur central:", backendError);
        // On affiche un message d'erreur clair contenant l'URL de l'API pour faciliter le diagnostic
        throw new Error(`Échec de l'inscription sur le serveur (${syncService.apiBaseUrl}) : ${backendError.message}`);
      }

      const newAgent = {
        email: email,
        nom: nom,
        prenom: prenom,
        zone: zone,
        pin: hashedPin,
        syncToken: syncToken,
        refreshToken: refreshToken,
        dateCreation: new Date().toISOString()
      };

      await db.agents.add(newAgent);
      await checkAgent();
      setIsAuthenticated(true);
      await trySubscribePush(syncToken);
      return true;
    } catch (error) {
      console.error("Erreur d'enregistrement", error);
      throw error;
    }
  };

  /**
   * Connexion par email + PIN (nouvel appareil ou après déconnexion complète).
   */
  const loginWithEmailAndPin = async (email, pin) => {
    const agents = await db.agents.toArray();

    if (agents.length > 0) {
      const agent = agents[0];
      if (agent.email?.toLowerCase() !== email.trim().toLowerCase()) {
        throw new Error("Cet email ne correspond pas au compte enregistré sur cet appareil.");
      }
      const success = await loginAgent(pin);
      if (!success) {
        throw new Error('Code PIN incorrect.');
      }
      sessionStorage.removeItem('medsearch-require-full-login');
      return true;
    }

    await loginExistingAccount(email, pin);
    sessionStorage.removeItem('medsearch-require-full-login');
    return true;
  };

  /**
   * Connecte un agent existant sur le serveur et enregistre le poste local.
   * Nécessite une connexion réseau pour la première connexion sur cet appareil.
   */
  const loginExistingAccount = async (email, pin) => {
    try {
      const agentsCount = await db.agents.count();
      if (agentsCount > 0) {
        throw new Error('Un agent est déjà enregistré sur cet appareil.');
      }

      if (!navigator.onLine) {
        throw new Error('Connexion Internet requise pour lier votre compte à cet appareil.');
      }

      const loginResult = await syncService.login(email, pin);
      if (!loginResult?.agent || !loginResult?.tokens) {
        throw new Error('Réponse serveur invalide.');
      }

      const { agent, tokens } = loginResult;
      const hashedPin = hashPin(pin);

      await db.agents.add({
        email: agent.email,
        nom: agent.nom,
        prenom: agent.prenom,
        zone: agent.zone,
        pin: hashedPin,
        syncToken: tokens.access,
        refreshToken: tokens.refresh,
        dateCreation: agent.date_creation || new Date().toISOString(),
      });

      await checkAgent();
      setIsAuthenticated(true);
      await trySubscribePush(tokens.access);
      return true;
    } catch (error) {
      console.error('Erreur de connexion serveur', error);
      throw new Error(`Échec de la connexion au serveur (${syncService.apiBaseUrl}) : ${error.message}`);
    }
  };

  /**
   * Connecte l'agent en vérifiant son code PIN localement (offline)
   * et renouvelle le token JWT en tâche de fond si connecté au réseau.
   */
  const loginAgent = async (pin) => {
    try {
      const agents = await db.agents.toArray();
      if (agents.length === 0) throw new Error("Aucun agent enregistré.");

      const agent = agents[0];
      const hashedPin = hashPin(pin);

      // Comparaison du hash de sécurité
      if (agent.pin === hashedPin || agent.pin === pin) {
        setIsAuthenticated(true);
        sessionStorage.removeItem('medsearch-require-full-login');

        // Si l'appareil est connecté à Internet, on récupère un nouveau token JWT
        if (navigator.onLine && agent.email) {
          try {
            const loginResult = await syncService.login(agent.email, pin);
            if (loginResult && loginResult.tokens) {
              await db.agents.update(agent.id, {
                syncToken: loginResult.tokens.access,
                refreshToken: loginResult.tokens.refresh
              });
              
              // Mettre à jour le profil agent en mémoire avec ses nouveaux tokens
              setCurrentAgent({
                ...agent,
                syncToken: loginResult.tokens.access,
                refreshToken: loginResult.tokens.refresh
              });
              console.log("Tokens JWT renouvelés avec succès depuis le serveur Django.");
              await trySubscribePush(loginResult.tokens.access);
            }
          } catch (jwtError) {
            console.warn("Connexion en ligne échouée, conservation des tokens JWT actuels :", jwtError.message);
          }
        }

        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error("Erreur de connexion", error);
      return false;
    }
  };

  /**
   * Déconnexion complète : retour à l'écran de connexion (email + PIN), pas au déverrouillage rapide.
   */
  const logout = () => {
    setIsAuthenticated(false);
    sessionStorage.setItem('medsearch-require-full-login', '1');
  };

  const updateAgent = (updatedAgent) => {
    setCurrentAgent(updatedAgent);
  };

  return {
    isAuthenticated,
    hasAgent,
    currentAgent,
    registerAgent,
    loginAgent,
    loginExistingAccount,
    loginWithEmailAndPin,
    logout,
    updateAgent,
    checkAgent
  };
}
