
import { supabase } from '@/integrations/supabase/client';
import type { SystemMetrics } from '@/types/dashboard';

export const fetchSystemMetrics = async (): Promise<SystemMetrics[]> => {
  const { data, error } = await supabase
    .from('system_metrics')
    .select('*')
    .order('recorded_at', { ascending: false })
    .limit(10);

  if (error) {
    console.error('Error fetching system metrics:', error);
    return [];
  }

  return data || [];
};
