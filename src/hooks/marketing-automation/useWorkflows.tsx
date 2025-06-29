
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { AutomationWorkflow } from '@/types/marketingAutomation';

export const useWorkflows = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Obtener workflows
  const { data: workflows, isLoading: isLoadingWorkflows } = useQuery({
    queryKey: ['automationWorkflows'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('automation_workflows')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as AutomationWorkflow[];
    },
  });

  // Crear workflow
  const createWorkflow = useMutation({
    mutationFn: async (workflowData: Omit<AutomationWorkflow, 'id' | 'created_at' | 'updated_at' | 'execution_count' | 'last_executed'>) => {
      const { data, error } = await supabase
        .from('automation_workflows')
        .insert(workflowData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automationWorkflows'] });
      toast({
        title: "⚡ Workflow creado",
        description: "El workflow de automatización ha sido creado exitosamente.",
      });
    },
  });

  return {
    workflows,
    isLoadingWorkflows,
    createWorkflow,
  };
};
