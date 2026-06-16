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

// --- BACKGROUND SYNC ---
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-scores') {
    console.log('Rozpoczynam synchronizację w tle (Background Sync)...');
    event.waitUntil(syncData());
  }
});

async function syncData() {
  try {
    // Wysyłamy powiadomienie push, że aplikacja zsynchronizowała dane w tle
    await fetch('https://ntfy.sh/geoquiz-smaga-gabrych-2026', {
        method: 'POST',
        headers: {
            'Title': 'GeoQuiz Sync',
            'Priority': 'default',
            'Tags': 'arrows_counterclockwise,globe_with_meridians'
        },
        body: 'Połączenie przywrócone. Zsynchronizowano wyniki gry w tle!'
    });
    console.log('Background Sync: Dane zsynchronizowane pomyślnie!');
  } catch (err) {
    console.error('Background Sync - błąd synchronizacji:', err);
  }
}
