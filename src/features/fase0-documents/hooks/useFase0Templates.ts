import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { 
  Fase0DocumentTemplate, 
  Fase0DocumentType,
  Fase0TemplateSection,
  Fase0FeeStructure,
} from '../types';

const QUERY_KEY = 'fase0-templates';

// Fetch all templates
export const useFase0Templates = (documentType?: Fase0DocumentType) => {
  return useQuery({
    queryKey: [QUERY_KEY, documentType],
    queryFn: async () => {
      let query = supabase
        .from('fase0_document_templates')
        .select('*')
        .eq('is_active', true)
        .order('document_type')
        .order('name');
      
      if (documentType) {
        query = query.eq('document_type', documentType);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      return (data || []).map(template => ({
        id: template.id,
        document_type: template.document_type as Fase0DocumentType,
        name: template.name,
        version: template.version || '1.0',
        sections: (template.sections as unknown as Fase0TemplateSection[]) || [],
        available_variables: (template.available_variables as unknown as string[]) || [],
        fee_structure: (template.fee_structure as unknown as Fase0FeeStructure) || null,
        description: template.description,
        is_active: template.is_active ?? true,
        created_by: template.created_by,
        created_at: template.created_at,
        updated_at: template.updated_at,
      })) as Fase0DocumentTemplate[];
    },
  });
};

// Fetch single template
export const useFase0Template = (templateId: string | undefined) => {
  return useQuery({
    queryKey: [QUERY_KEY, 'single', templateId],
    queryFn: async () => {
      if (!templateId) return null;
      
      const { data, error } = await supabase
        .from('fase0_document_templates')
        .select('*')
        .eq('id', templateId)
        .single();
      
      if (error) throw error;
      
      return {
        id: data.id,
        document_type: data.document_type as Fase0DocumentType,
        name: data.name,
        version: data.version || '1.0',
        sections: (data.sections as unknown as Fase0TemplateSection[]) || [],
        available_variables: (data.available_variables as unknown as string[]) || [],
        fee_structure: (data.fee_structure as unknown as Fase0FeeStructure) || null,
        description: data.description,
        is_active: data.is_active ?? true,
        created_by: data.created_by,
        created_at: data.created_at,
        updated_at: data.updated_at,
      } as Fase0DocumentTemplate;
    },
    enabled: !!templateId,
  });
};

// Update template
export const useUpdateFase0Template = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      id, 
      updates 
    }: { 
      id: string; 
      updates: Partial<Pick<Fase0DocumentTemplate, 'name' | 'version' | 'sections' | 'available_variables' | 'fee_structure' | 'description' | 'is_active'>>
    }) => {
      const { data, error } = await supabase
        .from('fase0_document_templates')
        .update(updates as Record<string, unknown>)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success('Plantilla actualizada');
    },
    onError: (error) => {
      console.error('Error updating template:', error);
      toast.error('Error al actualizar la plantilla');
    },
  });
};

// Create template
export const useCreateFase0Template = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (template: {
      document_type: string;
      name: string;
      version?: string;
      sections?: Fase0TemplateSection[];
      available_variables?: string[];
      fee_structure?: Fase0FeeStructure | null;
      description?: string;
      is_active?: boolean;
    }) => {
      const { data, error } = await supabase
        .from('fase0_document_templates')
        .insert([template as Record<string, unknown>])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success('Plantilla creada');
    },
    onError: (error) => {
      console.error('Error creating template:', error);
      toast.error('Error al crear la plantilla');
    },
  });
};

// Delete (soft) template
export const useDeleteFase0Template = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('fase0_document_templates')
        .update({ is_active: false })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success('Plantilla eliminada');
    },
    onError: (error) => {
      console.error('Error deleting template:', error);
      toast.error('Error al eliminar la plantilla');
    },
  });
};
