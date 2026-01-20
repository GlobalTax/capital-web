import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { 
  PresentationProject, 
  Slide, 
  BrandKit, 
  PresentationTemplate,
  CreatePresentationInput,
  UpdateSlideInput,
  SharingLink,
  SlideContent
} from '../types/presentation.types';
import type { Json } from '@/integrations/supabase/types';

const QUERY_KEYS = {
  presentations: ['presentations'],
  presentation: (id: string) => ['presentations', id],
  slides: (projectId: string) => ['presentations', projectId, 'slides'],
  brandKits: ['brand-kits'],
  templates: ['presentation-templates'],
  sharingLinks: (projectId: string) => ['presentations', projectId, 'sharing-links'],
};

// Fetch all presentations
export const usePresentations = () => {
  return useQuery({
    queryKey: QUERY_KEYS.presentations,
    queryFn: async (): Promise<PresentationProject[]> => {
      const { data, error } = await supabase
        .from('presentation_projects')
        .select(`
          *,
          brand_kit:brand_kits(*)
        `)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      return data as PresentationProject[];
    }
  });
};

// Fetch single presentation with slides
export const usePresentation = (id: string | undefined) => {
  return useQuery({
    queryKey: QUERY_KEYS.presentation(id || ''),
    queryFn: async (): Promise<PresentationProject> => {
      if (!id) throw new Error('Presentation ID required');
      
      const { data, error } = await supabase
        .from('presentation_projects')
        .select(`
          *,
          brand_kit:brand_kits(*),
          slides:presentation_slides(*)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      
      // Sort slides by order_index and cast types
      const result = {
        ...data,
        slides: data.slides
          ?.sort((a: { order_index: number }, b: { order_index: number }) => a.order_index - b.order_index)
          .map((s: Record<string, unknown>) => ({ ...s, content: s.content as SlideContent }))
      };
      
      return result as PresentationProject;
    },
    enabled: !!id
  });
};

// Fetch presentation by sharing token
export const usePresentationByToken = (token: string | undefined) => {
  return useQuery({
    queryKey: ['presentation-shared', token],
    queryFn: async (): Promise<{ project: PresentationProject; permission: string }> => {
      if (!token) throw new Error('Token required');
      
      // First get the sharing link
      const { data: linkData, error: linkError } = await supabase
        .from('presentation_sharing_links')
        .select('project_id, permission, expires_at, is_active, max_views, view_count')
        .eq('token', token)
        .single();

      if (linkError) throw new Error('Invalid or expired link');
      if (!linkData.is_active) throw new Error('Link is no longer active');
      if (linkData.expires_at && new Date(linkData.expires_at) < new Date()) {
        throw new Error('Link has expired');
      }
      if (linkData.max_views && linkData.view_count >= linkData.max_views) {
        throw new Error('Maximum views reached');
      }

      // Increment view count
      await supabase
        .from('presentation_sharing_links')
        .update({ 
          view_count: (linkData.view_count || 0) + 1,
          last_accessed_at: new Date().toISOString()
        })
        .eq('token', token);

      // Get the presentation
      const { data, error } = await supabase
        .from('presentation_projects')
        .select(`
          *,
          brand_kit:brand_kits(*),
          slides:presentation_slides(*)
        `)
        .eq('id', linkData.project_id)
        .single();

      if (error) throw error;
      
      const result = {
        ...data,
        slides: data.slides
          ?.sort((a: { order_index: number }, b: { order_index: number }) => a.order_index - b.order_index)
          .map((s: Record<string, unknown>) => ({ ...s, content: s.content as SlideContent }))
      };
      
      return { 
        project: result as PresentationProject, 
        permission: linkData.permission 
      };
    },
    enabled: !!token
  });
};

// Fetch slides for a presentation
export const useSlides = (projectId: string | undefined) => {
  return useQuery({
    queryKey: QUERY_KEYS.slides(projectId || ''),
    queryFn: async (): Promise<Slide[]> => {
      if (!projectId) throw new Error('Project ID required');
      
      const { data, error } = await supabase
        .from('presentation_slides')
        .select('*')
        .eq('project_id', projectId)
        .order('order_index', { ascending: true });

      if (error) throw error;
      return data as Slide[];
    },
    enabled: !!projectId
  });
};

// Fetch brand kits
export const useBrandKits = () => {
  return useQuery({
    queryKey: QUERY_KEYS.brandKits,
    queryFn: async (): Promise<BrandKit[]> => {
      const { data, error } = await supabase
        .from('brand_kits')
        .select('*')
        .order('is_default', { ascending: false });

      if (error) throw error;
      return data as BrandKit[];
    }
  });
};

// Fetch templates
export const useTemplates = () => {
  return useQuery({
    queryKey: QUERY_KEYS.templates,
    queryFn: async (): Promise<PresentationTemplate[]> => {
      const { data, error } = await supabase
        .from('presentation_templates')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) throw error;
      return data as PresentationTemplate[];
    }
  });
};

// Create presentation
export const useCreatePresentation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (input: CreatePresentationInput): Promise<PresentationProject> => {
      // Get template if specified
      let slidesConfig: Partial<Slide>[] = [];
      if (input.template_id) {
        const { data: template } = await supabase
          .from('presentation_templates')
          .select('slides_config')
          .eq('id', input.template_id)
          .single();
        
        if (template?.slides_config) {
          slidesConfig = template.slides_config as Partial<Slide>[];
        }
      }

      // Get default brand kit if none specified
      let brandKitId = input.brand_kit_id;
      if (!brandKitId) {
        const { data: defaultKit } = await supabase
          .from('brand_kits')
          .select('id')
          .eq('is_default', true)
          .single();
        brandKitId = defaultKit?.id;
      }

      // Create project
      const { data: project, error: projectError } = await supabase
        .from('presentation_projects')
        .insert({
          title: input.title,
          description: input.description,
          type: input.type,
          brand_kit_id: brandKitId,
          theme: input.theme || 'light',
          client_name: input.client_name,
          project_code: input.project_code,
          status: 'draft'
        })
        .select()
        .single();

      if (projectError) throw projectError;

      // Create slides from template
      if (slidesConfig.length > 0) {
        const slides = slidesConfig.map((slide, index) => ({
          project_id: project.id,
          order_index: index,
          layout: slide.layout || 'custom',
          headline: slide.headline || '',
          subline: slide.subline || '',
          content: (slide.content || {}) as Json,
          is_hidden: false
        }));

        const { error: slidesError } = await supabase
          .from('presentation_slides')
          .insert(slides);

        if (slidesError) throw slidesError;
      }

      return project as PresentationProject;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.presentations });
      toast.success('Presentation created');
    },
    onError: (error) => {
      toast.error('Failed to create presentation: ' + error.message);
    }
  });
};

// Update presentation
export const useUpdatePresentation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, slides, brand_kit, ...updates }: Partial<PresentationProject> & { id: string }) => {
      const { data, error } = await supabase
        .from('presentation_projects')
        .update({ ...updates, metadata: (updates.metadata || {}) as Json })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as PresentationProject;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.presentation(data.id) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.presentations });
    },
    onError: (error) => {
      toast.error('Failed to update presentation: ' + error.message);
    }
  });
};

// Delete presentation
export const useDeletePresentation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('presentation_projects')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.presentations });
      toast.success('Presentation deleted');
    },
    onError: (error) => {
      toast.error('Failed to delete presentation: ' + error.message);
    }
  });
};

// Update slide
export const useUpdateSlide = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, projectId, content, ...updates }: UpdateSlideInput & { id: string; projectId: string }) => {
      const updateData = content ? { ...updates, content: content as Json } : updates;
      const { data, error } = await supabase
        .from('presentation_slides')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { slide: { ...data, content: data.content as SlideContent } as Slide, projectId };
    },
    onSuccess: ({ projectId }) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.slides(projectId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.presentation(projectId) });
    },
    onError: (error) => {
      toast.error('Failed to update slide: ' + error.message);
    }
  });
};

// Create slide
export const useCreateSlide = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ projectId, content, ...slide }: Partial<Slide> & { projectId: string }) => {
      // Get max order_index
      const { data: existing } = await supabase
        .from('presentation_slides')
        .select('order_index')
        .eq('project_id', projectId)
        .order('order_index', { ascending: false })
        .limit(1);

      const maxOrder = existing?.[0]?.order_index ?? -1;

      const { data, error } = await supabase
        .from('presentation_slides')
        .insert({
          project_id: projectId,
          order_index: maxOrder + 1,
          layout: slide.layout || 'custom',
          headline: slide.headline,
          subline: slide.subline,
          content: (content || {}) as Json,
          is_hidden: false
        })
        .select()
        .single();

      if (error) throw error;
      return { slide: data as Slide, projectId };
    },
    onSuccess: ({ projectId }) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.slides(projectId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.presentation(projectId) });
      toast.success('Slide added');
    },
    onError: (error) => {
      toast.error('Failed to add slide: ' + error.message);
    }
  });
};

// Delete slide
export const useDeleteSlide = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, projectId }: { id: string; projectId: string }) => {
      const { error } = await supabase
        .from('presentation_slides')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return projectId;
    },
    onSuccess: (projectId) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.slides(projectId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.presentation(projectId) });
      toast.success('Slide deleted');
    },
    onError: (error) => {
      toast.error('Failed to delete slide: ' + error.message);
    }
  });
};

// Reorder slides
export const useReorderSlides = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ projectId, slideIds }: { projectId: string; slideIds: string[] }) => {
      // Update each slide's order_index
      const updates = slideIds.map((id, index) => 
        supabase
          .from('presentation_slides')
          .update({ order_index: index })
          .eq('id', id)
      );

      await Promise.all(updates);
      return projectId;
    },
    onSuccess: (projectId) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.slides(projectId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.presentation(projectId) });
    },
    onError: (error) => {
      toast.error('Failed to reorder slides: ' + error.message);
    }
  });
};

// Create sharing link
export const useCreateSharingLink = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (input: Partial<SharingLink> & { project_id: string }) => {
      const { data, error } = await supabase
        .from('presentation_sharing_links')
        .insert({
          project_id: input.project_id,
          permission: input.permission || 'view',
          expires_at: input.expires_at,
          max_views: input.max_views,
          recipient_email: input.recipient_email,
          recipient_name: input.recipient_name,
          is_active: true
        })
        .select()
        .single();

      if (error) throw error;
      return data as SharingLink;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.sharingLinks(data.project_id) });
      toast.success('Sharing link created');
    },
    onError: (error) => {
      toast.error('Failed to create sharing link: ' + error.message);
    }
  });
};

// Fetch sharing links
export const useSharingLinks = (projectId: string | undefined) => {
  return useQuery({
    queryKey: QUERY_KEYS.sharingLinks(projectId || ''),
    queryFn: async (): Promise<SharingLink[]> => {
      if (!projectId) throw new Error('Project ID required');
      
      const { data, error } = await supabase
        .from('presentation_sharing_links')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as SharingLink[];
    },
    enabled: !!projectId
  });
};

// Delete sharing link
export const useDeleteSharingLink = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, projectId }: { id: string; projectId: string }) => {
      const { error } = await supabase
        .from('presentation_sharing_links')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return projectId;
    },
    onSuccess: (projectId) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.sharingLinks(projectId) });
      toast.success('Sharing link deleted');
    },
    onError: (error) => {
      toast.error('Failed to delete sharing link: ' + error.message);
    }
  });
};
