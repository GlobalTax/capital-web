// ============= SF ACQUISITIONS WITH FUNDS HOOK =============
// Hook para obtener adquisiciones con datos del fondo relacionado

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface SFAcquisitionWithFund {
  id: string;
  fund_id: string;
  fund_name: string | null;
  company_name: string;
  sector: string | null;
  cnae: string | null;
  description: string | null;
  deal_year: number | null;
  deal_type: string | null;
  country: string | null;
  region: string | null;
  status: string | null;
  exit_year: number | null;
  source_url: string | null;
  website: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  fund: {
    id: string;
    name: string;
    country_base: string | null;
    cities: string[] | null;
  } | null;
}

export interface SFAcquisitionsFilters {
  search?: string;
  year?: number;
  sector?: string;
  status?: 'owned' | 'exited' | 'unknown';
  fundId?: string;
}

const SF_ACQUISITIONS_WITH_FUNDS_KEY = 'sf_acquisitions_with_funds';

export const useSFAcquisitionsWithFunds = (filters?: SFAcquisitionsFilters) => {
  return useQuery({
    queryKey: [SF_ACQUISITIONS_WITH_FUNDS_KEY, filters],
    queryFn: async () => {
      let query = supabase
        .from('sf_acquisitions')
        .select(`
          *,
          fund:sf_funds(id, name, country_base, cities)
        `)
        .order('deal_year', { ascending: false });

      if (filters?.fundId) {
        query = query.eq('fund_id', filters.fundId);
      }

      if (filters?.year) {
        query = query.eq('deal_year', filters.year);
      }

      if (filters?.sector) {
        query = query.ilike('sector', `%${filters.sector}%`);
      }

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      if (filters?.search) {
        query = query.or(`company_name.ilike.%${filters.search}%,sector.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as SFAcquisitionWithFund[];
    },
  });
};

// Hook para obtener estadísticas de adquisiciones
export const useSFAcquisitionsStats = () => {
  return useQuery({
    queryKey: ['sf_acquisitions_stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sf_acquisitions')
        .select('id, deal_year, status');
      
      if (error) throw error;

      const currentYear = new Date().getFullYear();
      const total = data?.length || 0;
      const thisYear = data?.filter(a => a.deal_year === currentYear).length || 0;
      const owned = data?.filter(a => a.status === 'owned').length || 0;
      const exited = data?.filter(a => a.status === 'exited').length || 0;

      // Distribución por año
      const byYear: Record<number, number> = {};
      data?.forEach(a => {
        if (a.deal_year) {
          byYear[a.deal_year] = (byYear[a.deal_year] || 0) + 1;
        }
      });

      return {
        total,
        thisYear,
        owned,
        exited,
        byYear,
      };
    },
  });
};

// Hook para obtener sectores únicos
export const useSFAcquisitionsSectors = () => {
  return useQuery({
    queryKey: ['sf_acquisitions_sectors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sf_acquisitions')
        .select('sector')
        .not('sector', 'is', null);
      
      if (error) throw error;

      const sectors = [...new Set(data?.map(a => a.sector).filter(Boolean))].sort();
      return sectors as string[];
    },
  });
};

// Hook para obtener años únicos
export const useSFAcquisitionsYears = () => {
  return useQuery({
    queryKey: ['sf_acquisitions_years'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sf_acquisitions')
        .select('deal_year')
        .not('deal_year', 'is', null);
      
      if (error) throw error;

      const years = [...new Set(data?.map(a => a.deal_year).filter(Boolean))].sort((a, b) => (b || 0) - (a || 0));
      return years as number[];
    },
  });
};
