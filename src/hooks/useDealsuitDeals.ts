import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface DealsuiteDeal {
  id: string;
  deal_id: string;
  deal_type: string | null;
  title: string | null;
  sector: string | null;
  country: string | null;
  ebitda_min: number | null;
  ebitda_max: number | null;
  revenue_min: number | null;
  revenue_max: number | null;
  description: string | null;
  advisor: string | null;
  detail_url: string | null;
  published_at: string | null;
  scraped_at: string;
  created_at: string;
  updated_at: string;
  raw_data: Record<string, unknown> | null;
}

export const useDealsuitDeals = (limit = 50) => {
  return useQuery({
    queryKey: ['dealsuite-deals', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('dealsuite_deals')
        .select('*')
        .order('scraped_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data as DealsuiteDeal[];
    },
  });
};
