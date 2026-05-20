import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PinInput from '../components/PinInput';
import { IconStethoscope, IconRefresh } from '@tabler/icons-react';
import { db } from '../db/database';


/**
 * Page d'enregistrement initiale (Affiche uniquement si la DB est vide).
 */
export default function Register({ onRegister }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ nom: '', prenom: '', zone: '', email: '' });
  const [step, setStep] = useState(1); // Étape 1: Infos, 2: PIN, 3: Confirmer PIN
  const [pin1, setPin1] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validation de la première étape
  const handleInfoSubmit = (e) => {
    e.preventDefault();
    if (formData.nom && formData.prenom && formData.zone && formData.email) {
      setStep(2);
      setError('');
    } else {
      setError("Veuillez remplir tous les champs.");
    }
  };

  // Enregistrement du premier PIN saisi
  const handlePin1Complete = (pin) => {
    setPin1(pin);
    setStep(3);
    setError('');
  };

  // Vérification de la confirmation du PIN et enregistrement final
  const handlePin2Complete = async (pin2) => {
    if (isSubmitting) return;
    if (pin1 === pin2) {
      setIsSubmitting(true);
      setError('');
      try {
        await onRegister(formData.nom, formData.prenom, formData.zone, pin1, formData.email);
        navigate('/'); // Redirection vers l'application
      } catch (err) {
        setIsSubmitting(false);
        setError(err.message || "Erreur lors de l'enregistrement. Veuillez réessayer.");
      }
    } else {
      setError("Les codes PIN ne correspondent pas. Réessayez.");
      setStep(2); // Retour à la première saisie
      setPin1('');
    }
  };


  // Réinitialisation du profil local si bloqué
  const handleReset = async () => {
    const confirmReset = window.confirm(
      "Voulez-vous réinitialiser l'application ? Cela effacera toutes les données locales."
    );
    if (confirmReset) {
      try {
        await db.agents.clear();
        await db.consultations.clear();
        console.log("IndexedDB vidée avec succès.");
        window.location.reload();
      } catch (err) {
        console.error("Erreur de réinitialisation :", err);
      }
    }
  };

  return (
    <div className="min-h-screen bg-bg-app flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-bg-card p-8 rounded-2xl border border-border-strong shadow-lg">
        
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-primary-muted rounded-full flex items-center justify-center mb-4">
            <IconStethoscope size={32} className="text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-text-primary text-center">Bienvenue sur MedSearch</h1>
          <p className="text-text-secondary text-sm mt-2 text-center">
            Enregistrement du poste de santé local (1 agent par appareil)
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-danger/10 border border-danger/20 rounded-lg text-danger text-sm text-center">
            {error}
          </div>
        )}

        {/* ÉTAPE 1 : Informations de base */}
        {step === 1 && (
          <form onSubmit={handleInfoSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Prénom</label>
              <input 
                type="text" 
                value={formData.prenom}
                onChange={e => setFormData({...formData, prenom: e.target.value})}
                className="w-full bg-bg-input border border-border-strong rounded-xl p-3 text-text-primary focus:border-primary outline-none transition-colors"
                placeholder="Ex: Jean"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Nom</label>
              <input 
                type="text" 
                value={formData.nom}
                onChange={e => setFormData({...formData, nom: e.target.value})}
                className="w-full bg-bg-input border border-border-strong rounded-xl p-3 text-text-primary focus:border-primary outline-none transition-colors"
                placeholder="Ex: Dupont"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Adresse Email</label>
              <input 
                type="email" 
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
                className="w-full bg-bg-input border border-border-strong rounded-xl p-3 text-text-primary focus:border-primary outline-none transition-colors"
                placeholder="Ex: jean.dupont@sante.gov"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Zone / Village</label>
              <input 
                type="text" 
                value={formData.zone}
                onChange={e => setFormData({...formData, zone: e.target.value})}
                className="w-full bg-bg-input border border-border-strong rounded-xl p-3 text-text-primary focus:border-primary outline-none transition-colors"
                placeholder="Ex: Dispensaire Nord"
              />
            </div>
            <button 
              type="submit"
              className="w-full mt-6 bg-primary hover:bg-primary-light active:bg-primary-dark text-white font-medium py-3 rounded-xl transition-colors min-h-[44px]"
            >
              Continuer
            </button>
          </form>
        )}


        {/* ÉTAPE 2 : Création du PIN */}
        {step === 2 && (
          <div className="flex flex-col items-center animate-in fade-in">
            <h2 className="text-lg font-medium text-text-primary mb-2">Créez votre code PIN</h2>
            <p className="text-sm text-text-secondary mb-4 text-center">
              Ce code à 4 chiffres protégera l'accès à l'application.
            </p>
            {/* Clé modifiée pour forcer le re-render si on revient à cette étape */}
            <PinInput key={`pin1-${pin1.length}`} onComplete={handlePin1Complete} error={false} />
          </div>
        )}

        {/* ÉTAPE 3 : Confirmation du PIN */}
        {step === 3 && (
          <div className="flex flex-col items-center animate-in fade-in">
            <h2 className="text-lg font-medium text-text-primary mb-2">Confirmez le code PIN</h2>
            <p className="text-sm text-text-secondary mb-4 text-center">
              {isSubmitting ? "Création de votre compte sécurisé sur le serveur..." : "Veuillez saisir à nouveau votre code PIN."}
            </p>
            {isSubmitting ? (
              <div className="flex flex-col items-center justify-center p-6 space-y-3">
                <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm text-primary font-medium">Inscription en cours...</span>
              </div>
            ) : (
              <PinInput key="pin-confirm" onComplete={handlePin2Complete} error={!!error} />
            )}
          </div>
        )}

        {/* Bouton de réinitialisation si bloqué */}
        <div className="mt-8 pt-6 border-t border-border-strong flex flex-col items-center gap-4 w-full">
          <div className="bg-bg-input w-full p-4 rounded-xl border border-border flex flex-col items-center text-center">
            <p className="text-sm text-text-primary font-medium mb-2">
              Vous avez déjà un compte (créé sur PC ou ailleurs) ?
            </p>
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="w-full bg-bg-app border border-primary text-primary hover:bg-primary/10 active:bg-primary/20 font-semibold py-2.5 rounded-lg transition-colors cursor-pointer"
            >
              Se connecter à mon compte existant
            </button>
          </div>
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 text-xs text-text-secondary hover:text-danger hover:underline transition-colors cursor-pointer bg-transparent border-none outline-none"
          >
            <IconRefresh size={14} />
            Réinitialiser le poste local
          </button>
        </div>

      </div>
    </div>
  );
}

