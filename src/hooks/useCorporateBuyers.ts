// =============================================
// CORPORATE BUYERS HOOKS
// =============================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { 
  CorporateBuyer, 
  CorporateBuyerFormData, 
  CorporateBuyersFilters 
} from '@/types/corporateBuyers';
import { toast } from 'sonner';

const QUERY_KEY = 'corporate-buyers';

// Fetch all buyers with filters
export const useCorporateBuyers = (filters?: CorporateBuyersFilters) => {
  return useQuery({
    queryKey: [QUERY_KEY, filters],
    queryFn: async () => {
      let query = supabase
        .from('corporate_buyers')
        .select('*')
        .eq('is_deleted', false)
        .order('name', { ascending: true });

      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      if (filters?.buyer_type) {
        query = query.eq('buyer_type', filters.buyer_type);
      }

      if (filters?.country) {
        query = query.eq('country_base', filters.country);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as CorporateBuyer[];
    },
  });
};

// Fetch single buyer
export const useCorporateBuyer = (id: string | undefined) => {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: async () => {
      if (!id) return null;

      const { data, error } = await supabase
        .from('corporate_buyers')
        .select('*')
        .eq('id', id)
        .eq('is_deleted', false)
        .maybeSingle();

      if (error) throw error;
      return data as CorporateBuyer | null;
    },
    enabled: !!id,
  });
};

// Create buyer - with robust RLS error handling
export const useCreateCorporateBuyer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CorporateBuyerFormData) => {
      console.log('[useCreateCorporateBuyer] Payload:', data);
      
      const { data: result, error } = await supabase
        .from('corporate_buyers')
        .insert(data)
        .select()
        .single();

      console.log('[useCreateCorporateBuyer] Response:', { result, error });

      if (error) {
        console.error('[useCreateCorporateBuyer] Supabase error:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint,
        });
        
        // Translate common errors to user-friendly messages
        if (error.code === '42501') {
          throw new Error('Sin permisos: Necesitas rol de administrador para crear compradores.');
        }
        if (error.code === '23505') {
          throw new Error('Ya existe un comprador con ese nombre.');
        }
        if (error.message?.toLowerCase().includes('policy')) {
          throw new Error('Acceso denegado por políticas de seguridad.');
        }
        
        throw new Error(error.message || 'Error al crear el comprador');
      }
      
      // Silent RLS block detection (insert returns null without error)
      if (!result) {
        console.error('[useCreateCorporateBuyer] Null result - possible silent RLS block');
        throw new Error('No se pudo crear el comprador. Verifica que tengas permisos de administrador.');
      }
      
      return result as CorporateBuyer;
    },
    onSuccess: (data) => {
      console.log('[useCreateCorporateBuyer] Success:', data.id);
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success('Comprador creado correctamente');
    },
    onError: (error: Error) => {
      console.error('[useCreateCorporateBuyer] Mutation error:', error);
      toast.error(error.message);
    },
  });
};

// Update buyer
export const useUpdateCorporateBuyer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CorporateBuyerFormData> }) => {
      const { data: result, error } = await supabase
        .from('corporate_buyers')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return result as CorporateBuyer;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success('Comprador actualizado');
    },
    onError: (error) => {
      console.error('Error updating buyer:', error);
      toast.error('Error al actualizar el comprador');
    },
  });
};

// Soft delete buyer
export const useDeleteCorporateBuyer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('corporate_buyers')
        .update({ is_deleted: true })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success('Comprador eliminado');
    },
    onError: (error) => {
      console.error('Error deleting buyer:', error);
      toast.error('Error al eliminar el comprador');
    },
  });
};

// Get unique countries for filter dropdown
export const useCorporateBuyerCountries = () => {
  return useQuery({
    queryKey: [QUERY_KEY, 'countries'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('corporate_buyers')
        .select('country_base')
        .eq('is_deleted', false)
        .not('country_base', 'is', null);

      if (error) throw error;

      const countries = [...new Set(data.map(d => d.country_base).filter(Boolean))];
      return countries.sort() as string[];
    },
  });
};

// Toggle is_reviewed status
export const useToggleBuyerReviewed = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, isReviewed }: { id: string; isReviewed: boolean }) => {
      const { error } = await supabase
        .from('corporate_buyers')
        .update({ is_reviewed: isReviewed })
        .eq('id', id);

      if (error) throw error;
      return { id, isReviewed };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
    onError: () => {
      toast.error('Error al actualizar estado de revisión');
    },
  });
};

// Bulk soft delete multiple buyers
export const useBulkDeleteCorporateBuyers = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ids: string[]) => {
      const { error } = await supabase
        .from('corporate_buyers')
        .update({ is_deleted: true })
        .in('id', ids);

      if (error) throw error;
      return ids.length;
    },
    onSuccess: (count) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success(`${count} comprador${count > 1 ? 'es' : ''} eliminado${count > 1 ? 's' : ''}`);
    },
    onError: (error) => {
      console.error('Error bulk deleting buyers:', error);
      toast.error('Error al eliminar los compradores');
    },
  });
};
