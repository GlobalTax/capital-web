import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface DealPausedItem {
  id: string;
  company_id: string;
  reason_id: string;
  notes: string | null;
  reminder_at: string | null;
  reminder_text: string | null;
  status: string;
  reactivated_at: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  empresa?: { id: string; nombre: string; sector: string | null; ubicacion: string | null } | null;
  reason?: { id: string; name: string } | null;
}

export interface PausedReason {
  id: string;
  name: string;
  is_active: boolean;
  sort_order: number;
}

export function usePausedReasons() {
  return useQuery({
    queryKey: ['paused-reasons'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('paused_reasons')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');
      if (error) throw error;
      return data as PausedReason[];
    },
  });
}

export function useActivePause(companyId: string | undefined) {
  return useQuery({
    queryKey: ['active-pause', companyId],
    queryFn: async () => {
      if (!companyId) return null;
      const { data, error } = await supabase
        .from('deal_paused_items')
        .select('*, reason:paused_reasons(id, name)')
        .eq('company_id', companyId)
        .eq('status', 'paused')
        .maybeSingle();
      if (error) throw error;
      return data as DealPausedItem | null;
    },
    enabled: !!companyId,
  });
}

export function useDealsPaused(filters?: {
  search?: string;
  reasonId?: string;
  reminderFilter?: 'all' | 'overdue' | 'upcoming';
}) {
  return useQuery({
    queryKey: ['deals-paused', filters],
    queryFn: async () => {
      let query = supabase
        .from('deal_paused_items')
        .select('*, empresa:empresas(id, nombre, sector, ubicacion), reason:paused_reasons(id, name)')
        .eq('status', 'paused')
        .order('created_at', { ascending: false });

      if (filters?.reasonId) {
        query = query.eq('reason_id', filters.reasonId);
      }

      const { data, error } = await query;
      if (error) throw error;

      let items = data as DealPausedItem[];

      // Client-side filters
      if (filters?.search) {
        const s = filters.search.toLowerCase();
        items = items.filter(
          (i) =>
            i.empresa?.nombre?.toLowerCase().includes(s) ||
            i.notes?.toLowerCase().includes(s)
        );
      }

      if (filters?.reminderFilter === 'overdue') {
        const now = new Date().toISOString();
        items = items.filter((i) => i.reminder_at && i.reminder_at < now);
      } else if (filters?.reminderFilter === 'upcoming') {
        const now = new Date();
        const in7days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
        items = items.filter(
          (i) => i.reminder_at && i.reminder_at >= now.toISOString() && i.reminder_at <= in7days
        );
      }

      return items;
    },
  });
}

export function useDealPausedMutations() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const invalidate = (companyId?: string) => {
    queryClient.invalidateQueries({ queryKey: ['deals-paused'] });
    if (companyId) {
      queryClient.invalidateQueries({ queryKey: ['active-pause', companyId] });
      queryClient.invalidateQueries({ queryKey: ['empresa-detail', companyId] });
    }
  };

  const pauseCompany = useMutation({
    mutationFn: async (params: {
      companyId: string;
      reasonId: string;
      notes?: string;
      reminderAt?: string;
      reminderText?: string;
    }) => {
      const { data: user } = await supabase.auth.getUser();
      const { error } = await supabase.from('deal_paused_items').insert({
        company_id: params.companyId,
        reason_id: params.reasonId,
        notes: params.notes || null,
        reminder_at: params.reminderAt || null,
        reminder_text: params.reminderText || null,
        created_by: user?.user?.id || null,
      });
      if (error) throw error;
      return params.companyId;
    },
    onSuccess: (companyId) => {
      invalidate(companyId);
      toast({ title: '⏸️ Deal marcado como pausado' });
    },
    onError: (error: any) => {
      const isDuplicate = error?.code === '23505';
      toast({
        title: isDuplicate ? 'Ya existe una pausa activa' : 'Error',
        description: isDuplicate
          ? 'Esta empresa ya tiene un deal pausado activo. Reactívalo primero.'
          : 'No se pudo pausar el deal',
        variant: 'destructive',
      });
    },
  });

  const reactivateCompany = useMutation({
    mutationFn: async (params: { pausedItemId: string; companyId: string }) => {
      const { error } = await supabase
        .from('deal_paused_items')
        .update({ status: 'reactivated', reactivated_at: new Date().toISOString() })
        .eq('id', params.pausedItemId);
      if (error) throw error;
      return params.companyId;
    },
    onSuccess: (companyId) => {
      invalidate(companyId);
      toast({ title: '▶️ Deal reactivado' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'No se pudo reactivar', variant: 'destructive' });
    },
  });

  const updatePausedItem = useMutation({
    mutationFn: async (params: {
      id: string;
      companyId: string;
      updates: { reason_id?: string; notes?: string; reminder_at?: string | null; reminder_text?: string | null };
    }) => {
      const { error } = await supabase
        .from('deal_paused_items')
        .update(params.updates)
        .eq('id', params.id);
      if (error) throw error;
      return params.companyId;
    },
    onSuccess: (companyId) => {
      invalidate(companyId);
      toast({ title: '✅ Deal pausado actualizado' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'No se pudo actualizar', variant: 'destructive' });
    },
  });

  return { pauseCompany, reactivateCompany, updatePausedItem };
}
