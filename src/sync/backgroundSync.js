export const BACKGROUND_SYNC_TAG = 'medsearch-sync-consultations';

/**
 * Planifie une synchronisation en arrière-plan via le Service Worker.
 * Retombe silencieusement si l'API Background Sync n'est pas supportée.
 */
export async function scheduleBackgroundSync() {
  if (!('serviceWorker' in navigator)) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.ready;

    if ('sync' in registration) {
      await registration.sync.register(BACKGROUND_SYNC_TAG);
      console.log('[BackgroundSync] Synchronisation planifiée.');
      return true;
    }
  } catch (error) {
    console.warn('[BackgroundSync] Non disponible sur cet appareil :', error.message);
  }

  return false;
}

/**
 * Persiste l'URL API pour que le Service Worker puisse synchroniser hors UI.
 */
export async function persistApiBaseUrl(apiBaseUrl) {
  if (!('serviceWorker' in navigator)) return;

  const registration = await navigator.serviceWorker.ready;
  const worker = registration.active || registration.waiting || registration.installing;
  if (!worker) return;

  worker.postMessage({ type: 'SET_API_BASE_URL', apiBaseUrl });
}
