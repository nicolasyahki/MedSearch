import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useOnlineStatus } from './useOnlineStatus';
import { triggerAutoSync, hasPendingSync } from '../sync/autoSync';

const PERIODIC_SYNC_MS = 15000;

/**
 * Synchronisation automatique tant que l'agent est authentifié et en ligne :
 * montage, focus, retour réseau, visibilité, changement de page, intervalle si dossiers en attente.
 */
export function useAutoSyncOnReconnect(isAuthenticated) {
  const isOnline = useOnlineStatus();
  const location = useLocation();

  useEffect(() => {
    if (!isAuthenticated || !isOnline) return;

    const run = () => triggerAutoSync();

    run();

    const onFocus = () => run();
    const onOnline = () => run();
    const onVisible = () => {
      if (document.visibilityState === 'visible') run();
    };

    window.addEventListener('focus', onFocus);
    window.addEventListener('online', onOnline);
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('online', onOnline);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [isAuthenticated, isOnline]);

  useEffect(() => {
    if (!isAuthenticated || !isOnline) return;
    triggerAutoSync();
  }, [location.pathname, isAuthenticated, isOnline]);

  useEffect(() => {
    if (!isAuthenticated || !isOnline) return;

    const tick = async () => {
      if (await hasPendingSync()) {
        await triggerAutoSync();
      }
    };

    const interval = setInterval(tick, PERIODIC_SYNC_MS);
    return () => clearInterval(interval);
  }, [isAuthenticated, isOnline]);
}

export default useAutoSyncOnReconnect;
