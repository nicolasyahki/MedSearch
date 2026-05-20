import { useEffect } from 'react';
import { runSync } from '../sync/syncEngine';
import { scheduleBackgroundSync } from '../sync/backgroundSync';

/**
 * Déclenche une sync automatique au retour réseau (fallback si Background Sync indisponible).
 */
export function useAutoSyncOnReconnect(isAuthenticated) {
  useEffect(() => {
    if (!isAuthenticated) return;

    const handleOnline = async () => {
      await scheduleBackgroundSync();
      try {
        await runSync();
      } catch (error) {
        console.warn('[AutoSync] Sync au retour réseau reportée :', error.message);
      }
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [isAuthenticated]);
}

export default useAutoSyncOnReconnect;
