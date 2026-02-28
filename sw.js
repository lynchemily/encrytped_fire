const CACHE_NAME = 'fire-tracker-v1';

// The files we want to save for offline use
const FILES_TO_CACHE = [
    './index.html',
    './manifest.json',
    // We MUST cache the SheetJS library so Excel downloads work offline!
    'https://cdn.sheetjs.com/xlsx-latest/package/dist/xlsx.full.min.js'
];

// 1. Install Event: Save files to the device
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('[ServiceWorker] Pre-caching offline page');
            return cache.addAll(FILES_TO_CACHE);
        })
    );
    self.skipWaiting();
});

// 2. Activate Event: Clean up old caches if we update the app
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keyList) => {
            return Promise.all(keyList.map((key) => {
                if (key !== CACHE_NAME) {
                    console.log('[ServiceWorker] Removing old cache', key);
                    return caches.delete(key);
                }
            }));
        })
    );
    self.clients.claim();
});

// 3. Fetch Event: Serve the offline files when there is no internet
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            // Return the cached file if we have it, otherwise try the network
            return response || fetch(event.request);
        })
    );
});