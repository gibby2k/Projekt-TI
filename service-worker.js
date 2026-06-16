const CACHE_NAME = 'geoquiz-cache-v3'; // Zmiana nazwy wymusza aktualizację cache
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

// Instalacja Service Workera
self.addEventListener('install', (event) => {
  // Wymusza natychmiastową aktywację nowego Service Workera
  self.skipWaiting(); 
  
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Zapisywanie plików w cache...');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// Zdarzenie fetch - Strategia Network-First z fallbackiem
self.addEventListener('fetch', (event) => {
  event.respondWith(
    // 1. Najpierw próbujemy pobrać zasób z sieci
    fetch(event.request)
      .catch(() => {
        // 2. Jeśli sieć zawiedzie (np. brak internetu), szukamy w cache
        return caches.match(event.request);
      })
  );
});

// Aktywacja Service Workera i czyszczenie starego cache
self.addEventListener('activate', (event) => {
  // Przejmuje natychmiastową kontrolę nad wszystkimi otwartymi kartami aplikacji
  event.waitUntil(self.clients.claim()); 
  
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
