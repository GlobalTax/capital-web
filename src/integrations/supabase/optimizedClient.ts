import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';
import { SUPABASE_CONFIG, validateSupabaseConfig } from '@/config/supabase';

// Singleton pattern global más robusto para evitar múltiples instancias
class SupabaseClientSingleton {
  private static instance: ReturnType<typeof createClient<Database>> | null = null;
  private static isInitializing = false;
  private static readonly SINGLETON_KEY = '__CAPITTAL_SUPABASE_CLIENT__';

  static getInstance() {
    // Verificar instancia global primero
    if (typeof window !== 'undefined' && (window as any)[this.SINGLETON_KEY]) {
      this.instance = (window as any)[this.SINGLETON_KEY];
      return this.instance;
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
              persistSession: true,
              storage: typeof window !== 'undefined' ? window.localStorage : undefined,
              storageKey: 'capittal-auth-token',
              autoRefreshToken: true,
              detectSessionInUrl: true,
            },
            realtime: {
              params: {
                eventsPerSecond: 10,
              },
            },
          }
        );
        
        // Almacenar en ventana global para verdadero singleton
        if (typeof window !== 'undefined') {
          (window as any)[this.SINGLETON_KEY] = this.instance;
        }
        
        console.log('✅ Optimized Supabase client initialized (singleton)');
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
    // Limpiar instancia global también
    if (typeof window !== 'undefined') {
      delete (window as any)[this.SINGLETON_KEY];
    }
  }
}

export const optimizedSupabase = SupabaseClientSingleton.getInstance();