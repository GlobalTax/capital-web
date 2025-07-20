
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';

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
      
      logger.debug('V4 interaction tracked', { interactionType, companyId, data }, { context: 'valuation', component: 'useV4Tracking' });
    } catch (error) {
      logger.error('Error tracking V4 interaction', error as Error, { context: 'valuation', component: 'useV4Tracking', data: { interactionType, companyId } });
    }
  }, [companyId]);

  const trackScenarioChange = useCallback((scenarioId: string, scenarioName: string) => {
    trackInteraction('scenario_change', { scenarioId, scenarioName });
  }, [trackInteraction]);

  const trackControlChange = useCallback((controlType: string, value: any) => {
    trackInteraction('control_change', { controlType, value });
  }, [trackInteraction]);

  const trackContactClick = useCallback((contactMethod: string) => {
    logger.info('V4 contact click tracked', { contactMethod, companyId }, { context: 'marketing', component: 'useV4Tracking' });
    trackInteraction('contact_click', { contactMethod });
  }, [trackInteraction, companyId]);

  const trackTimeSpent = useCallback(async (timeInSeconds: number) => {
    if (!companyId) return;
    
    try {
      await Promise.all([
        trackInteraction('time_update', { timeSpent: timeInSeconds }),
        supabase
          .from('company_valuations')
          .update({ 
            v4_time_spent: timeInSeconds,
            v4_engagement_score: Math.min(100, Math.floor(timeInSeconds / 10))
          })
          .eq('id', companyId)
      ]);
      
      logger.debug('V4 time spent updated', { timeInSeconds, companyId }, { context: 'valuation', component: 'useV4Tracking' });
    } catch (error) {
      logger.error('Error updating V4 time spent', error as Error, { context: 'valuation', component: 'useV4Tracking', data: { timeInSeconds, companyId } });
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
