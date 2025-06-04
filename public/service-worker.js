self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open('calculator-cache-v1').then(function(cache) {
      return cache.addAll([
        '/',
        '/index.html',
        '/default.css',
        '/client.js',
        '/digits.png',
        '/background.png',
        '/manifest.json',
        // Add more assets as needed
      ]);
    })
  );
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request).then(function(response) {
      return response || fetch(event.request);
    })
  );
});
