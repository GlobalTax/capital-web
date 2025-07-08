import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useV4Tracking = (companyId?: string) => {
  
  const trackInteraction = useCallback(async (
    interactionType: string, 
    data: Record<string, any> = {}
  ) => {
    if (!companyId) return;

    try {
      await supabase
        .from('v4_interactions')
        .insert({
          company_valuation_id: companyId,
          interaction_type: interactionType,
          interaction_data: {
            ...data,
            timestamp: new Date().toISOString(),
            user_agent: navigator.userAgent
          }
        });
    } catch (error) {
      console.error('Error tracking interaction:', error);
    }
  }, [companyId]);

  const trackScenarioChange = useCallback((scenarioId: string, scenarioName: string) => {
    trackInteraction('scenario_change', { scenarioId, scenarioName });
  }, [trackInteraction]);

  const trackControlChange = useCallback((controlType: string, value: any) => {
    trackInteraction('control_change', { controlType, value });
  }, [trackInteraction]);

  const trackContactClick = useCallback((contactMethod: string) => {
    trackInteraction('contact_click', { contactMethod });
  }, [trackInteraction]);

  const trackTimeSpent = useCallback(async (timeInSeconds: number) => {
    if (!companyId) return;
    
    try {
      await Promise.all([
        trackInteraction('time_update', { timeSpent: timeInSeconds }),
        supabase
          .from('company_valuations')
          .update({ 
            v4_time_spent: timeInSeconds,
            v4_engagement_score: Math.min(100, Math.floor(timeInSeconds / 10)) // 1 punto por cada 10 segundos, máx 100
          })
          .eq('id', companyId)
      ]);
    } catch (error) {
      console.error('Error updating time spent:', error);
    }
  }, [companyId, trackInteraction]);

  return {
    trackInteraction,
    trackScenarioChange,
    trackControlChange,
    trackContactClick,
    trackTimeSpent
  };
};