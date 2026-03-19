// ============= EMPRESA FAVORITES HOOK =============
// Hook para gestionar favoritos de empresas
// NOTA: Los favoritos son GLOBALES para todo el equipo (no por usuario)

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Empresa } from '@/hooks/useEmpresas';

// Hook para obtener los IDs de empresas favoritas (GLOBALES para todo el equipo)
export const useEmpresaFavoriteIds = () => {
  return useQuery({
    queryKey: ['empresa-favorite-ids'],
    queryFn: async (): Promise<string[]> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('empresa_favorites')
        .select('empresa_id');

      if (error) throw error;
      return data?.map(f => f.empresa_id) || [];
    },
  });
};

// Hook para toggle de favoritos (COMPARTIDOS para todo el equipo)
export const useToggleEmpresaFavorite = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      empresaId, 
      isFavorite 
    }: { 
      empresaId: string; 
      isFavorite: boolean;
    }): Promise<{ empresaId: string; wasRemoved: boolean }> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No autenticado');

      if (isFavorite) {
        const { error } = await supabase
          .from('empresa_favorites')
          .delete()
          .eq('empresa_id', empresaId);
        if (error) throw error;
        return { empresaId, wasRemoved: true };
      } else {
        const { error } = await supabase
          .from('empresa_favorites')
          .insert({ empresa_id: empresaId, added_by: user.id });
        if (error) throw error;
        return { empresaId, wasRemoved: false };
      }
    },
    onSuccess: ({ wasRemoved }) => {
      queryClient.invalidateQueries({ queryKey: ['empresa-favorite-ids'] });
      queryClient.invalidateQueries({ queryKey: ['empresa-favorites'] });
      queryClient.invalidateQueries({ queryKey: ['empresas-stats'] });
      toast.success(wasRemoved ? 'Eliminado de favoritos' : 'Añadido a favoritos');
    },
    onError: () => {
      toast.error('Error al actualizar favorito');
    },
  });
};

// Hook para obtener empresas favoritas con datos completos (GLOBALES)
// Optimizado: usa JOIN en lugar de cargar todas las empresas
export const useFavoriteEmpresas = () => {
  return useQuery({
    queryKey: ['empresa-favorites'],
    queryFn: async (): Promise<Empresa[]> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      // Use inner join to fetch only favorite empresas efficiently
      const { data: favorites, error } = await supabase
        .from('empresa_favorites')
        .select('empresa_id, empresas!inner(*)');

      if (error) throw error;
      if (!favorites || favorites.length === 0) return [];

      // Extract empresa data from the join result
      return favorites.map((f: any) => f.empresas as Empresa);
    },
  });
};
