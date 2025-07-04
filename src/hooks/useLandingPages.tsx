import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

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

export const useLandingPageTemplates = () => {
  const { data: templates, isLoading } = useQuery({
    queryKey: ['landingPageTemplates'],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('landing_page_templates')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) throw error;
      return data as LandingPageTemplate[];
    },
  });

  return { templates, isLoading };
};

export const useLandingPages = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Obtener todas las landing pages
  const { data: landingPages, isLoading } = useQuery({
    queryKey: ['landingPages'],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('landing_pages')
        .select(`
          *,
          template:landing_page_templates(name, type)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as (LandingPage & { template?: { name: string; type: string } })[];
    },
  });

  // Crear landing page
  const createLandingPage = useMutation({
    mutationFn: async (formData: LandingPageFormData) => {
      // Verificar que el slug sea único
      const { data: existing } = await (supabase as any)
        .from('landing_pages')
        .select('id')
        .eq('slug', formData.slug)
        .single();

      if (existing) {
        throw new Error('Ya existe una landing page con este slug');
      }

      const { data, error } = await (supabase as any)
        .from('landing_pages')
        .insert(formData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['landingPages'] });
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

  // Actualizar landing page
  const updateLandingPage = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<LandingPage> }) => {
      const { data, error } = await (supabase as any)
        .from('landing_pages')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['landingPages'] });
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

  // Publicar/despublicar landing page
  const togglePublish = useMutation({
    mutationFn: async ({ id, publish }: { id: string; publish: boolean }) => {
      const updates: Partial<LandingPage> = {
        is_published: publish,
      };

      if (publish) {
        updates.published_at = new Date().toISOString();
      }

      const { data, error } = await (supabase as any)
        .from('landing_pages')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, { publish }) => {
      queryClient.invalidateQueries({ queryKey: ['landingPages'] });
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

  // Eliminar landing page
  const deleteLandingPage = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any)
        .from('landing_pages')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['landingPages'] });
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

  // Duplicar landing page
  const duplicateLandingPage = useMutation({
    mutationFn: async (id: string) => {
      const { data: original, error: fetchError } = await (supabase as any)
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

      const { data, error } = await (supabase as any)
        .from('landing_pages')
        .insert(duplicateData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['landingPages'] });
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
  const { data: landingPage, isLoading, error } = useQuery({
    queryKey: ['landingPage', slug],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('landing_pages')
        .select(`
          *,
          template:landing_page_templates(*)
        `)
        .eq('slug', slug)
        .eq('is_published', true)
        .single();

      if (error) throw error;
      return data as LandingPage & { template?: LandingPageTemplate };
    },
    enabled: !!slug,
  });

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
      // Obtener información adicional del navegador
      const ipResponse = await fetch('https://api.ipify.org?format=json').catch(() => null);
      const ipData = ipResponse ? await ipResponse.json() : null;

      const { data, error } = await (supabase as any)
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