var CACHE = ‘bbma-scanner-v1’;
var ASSETS = [
‘/fake-insider-bbma-scanner/’,
‘/fake-insider-bbma-scanner/index.html’,
‘/fake-insider-bbma-scanner/manifest.json’,
‘/fake-insider-bbma-scanner/icon-192.png’,
‘/fake-insider-bbma-scanner/icon-512.png’
];

// Install — cache semua asset
self.addEventListener(‘install’, function(e) {
e.waitUntil(
caches.open(CACHE).then(function(cache) {
return cache.addAll(ASSETS);
})
);
self.skipWaiting();
});

// Activate — hapus cache lama
self.addEventListener(‘activate’, function(e) {
e.waitUntil(
caches.keys().then(function(keys) {
return Promise.all(
keys.filter(function(k){ return k !== CACHE; })
.map(function(k){ return caches.delete(k); })
);
})
);
self.clients.claim();
});

// Fetch — network first, fallback ke cache
self.addEventListener(‘fetch’, function(e) {
// Jangan cache request ke Binance API
if (e.request.url.indexOf(‘binance.com’) >= 0) {
e.respondWith(fetch(e.request));
return;
}
e.respondWith(
fetch(e.request)
.then(function(res) {
var clone = res.clone();
caches.open(CACHE).then(function(cache){ cache.put(e.request, clone); });
return res;
})
.catch(function() {
return caches.match(e.request);
})
);
});
