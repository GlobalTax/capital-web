import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface BuyerPreferences {
  id: string;
  user_id?: string;
  email: string;
  full_name?: string;
  phone?: string;
  company?: string;
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
      const payload: any = {
        email: prefs.email,
        full_name: prefs.full_name,
        phone: prefs.phone,
        company: prefs.company,
        preferred_sectors: prefs.preferred_sectors,
        preferred_locations: prefs.preferred_locations,
        min_valuation: prefs.min_valuation,
        max_valuation: prefs.max_valuation,
        alert_frequency: prefs.alert_frequency,
        is_active: prefs.is_active,
      };

      // If user is authenticated, link to their account
      if (user) {
        payload.user_id = user.id;
        if (!payload.email) payload.email = user.email;
      }

      if (!payload.email) throw new Error('Email is required');

      const { data, error } = await supabase
        .from('buyer_preferences')
        .upsert(payload, { onConflict: user ? 'user_id' : undefined })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buyer-preferences'] });
      toast.success('Preferencias guardadas correctamente');
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
