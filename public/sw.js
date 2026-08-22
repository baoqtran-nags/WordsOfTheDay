// Service Worker for Words of the Day (WOTD)
// Cache daily words, static assets, and shell for full offline functionality

const CACHE_NAME = 'wotd-cache-v2';
const STATIC_ASSETS = [
  './',
  './index.html',
  './icon.svg',
  './manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        return Promise.allSettled(
          STATIC_ASSETS.map((asset) => cache.add(asset).catch(() => {}))
        );
      })
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((name) => {
            if (name !== CACHE_NAME) {
              return caches.delete(name);
            }
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Skip non-http schemes, dev websockets, and Vite internal dev routes
  if (
    !url.protocol.startsWith('http') ||
    url.pathname.includes('/@vite') ||
    url.pathname.includes('/@react') ||
    url.pathname.includes('/@fs') ||
    url.pathname.startsWith('/__vite')
  ) {
    return;
  }

  // Navigation requests (HTML document loads): Network-first with cache fallback
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const copy = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, copy);
            });
          }
          return networkResponse;
        })
        .catch(async () => {
          const cached = await caches.match(event.request);
          if (cached) return cached;
          const fallback = await caches.match('./index.html');
          if (fallback) return fallback;
          return new Response('<h1>Offline - Please reconnect to Internet</h1>', {
            headers: { 'Content-Type': 'text/html; charset=utf-8' },
          });
        })
    );
    return;
  }

  // Static assets (CSS, JS, Fonts, Images): Cache-first with network revalidation
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Fetch in background to revalidate cache
        fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const copy = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
            }
          })
          .catch(() => {});
        return cachedResponse;
      }

      return fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const copy = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          }
          return networkResponse;
        })
        .catch(() => {
          return new Response('', { status: 408, statusText: 'Request Timeout (Offline)' });
        });
    })
  );
});
