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
        // Eliminar favorito
        const { error } = await supabase
          .from('empresa_favorites')
          .delete()
          .eq('empresa_id', empresaId);

        if (error) throw error;
        return { empresaId, wasRemoved: true };
      } else {
        // Añadir favorito
        const { error } = await supabase
          .from('empresa_favorites')
          .insert({
            empresa_id: empresaId,
            added_by: user.id,
          });

        if (error) throw error;
        return { empresaId, wasRemoved: false };
      }
    },
    onSuccess: ({ wasRemoved }) => {
      queryClient.invalidateQueries({ queryKey: ['empresa-favorite-ids'] });
      queryClient.invalidateQueries({ queryKey: ['empresa-favorites'] });
      
      if (wasRemoved) {
        toast.success('Eliminado de favoritos');
      } else {
        toast.success('Añadido a favoritos');
      }
    },
    onError: () => {
      toast.error('Error al actualizar favorito');
    },
  });
};

// Hook para obtener empresas favoritas con datos completos (GLOBALES)
export const useFavoriteEmpresas = () => {
  return useQuery({
    queryKey: ['empresa-favorites'],
    queryFn: async (): Promise<Empresa[]> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      // Primero obtener IDs favoritos
      const { data: favorites, error: favError } = await supabase
        .from('empresa_favorites')
        .select('empresa_id');

      if (favError) throw favError;
      if (!favorites || favorites.length === 0) return [];

      const empresaIds = favorites.map(f => f.empresa_id);

      // Obtener todas las empresas y filtrar en cliente
      // Esto evita problemas de tipos con .in() en Supabase
      const { data: empresas, error: empresasError } = await supabase
        .from('empresas')
        .select('*')
        .order('nombre');

      if (empresasError) throw empresasError;
      
      // Filtrar solo las que están en favoritos
      const filteredEmpresas = (empresas || []).filter(e => empresaIds.includes(e.id));
      return filteredEmpresas as unknown as Empresa[];
    },
  });
};
