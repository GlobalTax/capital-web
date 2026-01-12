// ============= SF FAVORITES HOOK =============
// Hook para gestionar favoritos de fondos, personas y adquisiciones de Search Funds
// NOTA: Los favoritos son GLOBALES para todo el equipo (no por usuario)
// Basado en useCRFavorites.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { SFFund, SFPersonWithFund, SFAcquisition } from '@/types/searchFunds';

export type SFFavoriteEntityType = 'fund' | 'person' | 'acquisition';

interface SFFavorite {
  id: string;
  entity_type: SFFavoriteEntityType;
  entity_id: string;
  added_by: string | null;
  notes: string | null;
  created_at: string;
}

// Hook para obtener los IDs de favoritos por tipo (GLOBALES para todo el equipo)
export const useSFFavoriteIds = (entityType: SFFavoriteEntityType) => {
  return useQuery({
    queryKey: ['sf-favorite-ids', entityType],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      // Favoritos globales - sin filtro de user_id
      const { data, error } = await (supabase as any)
        .from('sf_favorites')
        .select('entity_id')
        .eq('entity_type', entityType);

      if (error) throw error;
      return (data as SFFavorite[] | null)?.map(f => f.entity_id) || [];
    },
  });
};

// Hook para toggle de favoritos (COMPARTIDOS para todo el equipo)
export const useToggleSFFavorite = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      entityType, 
      entityId, 
      isFavorite 
    }: { 
      entityType: SFFavoriteEntityType; 
      entityId: string; 
      isFavorite: boolean;
    }): Promise<{ entityType: SFFavoriteEntityType; entityId: string; wasRemoved: boolean; peopleAdded?: number }> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No autenticado');

      if (isFavorite) {
        // Eliminar favorito (global - sin filtro user_id)
        const { error } = await (supabase as any)
          .from('sf_favorites')
          .delete()
          .eq('entity_type', entityType)
          .eq('entity_id', entityId);

        if (error) throw error;
        return { entityType, entityId, wasRemoved: true };
      } else {
        // Añadir favorito (global - registrar quién lo añadió)
        const { error } = await (supabase as any)
          .from('sf_favorites')
          .insert({
            entity_type: entityType,
            entity_id: entityId,
            added_by: user.id,
          });

        if (error) throw error;

        // Si es un fondo, también añadir todas sus personas como favoritas
        let peopleAdded = 0;
        if (entityType === 'fund') {
          // Obtener todas las personas de este fondo
          const { data: people } = await supabase
            .from('sf_people')
            .select('id')
            .eq('fund_id', entityId);

          if (people && people.length > 0) {
            // Añadir cada persona como favorita (ignorar duplicados)
            const personFavorites = people.map(p => ({
              entity_type: 'person' as const,
              entity_id: p.id,
              added_by: user.id,
            }));

            const { error: peopleError } = await (supabase as any)
              .from('sf_favorites')
              .upsert(personFavorites, { 
                onConflict: 'entity_type,entity_id',
                ignoreDuplicates: true 
              });

            if (!peopleError) {
              peopleAdded = people.length;
            }
          }
        }

        return { entityType, entityId, wasRemoved: false, peopleAdded };
      }
    },
    onSuccess: ({ entityType, wasRemoved, peopleAdded }) => {
      queryClient.invalidateQueries({ queryKey: ['sf-favorite-ids', 'fund'] });
      queryClient.invalidateQueries({ queryKey: ['sf-favorite-ids', 'person'] });
      queryClient.invalidateQueries({ queryKey: ['sf-favorite-ids', 'acquisition'] });
      queryClient.invalidateQueries({ queryKey: ['sf-favorite-funds'] });
      queryClient.invalidateQueries({ queryKey: ['sf-favorite-people'] });
      queryClient.invalidateQueries({ queryKey: ['sf-favorite-acquisitions'] });
      
      if (wasRemoved) {
        toast.success('Eliminado de favoritos del equipo');
      } else if (entityType === 'fund' && peopleAdded && peopleAdded > 0) {
        toast.success(`Fondo y ${peopleAdded} persona${peopleAdded > 1 ? 's' : ''} añadidos a favoritos del equipo`);
      } else {
        toast.success('Añadido a favoritos del equipo');
      }
    },
    onError: () => {
      toast.error('Error al actualizar favorito');
    },
  });
};

// Hook para obtener fondos favoritos con datos completos (GLOBALES)
export const useSFFavoriteFunds = () => {
  return useQuery({
    queryKey: ['sf-favorite-funds'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      // Favoritos globales - sin filtro de user_id
      const { data: favorites, error: favError } = await (supabase as any)
        .from('sf_favorites')
        .select('entity_id')
        .eq('entity_type', 'fund');

      if (favError) throw favError;
      if (!favorites || favorites.length === 0) return [];

      const fundIds = (favorites as SFFavorite[]).map(f => f.entity_id);

      // Luego obtener los datos de los fondos
      const { data: funds, error: fundsError } = await supabase
        .from('sf_funds')
        .select('*')
        .in('id', fundIds)
        .order('name');

      if (fundsError) throw fundsError;
      return funds as SFFund[];
    },
  });
};

// Hook para obtener personas favoritas con datos completos (GLOBALES)
export const useSFFavoritePeople = () => {
  return useQuery({
    queryKey: ['sf-favorite-people'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      // Favoritos globales - sin filtro de user_id
      const { data: favorites, error: favError } = await (supabase as any)
        .from('sf_favorites')
        .select('entity_id')
        .eq('entity_type', 'person');

      if (favError) throw favError;
      if (!favorites || favorites.length === 0) return [];

      const personIds = (favorites as SFFavorite[]).map(f => f.entity_id);

      // Luego obtener los datos de las personas con sus fondos
      const { data: people, error: peopleError } = await supabase
        .from('sf_people')
        .select(`
          *,
          fund:sf_funds(id, name, country_base, status)
        `)
        .in('id', personIds)
        .order('full_name');

      if (peopleError) throw peopleError;
      return people as SFPersonWithFund[];
    },
  });
};

// Hook para obtener adquisiciones favoritas con datos completos (GLOBALES)
export const useSFFavoriteAcquisitions = () => {
  return useQuery({
    queryKey: ['sf-favorite-acquisitions'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      // Favoritos globales - sin filtro de user_id
      const { data: favorites, error: favError } = await (supabase as any)
        .from('sf_favorites')
        .select('entity_id')
        .eq('entity_type', 'acquisition');

      if (favError) throw favError;
      if (!favorites || favorites.length === 0) return [];

      const acquisitionIds = (favorites as SFFavorite[]).map(f => f.entity_id);

      // Luego obtener los datos de las adquisiciones con sus fondos
      const { data: acquisitions, error: acqError } = await supabase
        .from('sf_acquisitions')
        .select(`
          *,
          fund:sf_funds(id, name, country_base, status)
        `)
        .in('id', acquisitionIds)
        .order('company_name');

      if (acqError) throw acqError;
      return acquisitions as unknown as (SFAcquisition & { fund?: Pick<SFFund, 'id' | 'name' | 'country_base' | 'status'> })[];
    },
  });
};
