import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface LeadForm {
  id: string;
  name: string;
  description?: string;
  is_active: boolean;
  display_order: number;
}

/**
 * Fetch all active lead forms ordered by display_order
 */
export function useLeadForms() {
  const { data: forms, isLoading, error } = useQuery({
    queryKey: ['lead-forms'],
    queryFn: async (): Promise<LeadForm[]> => {
      const { data, error } = await supabase
        .from('lead_forms')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) {
        console.error('[useLeadForms] Error fetching lead forms:', error);
        throw error;
      }

      return data || [];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return {
    forms: forms || [],
    isLoading,
    error,
  };
}
