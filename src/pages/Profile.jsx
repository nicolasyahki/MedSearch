import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { db } from '../db/database';
import { useSync } from '../hooks/useSync';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { subscribeToPushNotifications } from '../hooks/usePushNotifications';
import { triggerAutoSync } from '../sync/autoSync';
import {
  IconUserCircle,
  IconMapPin,
  IconMail,
  IconHistory,
  IconBell,
  IconCloudUpload,
  IconAlertTriangle,
  IconDeviceMobile,
  IconCheck,
} from '@tabler/icons-react';

export default function Profile({ currentAgent, onLogout, onUpdateAgent }) {
  const navigate = useNavigate();
  const isOnline = useOnlineStatus();
  const { syncData, isSyncing, syncError } = useSync();

  const [zone, setZone] = useState(currentAgent?.zone || '');
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [saveStatus, setSaveStatus] = useState(null); // 'success' or 'error'
  const [pushMessage, setPushMessage] = useState('');
  const [stats, setStats] = useState({ total: 0, pending: 0, synced: 0, conflicts: 0 });
  const [reauthPin, setReauthPin] = useState('');
  const [isReauthorizing, setIsReauthorizing] = useState(false);
  const [reauthError, setReauthError] = useState('');

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    const [total, pending, synced, conflicts] = await Promise.all([
      db.consultations.count(),
      db.consultations.where('statutSync').equals('attente').count(),
      db.consultations.where('statutSync').equals('synced').count(),
      db.consultations.where('statutSync').equals('conflit').count(),
    ]);
    setStats({ total, pending, synced, conflicts });
  };

  const handleSaveZone = async (e) => {
    e.preventDefault();
    if (!currentAgent?.id || !zone.trim()) return;

    setIsSaving(true);
    setSaveMessage('');
    setSaveStatus(null);

    try {
      await db.agents.update(currentAgent.id, { zone: zone.trim() });

      let isSynced = false;
      if (navigator.onLine && currentAgent.syncToken) {
        const { syncService } = await import('../api/syncService');
        await syncService.updateProfile({ zone: zone.trim() }, currentAgent.syncToken);
        isSynced = true;
      }

      onUpdateAgent?.({ ...currentAgent, zone: zone.trim() });
      setSaveStatus('success');
      if (isSynced) {
        setSaveMessage('Zone d\'intervention enregistrée localement et synchronisée avec le serveur.');
      } else {
        setSaveMessage('Zone d\'intervention enregistrée localement (hors ligne). Elle sera synchronisée au retour du réseau.');
      }
    } catch (error) {
      setSaveStatus('error');
      setSaveMessage(error.message || 'Échec de la mise à jour.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReauth = async (e) => {
    if (e) e.preventDefault();
    if (!currentAgent?.email) {
      setReauthError("Aucun email associé à cet agent.");
      return;
    }
    if (reauthPin.length !== 4) {
      setReauthError("Veuillez saisir votre code PIN à 4 chiffres.");
      return;
    }

    setIsReauthorizing(true);
    setReauthError('');

    try {
      const { syncService } = await import('../api/syncService');
      const loginResult = await syncService.login(currentAgent.email, reauthPin);
      
      if (loginResult && loginResult.tokens) {
        await db.agents.update(currentAgent.id, {
          syncToken: loginResult.tokens.access,
          refreshToken: loginResult.tokens.refresh,
          apiBaseUrl: syncService.apiBaseUrl
        });
        
        onUpdateAgent?.({
          ...currentAgent,
          syncToken: loginResult.tokens.access,
          refreshToken: loginResult.tokens.refresh,
          apiBaseUrl: syncService.apiBaseUrl
        });

        setReauthPin('');
        setSaveStatus('success');
        setSaveMessage('Session de synchronisation renouvelée avec succès !');
        await triggerAutoSync();
        await loadStats();
      } else {
        throw new Error('Réponse serveur invalide.');
      }
    } catch (err) {
      console.error('[Reauth] Échec :', err);
      setReauthError(err.message || 'Échec de la connexion. Vérifiez votre connexion Internet et votre code PIN.');
    } finally {
      setIsReauthorizing(false);
    }
  };

  const handleEnablePush = async () => {
    setPushMessage('');
    if (!currentAgent?.syncToken) {
      setPushMessage('Reconnectez-vous en ligne pour activer les notifications.');
      return;
    }

    try {
      const result = await subscribeToPushNotifications(currentAgent.syncToken);
      if (result.ok) {
        setPushMessage('Notifications activées.');
      } else if (result.reason === 'denied') {
        setPushMessage('Permission refusée dans le navigateur.');
      } else {
        setPushMessage('Notifications non supportées sur cet appareil.');
      }
    } catch (error) {
      setPushMessage(error.message);
    }
  };

  const handleSync = async () => {
    const ok = await syncData();
    if (ok) await loadStats();
  };

  const fullName = `${currentAgent?.prenom || ''} ${currentAgent?.nom || ''}`.trim() || 'Agent';

  return (
    <div className="min-h-screen bg-bg-app flex flex-col">
      <Navbar onLogout={onLogout} />

      <main className="flex-1 max-w-2xl w-full mx-auto p-4 pt-8 animate-in fade-in">
        <div className="bg-bg-card border border-border-strong rounded-2xl overflow-hidden shadow-sm mb-6">
          <div className="p-6 border-b border-border-strong bg-bg-hover/30 flex items-center gap-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <IconUserCircle size={40} className="text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-text-primary">{fullName}</h1>
              <p className="text-text-secondary text-sm flex items-center gap-1.5 mt-1">
                <IconMapPin size={14} />
                {currentAgent?.zone || 'Zone non définie'}
              </p>
            </div>
          </div>

          <div className="p-6 space-y-4">
            <div className="flex items-center gap-3 text-sm">
              <IconMail size={18} className="text-text-muted" />
              <span className="text-text-secondary">{currentAgent?.email || '—'}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <IconDeviceMobile size={18} className="text-text-muted" />
              <span className="text-text-secondary">
                Appareil {isOnline ? 'en ligne' : 'hors ligne'}
              </span>
            </div>
            {currentAgent?.dateCreation && (
              <p className="text-xs text-text-muted">
                Enregistré le {new Date(currentAgent.dateCreation).toLocaleDateString('fr-FR')}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Total', value: stats.total },
            { label: 'En attente', value: stats.pending, warn: stats.pending > 0 },
            { label: 'Synchronisées', value: stats.synced },
            { label: 'Conflits', value: stats.conflicts, warn: stats.conflicts > 0 },
          ].map((item) => (
            <div key={item.label} className="bg-bg-card border border-border-strong rounded-xl p-4 text-center">
              <p className={`text-2xl font-bold ${item.warn ? 'text-warning' : 'text-text-primary'}`}>
                {item.value}
              </p>
              <p className="text-xs text-text-secondary mt-1">{item.label}</p>
            </div>
          ))}
        </div>

        <div className="bg-bg-card border border-border-strong rounded-2xl p-6 mb-6 space-y-4">
          <h2 className="font-semibold text-text-primary">Zone d'intervention</h2>
          <form onSubmit={handleSaveZone} className="flex flex-col sm:flex-row gap-3">
            <input
              value={zone}
              onChange={(e) => setZone(e.target.value)}
              className="flex-1 bg-bg-input border border-border-strong rounded-xl p-3 text-text-primary focus:border-primary outline-none"
              placeholder="Ex: Nord-Kivu"
            />
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-3 rounded-xl bg-primary text-white hover:bg-primary-light transition-colors font-medium flex items-center justify-center gap-2"
            >
              <IconCheck size={18} />
              Enregistrer
            </button>
          </form>
          {saveMessage && (
            <div className={`p-4 rounded-xl border text-sm flex items-start gap-3 animate-in fade-in ${
              saveStatus === 'success' 
                ? 'bg-primary/10 border-primary/20 text-text-primary' 
                : 'bg-danger/10 border-danger/20 text-danger'
            }`}>
              <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                saveStatus === 'success' ? 'bg-primary/20 text-primary' : 'bg-danger/20 text-danger'
              }`}>
                {saveStatus === 'success' ? <IconCheck size={14} /> : <IconAlertTriangle size={14} />}
              </div>
              <div className="flex-1">
                <p className="font-semibold">{saveStatus === 'success' ? 'Enregistrement réussi' : 'Erreur'}</p>
                <p className="text-xs text-text-secondary mt-0.5">{saveMessage}</p>
              </div>
            </div>
          )}
        </div>

        <div className="bg-bg-card border border-border-strong rounded-2xl p-6 mb-6 space-y-4">
          <h2 className="font-semibold text-text-primary">Synchronisation & alertes</h2>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleSync}
              disabled={isSyncing || !isOnline}
              className="flex-1 px-4 py-3 rounded-xl bg-bg-input border border-border-strong hover:bg-bg-hover transition-colors flex items-center justify-center gap-2 text-text-primary disabled:opacity-50"
            >
              <IconCloudUpload size={18} className="text-primary" />
              {isSyncing ? 'Synchronisation…' : 'Synchroniser maintenant'}
            </button>
            <button
              onClick={handleEnablePush}
              className="flex-1 px-4 py-3 rounded-xl bg-bg-input border border-border-strong hover:bg-bg-hover transition-colors flex items-center justify-center gap-2 text-text-primary"
            >
              <IconBell size={18} className="text-primary" />
              Activer les notifications
            </button>
          </div>

          {syncError && <p className="text-sm text-warning">{syncError}</p>}
          {pushMessage && <p className="text-sm text-text-secondary">{pushMessage}</p>}

          {/* Section reconnexion/renouvellement de session */}
          {(!currentAgent?.syncToken || syncError) && (
            <div className="mt-4 p-4 border border-warning/20 bg-warning/5 rounded-xl space-y-3">
              <p className="text-xs text-warning flex items-start gap-2">
                <IconAlertTriangle size={16} className="shrink-0 mt-0.5" />
                <span>
                  {!currentAgent?.syncToken 
                    ? "Aucune session de synchronisation n'est active sur cet appareil. Vos dossiers restent locaux."
                    : "Votre session de synchronisation a expiré ou a rencontré un problème. Reconnectez-vous pour continuer."}
                </span>
              </p>
              
              <form onSubmit={handleReauth} className="flex flex-col sm:flex-row gap-3 pt-2">
                <input
                  type="password"
                  maxLength={4}
                  pattern="[0-9]*"
                  inputMode="numeric"
                  value={reauthPin}
                  onChange={(e) => setReauthPin(e.target.value)}
                  className="bg-bg-input border border-border-strong rounded-xl px-4 py-2.5 text-center text-text-primary focus:border-primary outline-none tracking-widest text-lg font-bold sm:w-32"
                  placeholder="PIN"
                  required
                />
                <button
                  type="submit"
                  disabled={isReauthorizing}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-primary text-white hover:bg-primary-light transition-colors font-medium text-sm flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {isReauthorizing ? 'Connexion en cours...' : 'Renouveler la session en ligne'}
                </button>
              </form>
              {reauthError && <p className="text-xs text-danger">{reauthError}</p>}
            </div>
          )}

          {stats.conflicts > 0 && (
            <button
              onClick={() => navigate('/sync/conflicts')}
              className="w-full px-4 py-3 rounded-xl border border-warning/30 bg-warning/10 text-warning hover:bg-warning/20 transition-colors flex items-center justify-center gap-2"
            >
              <IconAlertTriangle size={18} />
              Résoudre {stats.conflicts} conflit(s)
            </button>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => navigate('/patients')}
            className="flex-1 px-4 py-3 rounded-xl bg-bg-input border border-border-strong hover:bg-bg-hover transition-colors flex items-center justify-center gap-2 text-text-primary"
          >
            <IconHistory size={18} />
            Historique patients
          </button>
          <button
            onClick={onLogout}
            className="flex-1 px-4 py-3 rounded-xl border border-danger/30 text-danger hover:bg-danger/10 transition-colors font-medium"
          >
            Se déconnecter
          </button>
        </div>
      </main>
    </div>
  );
}
