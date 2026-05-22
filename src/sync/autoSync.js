import { db } from '../db/database';
import { runSync } from './syncEngine';
import { scheduleBackgroundSync } from './backgroundSync';

export const SYNC_COMPLETE_EVENT = 'medsearch-sync-complete';

let syncInFlight = null;

/**
 * Lance une synchronisation automatique (dédupliquée si déjà en cours).
 * Émet SYNC_COMPLETE_EVENT pour rafraîchir l'UI (ex. historique).
 */
export async function triggerAutoSync() {
  if (!navigator.onLine) {
    await scheduleBackgroundSync();
    return { ok: false, reason: 'offline' };
  }

  if (syncInFlight) return syncInFlight;

  syncInFlight = (async () => {
    try {
      const result = await runSync({ forceOnline: true });
      window.dispatchEvent(new CustomEvent(SYNC_COMPLETE_EVENT, { detail: result }));
      return result;
    } catch (error) {
      const fail = { ok: false, error: error.message };
      window.dispatchEvent(new CustomEvent(SYNC_COMPLETE_EVENT, { detail: fail }));
      await scheduleBackgroundSync();
      return fail;
    } finally {
      syncInFlight = null;
    }
  })();

  return syncInFlight;
}

export async function hasPendingSync() {
  return db.consultations.where('statutSync').equals('attente').count();
}
