import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ReengagementTemplate {
  id: string;
  slug: string;
  label: string;
  description: string;
  brevo_segment: string;
  trigger_condition: string;
  default_subject: string;
  html_template: string;
  icon: string;
  variables_used: string[];
  is_system: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

export const useReengagementTemplates = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all active templates
  const {
    data: templates,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['reengagement-templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reengagement_templates')
        .select('*')
        .eq('is_active', true)
        .order('is_system', { ascending: false })
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as ReengagementTemplate[];
    },
  });

  // Create new template
  const createTemplate = useMutation({
    mutationFn: async (template: Omit<ReengagementTemplate, 'id' | 'created_at' | 'updated_at' | 'created_by'>) => {
      const { data, error } = await supabase
        .from('reengagement_templates')
        .insert({
          ...template,
          is_system: false,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reengagement-templates'] });
      toast({
        title: 'Template creado',
        description: 'El nuevo template de re-engagement ha sido guardado',
      });
    },
    onError: (error) => {
      console.error('Error creating template:', error);
      toast({
        title: 'Error',
        description: 'No se pudo crear el template',
        variant: 'destructive',
      });
    },
  });

  // Update template
  const updateTemplate = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ReengagementTemplate> & { id: string }) => {
      const { data, error } = await supabase
        .from('reengagement_templates')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reengagement-templates'] });
      toast({
        title: 'Template actualizado',
        description: 'Los cambios han sido guardados',
      });
    },
    onError: (error) => {
      console.error('Error updating template:', error);
      toast({
        title: 'Error',
        description: 'No se pudo actualizar el template',
        variant: 'destructive',
      });
    },
  });

  // Delete template (soft delete - set is_active = false)
  const deleteTemplate = useMutation({
    mutationFn: async (id: string) => {
      // Check if it's a system template
      const template = templates?.find(t => t.id === id);
      if (template?.is_system) {
        throw new Error('No se pueden eliminar templates del sistema');
      }

      const { error } = await supabase
        .from('reengagement_templates')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reengagement-templates'] });
      toast({
        title: 'Template eliminado',
        description: 'El template ha sido eliminado',
      });
    },
    onError: (error: Error) => {
      console.error('Error deleting template:', error);
      toast({
        title: 'Error',
        description: error.message || 'No se pudo eliminar el template',
        variant: 'destructive',
      });
    },
  });

  // Generate template with AI
  const generateWithAI = useMutation({
    mutationFn: async (params: {
      objective: string;
      audience: string;
      tone: 'profesional' | 'cercano' | 'urgente';
      cta_text: string;
      cta_url?: string;
    }) => {
      const { data, error } = await supabase.functions.invoke('generate-reengagement-template', {
        body: params,
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error || 'Failed to generate template');

      return data.template;
    },
    onError: (error) => {
      console.error('Error generating template:', error);
      toast({
        title: 'Error de generación',
        description: 'No se pudo generar el template con IA',
        variant: 'destructive',
      });
    },
  });

  return {
    templates,
    isLoading,
    error,
    refetch,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    generateWithAI,
  };
};
