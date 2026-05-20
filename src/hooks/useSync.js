import { useState, useCallback } from 'react';
import { useOnlineStatus } from './useOnlineStatus';
import { runSync } from '../sync/syncEngine';
import { scheduleBackgroundSync } from '../sync/backgroundSync';

export function useSync() {
  const isOnline = useOnlineStatus();
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState(null);

  const syncData = useCallback(async () => {
    if (!isOnline) {
      const scheduled = await scheduleBackgroundSync();
      setSyncError(scheduled
        ? 'Hors ligne — synchronisation planifiée dès le retour réseau.'
        : "L'appareil est hors-ligne. Synchronisation impossible.");
      return false;
    }

    setIsSyncing(true);
    setSyncError(null);

    try {
      const result = await runSync();
      if (result.conflictCount > 0) {
        setSyncError(`${result.conflictCount} conflit(s) détecté(s). Résolution manuelle requise.`);
      }
      setIsSyncing(false);
      return result.ok;
    } catch (error) {
      console.error('[Sync] Erreur :', error);
      setSyncError(error.message || 'Échec de la synchronisation.');
      await scheduleBackgroundSync();
      setIsSyncing(false);
      return false;
    }
  }, [isOnline]);

  return { syncData, isSyncing, syncError, isOnline };
}

export default useSync;
