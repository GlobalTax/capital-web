// Service Worker optimizado para Capittal
// Versión simplificada para evitar problemas de inicialización

const CACHE_NAME = 'capittal-v5';
const STATIC_CACHE = 'capittal-static-v5';

// Recursos críticos para cachear (eliminado '/' del precache)
const CRITICAL_RESOURCES = [
  '/manifest.json'
];

// Instalación del service worker
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(async (cache) => {
        console.log('[SW] Caching critical resources');
        
        // Cache resources individually with error handling
        const cachePromises = CRITICAL_RESOURCES.map(async (resource) => {
          try {
            // Verify resource exists before caching
            const response = await fetch(resource);
            if (response.ok) {
              await cache.put(resource, response);
              console.log(`[SW] Cached: ${resource}`);
            } else {
              console.warn(`[SW] Resource not available: ${resource} (${response.status})`);
            }
          } catch (error) {
            console.warn(`[SW] Failed to cache ${resource}:`, error.message);
          }
        });
        
        await Promise.allSettled(cachePromises);
        console.log('[SW] Critical resources caching completed');
      })
      .catch((error) => {
        console.error('[SW] Failed to open cache:', error);
      })
  );
  
  // Activar inmediatamente
  self.skipWaiting();
});

// Manejo de mensajes para forzar actualización
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('[SW] Received SKIP_WAITING message');
    self.skipWaiting();
  }
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

// Estrategia de fetch mejorada - Network-first para navegación, Cache-first para estáticos
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
  
  // No interceptar APIs externas conocidas
  const isExternalAPI = [
    'supabase.co',
    'googleapis.com',
    'lovable-api.com',
    'cloudfront.net',
    'lovable.dev'
  ].some(domain => url.hostname.includes(domain));
  
  if (isExternalAPI) {
    return;
  }
  
  // Estrategia Network-first para navegación (documentos)
  if (request.destination === 'document') {
    event.respondWith(
      fetch(request, { cache: 'no-store' })
        .then((response) => {
          // Cachear respuesta exitosa
          if (response && response.status === 200 && response.type === 'basic') {
            try {
              const responseToCache = response.clone();
              caches.open(CACHE_NAME)
                .then((cache) => {
                  return cache.put(request, responseToCache);
                })
                .catch((error) => {
                  console.warn('[SW] Failed to cache document:', request.url, error);
                });
            } catch (error) {
              console.warn('[SW] Error during document caching process:', request.url, error);
            }
          }
          return response;
        })
        .catch((error) => {
          console.error('[SW] Network fetch failed for document:', error);
          
          // Fallback a caché para navegación
          return caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            
            // Último fallback - página offline
            return new Response('<!DOCTYPE html><html><head><title>Offline</title></head><body><h1>Sin conexión</h1><p>Por favor, verifica tu conexión a internet.</p></body></html>', {
              status: 503,
              statusText: 'Service Unavailable',
              headers: { 'Content-Type': 'text/html' }
            });
          });
        })
    );
    return;
  }
  
  // Estrategia Cache-first para recursos estáticos
  if (isStaticResource(request.url)) {
    event.respondWith(
      caches.match(request)
        .then((cachedResponse) => {
          // Si está en caché, devolverlo inmediatamente
          if (cachedResponse) {
            return cachedResponse;
          }
          
          // Si no está en caché, fetch y cachear
          return fetch(request)
            .then((response) => {
              // Solo cachear respuestas exitosas
              if (!response || response.status !== 200 || response.type !== 'basic') {
                return response;
              }
              
              try {
                const responseToCache = response.clone();
                caches.open(STATIC_CACHE)
                  .then((cache) => {
                    return cache.put(request, responseToCache);
                  })
                  .catch((error) => {
                    console.warn('[SW] Failed to cache static resource:', request.url, error);
                  });
              } catch (error) {
                console.warn('[SW] Error during static resource caching process:', request.url, error);
              }
              
              return response;
            })
            .catch((error) => {
              console.error('[SW] Fetch failed for static resource:', error);
              
              // Fallback para recursos estáticos
              return new Response('Resource not available offline', {
                status: 503,
                statusText: 'Service Unavailable'
              });
            });
        })
    );
    return;
  }
  
  // Para otros requests no específicos, usar estrategia por defecto
  event.respondWith(
    fetch(request)
      .catch((error) => {
        console.error('[SW] Default fetch failed:', error);
        return new Response('Request failed', {
          status: 503,
          statusText: 'Service Unavailable'
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
    const staticExtensions = ['.css', '.png', '.jpg', '.jpeg', '.svg', '.ico', '.woff', '.woff2'];
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