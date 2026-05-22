import { useEffect } from 'react';
import { runSync } from '../sync/syncEngine';
import { scheduleBackgroundSync } from '../sync/backgroundSync';

/**
 * Déclenche une sync automatique au retour réseau, au focus et au montage de l'application.
 */
export function useAutoSyncOnReconnect(isAuthenticated) {
  useEffect(() => {
    if (!isAuthenticated) return;

    const triggerSync = async () => {
      if (navigator.onLine) {
        await scheduleBackgroundSync();
        try {
          await runSync();
        } catch (error) {
          console.warn('[AutoSync] Échec ou report de la synchronisation automatique :', error.message);
        }
      }
    };

    // 1. Déclenchement immédiat au montage (si en ligne)
    triggerSync();

    // 2. Déclenchement au retour au focus de l'application (changement d'onglet ou réouverture)
    window.addEventListener('focus', triggerSync);

    // 3. Déclenchement lors du retour réseau
    window.addEventListener('online', triggerSync);

    return () => {
      window.removeEventListener('focus', triggerSync);
      window.removeEventListener('online', triggerSync);
    };
  }, [isAuthenticated]);
}

export default useAutoSyncOnReconnect;
