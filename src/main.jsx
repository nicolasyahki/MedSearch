import './index.css';

const DEV_CACHE_RELOAD_KEY = 'medsearch-dev-cache-reload';

async function clearDevServiceWorker() {
  if (!import.meta.env.DEV || !('serviceWorker' in navigator)) {
    return false;
  }

  const registrations = await navigator.serviceWorker.getRegistrations();
  const hadSw = registrations.length > 0;
  await Promise.all(registrations.map((registration) => registration.unregister()));

  let hadCaches = false;
  if ('caches' in window) {
    const keys = await caches.keys();
    hadCaches = keys.length > 0;
    await Promise.all(keys.map((key) => caches.delete(key)));
  }

  return hadSw || hadCaches;
}

async function bootstrap() {
  const cleaned = await clearDevServiceWorker();
  if (cleaned && sessionStorage.getItem(DEV_CACHE_RELOAD_KEY) !== 'done') {
    sessionStorage.setItem(DEV_CACHE_RELOAD_KEY, 'done');
    window.location.reload();
    return;
  }
  sessionStorage.removeItem(DEV_CACHE_RELOAD_KEY);

  const [{ default: React }, ReactDOMClient, { default: App }] = await Promise.all([
    import('react'),
    import('react-dom/client'),
    import('./App.jsx'),
  ]);

  const { persistApiBaseUrl } = await import('./sync/backgroundSync');
  const { syncService } = await import('./api/syncService');

  if (!import.meta.env.DEV && 'serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then(() => persistApiBaseUrl(syncService.apiBaseUrl))
      .catch((error) => console.warn('[SW] Initialisation ignorée :', error.message));
  }

  ReactDOMClient.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
}

bootstrap().catch((error) => {
  console.error('[MedSearch] Échec du démarrage :', error);
  const root = document.getElementById('root');
  if (root) {
    root.innerHTML =
      '<p style="color:#E8EDF3;font-family:system-ui;padding:2rem">Erreur au chargement. Rechargez la page (Ctrl+Shift+R).</p>';
  }
});
