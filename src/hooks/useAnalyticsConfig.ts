import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface SessionThresholds {
  warm_minutes: number;
  cold_minutes: number;
  available_options: number[];
}

export const useAnalyticsConfig = () => {
  const queryClient = useQueryClient();

  // Obtener configuración actual
  const { data: thresholds, isLoading } = useQuery({
    queryKey: ['analytics-config', 'session_thresholds'],
    queryFn: async (): Promise<SessionThresholds> => {
      const { data, error } = await supabase
        .from('analytics_config')
        .select('config_value')
        .eq('config_key', 'session_thresholds')
        .single();

      if (error) throw error;
      
      return data.config_value as unknown as SessionThresholds;
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  // Actualizar configuración
  const updateThresholds = useMutation({
    mutationFn: async (newThresholds: Partial<SessionThresholds>) => {
      const currentThresholds = thresholds || {
        warm_minutes: 15,
        cold_minutes: 30,
        available_options: [15, 30, 45, 60]
      };

      const { error } = await supabase
        .from('analytics_config')
        .update({
          config_value: { ...currentThresholds, ...newThresholds },
          updated_at: new Date().toISOString()
        })
        .eq('config_key', 'session_thresholds');

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['analytics-config'] });
      queryClient.invalidateQueries({ queryKey: ['session-monitoring'] });
    },
  });

  return {
    thresholds: thresholds || { warm_minutes: 15, cold_minutes: 30, available_options: [15, 30, 45, 60] },
    isLoading,
    updateThresholds: updateThresholds.mutateAsync,
    isUpdating: updateThresholds.isPending,
  };
};
