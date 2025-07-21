import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useOptimizedQuery, useSmartInvalidation } from './useOptimizedQuery';

export interface LandingPageTemplate {
  id: string;
  name: string;
  description?: string;
  type: 'lead_magnet' | 'valuation' | 'contact' | 'sector' | 'custom';
  template_html: string;
  template_config: Record<string, any>;
  preview_image_url?: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface LandingPage {
  id: string;
  title: string;
  slug: string;
  template_id?: string;
  content_config: Record<string, any>;
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string[];
  is_published: boolean;
  analytics_config: Record<string, any>;
  conversion_goals: any[];
  custom_css?: string;
  custom_js?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  published_at?: string;
}

export interface LandingPageFormData {
  title: string;
  slug: string;
  template_id?: string;
  content_config: Record<string, any>;
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string[];
  custom_css?: string;
  custom_js?: string;
}

// Placeholder data optimizado
const LANDING_PAGES_PLACEHOLDER = Array.from({ length: 6 }, (_, i) => ({
  id: `placeholder-${i}`,
  title: 'Cargando...',
  slug: `loading-${i}`,
  content_config: {},
  is_published: false,
  analytics_config: {},
  conversion_goals: [],
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
}));

const TEMPLATES_PLACEHOLDER = Array.from({ length: 3 }, (_, i) => ({
  id: `template-placeholder-${i}`,
  name: 'Plantilla ejemplo',
  type: 'custom' as const,
  template_html: '',
  template_config: {},
  is_active: true,
  display_order: i,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
}));

export const useLandingPageTemplates = () => {
  const { data: templates, isLoading } = useOptimizedQuery(
    ['landingPageTemplates'],
    async () => {
      const { data, error } = await supabase
        .from('landing_page_templates')
        .select('id, name, description, type, preview_image_url, is_active, display_order')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) {
        console.debug('Landing page templates table not available');
        return [] as LandingPageTemplate[];
      }
      return data as LandingPageTemplate[];
    },
    'static', // Templates cambian raramente
    {
      placeholderData: TEMPLATES_PLACEHOLDER,
      select: (data) => data?.filter(template => template.is_active) || []
    }
  );

  return { templates, isLoading };
};

export const useLandingPages = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { invalidateRelatedQueries } = useSmartInvalidation();

  const { data: landingPages, isLoading } = useOptimizedQuery(
    ['landingPages'],
    async () => {
      const { data, error } = await supabase
        .from('landing_pages')
        .select(`
          id,
          title,
          slug,
          template_id,
          is_published,
          created_at,
          updated_at,
          published_at,
          template:landing_page_templates(name, type)
        `)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) {
        console.debug('Landing pages tables not available');
        return [] as (LandingPage & { template?: { name: string; type: string } })[];
      }
      return data as (LandingPage & { template?: { name: string; type: string } })[];
    },
    'important',
    {
      placeholderData: LANDING_PAGES_PLACEHOLDER,
      select: (data) => data?.map(page => ({
        ...page,
        // Transformar datos para optimizar renderizado
        displayTitle: page.title || 'Sin título',
        statusBadge: page.is_published ? 'published' : 'draft',
        templateName: page.template?.name || 'Sin plantilla'
      })) || []
    }
  );

  const createLandingPage = useMutation({
    mutationFn: async (formData: LandingPageFormData) => {
      const { data: existing } = await supabase
        .from('landing_pages')
        .select('id')
        .eq('slug', formData.slug)
        .single();

      if (existing) {
        throw new Error('Ya existe una landing page con este slug');
      }

      const { data, error } = await supabase
        .from('landing_pages')
        .insert(formData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      invalidateRelatedQueries('landingPages', 500);
      toast({
        title: "Landing Page creada",
        description: "La landing page ha sido creada exitosamente.",
      });
    },
    onError: (error: Error) => {
      console.error('Error creando landing page:', error);
      toast({
        title: "Error",
        description: error.message || "Error al crear la landing page.",
        variant: "destructive",
      });
    },
  });

  const updateLandingPage = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<LandingPage> }) => {
      const { data, error } = await supabase
        .from('landing_pages')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      // Actualización optimista del cache
      queryClient.setQueryData(['landingPages'], (old: any) => 
        old?.map((page: any) => page.id === data.id ? { ...page, ...data } : page)
      );
      
      toast({
        title: "Landing Page actualizada",
        description: "Los cambios han sido guardados exitosamente.",
      });
    },
    onError: (error) => {
      console.error('Error actualizando landing page:', error);
      toast({
        title: "Error",
        description: "Error al actualizar la landing page.",
        variant: "destructive",
      });
    },
  });

  const togglePublish = useMutation({
    mutationFn: async ({ id, publish }: { id: string; publish: boolean }) => {
      const updates: Partial<LandingPage> = {
        is_published: publish,
      };

      if (publish) {
        updates.published_at = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from('landing_pages')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data, { publish }) => {
      // Actualización optimista
      queryClient.setQueryData(['landingPages'], (old: any) => 
        old?.map((page: any) => page.id === data.id ? { ...page, ...data } : page)
      );
      
      toast({
        title: publish ? "Landing Page publicada" : "Landing Page despublicada",
        description: publish 
          ? "La landing page ya está disponible públicamente."
          : "La landing page ya no es visible públicamente.",
      });
    },
    onError: (error) => {
      console.error('Error cambiando estado de publicación:', error);
      toast({
        title: "Error",
        description: "Error al cambiar el estado de publicación.",
        variant: "destructive",
      });
    },
  });

  const deleteLandingPage = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('landing_pages')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: (_, deletedId) => {
      // Actualización optimista
      queryClient.setQueryData(['landingPages'], (old: any) => 
        old?.filter((page: any) => page.id !== deletedId)
      );
      
      toast({
        title: "Landing Page eliminada",
        description: "La landing page ha sido eliminada exitosamente.",
      });
    },
    onError: (error) => {
      console.error('Error eliminando landing page:', error);
      toast({
        title: "Error",
        description: "Error al eliminar la landing page.",
        variant: "destructive",
      });
    },
  });

  const duplicateLandingPage = useMutation({
    mutationFn: async (id: string) => {
      const { data: original, error: fetchError } = await supabase
        .from('landing_pages')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      const duplicateData = {
        ...original,
        id: undefined,
        title: `${original.title} (Copia)`,
        slug: `${original.slug}-copy-${Date.now()}`,
        is_published: false,
        published_at: null,
        created_at: undefined,
        updated_at: undefined,
      };

      const { data, error } = await supabase
        .from('landing_pages')
        .insert(duplicateData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      invalidateRelatedQueries('landingPages', 500);
      toast({
        title: "Landing Page duplicada",
        description: "Se ha creado una copia de la landing page.",
      });
    },
    onError: (error) => {
      console.error('Error duplicando landing page:', error);
      toast({
        title: "Error",
        description: "Error al duplicar la landing page.",
        variant: "destructive",
      });
    },
  });

  return {
    landingPages,
    isLoading,
    createLandingPage,
    updateLandingPage,
    togglePublish,
    deleteLandingPage,
    duplicateLandingPage,
  };
};

