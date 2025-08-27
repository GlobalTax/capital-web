// Utility to reset WebSocket state and clear problematic connections

export const resetWebSocketState = () => {
  try {
    // Clear ALL localStorage keys aggressively
    const allKeys = Object.keys(localStorage);
    allKeys.forEach(key => {
      if (key.includes('supabase') || 
          key.includes('websocket') || 
          key.includes('realtime') || 
          key.includes('push-state') ||
          key.includes('sb-') ||
          key.includes('capittal-')) {
        localStorage.removeItem(key);
        console.log(`🧹 Removed: ${key}`);
      }
    });

    // Clear sessionStorage completely
    sessionStorage.clear();

    // Clear Service Worker cache if available
    if ('caches' in window) {
      caches.keys().then(cacheNames => {
        cacheNames.forEach(cacheName => {
          caches.delete(cacheName);
        });
      });
    }

    console.log('✅ Complete WebSocket and cache state cleared');
    
    // Force hard reload to ensure clean state
    setTimeout(() => {
      window.location.reload();
    }, 100);
    
  } catch (error) {
    console.error('Error clearing WebSocket state:', error);
  }
};

export const forceCleanReload = () => {
  resetWebSocketState();
};