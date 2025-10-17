import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';
import { SUPABASE_CONFIG, validateSupabaseConfig } from '@/config/supabase';

// Memory storage implementation fallback
const memoryStorage = (() => {
  const storage = new Map<string, string>();
  
  return {
    getItem: (key: string): string | null => {
      return storage.get(key) || null;
    },
    setItem: (key: string, value: string): void => {
      storage.set(key, value);
    },
    removeItem: (key: string): void => {
      storage.delete(key);
    },
    clear: (): void => {
      storage.clear();
    }
  };
})();

// Safe localStorage access with fallback (always try localStorage first)
const safeLocalStorage = (() => {
  try {
    // Test localStorage access
    if (typeof window !== 'undefined' && window.localStorage) {
      const testKey = '__capittal_storage_test__';
      window.localStorage.setItem(testKey, 'test');
      window.localStorage.removeItem(testKey);
      console.log('✅ localStorage available');
      return window.localStorage;
    }
  } catch (error) {
    console.warn('🔒 localStorage blocked, using memory storage fallback');
  }
  
  return memoryStorage;
})();

const canPersistSession = safeLocalStorage !== memoryStorage;

// Singleton pattern global más robusto para evitar múltiples instancias
class SupabaseClientSingleton {
  private static instance: ReturnType<typeof createClient<Database>> | null = null;
  private static isInitializing = false;
  private static readonly SINGLETON_KEY = '__CAPITTAL_SUPABASE_CLIENT__';

  static getInstance() {
    // Verificar instancia global primero (con acceso seguro)
    try {
      if (typeof window !== 'undefined' && (window as any)[this.SINGLETON_KEY]) {
        this.instance = (window as any)[this.SINGLETON_KEY];
        return this.instance;
      }
    } catch (error) {
      console.warn('⚠️ Could not access global singleton, creating new instance');
    }
    
    if (!this.instance && !this.isInitializing) {
      this.isInitializing = true;
      
      try {
        validateSupabaseConfig();
        this.instance = createClient<Database>(
          SUPABASE_CONFIG.url, 
          SUPABASE_CONFIG.anonKey,
          {
            auth: {
              persistSession: canPersistSession,
              storage: safeLocalStorage,
              storageKey: 'capittal-auth-token',
              autoRefreshToken: canPersistSession,
              detectSessionInUrl: true,
            },
            // ✅ Disable realtime completely to prevent WebSocket errors
            realtime: {
              params: {
                eventsPerSecond: 0, // Cambiar de 1 a 0
              },
            },
            global: {
              headers: {
                'x-client-info': 'capittal-web-app',
              },
            },
          }
        ) as ReturnType<typeof createClient<Database>>;
        
        // Almacenar en ventana global para verdadero singleton (con acceso seguro)
        try {
          if (typeof window !== 'undefined') {
            (window as any)[this.SINGLETON_KEY] = this.instance;
          }
        } catch (error) {
          console.warn('⚠️ Could not store global singleton reference');
        }
        
        console.log(`✅ Supabase client initialized (persistSession: ${canPersistSession}, autoRefresh: ${canPersistSession})`);
      } catch (error) {
        console.error('❌ Failed to initialize Supabase client:', error);
        throw error;
      } finally {
        this.isInitializing = false;
      }
    }
    
    return this.instance!;
  }

  static reset() {
    this.instance = null;
    this.isInitializing = false;
    // Limpiar instancia global también (con acceso seguro)
    try {
      if (typeof window !== 'undefined') {
        delete (window as any)[this.SINGLETON_KEY];
      }
    } catch (error) {
      console.warn('⚠️ Could not clear global singleton reference');
    }
  }
}

export const optimizedSupabase = SupabaseClientSingleton.getInstance();