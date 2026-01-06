import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Mapeo de sectores de páginas a valores en BD
const SECTOR_MAPPING: Record<string, string[]> = {
  'energia': ['Energía y Renovables', 'Energía', 'Renovables', 'Solar', 'Eólica'],
  'tecnologia': ['Tecnología', 'Software', 'SaaS', 'Tech'],
  'healthcare': ['Salud', 'Healthcare', 'Biotecnología', 'Farmacéutico'],
  'industrial': ['Industrial', 'Manufacturero', 'Industria'],
  'retail': ['Retail', 'Consumo', 'E-commerce', 'Turismo y Hostelería'],
  'financial-services': ['Servicios Financieros', 'Fintech', 'Seguros', 'Banca'],
  'inmobiliario': ['Inmobiliario', 'Real Estate', 'Proptech'],
  'cosmetica': ['Cosmética', 'Belleza', 'Cuidado Personal'],
};

interface CaseStudyMetric {
  value: string;
  label: string;
}

interface CaseStudyTestimonial {
  quote: string;
  author: string;
  role: string;
}

interface CaseStudyData {
  companyName: string;
  sector: string;
  description: string;
  metrics: CaseStudyMetric[];
  testimonial?: CaseStudyTestimonial;
  operationId?: string;
  operationLink?: string;
}

interface UseSectorCaseStudyResult {
  caseStudy: CaseStudyData | null;
  isLoading: boolean;
  isFromMarketplace: boolean;
}

const formatCurrency = (amount: number): string => {
  if (amount >= 1000000) {
    return `€${(amount / 1000000).toFixed(0)}M`;
  } else if (amount >= 1000) {
    return `€${(amount / 1000).toFixed(0)}K`;
  }
  return `€${amount.toFixed(0)}`;
};

const formatMultiple = (valuation: number, ebitda: number): string => {
  if (!ebitda || ebitda <= 0) return '-';
  const multiple = valuation / ebitda;
  return `${multiple.toFixed(1)}x`;
};

export const useSectorCaseStudy = (
  sectorKey: string,
  fallbackCaseStudy?: CaseStudyData
): UseSectorCaseStudyResult => {
  const sectorVariants = SECTOR_MAPPING[sectorKey.toLowerCase()] || [sectorKey];

  const { data: operation, isLoading } = useQuery({
    queryKey: ['sectorCaseStudy', sectorKey],
    queryFn: async () => {
      // Buscar operaciones activas del sector, priorizando destacadas
      const { data, error } = await supabase
        .from('company_operations')
        .select('id, company_name, sector, subsector, short_description, description, valuation_amount, ebitda_amount, ebitda_multiple, highlights, is_featured, created_at')
        .eq('is_active', true)
        .or(`is_deleted.is.null,is_deleted.eq.false`)
        .in('sector', sectorVariants)
        .order('is_featured', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Error fetching sector case study:', error);
        return null;
      }

      return data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
  });

  // Transformar operación del marketplace a formato de caso de estudio
  if (operation) {
    const metrics: CaseStudyMetric[] = [];

    if (operation.valuation_amount) {
      metrics.push({
        value: formatCurrency(operation.valuation_amount),
        label: 'Valoración'
      });
    }

    if (operation.ebitda_amount && operation.valuation_amount) {
      metrics.push({
        value: formatMultiple(operation.valuation_amount, operation.ebitda_amount),
        label: 'Múltiplo EBITDA'
      });
    } else if (operation.ebitda_multiple) {
      metrics.push({
        value: `${operation.ebitda_multiple}x`,
        label: 'Múltiplo EBITDA'
      });
    }

    // Añadir métrica de tiempo estimado si no tenemos suficientes métricas
    if (metrics.length < 3) {
      metrics.push({
        value: '6-9 meses',
        label: 'Tiempo estimado'
      });
    }

    const caseStudy: CaseStudyData = {
      companyName: operation.company_name,
      sector: operation.subsector || operation.sector,
      description: operation.short_description || operation.description || '',
      metrics,
      operationId: operation.id,
      operationLink: `/operaciones/${operation.id}`,
    };

    return {
      caseStudy,
      isLoading,
      isFromMarketplace: true,
    };
  }

  // Fallback al caso estático
  return {
    caseStudy: fallbackCaseStudy || null,
    isLoading,
    isFromMarketplace: false,
  };
};

export default useSectorCaseStudy;
