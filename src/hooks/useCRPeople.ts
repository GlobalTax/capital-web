import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { CRPerson, CRPersonWithFund, CRPeopleFilters, CRPersonFormData } from '@/types/capitalRiesgo';

export function useCRPeople(filters?: CRPeopleFilters) {
  return useQuery({
    queryKey: ['cr-people', filters],
    queryFn: async () => {
      let query = supabase
        .from('cr_people')
        .select('*')
        .eq('is_deleted', false)
        .order('full_name', { ascending: true });

      if (filters?.search) {
        query = query.or(`full_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`);
      }

      if (filters?.role) {
        const roles = Array.isArray(filters.role) ? filters.role : [filters.role];
        query = query.in('role', roles);
      }

      if (filters?.fund_id) {
        query = query.eq('fund_id', filters.fund_id);
      }

      if (filters?.is_primary_contact !== undefined) {
        query = query.eq('is_primary_contact', filters.is_primary_contact);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as CRPerson[];
    },
  });
}

export function useCRPeopleWithFunds(filters?: CRPeopleFilters) {
  return useQuery({
    queryKey: ['cr-people-with-funds', filters],
    queryFn: async () => {
      let query = supabase
        .from('cr_people')
        .select(`
          *,
          fund:cr_funds(id, name, fund_type, status, country_base)
        `)
        .eq('is_deleted', false)
        .order('full_name', { ascending: true });

      if (filters?.search) {
        query = query.or(`full_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`);
      }

      if (filters?.role) {
        const roles = Array.isArray(filters.role) ? filters.role : [filters.role];
        query = query.in('role', roles);
      }

      if (filters?.fund_id) {
        query = query.eq('fund_id', filters.fund_id);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as CRPersonWithFund[];
    },
  });
}

export function useCRPerson(id: string | undefined) {
  return useQuery({
    queryKey: ['cr-person', id],
    queryFn: async () => {
      if (!id) return null;

      const { data, error } = await supabase
        .from('cr_people')
        .select(`
          *,
          fund:cr_funds(*)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as CRPersonWithFund;
    },
    enabled: !!id,
  });
}

export function useCreateCRPerson() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CRPersonFormData) => {
      const { data: result, error } = await supabase
        .from('cr_people')
        .insert(data)
        .select()
        .single();

      if (error) throw error;
      return result as CRPerson;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['cr-people'] });
      queryClient.invalidateQueries({ queryKey: ['cr-people-with-funds'] });
      queryClient.invalidateQueries({ queryKey: ['cr-fund', variables.fund_id] });
      toast.success('Persona creada correctamente');
    },
    onError: (error) => {
      console.error('Error creating CR person:', error);
      toast.error('Error al crear la persona');
    },
  });
}

export function useUpdateCRPerson() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CRPersonFormData> }) => {
      const { data: result, error } = await supabase
        .from('cr_people')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return result as CRPerson;
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['cr-people'] });
      queryClient.invalidateQueries({ queryKey: ['cr-people-with-funds'] });
      queryClient.invalidateQueries({ queryKey: ['cr-person', result.id] });
      queryClient.invalidateQueries({ queryKey: ['cr-fund', result.fund_id] });
      toast.success('Persona actualizada correctamente');
    },
    onError: (error) => {
      console.error('Error updating CR person:', error);
      toast.error('Error al actualizar la persona');
    },
  });
}

export function useDeleteCRPerson() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('cr_people')
        .update({ is_deleted: true, deleted_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cr-people'] });
      queryClient.invalidateQueries({ queryKey: ['cr-people-with-funds'] });
      toast.success('Persona eliminada correctamente');
    },
    onError: (error) => {
      console.error('Error deleting CR person:', error);
      toast.error('Error al eliminar la persona');
    },
  });
}
