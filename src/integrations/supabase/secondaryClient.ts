
import { createClient } from '@supabase/supabase-js';

const SECONDARY_SUPABASE_URL = "https://fwhqtzkkvnjkazhaficj.supabase.co";
const SECONDARY_SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ3aHF0emtrdm5qa2F6aGFmaWNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4Mjc5NTMsImV4cCI6MjA2NTQwMzk1M30.Qhb3pRgx3HIoLSjeIulRHorgzw-eqL3WwXhpncHMF7I";

export const secondarySupabase = createClient(
  SECONDARY_SUPABASE_URL,
  SECONDARY_SUPABASE_ANON_KEY
);
