import { logger } from '@/utils/logger';
import { supabase } from '@/integrations/supabase/client';

// Generate consistent visitor and session IDs
const getVisitorId = () => {
  let visitorId = localStorage.getItem('visitor_id');
  if (!visitorId) {
    visitorId = `visitor_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    localStorage.setItem('visitor_id', visitorId);
  }
  return visitorId;
};

const getSessionId = () => {
  let sessionId = sessionStorage.getItem('session_id');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    sessionStorage.setItem('session_id', sessionId);
  }
  return sessionId;
};

// Track event to Supabase via edge function
const trackEvent = async (eventType: string, eventData?: Record<string, any>) => {
  try {
    const visitorId = getVisitorId();
    const sessionId = getSessionId();
    
    await supabase.functions.invoke('secure-tracking', {
      body: {
        event: {
          visitor_id: visitorId,
          session_id: sessionId,
          event_type: eventType,
          page_path: window.location.pathname,
          event_data: eventData,
          company_domain: window.location.hostname,
          referrer: document.referrer || undefined,
        }
      }
    });
  } catch (error) {
    // Silently fail tracking to not disrupt user experience
    logger.error('Tracking event failed', error as Error, { 
      context: 'valuation', 
      data: { eventType } 
    });
  }
};

export const useValuationCalculatorTracking = () => {
  const trackStepChange = (step: number) => {
    logger.debug('Valuation calculator step change', { step }, { context: 'valuation', component: 'useValuationCalculatorTracking' });
    trackEvent('step_change', { step });
  };

  const trackFieldUpdate = (field: string, value: any) => {
    logger.debug('Valuation calculator field update', { field, value }, { context: 'valuation', component: 'useValuationCalculatorTracking' });
    trackEvent('field_change', { field_name: field, field_value: value });
  };

  const trackValidationIssue = (field: string, error: string) => {
    logger.warn('Valuation calculator validation issue', { field, error }, { context: 'valuation', component: 'useValuationCalculatorTracking' });
    trackEvent('validation_error', { field_name: field, error_message: error });
  };

  const trackCalculationStart = () => {
    logger.info('Valuation calculation started', undefined, { context: 'valuation', component: 'useValuationCalculatorTracking' });
    trackEvent('calculation_start');
  };

  const trackStepCompletion = (step: number, data: any) => {
    logger.info('Valuation step completed', { step, data }, { context: 'valuation', component: 'useValuationCalculatorTracking' });
    trackEvent('step_completed', { step, data });
  };

  const trackCalculationComplete = (valuation?: any) => {
    logger.info('Valuation calculation completed', { valuation }, { context: 'valuation', component: 'useValuationCalculatorTracking' });
    trackEvent('calculation_complete', { valuation });
  };

  const trackCalculationAbandon = (step: number) => {
    logger.info('Valuation calculation abandoned', { step }, { context: 'valuation', component: 'useValuationCalculatorTracking' });
    trackEvent('calculation_abandon', { step });
  };

  const trackFieldFocus = (field: string) => {
    trackEvent('field_focus', { field_name: field });
  };

  const trackFieldBlur = (field: string) => {
    trackEvent('field_blur', { field_name: field });
  };

  const trackRecoveryModalShown = () => {
    trackEvent('recovery_modal_shown');
  };

  const trackRecoveryAccepted = () => {
    trackEvent('recovery_accepted');
  };

  const trackRecoveryRejected = () => {
    trackEvent('recovery_rejected');
  };

  return {
    trackStepChange,
    trackFieldUpdate,
    trackValidationIssue,
    trackCalculationStart,
    trackStepCompletion,
    trackCalculationComplete,
    trackCalculationAbandon,
    trackFieldFocus,
    trackFieldBlur,
    trackRecoveryModalShown,
    trackRecoveryAccepted,
    trackRecoveryRejected,
  };
};
