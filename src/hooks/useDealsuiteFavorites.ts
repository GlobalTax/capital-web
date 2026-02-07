import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useFavoriteDealIds = () => {
  return useQuery({
    queryKey: ['dealsuite-favorite-ids'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('dealsuite_favorites' as any)
        .select('deal_id');
      if (error) throw error;
      return new Set((data as any[]).map((f) => f.deal_id as string));
    },
  });
};

export const useToggleDealFavorite = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ dealId, isFavorite }: { dealId: string; isFavorite: boolean }) => {
      if (isFavorite) {
        const { error } = await supabase
          .from('dealsuite_favorites' as any)
          .delete()
          .eq('deal_id', dealId);
        if (error) throw error;
      } else {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('No autenticado');
        const { error } = await supabase
          .from('dealsuite_favorites' as any)
          .insert({ deal_id: dealId, added_by: user.id } as any);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dealsuite-favorite-ids'] });
    },
  });
};
