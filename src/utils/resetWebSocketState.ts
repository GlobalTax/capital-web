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

// Comprehensive cache clearing utility
export const clearAllCaches = async () => {
  try {
    console.log('🧹 Starting comprehensive cache clearing...');
    
    // 1. Clear all localStorage
    localStorage.clear();
    console.log('✅ LocalStorage cleared');
    
    // 2. Clear all sessionStorage
    sessionStorage.clear();
    console.log('✅ SessionStorage cleared');
    
    // 3. Clear all browser caches (Service Worker + Manual)
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(cacheName => caches.delete(cacheName)));
      console.log('✅ All caches cleared:', cacheNames);
    }
    
    // 4. Clear in-memory caches from our cache utilities
    if ((window as any).globalCache) {
      (window as any).globalCache.clear();
      console.log('✅ Global cache cleared');
    }
    
    // 5. Reset any React Query cache if available
    if ((window as any).queryClient) {
      (window as any).queryClient.clear();
      console.log('✅ React Query cache cleared');
    }
    
    // 6. Unregister service worker to force fresh registration
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const registration of registrations) {
        await registration.unregister();
        console.log('✅ Service worker unregistered');
      }
    }
    
    console.log('✅ All caches cleared successfully');
    
    // Force complete page reload
    window.location.reload();
    
  } catch (error) {
    console.error('❌ Error clearing caches:', error);
    // Fallback to basic clear
    resetWebSocketState();
  }
};

export const forceCleanReload = () => {
  resetWebSocketState();
};