import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { AdminUser } from '@/hooks/useAdminUsers';

const QUERY_KEY = 'mandato-equipo';

export interface MandatoEquipoData {
  ownerId: string | null;
  teamMemberIds: string[];
  ownerData: AdminUser | null;
  teamData: AdminUser[];
}

export function useMandatoEquipo(mandatoId: string | undefined) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // ── READ: owner + team member ids from mandatos ──────────────────────────
  const { data, isLoading } = useQuery({
    queryKey: [QUERY_KEY, mandatoId],
    queryFn: async (): Promise<MandatoEquipoData> => {
      if (!mandatoId) return { ownerId: null, teamMemberIds: [], ownerData: null, teamData: [] };

      const { data: mandato, error } = await supabase
        .from('mandatos')
        .select('owner_id, team_member_ids')
        .eq('id', mandatoId)
        .single();

      if (error) {
        // If columns don't exist yet (migration pending), return empty
        console.warn('[useMandatoEquipo] Could not fetch team data:', error.message);
        return { ownerId: null, teamMemberIds: [], ownerData: null, teamData: [] };
      }

      const ownerId = (mandato as any)?.owner_id ?? null;
      const teamMemberIds: string[] = (mandato as any)?.team_member_ids ?? [];

      // Fetch admin_users data for owner + team
      const allIds = [ownerId, ...teamMemberIds].filter(Boolean) as string[];

      if (allIds.length === 0) {
        return { ownerId, teamMemberIds, ownerData: null, teamData: [] };
      }

      const { data: adminUsers } = await supabase
        .from('admin_users')
        .select('id, user_id, full_name, email, role, is_active, created_at')
        .in('user_id', allIds);

      const users = (adminUsers || []) as AdminUser[];
      const ownerData = ownerId ? (users.find(u => u.user_id === ownerId) ?? null) : null;
      const teamData = teamMemberIds
        .map(id => users.find(u => u.user_id === id))
        .filter(Boolean) as AdminUser[];

      return { ownerId, teamMemberIds, ownerData, teamData };
    },
    enabled: !!mandatoId,
  });

  // ── MUTATION: set owner ──────────────────────────────────────────────────
  const setOwnerMutation = useMutation({
    mutationFn: async (newOwnerId: string | null) => {
      if (!mandatoId) throw new Error('mandatoId requerido');

      console.log('[useMandatoEquipo] setOwner:', { mandatoId, newOwnerId });

      const { error } = await supabase
        .from('mandatos')
        .update({ owner_id: newOwnerId } as any)
        .eq('id', mandatoId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, mandatoId] });
      toast({ title: '✅ Responsable actualizado' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error al actualizar responsable', description: error.message, variant: 'destructive' });
    },
  });

  // ── MUTATION: add team member ─────────────────────────────────────────────
  const addMemberMutation = useMutation({
    mutationFn: async (userId: string) => {
      if (!mandatoId) throw new Error('mandatoId requerido');

      const currentIds = data?.teamMemberIds ?? [];
      if (currentIds.includes(userId)) return; // Already a member

      const newIds = [...currentIds, userId];

      console.log('[useMandatoEquipo] addMember:', { mandatoId, userId, newIds });

      const { error } = await supabase
        .from('mandatos')
        .update({ team_member_ids: newIds } as any)
        .eq('id', mandatoId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, mandatoId] });
      toast({ title: '✅ Miembro añadido al equipo' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error al añadir miembro', description: error.message, variant: 'destructive' });
    },
  });

  // ── MUTATION: remove team member ─────────────────────────────────────────
  const removeMemberMutation = useMutation({
    mutationFn: async (userId: string) => {
      if (!mandatoId) throw new Error('mandatoId requerido');

      const currentIds = data?.teamMemberIds ?? [];
      const newIds = currentIds.filter(id => id !== userId);

      console.log('[useMandatoEquipo] removeMember:', { mandatoId, userId, newIds });

      const { error } = await supabase
        .from('mandatos')
        .update({ team_member_ids: newIds } as any)
        .eq('id', mandatoId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, mandatoId] });
      toast({ title: '🗑️ Miembro eliminado del equipo' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error al eliminar miembro', description: error.message, variant: 'destructive' });
    },
  });

  return {
    ownerId: data?.ownerId ?? null,
    teamMemberIds: data?.teamMemberIds ?? [],
    ownerData: data?.ownerData ?? null,
    teamData: data?.teamData ?? [],
    isLoading,
    setOwner: setOwnerMutation.mutate,
    isSettingOwner: setOwnerMutation.isPending,
    addMember: addMemberMutation.mutate,
    isAddingMember: addMemberMutation.isPending,
    removeMember: removeMemberMutation.mutate,
    isRemovingMember: removeMemberMutation.isPending,
    isUpdating: setOwnerMutation.isPending || addMemberMutation.isPending || removeMemberMutation.isPending,
  };
}
