/**
 * Hook for managing contact status configuration
 * Following the pattern of useLeadPipelineColumns.ts
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ContactStatus {
  id: string;
  status_key: string;
  label: string;
  color: string;
  icon: string;
  position: number;
  is_active: boolean;
  is_system: boolean;
  created_at: string;
  updated_at: string;
}

export type StatusFormData = {
  status_key: string;
  label: string;
  color: string;
  icon: string;
};

// Color mapping for badges (status_key -> Tailwind classes)
export const STATUS_COLOR_MAP: Record<string, { bg: string; text: string }> = {
  blue: { bg: 'bg-blue-100', text: 'text-blue-700' },
  purple: { bg: 'bg-purple-100', text: 'text-purple-700' },
  cyan: { bg: 'bg-cyan-100', text: 'text-cyan-700' },
  indigo: { bg: 'bg-indigo-100', text: 'text-indigo-700' },
  orange: { bg: 'bg-orange-100', text: 'text-orange-700' },
  yellow: { bg: 'bg-yellow-50', text: 'text-yellow-700' },
  green: { bg: 'bg-green-100', text: 'text-green-700' },
  red: { bg: 'bg-red-100', text: 'text-red-700' },
  gray: { bg: 'bg-gray-100', text: 'text-gray-600' },
  emerald: { bg: 'bg-emerald-100', text: 'text-emerald-700' },
  slate: { bg: 'bg-slate-100', text: 'text-slate-600' },
  amber: { bg: 'bg-amber-100', text: 'text-amber-700' },
  teal: { bg: 'bg-teal-100', text: 'text-teal-700' },
  pink: { bg: 'bg-pink-100', text: 'text-pink-700' },
};

export const useContactStatuses = () => {
  const queryClient = useQueryClient();

  // Fetch statuses from database
  const { data: statuses = [], isLoading, refetch } = useQuery({
    queryKey: ['contact-statuses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contact_statuses')
        .select('*')
        .order('position', { ascending: true });

      if (error) throw error;
      return data as ContactStatus[];
    },
    staleTime: 1000 * 30, // 30 seconds - faster sync for status changes
    refetchOnWindowFocus: true, // Auto-sync when user returns to tab
  });

  // Get only active statuses (for selectors)
  const activeStatuses = statuses.filter(s => s.is_active);

  // Get status by key
  const getStatusByKey = (key: string): ContactStatus | undefined => {
    return statuses.find(s => s.status_key === key);
  };

  // Update a single status
  const updateStatusMutation = useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<ContactStatus>;
    }) => {
      const { error } = await supabase
        .from('contact_statuses')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contact-statuses'] });
      toast.success('Estado actualizado');
    },
    onError: (error) => {
      toast.error('Error al actualizar el estado', { description: error.message });
    },
  });

  // Add a new status
  const addStatusMutation = useMutation({
    mutationFn: async (statusData: StatusFormData) => {
      // Get highest position
      const maxPosition = statuses.length > 0
        ? Math.max(...statuses.map(s => s.position))
        : 0;

      const { error } = await supabase
        .from('contact_statuses')
        .insert({
          ...statusData,
          position: maxPosition + 1,
          is_active: true,
          is_system: false,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contact-statuses'] });
      toast.success('Estado añadido');
    },
    onError: (error: any) => {
      if (error.message?.includes('duplicate') || error.code === '23505') {
        toast.error('Ya existe un estado con esa clave');
      } else {
        toast.error('Error al añadir el estado', { description: error.message });
      }
    },
  });

  // Toggle active/inactive
  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const { error } = await supabase
        .from('contact_statuses')
        .update({ is_active: isActive, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contact-statuses'] });
    },
    onError: (error) => {
      toast.error('Error al cambiar estado', { description: error.message });
    },
  });

  // Delete a status (only non-system, non-used)
  const deleteStatusMutation = useMutation({
    mutationFn: async (id: string) => {
      const status = statuses.find(s => s.id === id);
      if (status?.is_system) {
        throw new Error('No se puede eliminar un estado del sistema');
      }

      // Check if any contacts are using this status
      const { count: contactLeadsCount } = await supabase
        .from('contact_leads')
        .select('id', { count: 'exact', head: true })
        .eq('lead_status_crm', status?.status_key as any);

      const { count: valuationsCount } = await supabase
        .from('company_valuations')
        .select('id', { count: 'exact', head: true })
        .eq('lead_status_crm', status?.status_key as any);

      const totalUsage = (contactLeadsCount || 0) + (valuationsCount || 0);
      
      if (totalUsage > 0) {
        throw new Error(`No se puede eliminar: ${totalUsage} contactos usan este estado. Desactívalo en su lugar.`);
      }

      const { error } = await supabase
        .from('contact_statuses')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contact-statuses'] });
      toast.success('Estado eliminado');
    },
    onError: (error) => {
      toast.error('Error al eliminar el estado', { description: error.message });
    },
  });

  // Reorder statuses
  const reorderStatusesMutation = useMutation({
    mutationFn: async (orderedIds: string[]) => {
      const updates = orderedIds.map((id, index) =>
        supabase
          .from('contact_statuses')
          .update({ position: index + 1, updated_at: new Date().toISOString() })
          .eq('id', id)
      );

      const results = await Promise.all(updates);
      const errors = results.filter(r => r.error);

      if (errors.length > 0) {
        throw new Error('Error al reordenar algunos estados');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contact-statuses'] });
    },
    onError: (error) => {
      toast.error('Error al reordenar estados', { description: error.message });
    },
  });

  return {
    statuses,
    activeStatuses,
    isLoading,
    refetch,
    getStatusByKey,
    updateStatus: updateStatusMutation.mutate,
    isUpdating: updateStatusMutation.isPending,
    addStatus: addStatusMutation.mutate,
    isAdding: addStatusMutation.isPending,
    toggleActive: toggleActiveMutation.mutate,
    isToggling: toggleActiveMutation.isPending,
    deleteStatus: deleteStatusMutation.mutate,
    isDeleting: deleteStatusMutation.isPending,
    reorderStatuses: reorderStatusesMutation.mutate,
    isReordering: reorderStatusesMutation.isPending,
  };
};
