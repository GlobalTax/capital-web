// Utility to reset WebSocket state and clear problematic connections

export const resetWebSocketState = () => {
  try {
    // Clear localStorage keys that might contain WebSocket state
    const keysToRemove = [
      'supabase.auth.token',
      'sb-auth-token',
      'websocket-state',
      'realtime-state',
      'push-state'
    ];
    
    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
    });

    // Clear sessionStorage
    sessionStorage.clear();

    console.log('✅ WebSocket state cleared successfully');
    
    // Force reload to ensure clean state
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