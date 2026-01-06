import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Mapeo de sectores de páginas a valores en BD
const SECTOR_MAPPING: Record<string, string[]> = {
  'energia': ['Energía y Renovables', 'Energía', 'Renovables', 'Solar', 'Eólica'],
  'tecnologia': ['Tecnología', 'Software', 'SaaS', 'Tech'],
  'healthcare': ['Salud', 'Healthcare', 'Biotecnología', 'Farmacéutico', 'Salud y Biotecnología'],
  'salud': ['Salud', 'Healthcare', 'Biotecnología', 'Farmacéutico', 'Salud y Biotecnología'],
  'industrial': ['Industrial', 'Manufacturero', 'Industria', 'Industrial y Manufacturero'],
  'retail': ['Retail', 'Consumo', 'E-commerce', 'Turismo y Hostelería', 'Comercio'],
  'alimentacion': ['Alimentación', 'Alimentación y Bebidas', 'Bebidas', 'Food & Beverage'],
  'financial-services': ['Servicios Financieros', 'Fintech', 'Seguros', 'Banca'],
  'inmobiliario': ['Inmobiliario', 'Real Estate', 'Proptech'],
  'cosmetica': ['Cosmética', 'Belleza', 'Cuidado Personal'],
};

// URL filter values for marketplace link
const SECTOR_URL_FILTER: Record<string, string> = {
  'energia': 'Energía y Renovables',
  'tecnologia': 'Tecnología',
  'healthcare': 'Salud y Biotecnología',
  'salud': 'Salud y Biotecnología',
  'industrial': 'Industrial y Manufacturero',
  'retail': 'Turismo y Hostelería',
  'alimentacion': 'Alimentación y Bebidas',
};

export interface SectorOperation {
  id: string;
  company_name: string;
  sector: string;
  subsector?: string;
  short_description?: string;
  description: string;
  revenue_amount?: number;
  ebitda_amount?: number;
  valuation_currency?: string;
  highlights?: string[];
  is_featured?: boolean;
  project_status?: string;
  expected_market_text?: string;
  created_at?: string;
  updated_at?: string;
  is_new_override?: string;
  deal_type?: string;
  geographic_location?: string;
  company_size_employees?: string;
}

interface UseSectorOperationsResult {
  operations: SectorOperation[];
  isLoading: boolean;
  error: Error | null;
  marketplaceUrl: string;
  sectorName: string;
}

export const useSectorOperations = (
  sectorKey: string,
  limit: number = 6
): UseSectorOperationsResult => {
  const sectorVariants = SECTOR_MAPPING[sectorKey.toLowerCase()] || [sectorKey];
  const sectorFilter = SECTOR_URL_FILTER[sectorKey.toLowerCase()] || sectorKey;
  const marketplaceUrl = `/oportunidades?sector=${encodeURIComponent(sectorFilter)}`;

  const { data, isLoading, error } = useQuery({
    queryKey: ['sectorOperations', sectorKey, limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('company_operations')
        .select(`
          id,
          company_name,
          sector,
          subsector,
          short_description,
          description,
          revenue_amount,
          ebitda_amount,
          valuation_currency,
          highlights,
          is_featured,
          project_status,
          expected_market_text,
          created_at,
          updated_at,
          is_new_override,
          deal_type,
          geographic_location,
          company_size_employees
        `)
        .eq('is_active', true)
        .or('is_deleted.is.null,is_deleted.eq.false')
        .in('sector', sectorVariants)
        .order('is_featured', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching sector operations:', error);
        throw error;
      }

      return data || [];
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
  });

  return {
    operations: data || [],
    isLoading,
    error: error as Error | null,
    marketplaceUrl,
    sectorName: sectorFilter,
  };
};

export default useSectorOperations;
