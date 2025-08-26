import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';
import { SUPABASE_CONFIG, validateSupabaseConfig } from '@/config/supabase';

// Singleton pattern más robusto para evitar múltiples instancias
class SupabaseClientSingleton {
  private static instance: ReturnType<typeof createClient<Database>> | null = null;
  private static isInitializing = false;

  static getInstance() {
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
        
        console.log('✅ Optimized Supabase client initialized');
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
  }
}

export const optimizedSupabase = SupabaseClientSingleton.getInstance();