import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Mapeo de sectores de páginas a valores en BD
const SECTOR_MAPPING: Record<string, string[]> = {
  'energia': ['Energía y Renovables', 'Energías Renovables'],
  'tecnologia': ['Tecnología', 'SaaS', 'SaaS Vertical', 'Consultoría TIC', 'Consultoría SAP', 'Telecomunicaciones', 'Tecnología, SaaS, Consultoría TIC'],
  'healthcare': ['Salud y Biotecnología', 'Distribución Sanitaria'],
  'industrial': ['Industrial y Manufacturero', 'Frío Industrial', 'Estructuras Metálicas', 'Logística y Transporte', 'Construcción', 'Alquiler Maquinaria'],
  'retail': ['Retail y Consumo', 'Turismo y Hostelería', 'Restauración', 'Turismo', 'Retail y Consumo, Turismo y Hostelería'],
  'financial-services': ['Servicios Financieros', 'Fintech', 'Seguros'],
  'inmobiliario': ['Inmobiliario', 'Real Estate'],
  'cosmetica': ['Cosmética', 'Belleza', 'Productos Desechables'],
};

const SECTOR_URL_FILTER: Record<string, string> = {
  'energia': 'Energía y Renovables',
  'tecnologia': 'Tecnología',
  'healthcare': 'Salud y Biotecnología',
  'industrial': 'Industrial y Manufacturero',
  'retail': 'Retail y Consumo',
  'financial-services': 'Servicios Financieros',
  'inmobiliario': 'Inmobiliario',
  'cosmetica': 'Cosmética',
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
