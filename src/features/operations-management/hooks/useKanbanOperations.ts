import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Operation } from '../types/operations';

interface KanbanFilters {
  assigned_to?: string;
  sector?: string;
  search?: string;
}

export const KANBAN_COLUMNS = [
  { id: 'prospecting', label: 'Prospección', color: 'bg-slate-100' },
  { id: 'initial_contact', label: 'Contacto Inicial', color: 'bg-blue-100' },
  { id: 'qualification', label: 'Calificación', color: 'bg-purple-100' },
  { id: 'proposal', label: 'Propuesta', color: 'bg-yellow-100' },
  { id: 'negotiation', label: 'Negociación', color: 'bg-orange-100' },
  { id: 'due_diligence', label: 'Due Diligence', color: 'bg-pink-100' },
  { id: 'closing', label: 'Cierre', color: 'bg-green-100' },
  { id: 'closed_won', label: 'Ganada', color: 'bg-emerald-200' },
  { id: 'closed_lost', label: 'Perdida', color: 'bg-red-100' },
] as const;

export const useKanbanOperations = (filters: KanbanFilters = {}) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: operations, isLoading } = useQuery({
    queryKey: ['kanban-operations', filters],
    queryFn: async () => {
      let query = supabase
        .from('company_operations')
        .select('*')
        .eq('is_deleted', false)
        .eq('is_active', true);

      if (filters.assigned_to) {
        query = query.eq('assigned_to', filters.assigned_to);
      }

      if (filters.sector) {
        query = query.eq('sector', filters.sector);
      }

      if (filters.search) {
        query = query.or(`company_name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      return data as Operation[];
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ operationId, newStatus }: { operationId: string; newStatus: string }) => {
      const { error } = await supabase
        .from('company_operations')
        .update({
          status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq('id', operationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kanban-operations'] });
      queryClient.invalidateQueries({ queryKey: ['operations'] });
      queryClient.invalidateQueries({ queryKey: ['operations-analytics'] });
      toast({
        title: 'Estado actualizado',
        description: 'La operación se ha movido correctamente',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error al actualizar',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const operationsByStatus = KANBAN_COLUMNS.reduce((acc, column) => {
    acc[column.id] = (operations || []).filter(op => op.status === column.id);
    return acc;
  }, {} as Record<string, Operation[]>);

  return {
    operations,
    operationsByStatus,
    isLoading,
    updateStatus: updateStatusMutation.mutate,
    isUpdating: updateStatusMutation.isPending,
  };
};
