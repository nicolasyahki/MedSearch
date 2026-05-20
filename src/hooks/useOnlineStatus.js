import { useState, useEffect } from 'react';

/**
 * Hook personnalisé pour écouter et retourner l'état de la connexion réseau.
 * Utile pour adapter l'UI en temps réel (boutons désactivés, alertes hors-ligne, etc.).
 * 
 * @returns {boolean} True si l'appareil est connecté à Internet, False sinon.
 */
export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Nettoyage des écouteurs d'événements au démontage
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}

export default useOnlineStatus;
