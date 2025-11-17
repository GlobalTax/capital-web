import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface BuyerPreferences {
  id: string;
  user_id: string;
  email: string;
  preferred_sectors?: string[];
  preferred_locations?: string[];
  min_valuation?: number;
  max_valuation?: number;
  company_size_preferences?: string[];
  deal_type_preferences?: string[];
  alert_frequency: 'daily' | 'weekly' | 'monthly';
  is_active: boolean;
}

export const useBuyerPreferences = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: preferences, isLoading } = useQuery({
    queryKey: ['buyer-preferences', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('buyer_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data as BuyerPreferences | null;
    },
    enabled: !!user,
  });

  const savePreferences = useMutation({
    mutationFn: async (prefs: Partial<BuyerPreferences>) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('buyer_preferences')
        .upsert({
          user_id: user.id,
          email: user.email!,
          ...prefs
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buyer-preferences'] });
      toast.success('Preferencias guardadas');
    },
    onError: (error: any) => {
      console.error('Error saving preferences:', error);
      toast.error('Error al guardar preferencias');
    }
  });

  return {
    preferences,
    isLoading,
    savePreferences: savePreferences.mutate,
    isSaving: savePreferences.isPending
  };
};
