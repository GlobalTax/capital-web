// Service Worker optimizado para Capittal
// Versión simplificada para evitar problemas de inicialización

const CACHE_NAME = 'capittal-v2';
const STATIC_CACHE = 'capittal-static-v2';

// Recursos críticos para cachear
const CRITICAL_RESOURCES = [
  '/',
  '/manifest.json'
];

// Instalación del service worker
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] Caching critical resources');
        return cache.addAll(CRITICAL_RESOURCES);
      })
      .catch((error) => {
        console.error('[SW] Failed to cache critical resources:', error);
      })
  );
  
  // Activar inmediatamente
  self.skipWaiting();
});

// Activación del service worker
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker');
  
  event.waitUntil(
    Promise.all([
      // Limpiar cachés antiguos
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => {
              return cacheName.startsWith('capittal-') && 
                     cacheName !== CACHE_NAME && 
                     cacheName !== STATIC_CACHE;
            })
            .map((cacheName) => {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            })
        );
      }),
      // Tomar control inmediatamente
      self.clients.claim()
    ])
  );
});

// Estrategia de fetch simplificada
self.addEventListener('fetch', (event) => {
  const { request } = event;
  
  // Solo manejar requests GET
  if (request.method !== 'GET') {
    return;
  }
  
  const url = new URL(request.url);
  
  // Filtrar esquemas no soportados (extensiones del navegador, etc.)
  const unsupportedSchemes = ['chrome-extension:', 'moz-extension:', 'safari-extension:', 'ms-browser-extension:'];
  if (unsupportedSchemes.some(scheme => request.url.startsWith(scheme))) {
    console.log('[SW] Skipping unsupported scheme:', request.url);
    return;
  }
  
  // Solo procesar esquemas HTTP/HTTPS
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    return;
  }
  
  // Evitar cachear APIs externas conocidas
  const isExternalAPI = [
    'supabase.co',
    'googleapis.com',
    'lovable-api.com',
    'cloudfront.net'
  ].some(domain => url.hostname.includes(domain));
  
  if (isExternalAPI) {
    return;
  }
  
  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        // Si está en caché, devolverlo
        if (cachedResponse) {
          return cachedResponse;
        }
        
        // Si no está en caché, fetch y cachear si es necesario
        return fetch(request)
          .then((response) => {
            // Solo cachear respuestas exitosas
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // Cachear recursos estáticos
            const shouldCache = isStaticResource(request.url);
            if (shouldCache) {
              try {
                const responseToCache = response.clone();
                caches.open(CACHE_NAME)
                  .then((cache) => {
                    return cache.put(request, responseToCache);
                  })
                  .catch((error) => {
                    console.warn('[SW] Failed to cache resource:', request.url, error);
                  });
              } catch (error) {
                console.warn('[SW] Error during caching process:', request.url, error);
              }
            }
            
            return response;
          })
          .catch((error) => {
            console.error('[SW] Fetch failed:', error);
            
            // Fallback para navegación
            if (request.destination === 'document') {
              return caches.match('/');
            }
            
            // Fallback para otros recursos
            return new Response('Offline', {
              status: 503,
              statusText: 'Service Unavailable'
            });
          });
      })
  );
});

// Función auxiliar para determinar si un recurso debe ser cacheado
function isStaticResource(url) {
  try {
    const urlObj = new URL(url);
    
    // Solo recursos HTTP/HTTPS
    if (urlObj.protocol !== 'http:' && urlObj.protocol !== 'https:') {
      return false;
    }
    
    // Verificar extensiones estáticas
    const staticExtensions = ['.js', '.css', '.png', '.jpg', '.jpeg', '.svg', '.ico', '.woff', '.woff2'];
    return staticExtensions.some(ext => url.includes(ext));
  } catch (error) {
    console.warn('[SW] Invalid URL for static resource check:', url);
    return false;
  }
}

// Manejo de errores globales del service worker
self.addEventListener('error', (event) => {
  console.error('[SW] Service worker error:', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
  console.error('[SW] Unhandled promise rejection:', event.reason);
});

console.log('[SW] Service worker loaded successfully');