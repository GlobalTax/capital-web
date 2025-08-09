// Centraliza el cliente único de Supabase para toda la app
// Reexporta el cliente ya configurado en src/integrations/supabase/client

import { supabase as coreClient } from '@/integrations/supabase/client';

export const supabase = coreClient;
