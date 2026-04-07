import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Mapeo de sectores de páginas a valores en BD (datos_proyecto.sector)
const SECTOR_MAPPING: Record<string, string[]> = {
  'energia': ['Energía y Renovables', 'Energías Renovables'],
  'tecnologia': ['Tecnología', 'SaaS', 'SaaS Vertical', 'Consultoría TIC', 'Consultoría SAP', 'Telecomunicaciones', 'Tecnología, SaaS, Consultoría TIC'],
  'healthcare': ['Salud y Biotecnología', 'Distribución Sanitaria', 'Healthcare'],
  'industrial': ['Industrial y Manufacturero', 'Frío Industrial', 'Estructuras Metálicas', 'Alquiler Maquinaria', 'Fabricación Industrial'],
  'retail': ['Retail y Consumo', 'Turismo y Hostelería', 'Restauración', 'Turismo', 'Retail y Consumo, Turismo y Hostelería'],
  'seguridad': ['Seguridad', 'Protección Contra Incendios', 'Sanidad Ambiental', 'Vigilancia'],
  'construccion': ['Construcción', 'Pavimentación Industrial', 'Construcción Metalúrgica', 'Rehabilitación'],
  'alimentacion': ['Alimentación y Bebidas', 'Restauración', 'Canal HORECA', 'Distribución Alimentaria'],
  'logistica': ['Logística y Transporte', 'Alquiler Maquinaria', 'Transporte', 'Operador Logístico'],
  'medio-ambiente': ['Gestión de Residuos', 'Demoliciones', 'Reciclaje', 'Medio Ambiente', 'Servicios Ambientales']
};

const SECTOR_URL_FILTER: Record<string, string> = {
  'energia': 'Energía y Renovables',
  'tecnologia': 'Tecnología',
  'healthcare': 'Salud y Biotecnología',
  'industrial': 'Industrial y Manufacturero',
  'retail': 'Retail y Consumo',
  'seguridad': 'Seguridad',
  'construccion': 'Construcción',
  'alimentacion': 'Alimentación y Bebidas',
  'logistica': 'Logística y Transporte',
  'medio-ambiente': 'Gestión de Residuos'
};

export interface SectorOperation {
  id: string;
  company_name?: string;
  project_name?: string;
  sector: string;
  subsector?: string;
  short_description?: string;
  description: string;
  revenue_amount?: number;
  ebitda_amount?: number;
  ebitda_margin?: number;
  rango_facturacion_min?: number | null;
  rango_facturacion_max?: number | null;
  rango_ebitda_min?: number | null;
  rango_ebitda_max?: number | null;
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
      // Query datos_proyecto joined with mandatos (visible_en_rod = true)
      const { data, error } = await supabase
        .from('datos_proyecto')
        .select(`
          id,
          mandato_id,
          project_name,
          sector,
          short_description,
          description,
          revenue_amount,
          ebitda_amount,
          ebitda_margin,
          ubicacion,
          year,
          estado,
          created_at,
          updated_at,
          mandatos!inner (
            id,
            tipo,
            visible_en_rod,
            is_favorite,
            nombre_proyecto
          )
        `)
        .eq('mandatos.visible_en_rod', true)
        .in('sector', sectorVariants)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching sector operations:', error);
        throw error;
      }

      // Map to SectorOperation shape
      return (data || []).map(row => {
        const mandato = row.mandatos as any;
        return {
          id: mandato?.id || row.mandato_id,
          project_name: row.project_name || mandato?.nombre_proyecto,
          sector: row.sector || '',
          short_description: row.short_description,
          description: row.description || '',
          revenue_amount: row.revenue_amount ? Number(row.revenue_amount) : undefined,
          ebitda_amount: row.ebitda_amount ? Number(row.ebitda_amount) : undefined,
          ebitda_margin: row.ebitda_margin ? Number(row.ebitda_margin) : undefined,
          valuation_currency: 'EUR',
          is_featured: mandato?.is_favorite || false,
          project_status: row.estado,
          geographic_location: row.ubicacion,
          deal_type: mandato?.tipo === 'venta' ? 'sale' : mandato?.tipo === 'compra' ? 'acquisition' : mandato?.tipo,
          created_at: row.created_at,
          updated_at: row.updated_at,
        } as SectorOperation;
      });
    },
    staleTime: 1000 * 60 * 5,
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
