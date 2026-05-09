const CACHE_NAME = 'flashcardz-v8';
const assets = [
  './',
  './index.html',
  './manifest.json',
  './favicon.ico',
  './FlashCardZ.png',
  'https://cdn.tailwindcss.com',
  'https://unpkg.com/react@18/umd/react.production.min.js',
  'https://unpkg.com/react-dom@18/umd/react-dom.production.min.js',
  'https://unpkg.com/@babel/standalone/babel.min.js',
  'https://unpkg.com/framer-motion@11.18.2/dist/framer-motion.js',
  'https://unpkg.com/lucide-react@0.344.0/dist/umd/lucide-react.min.js',
  'https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css',
  'https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Caching essential assets...');
      return Promise.allSettled(
        assets.map(async (url) => {
          try {
            const response = await fetch(url, { mode: 'no-cors' }); // External CDNs ke liye zaroori hai
            return await cache.put(url, response);
          } catch (err) {
            console.error('Failed to cache:', url, err);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;

      return fetch(event.request).then((networkResponse) => {
        // Agar koi nayi file milay toh usey bhi cache mein dal dein
        if (event.request.url.startsWith('http')) {
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
        }
        return networkResponse;
      }).catch(() => {
        // Bilkul hi kuch na milay (Offline)
        return caches.match('./index.html');
      });
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)));
    })
  );
});
