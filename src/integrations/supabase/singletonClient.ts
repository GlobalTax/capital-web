import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Singleton Supabase client to avoid multiple instances
let supabaseInstance: ReturnType<typeof createClient<Database>> | null = null;

const supabaseUrl = 'https://fwhqtzkkvnjkazhaficj.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ3aHF0emtrdm5qa2F6aGFmaWNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4Mjc5NTMsImV4cCI6MjA2NTQwMzk1M30.Qhb3pRgx3HIoLSjeIulRHorgzw-eqL3WwXhpncHMF7I';

export const getSupabaseClient = () => {
  if (!supabaseInstance) {
    supabaseInstance = createClient<Database>(
      supabaseUrl,
      supabaseAnonKey,
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
    
    console.log('✅ Singleton Supabase client initialized');
  }
  
  return supabaseInstance;
};

export const supabase = getSupabaseClient();