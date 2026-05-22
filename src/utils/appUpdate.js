const SW_RELOAD_KEY = 'medsearch-sw-reloaded';

/**
 * Vérifie les mises à jour du Service Worker et recharge une fois la nouvelle version.
 * Corrige le cas « ancien compte / PIN rapide » qui gardait l'ancien code en cache.
 */
export function setupServiceWorkerUpdates() {
  if (!('serviceWorker' in navigator)) return;

  let reloaded = false;

  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (reloaded || sessionStorage.getItem(SW_RELOAD_KEY) === '1') return;
    reloaded = true;
    sessionStorage.setItem(SW_RELOAD_KEY, '1');
    window.location.reload();
  });

  const checkForUpdates = () => {
    navigator.serviceWorker.ready
      .then((registration) => registration.update())
      .catch(() => {});
  };

  checkForUpdates();
  window.addEventListener('focus', checkForUpdates);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') checkForUpdates();
  });

  // Permet un nouveau reload contrôlé lors d'une future mise à jour
  window.setTimeout(() => sessionStorage.removeItem(SW_RELOAD_KEY), 10000);
}
