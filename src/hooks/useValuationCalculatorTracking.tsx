import { useSimpleFormTracking } from './useSimpleFormTracking';

export const useValuationCalculatorTracking = () => {
  const { trackEvent } = useSimpleFormTracking();

  const trackStepChange = (step: number) => {
    trackEvent('step_change', { step });
  };

  const trackFieldUpdate = (field: string, value: any) => {
    trackEvent('field_update', { field, value });
  };

  const trackValidationIssue = (field: string, error: string) => {
    trackEvent('validation_issue', { field, error });
  };

  const trackCalculationStart = () => {
    trackEvent('calculation_start');
  };

  const trackStepCompletion = (step: number, data: any) => {
    trackEvent('step_completed', { step, data });
  };

  const trackCalculationComplete = (valuation?: any) => {
    trackEvent('calculation_complete', { valuation });
  };

  const trackCalculationAbandon = (step: number) => {
    trackEvent('calculation_abandon', { step });
  };

  return {
    trackStepChange,
    trackFieldUpdate,
    trackValidationIssue,
    trackCalculationStart,
    trackStepCompletion,
    trackCalculationComplete,
    trackCalculationAbandon
  };
};