export const useLandingPageBySlug = (slug: string) => {
  const { data: landingPage, isLoading, error } = useOptimizedQuery(
    ['landingPage', slug],
    async () => {
      const { data, error } = await supabase
        .from('landing_pages')
        .select(`
          id,
          title,
          slug,
          content_config,
          meta_title,
          meta_description,
          is_published,
          template:landing_page_templates(*)
        `)
        .eq('slug', slug)
        .eq('is_published', true)
        .single();

      if (error) throw error;
      return data as LandingPage & { template?: LandingPageTemplate };
    },
    'important',
    {
      enabled: !!slug,
      placeholderData: null
    }
  );

  return { landingPage, isLoading, error };
};

export const useLandingPageConversions = () => {
  const { toast } = useToast();

  const trackConversion = async (conversionData: {
    landing_page_id: string;
    conversion_type: string;
    form_data?: Record<string, any>;
    visitor_id?: string;
    session_id?: string;
    conversion_value?: number;
  }) => {
    try {
      const ipResponse = await fetch('https://api.ipify.org?format=json').catch(() => null);
      const ipData = ipResponse ? await ipResponse.json() : null;

      const { data, error } = await supabase
        .from('landing_page_conversions')
        .insert({
          ...conversionData,
          visitor_data: {
            user_agent: navigator.userAgent,
            referrer: document.referrer || null,
            screen_resolution: `${screen.width}x${screen.height}`,
            language: navigator.language,
          },
          attribution_data: {
            utm_source: new URLSearchParams(window.location.search).get('utm_source'),
            utm_medium: new URLSearchParams(window.location.search).get('utm_medium'),
            utm_campaign: new URLSearchParams(window.location.search).get('utm_campaign'),
            utm_content: new URLSearchParams(window.location.search).get('utm_content'),
            utm_term: new URLSearchParams(window.location.search).get('utm_term'),
          },
          ip_address: ipData?.ip,
          user_agent: navigator.userAgent,
          referrer: document.referrer || null,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "¡Conversión registrada!",
        description: "Gracias por tu interés. Te contactaremos pronto.",
      });

      return data;
    } catch (error) {
      console.error('Error registrando conversión:', error);
      toast({
        title: "Error",
        description: "Error al procesar tu solicitud. Inténtalo de nuevo.",
        variant: "destructive",
      });
      throw error;
    }
  };

  return { trackConversion };
};
