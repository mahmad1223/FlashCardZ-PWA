const CACHE_NAME = 'flashcardz-v10';
const STATIC_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './favicon.ico',
  './FlashCardZ.png',
  './react.production.min.js',
  './react-dom.production.min.js',
  './babel.min.js',
  './tailwind.min.js'
];

self.addEventListener('install', (event) => {
  self.skipWaiting(); 
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Caching all local assets...');
      return cache.addAll(STATIC_ASSETS);
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // 1. Agar cache mein hai toh wahi de do (Fastest!)
      if (cachedResponse) return cachedResponse;

      // 2. Nahi hai toh network se lo aur save karo
      return fetch(event.request).then((networkResponse) => {
        if (networkResponse.ok && event.request.url.startsWith('http')) {
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
        }
        return networkResponse;
      });
    })
  );
});
