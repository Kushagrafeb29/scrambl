// Scrambl Service Worker - PWA caching + Monetag push notifications
const CACHE_NAME = 'scrambl-v2';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/word_scrambl_logo.png',
];

// Install: cache shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// Fetch: network-first for navigation, cache-first for assets
self.addEventListener('fetch', (event) => {
  const { request } = event;
  
  // Skip non-GET requests and external APIs
  if (request.method !== 'GET') return;
  if (request.url.includes('firestore.googleapis.com')) return;
  if (request.url.includes('identitytoolkit.googleapis.com')) return;
  if (request.url.includes('ipapi.co')) return;
  if (request.url.includes('dictionaryapi.dev')) return;
  if (request.url.includes('google-analytics.com')) return;
  if (request.url.includes('googletagmanager.com')) return;
  if (request.url.includes('pagead2.googlesyndication.com')) return;
  if (request.url.includes('quge5.com')) return;

  // Navigation requests: network-first
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          return response;
        })
        .catch(() => caches.match('/index.html'))
    );
    return;
  }

  // Static assets: cache-first
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        if (response.ok && (
          request.url.endsWith('.js') || 
          request.url.endsWith('.css') || 
          request.url.endsWith('.png') || 
          request.url.endsWith('.jpg') ||
          request.url.endsWith('.woff2') ||
          request.url.endsWith('.svg')
        )) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return response;
      });
    })
  );
});

// Monetag Push Notifications support
try {
  importScripts('https://quge5.com/pfe/current/service-worker.min.js?r=sw');
} catch(e) {
  // Monetag script may fail in offline mode — that's fine
}
