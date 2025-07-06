import { useSimpleFormTracking } from './useSimpleFormTracking';

export const useValuationCalculatorTracking = () => {
  const { trackEvent } = useSimpleFormTracking();

  const trackStepCompletion = (step: number, data: any) => {
    trackEvent('step_completed', { step, data });
  };

  const trackCalculationComplete = (valuation: any) => {
    trackEvent('calculation_complete', { valuation });
  };

  return {
    trackStepCompletion,
    trackCalculationComplete
  };
};