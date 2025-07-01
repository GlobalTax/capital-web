
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { FormAnalytics } from './useFormTracking';

export const useFormAnalytics = () => {
  const [analytics, setAnalytics] = useState<FormAnalytics[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      setIsLoading(true);

      // Obtener datos agregados por tipo de formulario
      const { data: events, error } = await supabase
        .from('form_tracking_events')
        .select('*')
        .gte('timestamp', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()); // Últimos 30 días

      if (error) throw error;

      // Procesar datos para analytics
      const formStats = events?.reduce((acc: Record<string, any>, event) => {
        const formType = event.form_type;
        
        if (!acc[formType]) {
          acc[formType] = {
            form_type: formType,
            starts: new Set(),
            completions: new Set(),
            abandons: new Set(),
            completion_times: [],
            field_abandons: {},
          };
        }

        const sessionId = event.session_id;

        switch (event.event_type) {
          case 'start':
            acc[formType].starts.add(sessionId);
            break;
          case 'complete':
            acc[formType].completions.add(sessionId);
            break;
          case 'abandon':
            acc[formType].abandons.add(sessionId);
            if (event.field_name) {
              acc[formType].field_abandons[event.field_name] = 
                (acc[formType].field_abandons[event.field_name] || 0) + 1;
            }
            break;
        }

        return acc;
      }, {});

      // Convertir a formato final
      const analyticsData: FormAnalytics[] = Object.values(formStats || {}).map((stats: any) => {
        const totalStarts = stats.starts.size;
        const totalCompletions = stats.completions.size;
        const conversionRate = totalStarts > 0 ? (totalCompletions / totalStarts) * 100 : 0;
        const abandonmentRate = totalStarts > 0 ? ((totalStarts - totalCompletions) / totalStarts) * 100 : 0;
        
        const mostAbandonedField = Object.keys(stats.field_abandons).length > 0
          ? Object.keys(stats.field_abandons).reduce((a, b) => 
              stats.field_abandons[a] > stats.field_abandons[b] ? a : b
            )
          : undefined;

        return {
          form_type: stats.form_type,
          total_starts: totalStarts,
          total_completions: totalCompletions,
          conversion_rate: Math.round(conversionRate * 100) / 100,
          avg_completion_time: 0, // TODO: Calcular tiempo promedio
          abandonment_rate: Math.round(abandonmentRate * 100) / 100,
          most_abandoned_field: mostAbandonedField,
        };
      });

      setAnalytics(analyticsData);
    } catch (error) {
      console.error('Error fetching form analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  return {
    analytics,
    isLoading,
    refetch: fetchAnalytics,
  };
};
