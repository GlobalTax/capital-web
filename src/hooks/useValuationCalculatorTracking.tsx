
import { useSimpleFormTracking } from './useSimpleFormTracking';
import { logger } from '@/utils/logger';

export const useValuationCalculatorTracking = () => {
  const { trackEvent } = useSimpleFormTracking();

  const trackStepChange = (step: number) => {
    logger.debug('Valuation calculator step change', { step }, { context: 'valuation', component: 'useValuationCalculatorTracking' });
    trackEvent('step_change', { step });
  };

  const trackFieldUpdate = (field: string, value: any) => {
    logger.debug('Valuation calculator field update', { field, value }, { context: 'valuation', component: 'useValuationCalculatorTracking' });
    trackEvent('field_update', { field, value });
  };

  const trackValidationIssue = (field: string, error: string) => {
    logger.warn('Valuation calculator validation issue', { field, error }, { context: 'valuation', component: 'useValuationCalculatorTracking' });
    trackEvent('validation_issue', { field, error });
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
