const CACHE_NAME = 'geoquiz-cache-v3';

const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './manifest.json',
  './logo-192x192.png',
  './logo-512x512.png'
];

self.addEventListener('install', (event) => {
  self.skipWaiting(); 
  
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Zapisywanie plików w cache...');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .catch(() => {
        return caches.match(event.request);
      })
  );
});

self.addEventListener('activate', (event) => {
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

self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-scores') {
    console.log('Rozpoczynam synchronizację w tle (Background Sync)...');
    event.waitUntil(syncData());
  }
});

async function syncData() {
  try {
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
