const CACHE_NAME = 'geoquiz-cache-v2';
// Lista plików do zapisania w pamięci offline
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './manifest.json',
  './logo-192x192.png',
  './logo-512x512.png'
];

// Instalacja Service Workera i cacheowanie plików statycznych
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Zapisywanie plików w cache...');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Zwróć z cache, jeśli istnieje
      if (cachedResponse) {
        return cachedResponse;
      }
      // W przeciwnym razie pobierz z sieci
      return fetch(event.request);
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Usuwanie starego cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});