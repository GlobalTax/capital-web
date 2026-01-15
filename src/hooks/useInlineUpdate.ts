import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';

type TableName = keyof Database['public']['Tables'];

interface UseInlineUpdateOptions {
  table: TableName;
  queryKey: string[];
  showToast?: boolean;
  successMessage?: string;
  errorMessage?: string;
}

interface UpdateResult {
  success: boolean;
  error?: Error;
}

/**
 * Generic hook for inline cell updates with optimistic UI
 * Works with any Supabase table and React Query cache
 */
export const useInlineUpdate = <T extends Record<string, any>>({
  table,
  queryKey,
  showToast = true,
  successMessage = 'Guardado',
  errorMessage = 'Error al guardar',
}: UseInlineUpdateOptions) => {
  const queryClient = useQueryClient();

  /**
   * Update a single field on a record
   */
  const update = useCallback(async (
    id: string,
    field: string,
    value: any
  ): Promise<UpdateResult> => {
    // Get current cache snapshot for potential rollback
    const previousData = queryClient.getQueryData<T[]>(queryKey);
    
    // Cancel any in-flight queries
    await queryClient.cancelQueries({ queryKey });

    // Optimistic update
    queryClient.setQueryData<T[]>(queryKey, (old = []) =>
      old.map((item) =>
        (item as any).id === id ? { ...item, [field]: value } : item
      )
    );

    try {
      const { error } = await supabase
        .from(table)
        .update({ [field]: value, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;

      // Silently revalidate in background
      queryClient.invalidateQueries({
        queryKey,
        refetchType: 'none',
      });

      if (showToast) {
        toast.success(successMessage, { duration: 1500 });
      }

      return { success: true };
    } catch (error) {
      console.error(`Error updating ${table}.${field}:`, error);
      
      // Rollback on error
      if (previousData) {
        queryClient.setQueryData(queryKey, previousData);
      }

      if (showToast) {
        toast.error(errorMessage);
      }

      return { success: false, error: error as Error };
    }
  }, [table, queryKey, queryClient, showToast, successMessage, errorMessage]);

  /**
   * Update multiple fields on a record at once
   */
  const updateMultiple = useCallback(async (
    id: string,
    updates: Partial<T>
  ): Promise<UpdateResult> => {
    const previousData = queryClient.getQueryData<T[]>(queryKey);
    
    await queryClient.cancelQueries({ queryKey });

    // Optimistic update
    queryClient.setQueryData<T[]>(queryKey, (old = []) =>
      old.map((item) =>
        (item as any).id === id ? { ...item, ...updates } : item
      )
    );

    try {
      const { error } = await supabase
        .from(table)
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;

      queryClient.invalidateQueries({
        queryKey,
        refetchType: 'none',
      });

      if (showToast) {
        toast.success(successMessage, { duration: 1500 });
      }

      return { success: true };
    } catch (error) {
      console.error(`Error updating ${table}:`, error);
      
      if (previousData) {
        queryClient.setQueryData(queryKey, previousData);
      }

      if (showToast) {
        toast.error(errorMessage);
      }

      return { success: false, error: error as Error };
    }
  }, [table, queryKey, queryClient, showToast, successMessage, errorMessage]);

  return {
    update,
    updateMultiple,
  };
};

/**
 * Specialized hook for updating unified contacts
 * Handles the complexity of different origin tables
 */
export const useContactInlineUpdate = () => {
  const queryClient = useQueryClient();

  const update = useCallback(async (
    id: string,
    origin: string,
    field: string,
    value: any
  ): Promise<{ success: boolean; error?: Error }> => {
    // Map origin to table name
    const tableMap: Record<string, string> = {
      'valuation': 'company_valuations',
      'collaborator': 'collaborator_applications',
      'acquisition': 'acquisition_leads',
      'contact': 'contact_leads',
      'accountex': 'accountex_leads',
      'advisor': 'advisor_valuations',
    };

    const table = tableMap[origin];
    if (!table) {
      console.error(`Unknown origin: ${origin}`);
      return { success: false, error: new Error(`Unknown origin: ${origin}`) };
    }

    // Map field names for specific tables
    const fieldMap: Record<string, Record<string, string>> = {
      'company_valuations': {
        'company': 'company_name',
        'name': 'contact_name',
        'industry': 'industry',
        'location': 'location',
      },
      'collaborator_applications': {
        'name': 'full_name',
      },
      'acquisition_leads': {
        'name': 'full_name',
        'industry': 'sectors_of_interest',
      },
      'contact_leads': {
        'name': 'full_name',
        'industry': 'sector',
        'location': 'location',
      },
      'accountex_leads': {
        'name': 'full_name',
        'industry': 'sectors_of_interest',
      },
      'advisor_valuations': {
        'company': 'company_name',
        'name': 'contact_name',
      },
    };

    const mappedField = fieldMap[table]?.[field] ?? field;

    const previousData = queryClient.getQueryData(['unified-contacts']);
    
    await queryClient.cancelQueries({ queryKey: ['unified-contacts'] });

    // Optimistic update
    queryClient.setQueryData(['unified-contacts'], (old: any[] = []) =>
      old.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );

    try {
      const { error } = await supabase
        .from(table as TableName)
        .update({ [mappedField]: value, updated_at: new Date().toISOString() } as any)
        .eq('id', id);

      if (error) throw error;

      queryClient.invalidateQueries({
        queryKey: ['unified-contacts'],
        refetchType: 'none',
      });

      toast.success('Guardado', { duration: 1500 });
      return { success: true };
    } catch (error) {
      console.error(`Error updating ${table}.${mappedField}:`, error);
      
      if (previousData) {
        queryClient.setQueryData(['unified-contacts'], previousData);
      }

      toast.error('Error al guardar');
      return { success: false, error: error as Error };
    }
  }, [queryClient]);

  return { update };
};
