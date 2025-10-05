// ============= CAROUSEL LOGOS HOOK =============
// Hook optimizado con React Query para logos del carousel

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface CarouselLogo {
  id: string;
  company_name: string;
  logo_url: string | null;
  display_order: number;
  is_active: boolean;
}

export const useCarouselLogos = (includeInactive = false) => {
  return useQuery({
    queryKey: ['carousel-logos', includeInactive],
    queryFn: async () => {
      let query = supabase
        .from('carousel_logos')
        .select('*')
        .order('display_order');

      if (!includeInactive) {
        query = query.eq('is_active', true);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching carousel logos:', error);
        throw error;
      }

      return data as CarouselLogo[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos (antes cacheTime)
    refetchOnWindowFocus: false,
  });
};
