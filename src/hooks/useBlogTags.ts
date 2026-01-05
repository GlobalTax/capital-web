// ============= BLOG TAGS HOOK =============
// Sistema de tags controlado con lista maestra y normalización

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Tags oficiales organizados por temática
export const MASTER_TAGS = [
  // Operaciones
  'M&A',
  'Valoración',
  'Due Diligence',
  'Fusiones',
  'Adquisiciones',
  // Compradores
  'Private Equity',
  'Family Office',
  'Comprador Estratégico',
  // Legal/Fiscal
  'Planificación Fiscal',
  'Contratos',
  'SPA',
  // Sectores
  'Tecnología',
  'Industria',
  'Servicios',
  'SaaS',
  // Estrategia
  'Empresa Familiar',
  'Sucesión',
  'Reestructuración',
  'ESG',
  // Tendencias
  'IA',
  'Tendencias',
  'EBITDA',
] as const;

export type MasterTag = typeof MASTER_TAGS[number];

// Máximo de tags por artículo
export const MAX_TAGS_PER_POST = 5;

// Normalizar un tag (quitar #, trim, capitalizar primera letra)
export const normalizeTag = (tag: string): string => {
  return tag
    .replace(/^#/, '') // Quitar # al inicio
    .trim()
    .replace(/([A-Z])/g, ' $1') // Separar camelCase
    .trim()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
    .replace(/\s+/g, ' '); // Limpiar espacios múltiples
};

// Parsear string de tags (separados por # o ,)
export const parseTagsString = (tagsString: string): string[] => {
  // Si contiene hashtags, separar por #
  if (tagsString.includes('#')) {
    return tagsString
      .split('#')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0)
      .map(normalizeTag)
      .slice(0, MAX_TAGS_PER_POST);
  }
  
  // Si no, separar por comas
  return tagsString
    .split(',')
    .map(tag => tag.trim())
    .filter(tag => tag.length > 0)
    .map(normalizeTag)
    .slice(0, MAX_TAGS_PER_POST);
};

// Mapear variantes comunes a tags oficiales
const TAG_ALIASES: Record<string, MasterTag> = {
  'valoracion': 'Valoración',
  'valoración de empresas': 'Valoración',
  'valoraciondeempresas': 'Valoración',
  'valoración empresas': 'Valoración',
  'm&a': 'M&A',
  'mergers and acquisitions': 'M&A',
  'fusiones y adquisiciones': 'M&A',
  'due diligence': 'Due Diligence',
  'duediligence': 'Due Diligence',
  'dd': 'Due Diligence',
  'private equity': 'Private Equity',
  'privateequity': 'Private Equity',
  'pe': 'Private Equity',
  'family office': 'Family Office',
  'familyoffice': 'Family Office',
  'empresa familiar': 'Empresa Familiar',
  'empresafamiliar': 'Empresa Familiar',
  'planificacion fiscal': 'Planificación Fiscal',
  'planificación fiscal': 'Planificación Fiscal',
  'fiscal': 'Planificación Fiscal',
  'impuestos': 'Planificación Fiscal',
  'tecnologia': 'Tecnología',
  'tech': 'Tecnología',
  'software': 'SaaS',
  'inteligencia artificial': 'IA',
  'ai': 'IA',
  'esg': 'ESG',
  'sostenibilidad': 'ESG',
  'sustainability': 'ESG',
  'sucesion': 'Sucesión',
  'sucesión empresarial': 'Sucesión',
  'reestructuracion': 'Reestructuración',
  'restructuring': 'Reestructuración',
  'contratos': 'Contratos',
  'spa': 'SPA',
  'sale and purchase agreement': 'SPA',
};

// Mapear un tag a su versión oficial si existe
export const mapToOfficialTag = (tag: string): string => {
  const normalizedLower = tag.toLowerCase().trim();
  
  // Buscar en aliases
  if (TAG_ALIASES[normalizedLower]) {
    return TAG_ALIASES[normalizedLower];
  }
  
  // Buscar coincidencia exacta en master tags
  const masterMatch = MASTER_TAGS.find(
    mt => mt.toLowerCase() === normalizedLower
  );
  if (masterMatch) return masterMatch;
  
  // Si no hay match, devolver normalizado
  return normalizeTag(tag);
};

export const useBlogTags = () => {
  // Obtener todos los tags usados en la BD
  const { data: existingTags = [], isLoading } = useQuery({
    queryKey: ['blogTags'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('tags')
        .not('tags', 'is', null);
      
      if (error) throw error;
      
      // Extraer y contar tags únicos
      const tagCounts: Record<string, number> = {};
      
      data.forEach(post => {
        if (post.tags && Array.isArray(post.tags)) {
          post.tags.forEach((tag: string) => {
            // Normalizar cada tag
            const normalized = mapToOfficialTag(tag);
            tagCounts[normalized] = (tagCounts[normalized] || 0) + 1;
          });
        }
      });
      
      // Ordenar por frecuencia
      return Object.entries(tagCounts)
        .sort((a, b) => b[1] - a[1])
        .map(([tag]) => tag);
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
  });

  // Combinar tags master con existentes (sin duplicados)
  const allTags = useMemo(() => {
    const masterSet = new Set<string>(MASTER_TAGS as readonly string[]);
    const combined: string[] = [...MASTER_TAGS];
    
    existingTags.forEach(tag => {
      if (!masterSet.has(tag)) {
        combined.push(tag);
      }
    });
    
    return combined;
  }, [existingTags]);

  // Buscar tags que coincidan con un query
  const searchTags = (query: string): string[] => {
    if (!query.trim()) return allTags.slice(0, 10);
    
    const normalizedQuery = query.toLowerCase().trim();
    
    return allTags
      .filter(tag => tag.toLowerCase().includes(normalizedQuery))
      .slice(0, 10);
  };

  // Sugerir tags basados en la categoría
  const suggestTagsForCategory = (category: string): string[] => {
    const categoryTagMap: Record<string, string[]> = {
      'Valoración': ['Valoración', 'EBITDA', 'M&A', 'Due Diligence'],
      'Due Diligence': ['Due Diligence', 'M&A', 'Contratos', 'SPA'],
      'Venta de Empresas': ['M&A', 'Valoración', 'Private Equity', 'Family Office'],
      'Fiscalidad': ['Planificación Fiscal', 'Sucesión', 'Empresa Familiar'],
      'Tendencias M&A': ['Tendencias', 'M&A', 'IA', 'ESG'],
      'Casos de Éxito': ['M&A', 'Private Equity', 'Valoración'],
    };
    
    return categoryTagMap[category] || ['M&A', 'Valoración', 'Empresa Familiar'];
  };

  // Validar un array de tags
  const validateTags = (tags: string[]): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (tags.length > MAX_TAGS_PER_POST) {
      errors.push(`Máximo ${MAX_TAGS_PER_POST} tags permitidos`);
    }
    
    tags.forEach(tag => {
      if (tag.length < 2) {
        errors.push(`Tag "${tag}" demasiado corto`);
      }
      if (tag.length > 30) {
        errors.push(`Tag "${tag}" demasiado largo`);
      }
    });
    
    return {
      valid: errors.length === 0,
      errors,
    };
  };

  return {
    allTags,
    masterTags: MASTER_TAGS,
    existingTags,
    isLoading,
    searchTags,
    suggestTagsForCategory,
    validateTags,
    normalizeTag,
    mapToOfficialTag,
    parseTagsString,
    MAX_TAGS_PER_POST,
  };
};
