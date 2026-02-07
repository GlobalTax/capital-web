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
  // New fields
  stake_offered: string | null;
  customer_types: string | null;
  reference: string | null;
  location: string | null;
  contact_name: string | null;
  contact_email: string | null;
  contact_company: string | null;
  image_url: string | null;
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
