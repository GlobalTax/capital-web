// ============= CR FAVORITES HOOK =============
// Hook para gestionar favoritos de fondos y personas de Capital Riesgo

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { CRFund, CRPersonWithFund } from '@/types/capitalRiesgo';

export type CRFavoriteEntityType = 'fund' | 'person';

interface CRFavorite {
  id: string;
  user_id: string;
  entity_type: CRFavoriteEntityType;
  entity_id: string;
  notes: string | null;
  created_at: string;
}

// Hook para obtener los IDs de favoritos por tipo
export const useCRFavoriteIds = (entityType: CRFavoriteEntityType) => {
  return useQuery({
    queryKey: ['cr-favorite-ids', entityType],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      // Usar .from() con any para tabla nueva no tipada aún
      const { data, error } = await (supabase as any)
        .from('cr_favorites')
        .select('entity_id')
        .eq('user_id', user.id)
        .eq('entity_type', entityType);

      if (error) throw error;
      return (data as CRFavorite[] | null)?.map(f => f.entity_id) || [];
    },
  });
};

// Hook para toggle de favoritos
export const useToggleCRFavorite = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      entityType, 
      entityId, 
      isFavorite 
    }: { 
      entityType: CRFavoriteEntityType; 
      entityId: string; 
      isFavorite: boolean;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No autenticado');

      if (isFavorite) {
        // Eliminar favorito
        const { error } = await (supabase as any)
          .from('cr_favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('entity_type', entityType)
          .eq('entity_id', entityId);

        if (error) throw error;
      } else {
        // Añadir favorito
        const { error } = await (supabase as any)
          .from('cr_favorites')
          .insert({
            user_id: user.id,
            entity_type: entityType,
            entity_id: entityId,
          });

        if (error) throw error;
      }

      return { entityType, entityId, wasRemoved: isFavorite };
    },
    onSuccess: ({ entityType, wasRemoved }) => {
      queryClient.invalidateQueries({ queryKey: ['cr-favorite-ids', entityType] });
      queryClient.invalidateQueries({ queryKey: ['cr-favorite-funds'] });
      queryClient.invalidateQueries({ queryKey: ['cr-favorite-people'] });
      
      toast.success(wasRemoved ? 'Eliminado de favoritos' : 'Añadido a favoritos');
    },
    onError: () => {
      toast.error('Error al actualizar favorito');
    },
  });
};

// Hook para obtener fondos favoritos con datos completos
export const useFavoriteFunds = () => {
  return useQuery({
    queryKey: ['cr-favorite-funds'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      // Primero obtener los IDs de favoritos
      const { data: favorites, error: favError } = await (supabase as any)
        .from('cr_favorites')
        .select('entity_id')
        .eq('user_id', user.id)
        .eq('entity_type', 'fund');

      if (favError) throw favError;
      if (!favorites || favorites.length === 0) return [];

      const fundIds = (favorites as CRFavorite[]).map(f => f.entity_id);

      // Luego obtener los datos de los fondos
      const { data: funds, error: fundsError } = await supabase
        .from('cr_funds')
        .select('*')
        .in('id', fundIds)
        .eq('is_deleted', false)
        .order('name');

      if (fundsError) throw fundsError;
      return funds as CRFund[];
    },
  });
};

// Hook para obtener personas favoritas con datos completos
export const useFavoritePeople = () => {
  return useQuery({
    queryKey: ['cr-favorite-people'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      // Primero obtener los IDs de favoritos
      const { data: favorites, error: favError } = await (supabase as any)
        .from('cr_favorites')
        .select('entity_id')
        .eq('user_id', user.id)
        .eq('entity_type', 'person');

      if (favError) throw favError;
      if (!favorites || favorites.length === 0) return [];

      const personIds = (favorites as CRFavorite[]).map(f => f.entity_id);

      // Luego obtener los datos de las personas con sus fondos
      const { data: people, error: peopleError } = await supabase
        .from('cr_people')
        .select(`
          *,
          fund:cr_funds!cr_people_fund_id_fkey(id, name, country_base, fund_type)
        `)
        .in('id', personIds)
        .eq('is_deleted', false)
        .order('full_name');

      if (peopleError) throw peopleError;
      return people as CRPersonWithFund[];
    },
  });
};
