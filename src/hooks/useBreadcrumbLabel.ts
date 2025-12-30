import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Regex para detectar UUIDs
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Mapeo de rutas padre a tabla y campo
const ENTITY_CONFIG: Record<string, { table: string; field: string }> = {
  'valoraciones-pro': { table: 'professional_valuations', field: 'client_company' },
  'leads': { table: 'company_valuations', field: 'company_name' },
  'operaciones': { table: 'company_operations', field: 'company_name' },
  'sector-dossiers': { table: 'sector_dossiers', field: 'title' },
  'blog': { table: 'blog_posts', field: 'title' },
  'contacts': { table: 'contact_leads', field: 'full_name' },
};

export const isUuid = (segment: string): boolean => UUID_REGEX.test(segment);

export const useBreadcrumbLabel = (segment: string, parentSegment?: string) => {
  const isUuidSegment = isUuid(segment);
  const config = parentSegment ? ENTITY_CONFIG[parentSegment] : null;

  const { data: label, isLoading } = useQuery({
    queryKey: ['breadcrumb-label', segment, parentSegment],
    queryFn: async () => {
      if (!isUuidSegment || !config) return null;

      const { data } = await supabase
        .from(config.table as any)
        .select(config.field)
        .eq('id', segment)
        .maybeSingle();

      return data?.[config.field] || null;
    },
    enabled: isUuidSegment && !!config,
    staleTime: 1000 * 60 * 5, // Cache 5 minutos
  });

  if (!isUuidSegment) return { label: null, isLoading: false };
  
  return { 
    label: label || (isLoading ? '...' : segment.slice(0, 8)), 
    isLoading 
  };
};
