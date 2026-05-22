import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import PinInput from '../components/PinInput';
import { IconStethoscope, IconUser, IconRefresh, IconMail } from '@tabler/icons-react';
import { db } from '../db/database';

const FULL_LOGIN_KEY = 'medsearch-require-full-login';

export default function Login({ currentAgent, hasLocalAgent, onLogin, onLoginWithEmailAndPin }) {
  const navigate = useNavigate();
  const [requireFullLogin, setRequireFullLogin] = useState(
    () => sessionStorage.getItem(FULL_LOGIN_KEY) === '1'
  );
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [pinKey, setPinKey] = useState(0);
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const showFullLogin = !hasLocalAgent || requireFullLogin;

  useEffect(() => {
    if (requireFullLogin && currentAgent?.email) {
      setEmail(currentAgent.email);
    }
  }, [requireFullLogin, currentAgent]);

  const handleLocalPinComplete = async (pin) => {
    setError(false);
    setErrorMessage('');

    const success = await onLogin(pin);
    if (success) {
      sessionStorage.removeItem(FULL_LOGIN_KEY);
      // Rechargement léger pour appliquer une éventuelle mise à jour SW (évite l'ancien code en cache)
      if ('serviceWorker' in navigator) {
        const reg = await navigator.serviceWorker.getRegistration();
        await reg?.update().catch(() => {});
      }
      navigate('/', { replace: true });
    } else {
      setError(true);
      setErrorMessage('Code PIN incorrect. Veuillez réessayer.');
      setTimeout(() => setPinKey((prev) => prev + 1), 500);
    }
  };

  const handleFullLoginPinComplete = async (pin) => {
    if (!email.trim()) {
      setErrorMessage('Veuillez saisir votre adresse email.');
      setPinKey((prev) => prev + 1);
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');
    setError(false);

    try {
      await onLoginWithEmailAndPin(email.trim(), pin);
      setRequireFullLogin(false);
      if ('serviceWorker' in navigator) {
        const reg = await navigator.serviceWorker.getRegistration();
        await reg?.update().catch(() => {});
      }
      navigate('/', { replace: true });
    } catch (err) {
      setError(true);
      setErrorMessage(err.message || 'Email ou code PIN incorrect.');
      setTimeout(() => setPinKey((prev) => prev + 1), 500);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = async () => {
    const confirmReset = window.confirm(
      "Voulez-vous réinitialiser cet appareil ? Vous pourrez ensuite vous connecter avec un autre compte."
    );
    if (confirmReset) {
      try {
        await db.agents.clear();
        await db.consultations.clear();
        sessionStorage.removeItem(FULL_LOGIN_KEY);
        window.location.reload();
      } catch (err) {
        console.error('Erreur de réinitialisation :', err);
      }
    }
  };

  const displayName = currentAgent
    ? `${currentAgent.prenom || ''} ${currentAgent.nom || ''}`.trim()
    : 'Agent de santé';

  return (
    <div className="min-h-screen bg-bg-app flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm bg-bg-card p-8 rounded-2xl border border-border-strong shadow-lg flex flex-col items-center">

        <div className="w-16 h-16 bg-primary-muted rounded-full flex items-center justify-center mb-6">
          <IconStethoscope size={32} className="text-primary" />
        </div>

        <h1 className="text-2xl font-bold text-text-primary mb-1 text-center">MedSearch</h1>
        <p className="text-text-secondary text-sm mb-8 text-center">
          {showFullLogin ? 'Connexion à votre compte' : 'Accès sécurisé'}
        </p>

        {showFullLogin ? (
          <>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!email.trim()) setErrorMessage('Veuillez saisir votre adresse email.');
              }}
              className="w-full mb-6"
            >
              <label className="block text-sm font-medium text-text-secondary mb-1.5">Adresse email</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-text-secondary">
                  <IconMail size={18} />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-bg-input border border-border-strong rounded-xl py-3 pl-11 pr-4 text-text-primary focus:border-primary outline-none transition-colors"
                  placeholder="votre.email@sante.gov"
                  autoFocus
                />
              </div>
            </form>

            <h2 className="text-lg font-medium text-text-primary mb-2 text-center">Saisissez votre code PIN</h2>
            {isSubmitting ? (
              <div className="flex flex-col items-center justify-center p-4 space-y-3">
                <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                <span className="text-sm text-primary font-medium">Connexion en cours...</span>
              </div>
            ) : (
              <PinInput key={pinKey} onComplete={handleFullLoginPinComplete} error={error} />
            )}
          </>
        ) : (
          <>
            <div className="bg-bg-input w-full p-4 rounded-xl flex items-center gap-3 mb-8 border border-border-strong">
              <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center shrink-0">
                <IconUser size={20} className="text-primary" />
              </div>
              <div className="overflow-hidden">
                <p className="text-xs text-text-secondary mb-0.5">Poste enregistré</p>
                <p className="font-medium text-text-primary truncate">{displayName || 'Agent de santé'}</p>
              </div>
            </div>

            <h2 className="text-lg font-medium text-text-primary mb-2 text-center">Saisissez votre code PIN</h2>
            <PinInput key={pinKey} onComplete={handleLocalPinComplete} error={error} />
          </>
        )}

        <div className="h-6 mt-4">
          {errorMessage && (
            <p className="text-danger text-sm text-center">{errorMessage}</p>
          )}
        </div>

        <div className="mt-6 pt-4 border-t border-border-strong w-full flex flex-col items-center gap-3">
          {!hasLocalAgent ? (
            <p className="text-sm text-text-secondary text-center">
              Pas encore de compte ?{' '}
              <Link to="/register" className="text-primary hover:underline font-medium">
                S'inscrire
              </Link>
            </p>
          ) : showFullLogin ? (
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-1.5 text-xs text-text-secondary hover:text-danger hover:underline transition-colors bg-transparent border-none cursor-pointer"
            >
              <IconRefresh size={14} />
              Changer de compte sur cet appareil
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                sessionStorage.setItem(FULL_LOGIN_KEY, '1');
                setRequireFullLogin(true);
                if (currentAgent?.email) setEmail(currentAgent.email);
              }}
              className="text-xs text-text-secondary hover:text-primary hover:underline transition-colors bg-transparent border-none cursor-pointer"
            >
              Connexion avec email
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
