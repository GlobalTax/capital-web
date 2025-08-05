// ============= SERVICE WORKER =============
// Service Worker para cache avanzado y background sync

const CACHE_NAME = 'capittal-cache-v1.0.0';
const CRITICAL_CACHE = 'capittal-critical-v1.0.0';
const API_CACHE = 'capittal-api-v1.0.0';

// Recursos críticos para cachear
const CRITICAL_RESOURCES = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json'
];

// Patrones de URLs para diferentes estrategias
const CACHE_STRATEGIES = {
  static: /\.(js|css|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot)$/,
  api: /\/api\//,
  supabase: /supabase/
};

// Instalar SW y cachear recursos críticos
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CRITICAL_CACHE)
      .then((cache) => cache.addAll(CRITICAL_RESOURCES))
      .then(() => self.skipWaiting())
  );
});

// Activar SW y limpiar caches antiguos
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => 
            cacheName.startsWith('capittal-') && 
            cacheName !== CACHE_NAME && 
            cacheName !== CRITICAL_CACHE &&
            cacheName !== API_CACHE
          )
          .map((cacheName) => caches.delete(cacheName))
      );
    }).then(() => self.clients.claim())
  );
});

// Interceptar requests
self.addEventListener('fetch', (event) => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  const url = new URL(request.url);
  
  // Estrategia Cache First para recursos estáticos
  if (CACHE_STRATEGIES.static.test(url.pathname)) {
    return cacheFirst(request);
  }
  
  // Estrategia Stale While Revalidate para APIs
  if (CACHE_STRATEGIES.api.test(url.pathname) || CACHE_STRATEGIES.supabase.test(url.hostname)) {
    return staleWhileRevalidate(request);
  }
  
  // Network First para todo lo demás
  return networkFirst(request);
}

// Cache First: Buscar en cache primero, luego red
async function cacheFirst(request) {
  try {
    const cached = await caches.match(request);
    if (cached) return cached;
    
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    return caches.match(request);
  }
}

// Stale While Revalidate: Servir cache y actualizar en background
async function staleWhileRevalidate(request) {
  const cache = await caches.open(API_CACHE);
  const cached = await cache.match(request);
  
  const fetchPromise = fetch(request).then((response) => {
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  }).catch(() => cached);
  
  return cached || fetchPromise;
}

// Network First: Red primero, cache como fallback
async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    return caches.match(request) || new Response('Offline', { status: 503 });
  }
}

// Background Sync para operaciones offline
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(processBackgroundSync());
  }
});

async function processBackgroundSync() {
  // Procesar tareas pendientes de sincronización
  const tasks = await getStoredTasks();
  
  for (const task of tasks) {
    try {
      await fetch(task.url, {
        method: task.method,
        headers: task.headers,
        body: task.body
      });
      
      // Remover tarea completada
      await removeTask(task.id);
    } catch (error) {
      console.error('Background sync failed:', error);
    }
  }
}

async function getStoredTasks() {
  // Implementar lógica para obtener tareas de IndexedDB
  return [];
}

async function removeTask(taskId) {
  // Implementar lógica para remover tarea de IndexedDB
}