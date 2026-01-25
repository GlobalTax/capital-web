// ============= CR PORTFOLIO LIST HOOK =============
// Hook para listar todas las empresas del portfolio de Capital Riesgo

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface CRPortfolioListItem {
  id: string;
  company_name: string;
  sector: string | null;
  sector_pe: string | null;
  sector_pe_name: string | null;
  country: string | null;
  website: string | null;
  investment_year: number | null;
  status: string | null;
  investment_type: string | null;
  description: string | null;
  fund_id: string | null;
  fund_name: string | null;
  fund_type: string | null;
  created_at: string;
  enriched_at: string | null;
  has_enriched_data: boolean;
}

export interface CRPortfolioListFilters {
  search?: string;
  fundId?: string;
  status?: string;
  sector?: string;
  sectorPe?: string;
  country?: string;
  enrichmentStatus?: 'enriched' | 'pending' | 'no_website';
}

export const useCRPortfolioList = (filters?: CRPortfolioListFilters) => {
  return useQuery({
    queryKey: ['cr-portfolio-list', filters],
    queryFn: async (): Promise<CRPortfolioListItem[]> => {
      let query = supabase
        .from('cr_portfolio')
        .select(`
          id,
          company_name,
          sector,
          sector_pe,
          country,
          website,
          investment_year,
          status,
          investment_type,
          description,
          fund_id,
          created_at,
          enriched_at,
          enriched_data,
          cr_funds!cr_portfolio_fund_id_fkey (
            name,
            fund_type
          ),
          pe_sector_taxonomy!cr_portfolio_sector_pe_fkey (
            name_es
          )
        `)
        .eq('is_deleted', false)
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
      // Use sector_pe filter if provided, otherwise fall back to legacy sector
      if (filters?.sectorPe) {
        query = query.eq('sector_pe', filters.sectorPe);
      } else if (filters?.sector) {
        query = query.ilike('sector', `%${filters.sector}%`);
      }
      if (filters?.country) {
        query = query.ilike('country', `%${filters.country}%`);
      }

      // Enrichment status filter
      if (filters?.enrichmentStatus === 'enriched') {
        query = query.not('enriched_at', 'is', null);
      } else if (filters?.enrichmentStatus === 'pending') {
        query = query.is('enriched_at', null).not('website', 'is', null);
      } else if (filters?.enrichmentStatus === 'no_website') {
        query = query.is('website', null);
      }

      const { data, error } = await query;

      if (error) throw error;

      return (data || []).map((item: any) => ({
        id: item.id,
        company_name: item.company_name,
        sector: item.sector,
        sector_pe: item.sector_pe,
        sector_pe_name: item.pe_sector_taxonomy?.name_es || null,
        country: item.country,
        website: item.website,
        investment_year: item.investment_year,
        status: item.status,
        investment_type: item.investment_type,
        description: item.description,
        fund_id: item.fund_id,
        fund_name: item.cr_funds?.name || null,
        fund_type: item.cr_funds?.fund_type || null,
        created_at: item.created_at,
        enriched_at: item.enriched_at,
        has_enriched_data: !!item.enriched_data
      }));
    }
  });
};

// Interface for PE sector options
export interface PESectorOption {
  id: string;
  name_es: string;
}

// Hook para obtener opciones de filtros
export const useCRPortfolioFilterOptions = () => {
  return useQuery({
    queryKey: ['cr-portfolio-filter-options'],
    queryFn: async () => {
      // Obtener fondos
      const { data: funds } = await supabase
        .from('cr_funds')
        .select('id, name')
        .eq('is_deleted', false)
        .order('name');

      // Obtener sectores PE desde la taxonomía
      const { data: peSectors } = await supabase
        .from('pe_sector_taxonomy')
        .select('id, name_es')
        .eq('is_active', true)
        .order('name_es');

      // Obtener sectores legacy únicos (para mostrar cuántos faltan migrar)
      const { data: legacySectors } = await supabase
        .from('cr_portfolio')
        .select('sector')
        .eq('is_deleted', false)
        .not('sector', 'is', null);

      // Obtener países únicos
      const { data: countries } = await supabase
        .from('cr_portfolio')
        .select('country')
        .eq('is_deleted', false)
        .not('country', 'is', null);

      const uniqueLegacySectors = [...new Set((legacySectors || []).map(s => s.sector).filter(Boolean))];
      const uniqueCountries = [...new Set((countries || []).map(c => c.country).filter(Boolean))];

      return {
        funds: funds || [],
        peSectors: (peSectors || []) as PESectorOption[],
        legacySectors: uniqueLegacySectors,
        countries: uniqueCountries,
        statuses: ['active', 'exited', 'write_off']
      };
    }
  });
};

// Hook para estadísticas de completitud de datos
export const useCRPortfolioDataStats = () => {
  return useQuery({
    queryKey: ['cr-portfolio-data-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cr_portfolio')
        .select('id, sector, sector_pe, country, website, enriched_at')
        .eq('is_deleted', false);

      if (error) throw error;

      const total = data?.length || 0;
      const withSector = data?.filter(d => d.sector).length || 0;
      const withSectorPe = data?.filter(d => d.sector_pe).length || 0;
      const withCountry = data?.filter(d => d.country).length || 0;
      const withWebsite = data?.filter(d => d.website).length || 0;
      const enriched = data?.filter(d => d.enriched_at).length || 0;

      return {
        total,
        sector: { count: withSector, percent: total > 0 ? Math.round((withSector / total) * 100) : 0 },
        sectorPe: { count: withSectorPe, percent: total > 0 ? Math.round((withSectorPe / total) * 100) : 0 },
        country: { count: withCountry, percent: total > 0 ? Math.round((withCountry / total) * 100) : 0 },
        website: { count: withWebsite, percent: total > 0 ? Math.round((withWebsite / total) * 100) : 0 },
        enriched: { count: enriched, percent: total > 0 ? Math.round((enriched / total) * 100) : 0 },
      };
    }
  });
};
