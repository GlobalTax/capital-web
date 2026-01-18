// ============= MNA BOUTIQUE FAVORITES HOOK =============
// Hook para gestionar favoritos de boutiques M&A
// NOTA: Los favoritos son GLOBALES para todo el equipo (no por usuario)

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { MNABoutique } from '@/types/mnaBoutique';

// Hook para obtener los IDs de boutiques favoritas (GLOBALES para todo el equipo)
export const useMNABoutiqueFavoriteIds = () => {
  return useQuery({
    queryKey: ['mna-boutique-favorite-ids'],
    queryFn: async (): Promise<string[]> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('mna_boutique_favorites')
        .select('boutique_id');

      if (error) throw error;
      return data?.map(f => f.boutique_id) || [];
    },
  });
};

// Hook para toggle de favoritos (COMPARTIDOS para todo el equipo)
export const useToggleMNABoutiqueFavorite = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      boutiqueId, 
      isFavorite 
    }: { 
      boutiqueId: string; 
      isFavorite: boolean;
    }): Promise<{ boutiqueId: string; wasRemoved: boolean }> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No autenticado');

      if (isFavorite) {
        // Eliminar favorito
        const { error } = await supabase
          .from('mna_boutique_favorites')
          .delete()
          .eq('boutique_id', boutiqueId);

        if (error) throw error;
        return { boutiqueId, wasRemoved: true };
      } else {
        // Añadir favorito
        const { error } = await supabase
          .from('mna_boutique_favorites')
          .insert({
            boutique_id: boutiqueId,
            added_by: user.id,
          });

        if (error) throw error;
        return { boutiqueId, wasRemoved: false };
      }
    },
    onSuccess: ({ wasRemoved }) => {
      queryClient.invalidateQueries({ queryKey: ['mna-boutique-favorite-ids'] });
      queryClient.invalidateQueries({ queryKey: ['mna-boutique-favorites'] });
      
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

// Hook para obtener boutiques favoritas con datos completos (GLOBALES)
export const useFavoriteMNABoutiques = () => {
  return useQuery({
    queryKey: ['mna-boutique-favorites'],
    queryFn: async (): Promise<MNABoutique[]> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      // Primero obtener IDs favoritos
      const { data: favorites, error: favError } = await supabase
        .from('mna_boutique_favorites')
        .select('boutique_id');

      if (favError) throw favError;
      if (!favorites || favorites.length === 0) return [];

      const boutiqueIds = favorites.map(f => f.boutique_id);

      // Obtener las boutiques
      const { data: boutiques, error: boutiquesError } = await supabase
        .from('mna_boutiques')
        .select('*')
        .in('id', boutiqueIds)
        .eq('is_deleted', false)
        .order('name');

      if (boutiquesError) throw boutiquesError;
      
      return (boutiques || []) as MNABoutique[];
    },
  });
};
