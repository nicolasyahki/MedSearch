// Service Worker MedSearch — offline-first, Background Sync, Push Notifications

const CACHE_NAME = 'medsearch-assets-v7';
const DATA_CACHE_NAME = 'medsearch-data-v7';
const BACKGROUND_SYNC_TAG = 'medsearch-sync-consultations';
const DB_NAME = 'MedSearchDatabase';
const DEFAULT_API_BASE = 'https://Nicolas60.pythonanywhere.com/api';

let cachedApiBaseUrl = DEFAULT_API_BASE;

const MEDICAL_JSON = [
  '/data/index.json',
  '/data/chroniques.json',
  '/data/dermatologiques.json',
  '/data/digestives.json',
  '/data/gyneco.json',
  '/data/infectieuses.json',
  '/data/nutritionnelles.json',
  '/data/respiratoires.json',
];

const BASE_ASSETS = ['/', '/index.html', '/manifest.json', '/icon-192x192.png', '/icon-512x512.png'];
const viteAssets = self.__WB_MANIFEST || [];
const compiledAssets = viteAssets.map((asset) => (typeof asset === 'string' ? asset : asset.url));
const assetsToPrecache = [...BASE_ASSETS, ...compiledAssets];

function openDexieDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

function readAllFromStore(db, storeName) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

function updateConsultation(db, id, changes) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction('consultations', 'readwrite');
    const store = tx.objectStore('consultations');
    const getReq = store.get(id);
    getReq.onsuccess = () => {
      const current = getReq.result;
      if (!current) {
        resolve(false);
        return;
      }
      store.put({ ...current, ...changes });
    };
    getReq.onerror = () => reject(getReq.error);
    tx.oncomplete = () => resolve(true);
    tx.onerror = () => reject(tx.error);
  });
}

function addSyncConflict(db, conflict) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction('syncConflicts', 'readwrite');
    tx.objectStore('syncConflicts').add(conflict);
    tx.oncomplete = () => resolve(true);
    tx.onerror = () => reject(tx.error);
  });
}

