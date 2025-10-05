import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface LeadTask {
  id: string;
  lead_id: string;
  lead_type: 'valuation' | 'contact' | 'collaborator';
  task_name: string;
  task_order: number;
  status: 'pending' | 'in_progress' | 'completed' | 'skipped';
  assigned_to: string | null;
  due_date: string | null;
  completed_at: string | null;
  completed_by: string | null;
  notes: string | null;
  is_system_task: boolean;
  task_category: 'recepcion' | 'valoracion' | 'decision' | null;
  responsible_system: string | null;
  deliverable_url: string | null;
  is_automated: boolean;
  created_at: string;
  updated_at: string;
}

export const useLeadTasks = (leadId: string, leadType: 'valuation' | 'contact' | 'collaborator') => {
  const queryClient = useQueryClient();

  // Fetch tasks for a lead
  const { data: tasks = [], isLoading, error } = useQuery({
    queryKey: ['lead-tasks', leadId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lead_tasks')
        .select('*')
        .eq('lead_id', leadId)
        .eq('lead_type', leadType)
        .order('task_order', { ascending: true });

      if (error) throw error;
      return data as LeadTask[];
    },
    enabled: !!leadId,
  });

  // Update task status
  const updateStatus = useMutation({
    mutationFn: async ({ taskId, status }: { taskId: string; status: LeadTask['status'] }) => {
      const { error } = await supabase
        .from('lead_tasks')
        .update({ status })
        .eq('id', taskId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lead-tasks', leadId] });
      toast.success('Estado de tarea actualizado');
    },
    onError: (error: any) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  // Assign task
  const assignTask = useMutation({
    mutationFn: async ({ taskId, adminId }: { taskId: string; adminId: string | null }) => {
      const { error } = await supabase
        .from('lead_tasks')
        .update({ assigned_to: adminId })
        .eq('id', taskId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lead-tasks', leadId] });
      toast.success('Tarea asignada correctamente');
    },
    onError: (error: any) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  // Update due date
  const updateDueDate = useMutation({
    mutationFn: async ({ taskId, dueDate }: { taskId: string; dueDate: string | null }) => {
      const { error } = await supabase
        .from('lead_tasks')
        .update({ due_date: dueDate })
        .eq('id', taskId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lead-tasks', leadId] });
      toast.success('Fecha límite actualizada');
    },
    onError: (error: any) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  // Add/update notes
  const updateNotes = useMutation({
    mutationFn: async ({ taskId, notes }: { taskId: string; notes: string }) => {
      const { error } = await supabase
        .from('lead_tasks')
        .update({ notes })
        .eq('id', taskId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lead-tasks', leadId] });
      toast.success('Notas guardadas');
    },
    onError: (error: any) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  // Create custom task
  const createTask = useMutation({
    mutationFn: async ({ 
      taskName, 
      dueDate, 
      assignedTo 
    }: { 
      taskName: string; 
      dueDate?: string; 
      assignedTo?: string;
    }) => {
      const maxOrder = tasks.length > 0 ? Math.max(...tasks.map(t => t.task_order)) : 0;
      
      const { error } = await supabase
        .from('lead_tasks')
        .insert({
          lead_id: leadId,
          lead_type: leadType,
          task_name: taskName,
          task_order: maxOrder + 1,
          status: 'pending',
          is_system_task: false,
          due_date: dueDate || null,
          assigned_to: assignedTo || null,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lead-tasks', leadId] });
      toast.success('Tarea creada correctamente');
    },
    onError: (error: any) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  // Update deliverable URL
  const uploadDeliverable = useMutation({
    mutationFn: async ({ taskId, url }: { taskId: string; url: string }) => {
      const { error } = await supabase
        .from('lead_tasks')
        .update({ deliverable_url: url })
        .eq('id', taskId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lead-tasks', leadId] });
      toast.success('URL del entregable guardada');
    },
    onError: (error: any) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  // Delete task (solo custom tasks)
  const deleteTask = useMutation({
    mutationFn: async (taskId: string) => {
      const { error } = await supabase
        .from('lead_tasks')
        .delete()
        .eq('id', taskId)
        .eq('is_system_task', false); // Solo custom tasks

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lead-tasks', leadId] });
      toast.success('Tarea eliminada');
    },
    onError: (error: any) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  // Get overdue tasks
  const overdueTasks = tasks.filter(task => {
    if (task.status === 'completed' || !task.due_date) return false;
    return new Date(task.due_date) < new Date();
  });

  // Calculate progress
  const completedCount = tasks.filter(t => t.status === 'completed').length;
  const totalCount = tasks.length;
  const progressPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return {
    tasks,
    isLoading,
    error,
    overdueTasks,
    completedCount,
    totalCount,
    progressPercentage,
    updateStatus: updateStatus.mutate,
    assignTask: assignTask.mutate,
    updateDueDate: updateDueDate.mutate,
    updateNotes: updateNotes.mutate,
    uploadDeliverable: uploadDeliverable.mutate,
    createTask: createTask.mutate,
    deleteTask: deleteTask.mutate,
  };
};
