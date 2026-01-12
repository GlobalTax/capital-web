// ============= SF PORTFOLIO LIST HOOK =============
// Hook para listar todas las empresas adquiridas por Search Funds

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface SFPortfolioListItem {
  id: string;
  company_name: string;
  sector: string | null;
  country: string | null;
  website: string | null;
  acquisition_year: number | null;
  status: string | null;
  deal_type: string | null;
  description: string | null;
  fund_id: string | null;
  fund_name: string | null;
  fund_status: string | null;
  created_at: string;
}

export interface SFPortfolioListFilters {
  search?: string;
  fundId?: string;
  status?: string;
  sector?: string;
  country?: string;
}

export const useSFPortfolioList = (filters?: SFPortfolioListFilters) => {
  return useQuery({
    queryKey: ['sf-portfolio-list', filters],
    queryFn: async (): Promise<SFPortfolioListItem[]> => {
      let query = supabase
        .from('sf_acquisitions')
        .select(`
          id,
          company_name,
          sector,
          country,
          website,
          acquisition_year,
          status,
          deal_type,
          description,
          fund_id,
          created_at,
          sf_funds!sf_acquisitions_fund_id_fkey (
            name,
            status
          )
        `)
        .order('created_at', { ascending: false });

      // Aplicar filtros
      if (filters?.search) {
        query = query.ilike('company_name', `%${filters.search}%`);
      }
      if (filters?.fundId) {
        query = query.eq('fund_id', filters.fundId);
      }
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.sector) {
        query = query.ilike('sector', `%${filters.sector}%`);
      }
      if (filters?.country) {
        query = query.ilike('country', `%${filters.country}%`);
      }

      const { data, error } = await query;

      if (error) throw error;

      return (data || []).map((item: any) => ({
        id: item.id,
        company_name: item.company_name,
        sector: item.sector,
        country: item.country,
        website: item.website,
        acquisition_year: item.acquisition_year,
        status: item.status,
        deal_type: item.deal_type,
        description: item.description,
        fund_id: item.fund_id,
        fund_name: item.sf_funds?.name || null,
        fund_status: item.sf_funds?.status || null,
        created_at: item.created_at
      }));
    }
  });
};

// Hook para obtener opciones de filtros
export const useSFPortfolioFilterOptions = () => {
  return useQuery({
    queryKey: ['sf-portfolio-filter-options'],
    queryFn: async () => {
      // Obtener fondos
      const { data: funds } = await supabase
        .from('sf_funds')
        .select('id, name')
        .order('name');

      // Obtener sectores únicos
      const { data: sectors } = await supabase
        .from('sf_acquisitions')
        .select('sector')
        .not('sector', 'is', null);

      // Obtener países únicos
      const { data: countries } = await supabase
        .from('sf_acquisitions')
        .select('country')
        .not('country', 'is', null);

      const uniqueSectors = [...new Set((sectors || []).map(s => s.sector).filter(Boolean))];
      const uniqueCountries = [...new Set((countries || []).map(c => c.country).filter(Boolean))];

      return {
        funds: funds || [],
        sectors: uniqueSectors,
        countries: uniqueCountries,
        statuses: ['portfolio', 'exited', 'unknown']
      };
    }
  });
};
