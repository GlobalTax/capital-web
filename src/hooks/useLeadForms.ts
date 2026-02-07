import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useMemo } from 'react';

export interface LeadForm {
  id: string;
  name: string;
  display_name?: string;
  description?: string;
  is_active: boolean;
  display_order: number;
}

export interface DisplayNameGroup {
  displayName: string;
  formIds: string[];
}

/**
 * Fetch all lead forms ordered by display_order
 */
export function useLeadForms() {
  const queryClient = useQueryClient();

  const { data: forms, isLoading, error } = useQuery({
    queryKey: ['lead-forms'],
    queryFn: async (): Promise<LeadForm[]> => {
      const { data, error } = await supabase
        .from('lead_forms')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) {
        console.error('[useLeadForms] Error fetching lead forms:', error);
        throw error;
      }

      return data || [];
    },
    staleTime: 1000 * 60 * 5,
  });

  const allForms = forms || [];
  const activeForms = useMemo(() => allForms.filter(f => f.is_active), [allForms]);

  /**
   * Unique display names grouped with their underlying form IDs.
   * Only active forms are included.
   */
  const displayNameGroups = useMemo((): DisplayNameGroup[] => {
    const map = new Map<string, string[]>();
    for (const form of activeForms) {
      const dn = form.display_name || form.name;
      if (!map.has(dn)) map.set(dn, []);
      map.get(dn)!.push(form.id);
    }
    return Array.from(map.entries()).map(([displayName, formIds]) => ({
      displayName,
      formIds,
    }));
  }, [activeForms]);

  /**
   * Build a lookup map: form_id -> display_name
   */
  const displayNameMap = useMemo((): Record<string, string> => {
    const map: Record<string, string> = {};
    for (const form of allForms) {
      map[form.id] = form.display_name || form.name;
    }
    return map;
  }, [allForms]);

  /**
   * Resolve a display_name filter to an array of form IDs
   */
  const resolveDisplayNameToIds = (displayName: string): string[] => {
    return allForms
      .filter(f => (f.display_name || f.name) === displayName)
      .map(f => f.id);
  };

  // Mutations for CRUD
  const updateForm = useMutation({
    mutationFn: async (params: { id: string; updates: Partial<Pick<LeadForm, 'name' | 'display_name' | 'is_active' | 'display_order'>> }) => {
      const { error } = await supabase
        .from('lead_forms')
        .update(params.updates)
        .eq('id', params.id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['lead-forms'] }),
  });

  const createForm = useMutation({
    mutationFn: async (params: { id: string; name: string; display_name: string }) => {
      const { error } = await supabase
        .from('lead_forms')
        .insert({
          id: params.id,
          name: params.name,
          display_name: params.display_name,
          is_active: true,
          display_order: allForms.length,
        });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['lead-forms'] }),
  });

  const reorderForms = useMutation({
    mutationFn: async (orderedIds: string[]) => {
      const updates = orderedIds.map((id, index) =>
        supabase.from('lead_forms').update({ display_order: index }).eq('id', id)
      );
      await Promise.all(updates);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['lead-forms'] }),
  });

  const toggleActive = useMutation({
    mutationFn: async (params: { id: string; isActive: boolean }) => {
      const { error } = await supabase
        .from('lead_forms')
        .update({ is_active: params.isActive })
        .eq('id', params.id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['lead-forms'] }),
  });

  return {
    forms: allForms,
    activeForms,
    displayNameGroups,
    displayNameMap,
    resolveDisplayNameToIds,
    isLoading,
    error,
    updateForm: updateForm.mutate,
    createForm: createForm.mutate,
    reorderForms: reorderForms.mutate,
    toggleActive: toggleActive.mutate,
  };
}
