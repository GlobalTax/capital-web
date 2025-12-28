// ============= WORKFLOW TEMPLATES HOOK =============
// Hook for managing workflow task templates

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type TaskCategory = 'recepcion' | 'valoracion' | 'decision';
export type ResponsibleSystem = 'Manual' | 'Supabase' | 'CRM' | 'Brevo' | 'ROD';

export interface WorkflowTaskTemplate {
  id: string;
  task_name: string;
  task_order: number;
  task_category: TaskCategory;
  responsible_system: ResponsibleSystem;
  due_days_offset: number;
  is_active: boolean;
  is_automatable: boolean;
  description: string | null;
  lead_type: string;
  created_at: string;
  updated_at: string;
}

export type CreateWorkflowTaskInput = Omit<WorkflowTaskTemplate, 'id' | 'created_at' | 'updated_at'>;
export type UpdateWorkflowTaskInput = Partial<CreateWorkflowTaskInput>;

const QUERY_KEY = ['workflow-task-templates'];

export const useWorkflowTemplates = () => {
  const queryClient = useQueryClient();

  // Fetch all templates
  const { data: templates, isLoading, error } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workflow_task_templates')
        .select('*')
        .order('task_order', { ascending: true });
      
      if (error) throw error;
      return data as WorkflowTaskTemplate[];
    },
    staleTime: 5 * 60 * 1000,
  });

  // Create template
  const createMutation = useMutation({
    mutationFn: async (input: CreateWorkflowTaskInput) => {
      const { data, error } = await supabase
        .from('workflow_task_templates')
        .insert(input)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      toast.success('Tarea creada correctamente');
    },
    onError: (error: Error) => {
      toast.error(`Error al crear tarea: ${error.message}`);
    },
  });

  // Update template
  const updateMutation = useMutation({
    mutationFn: async ({ id, ...input }: { id: string } & UpdateWorkflowTaskInput) => {
      const { data, error } = await supabase
        .from('workflow_task_templates')
        .update(input)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      toast.success('Tarea actualizada');
    },
    onError: (error: Error) => {
      toast.error(`Error al actualizar: ${error.message}`);
    },
  });

  // Delete template
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('workflow_task_templates')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      toast.success('Tarea eliminada');
    },
    onError: (error: Error) => {
      toast.error(`Error al eliminar: ${error.message}`);
    },
  });

  // Reorder templates
  const reorderMutation = useMutation({
    mutationFn: async (updates: { id: string; task_order: number }[]) => {
      const promises = updates.map(({ id, task_order }) =>
        supabase
          .from('workflow_task_templates')
          .update({ task_order })
          .eq('id', id)
      );
      
      const results = await Promise.all(promises);
      const errors = results.filter(r => r.error);
      
      if (errors.length > 0) {
        throw new Error('Error reordering tasks');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
    onError: (error: Error) => {
      toast.error(`Error al reordenar: ${error.message}`);
    },
  });

  // Toggle active status
  const toggleActive = async (id: string, isActive: boolean) => {
    await updateMutation.mutateAsync({ id, is_active: isActive });
  };

  // Group templates by category
  const templatesByCategory = templates?.reduce((acc, template) => {
    if (!acc[template.task_category]) {
      acc[template.task_category] = [];
    }
    acc[template.task_category].push(template);
    return acc;
  }, {} as Record<TaskCategory, WorkflowTaskTemplate[]>) || {
    recepcion: [],
    valoracion: [],
    decision: [],
  };

  return {
    templates,
    templatesByCategory,
    isLoading,
    error,
    createTask: createMutation.mutateAsync,
    updateTask: updateMutation.mutateAsync,
    deleteTask: deleteMutation.mutateAsync,
    reorderTasks: reorderMutation.mutateAsync,
    toggleActive,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isReordering: reorderMutation.isPending,
  };
};