async function runConsultationSync() {
  const db = await openDexieDb();
  const agents = await readAllFromStore(db, 'agents');
  const agent = agents[0];
  const token = agent?.syncToken;
  const apiBase = agent?.apiBaseUrl || cachedApiBaseUrl || DEFAULT_API_BASE;

  if (!token) {
    throw new Error('Token de synchronisation absent.');
  }

  const consultations = await readAllFromStore(db, 'consultations');
  const pending = consultations.filter((item) => item.statutSync === 'attente');

  if (pending.length === 0) {
    return { syncedCount: 0 };
  }

  const response = await fetch(`${apiBase}/consultations/sync/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(pending),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || 'Échec de synchronisation réseau.');
  }

  if (Array.isArray(data.synced_ids)) {
    for (const id of data.synced_ids) {
      const meta = data.server_meta?.[String(id)] || {};
      await updateConsultation(db, id, {
        statutSync: 'synced',
        serverId: meta.server_id,
        version: meta.version,
      });
    }
  }

  if (Array.isArray(data.conflicts)) {
    for (const conflict of data.conflicts) {
      if (conflict.resolution === 'server_wins' && conflict.server_record) {
        await updateConsultation(db, conflict.id_local, {
          patientRef: conflict.server_record.nom_patient,
          age: conflict.server_record.age_patient,
          sexe: conflict.server_record.sexe_patient,
          poids: conflict.server_record.poids_patient,
          zone: conflict.server_record.zone,
          symptomes: conflict.server_record.symptomes_saisis,
          diagnosticId: conflict.server_record.diagnostic_retenu,
          score: conflict.server_record.score_diagnostic,
          signesDanger: conflict.server_record.signes_danger,
          date: conflict.server_record.date_consultation,
          updatedAt: conflict.server_record.updated_at_client,
          version: conflict.server_record.version,
          serverId: conflict.server_record.id,
          statutSync: 'synced',
        });
        continue;
      }

      await updateConsultation(db, conflict.id_local, { statutSync: 'conflit' });
      await addSyncConflict(db, {
        consultationId: conflict.id_local,
        clientUuid: conflict.client_uuid,
        localSnapshot: conflict.local_record,
        serverSnapshot: conflict.server_record,
        detectedAt: new Date().toISOString(),
        resolved: false,
      });
    }
  }

  return { syncedCount: data.synced_ids?.length || 0 };
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    Promise.all([
      caches.open(CACHE_NAME).then((cache) => cache.addAll(assetsToPrecache).catch(() => {})),
      caches.open(DATA_CACHE_NAME).then((cache) => cache.addAll(MEDICAL_JSON).catch(() => {})),
    ]).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== DATA_CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      )
    ).then(() => self.clients.claim())
  );
});

/** Réseau d'abord pour le code app — évite de garder d'anciens bundles JS après un déploiement Vercel. */
async function networkFirst(request, cacheName) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse?.status === 200) {
      const cache = await caches.open(cacheName);
      await cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    if (request.mode === 'navigate') {
      return caches.match('/index.html') || caches.match('/');
    }
    return undefined;
  }
}

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SET_API_BASE_URL') {
    cachedApiBaseUrl = event.data.apiBaseUrl || DEFAULT_API_BASE;
  }
});

self.addEventListener('sync', (event) => {
  if (event.tag === BACKGROUND_SYNC_TAG) {
    event.waitUntil(
      runConsultationSync()
        .then((result) => {
          console.log('[SW] Background Sync terminé :', result);
          if (result.syncedCount > 0) {
            return self.registration.showNotification('MedSearch', {
              body: `${result.syncedCount} consultation(s) synchronisée(s) en arrière-plan.`,
              icon: '/icon-192x192.png',
              badge: '/icon-192x192.png',
              tag: 'medsearch-sync-success',
            });
          }
        })
        .catch((error) => {
          console.error('[SW] Background Sync échoué :', error);
          throw error;
        })
    );
  }
});

self.addEventListener('push', (event) => {
  let payload = { title: 'MedSearch', body: 'Nouvelle alerte sanitaire.' };

  if (event.data) {
    try {
      payload = event.data.json();
    } catch {
      payload.body = event.data.text();
    }
  }

  event.waitUntil(
    self.registration.showNotification(payload.title || 'MedSearch', {
      body: payload.body || '',
      icon: '/icon-192x192.png',
      badge: '/icon-192x192.png',
      tag: payload.tag || 'medsearch-push',
      data: payload.data || {},
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if ('focus' in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      return self.clients.openWindow(targetUrl);
    })
  );
});

function isViteDevRequest(url) {
  return (
    url.pathname.startsWith('/@') ||
    url.pathname.startsWith('/src/') ||
    url.pathname.includes('/node_modules/.vite/') ||
    url.pathname.includes('/@fs/')
  );
}

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET' || !event.request.url.startsWith(self.location.origin)) {
    return;
  }

  const url = new URL(event.request.url);

  // Ne jamais intercepter Vite en dev (évite deux copies de React en cache)
  if (isViteDevRequest(url)) {
    return;
  }

  if (url.pathname.startsWith('/data/')) {
    event.respondWith(
      caches.open(DATA_CACHE_NAME).then((cache) =>
        cache.match(event.request).then((cachedResponse) => {
          const fetchPromise = fetch(event.request)
            .then((networkResponse) => {
              if (networkResponse?.status === 200) {
                cache.put(event.request, networkResponse.clone());
              }
              return networkResponse;
            })
            .catch(() => undefined);
          return cachedResponse || fetchPromise;
        })
      )
    );
    return;
  }

  const isHashedBuildAsset = url.pathname.match(/\/assets\/[^/]+\.(js|css)$/);
  const isAppShell =
    event.request.mode === 'navigate' ||
    url.pathname === '/' ||
    url.pathname === '/index.html' ||
    url.pathname.match(/\/assets\/[^/]+\.(js|css)$/);

  if (isAppShell || isHashedBuildAsset) {
    event.respondWith(networkFirst(event.request, CACHE_NAME));
    return;
  }

  event.respondWith(
    fetch(event.request).catch(() =>
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) return cachedResponse;
        if (event.request.mode === 'navigate') {
          return caches.match('/index.html') || caches.match('/');
        }
      })
    )
  );
});
