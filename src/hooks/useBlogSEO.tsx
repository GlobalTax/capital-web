import { useState, useEffect } from 'react';
import { BlogPost } from '@/types/blog';
import { supabase } from '@/integrations/supabase/client';

interface SEOAnalysis {
  titleLength: number;
  metaTitleLength: number;
  metaDescriptionLength: number;
  readingTime: number;
  wordCount: number;
  paragraphCount: number;
  headingCount: number;
  isSlugUnique: boolean;
  seoScore: number;
  suggestions: string[];
}

interface SEOValidationErrors {
  title?: string;
  metaTitle?: string;
  metaDescription?: string;
  slug?: string;
}

export const useBlogSEO = () => {
  const [analysis, setAnalysis] = useState<SEOAnalysis>({
    titleLength: 0,
    metaTitleLength: 0,
    metaDescriptionLength: 0,
    readingTime: 0,
    wordCount: 0,
    paragraphCount: 0,
    headingCount: 0,
    isSlugUnique: true,
    seoScore: 0,
    suggestions: []
  });
  
  const [seoErrors, setSeoErrors] = useState<SEOValidationErrors>({});
  const [isCheckingSlug, setIsCheckingSlug] = useState(false);

  // Calcular tiempo de lectura (200 WPM promedio)
  const calculateReadingTime = (content: string): number => {
    const wordsPerMinute = 200;
    const words = content.trim().split(/\s+/).length;
    return Math.max(1, Math.ceil(words / wordsPerMinute));
  };

  // Analizar contenido para legibilidad
  const analyzeContent = (content: string) => {
    const words = content.trim().split(/\s+/).length;
    const paragraphs = content.split(/\n\s*\n/).filter(p => p.trim()).length;
    const headings = (content.match(/^#{1,6}\s/gm) || []).length;
    
    return { words, paragraphs, headings };
  };

  // Auto-generar slug inteligente
  const generateSlug = (title: string): string => {
    return title
      .toLowerCase()
      .trim()
      // Reemplazar acentos
      .replace(/[áàäâ]/g, 'a')
      .replace(/[éèëê]/g, 'e')
      .replace(/[íìïî]/g, 'i')
      .replace(/[óòöô]/g, 'o')
      .replace(/[úùüû]/g, 'u')
      .replace(/ñ/g, 'n')
      .replace(/ç/g, 'c')
      // Remover caracteres especiales
      .replace(/[^\w\s-]/g, '')
      // Reemplazar espacios y múltiples guiones
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      // Remover guiones al inicio y final
      .replace(/^-+|-+$/g, '');
  };

  // Verificar si el slug es único
  const checkSlugUniqueness = async (slug: string, currentPostId?: string): Promise<boolean> => {
    if (!slug) return false;
    
    setIsCheckingSlug(true);
    try {
      let query = supabase
        .from('blog_posts')
        .select('id') // Keep specific column for efficiency
        .eq('slug', slug);
      
      if (currentPostId) {
        query = query.neq('id', currentPostId);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Error checking slug uniqueness:', error);
        return false;
      }
      
      return data.length === 0;
    } catch (error) {
      console.error('Error checking slug uniqueness:', error);
      return false;
    } finally {
      setIsCheckingSlug(false);
    }
  };

  // Auto-generar meta tags
  const generateMetaTags = (post: BlogPost) => {
    const updates: Partial<BlogPost> = {};
    
    // Auto-generar meta título si está vacío
    if (!post.meta_title?.trim()) {
      updates.meta_title = post.title;
    }
    
    // Auto-generar meta descripción si está vacía
    if (!post.meta_description?.trim() && post.excerpt?.trim()) {
      const excerpt = post.excerpt.substring(0, 155);
      updates.meta_description = excerpt + (post.excerpt.length > 155 ? '...' : '');
    }
    
    return updates;
  };

  // Calcular puntuación SEO
  const calculateSEOScore = (post: BlogPost, analysis: SEOAnalysis): number => {
    let score = 0;
    const maxScore = 100;
    
    // Título (20 puntos)
    if (post.title && post.title.length >= 30 && post.title.length <= 60) {
      score += 20;
    } else if (post.title && post.title.length > 0) {
      score += 10;
    }
    
    // Meta descripción (20 puntos)
    if (post.meta_description && post.meta_description.length >= 150 && post.meta_description.length <= 160) {
      score += 20;
    } else if (post.meta_description && post.meta_description.length > 0) {
      score += 10;
    }
    
    // Contenido (30 puntos)
    if (analysis.wordCount >= 300) {
      score += 20;
    } else if (analysis.wordCount >= 150) {
      score += 10;
    }
    
    if (analysis.headingCount > 0) {
      score += 10;
    }
    
    // Slug (10 puntos)
    if (analysis.isSlugUnique && post.slug) {
      score += 10;
    }
    
    // Imagen destacada (10 puntos)
    if (post.featured_image_url) {
      score += 10;
    }
    
    // Extracto (10 puntos)
    if (post.excerpt && post.excerpt.length > 50) {
      score += 10;
    }
    
    return Math.min(score, maxScore);
  };

  // Generar sugerencias de mejora
  const generateSuggestions = (post: BlogPost, analysis: SEOAnalysis): string[] => {
    const suggestions: string[] = [];
    
    if (!post.title || post.title.length < 30) {
      suggestions.push('El título debería tener al menos 30 caracteres para mejor SEO');
    }
    if (post.title && post.title.length > 60) {
      suggestions.push('El título es muy largo, considera reducirlo a menos de 60 caracteres');
    }
    
    if (!post.meta_description) {
      suggestions.push('Agrega una meta descripción para mejorar el SEO');
    } else if (post.meta_description.length < 150) {
      suggestions.push('La meta descripción debería tener al menos 150 caracteres');
    } else if (post.meta_description.length > 160) {
      suggestions.push('La meta descripción es muy larga, considera reducirla a 160 caracteres');
    }
    
    if (analysis.wordCount < 300) {
      suggestions.push('El contenido debería tener al menos 300 palabras para mejor posicionamiento');
    }
    
    if (analysis.headingCount === 0) {
      suggestions.push('Agrega encabezados (H2, H3) para mejorar la estructura del contenido');
    }
    
    if (!post.featured_image_url) {
      suggestions.push('Agrega una imagen destacada para mejorar el engagement');
    }
    
    if (!post.excerpt || post.excerpt.length < 50) {
      suggestions.push('Agrega un extracto descriptivo de al menos 50 caracteres');
    }
    
    if (!analysis.isSlugUnique) {
      suggestions.push('El slug debe ser único. Este slug ya existe en otro post');
    }
    
    return suggestions;
  };

  // Validar campos SEO
  const validateSEO = (post: BlogPost): SEOValidationErrors => {
    const errors: SEOValidationErrors = {};
    
    if (post.meta_title && post.meta_title.length > 70) {
      errors.metaTitle = 'El meta título no debería exceder 70 caracteres';
    }
    
    if (post.meta_description && (post.meta_description.length < 120 || post.meta_description.length > 160)) {
      errors.metaDescription = 'La meta descripción debería tener entre 120-160 caracteres';
    }
    
    if (!post.slug?.trim()) {
      errors.slug = 'El slug es requerido';
    } else if (!/^[a-z0-9-]+$/.test(post.slug)) {
      errors.slug = 'El slug solo puede contener letras minúsculas, números y guiones';
    } else if (!analysis.isSlugUnique) {
      errors.slug = 'Este slug ya existe. Debe ser único';
    }
    
    return errors;
  };

  // Analizar post completo
  const analyzePost = async (post: BlogPost) => {
    const contentAnalysis = analyzeContent(post.content || '');
    const readingTime = calculateReadingTime(post.content || '');
    const isSlugUnique = post.slug ? await checkSlugUniqueness(post.slug, post.id) : true;
    
    const newAnalysis: SEOAnalysis = {
      titleLength: post.title?.length || 0,
      metaTitleLength: post.meta_title?.length || 0,
      metaDescriptionLength: post.meta_description?.length || 0,
      readingTime,
      wordCount: contentAnalysis.words,
      paragraphCount: contentAnalysis.paragraphs,
      headingCount: contentAnalysis.headings,
      isSlugUnique,
      seoScore: 0,
      suggestions: []
    };
    
    newAnalysis.seoScore = calculateSEOScore(post, newAnalysis);
    newAnalysis.suggestions = generateSuggestions(post, newAnalysis);
    
    setAnalysis(newAnalysis);
    setSeoErrors(validateSEO(post));
    
    return newAnalysis;
  };

  return {
    analysis,
    seoErrors,
    isCheckingSlug,
    analyzePost,
    generateSlug,
    generateMetaTags,
    checkSlugUniqueness,
    validateSEO
  };
};