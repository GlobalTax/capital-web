import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface JobTemplate {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  title_template: string | null;
  short_description_template: string | null;
  description_template: string | null;
  requirements_template: string[] | null;
  responsibilities_template: string[] | null;
  benefits_template: string[] | null;
  default_location: string | null;
  default_contract_type: string | null;
  default_employment_type: string | null;
  default_is_remote: boolean | null;
  default_is_hybrid: boolean | null;
  default_experience_level: string | null;
  default_sector: string | null;
  is_active: boolean | null;
  times_used: number | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export type JobTemplateInsert = Omit<JobTemplate, 'id' | 'created_at' | 'updated_at'>;

export const useJobTemplates = (filters?: { category?: string }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Obtener todas las plantillas
  const { data: templates, isLoading } = useQuery({
    queryKey: ['job-templates', filters],
    queryFn: async () => {
      let query = supabase
        .from('job_post_templates')
        .select('*')
        .eq('is_active', true)
        .order('times_used', { ascending: false });

      if (filters?.category) {
        query = query.eq('category', filters.category);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as JobTemplate[];
    },
  });

  // Crear plantilla
  const { mutateAsync: createTemplate } = useMutation({
    mutationFn: async (template: Partial<JobTemplateInsert>) => {
      const { data, error } = await supabase
        .from('job_post_templates')
        .insert([template as any])
        .select()
        .single();

      if (error) throw error;
      return data as JobTemplate;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-templates'] });
      toast({
        title: 'Plantilla creada',
        description: 'La plantilla se ha creado correctamente',
      });
    },
    onError: (error) => {
      console.error('Error creating template:', error);
      toast({
        title: 'Error',
        description: 'No se pudo crear la plantilla',
        variant: 'destructive',
      });
    },
  });

  // Actualizar plantilla
  const { mutateAsync: updateTemplate } = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<JobTemplate> }) => {
      const { data, error } = await supabase
        .from('job_post_templates')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-templates'] });
      toast({
        title: 'Plantilla actualizada',
        description: 'La plantilla se ha actualizado correctamente',
      });
    },
    onError: (error) => {
      console.error('Error updating template:', error);
      toast({
        title: 'Error',
        description: 'No se pudo actualizar la plantilla',
        variant: 'destructive',
      });
    },
  });

  // Eliminar plantilla (soft delete)
  const { mutateAsync: deleteTemplate } = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('job_post_templates')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-templates'] });
      toast({
        title: 'Plantilla eliminada',
        description: 'La plantilla se ha eliminado correctamente',
      });
    },
    onError: (error) => {
      console.error('Error deleting template:', error);
      toast({
        title: 'Error',
        description: 'No se pudo eliminar la plantilla',
        variant: 'destructive',
      });
    },
  });

  // Incrementar contador de uso
  const { mutateAsync: incrementUsage } = useMutation({
    mutationFn: async (id: string) => {
      const template = templates?.find(t => t.id === id);
      if (template) {
        const { error } = await supabase
          .from('job_post_templates')
          .update({ times_used: (template.times_used || 0) + 1 })
          .eq('id', id);
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-templates'] });
    },
  });

  return {
    templates,
    isLoading,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    incrementUsage,
  };
};
