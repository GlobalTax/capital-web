// =============================================
// CORPORATE FAVORITES HOOKS
// =============================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CorporateFavorite } from '@/types/corporateBuyers';
import { toast } from 'sonner';

const QUERY_KEY = 'corporate-favorites';

// Fetch all favorites
export const useCorporateFavorites = () => {
  return useQuery({
    queryKey: [QUERY_KEY],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('corporate_favorites')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as CorporateFavorite[];
    },
  });
};

// Get favorite buyer IDs
export const useFavoriteBuyerIds = () => {
  return useQuery({
    queryKey: [QUERY_KEY, 'buyer-ids'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('corporate_favorites')
        .select('entity_id')
        .eq('entity_type', 'buyer');

      if (error) throw error;
      return new Set(data.map(f => f.entity_id));
    },
  });
};

// Get favorite contact IDs
export const useFavoriteContactIds = () => {
  return useQuery({
    queryKey: [QUERY_KEY, 'contact-ids'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('corporate_favorites')
        .select('entity_id')
        .eq('entity_type', 'contact');

      if (error) throw error;
      return new Set(data.map(f => f.entity_id));
    },
  });
};

// Toggle favorite
export const useToggleCorporateFavorite = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      entityType, 
      entityId, 
      isFavorite 
    }: { 
      entityType: 'buyer' | 'contact'; 
      entityId: string; 
      isFavorite: boolean;
    }) => {
      if (isFavorite) {
        // Remove favorite
        const { error } = await supabase
          .from('corporate_favorites')
          .delete()
          .eq('entity_type', entityType)
          .eq('entity_id', entityId);

        if (error) throw error;
      } else {
        // Add favorite
        const { data: { user } } = await supabase.auth.getUser();
        
        const { error } = await supabase
          .from('corporate_favorites')
          .insert({
            entity_type: entityType,
            entity_id: entityId,
            added_by: user?.id,
          });

        if (error) throw error;
      }
    },
    onSuccess: (_, { isFavorite }) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success(isFavorite ? 'Eliminado de favoritos' : 'Añadido a favoritos');
    },
    onError: (error) => {
      console.error('Error toggling favorite:', error);
      toast.error('Error al actualizar favoritos');
    },
  });
};

// Check if entity is favorite
export const useIsCorporateFavorite = (entityType: 'buyer' | 'contact', entityId: string) => {
  return useQuery({
    queryKey: [QUERY_KEY, entityType, entityId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('corporate_favorites')
        .select('id')
        .eq('entity_type', entityType)
        .eq('entity_id', entityId)
        .maybeSingle();

      if (error) throw error;
      return !!data;
    },
    enabled: !!entityId,
  });
};
