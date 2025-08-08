// ============= SERVICE WORKER SIMPLIFICADO =============
// Service Worker básico y seguro

const CACHE_NAME = 'capittal-cache-v1';
const STATIC_CACHE = 'capittal-static-v1';

// Recursos básicos para cachear
const STATIC_RESOURCES = [
  '/',
  '/manifest.json'
];

// Instalar SW
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Caching static resources');
        return cache.addAll(STATIC_RESOURCES.filter(Boolean));
      })
      .then(() => self.skipWaiting())
      .catch((error) => {
        console.error('Failed to cache static resources:', error);
      })
  );
});

// Activar SW
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => 
            cacheName.startsWith('capittal-') && 
            cacheName !== CACHE_NAME && 
            cacheName !== STATIC_CACHE
          )
          .map((cacheName) => {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          })
      );
    }).then(() => {
      console.log('Service Worker activated');
      return self.clients.claim();
    })
  );
});

// Manejar requests de forma simple
self.addEventListener('fetch', (event) => {
  // Solo manejar requests GET
  if (event.request.method !== 'GET') {
    return;
  }

  // No cachear requests de API externa
  const url = new URL(event.request.url);
  if (url.hostname.includes('supabase.co') || 
      url.hostname.includes('googleapis.com') ||
      url.hostname.includes('firebaseio.com')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Retornar desde cache si existe
        if (response) {
          return response;
        }

        // Fetch desde la red
        return fetch(event.request)
          .then((response) => {
            // No cachear si no es exitoso
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Cachear solo recursos estáticos
            const responseToCache = response.clone();
            if (event.request.url.match(/\.(js|css|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot|ico)$/)) {
              caches.open(CACHE_NAME)
                .then((cache) => {
                  cache.put(event.request, responseToCache);
                })
                .catch((error) => {
                  console.warn('Failed to cache resource:', error);
                });
            }

            return response;
          })
          .catch(() => {
            // Fallback para navegación offline
            if (event.request.mode === 'navigate') {
              return caches.match('/');
            }
            return new Response('Offline', { status: 503 });
          });
      })
  );
});

// Error handler
self.addEventListener('error', (event) => {
  console.error('Service Worker error:', event.error);
});

// Unhandled rejection handler
self.addEventListener('unhandledrejection', (event) => {
  console.error('Service Worker unhandled rejection:', event.reason);
  event.preventDefault();
});