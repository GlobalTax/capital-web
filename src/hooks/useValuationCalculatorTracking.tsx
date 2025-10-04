import { logger } from '@/utils/logger';

export const useValuationCalculatorTracking = () => {
  const trackStepChange = (step: number) => {
    logger.debug('Valuation calculator step change', { step }, { context: 'valuation', component: 'useValuationCalculatorTracking' });
  };

  const trackFieldUpdate = (field: string, value: any) => {
    logger.debug('Valuation calculator field update', { field, value }, { context: 'valuation', component: 'useValuationCalculatorTracking' });
  };

  const trackValidationIssue = (field: string, error: string) => {
    logger.warn('Valuation calculator validation issue', { field, error }, { context: 'valuation', component: 'useValuationCalculatorTracking' });
  };

  const trackCalculationStart = () => {
    logger.info('Valuation calculation started', undefined, { context: 'valuation', component: 'useValuationCalculatorTracking' });
  };

  const trackStepCompletion = (step: number, data: any) => {
    logger.info('Valuation step completed', { step, data }, { context: 'valuation', component: 'useValuationCalculatorTracking' });
  };

  const trackCalculationComplete = (valuation?: any) => {
    logger.info('Valuation calculation completed', { valuation }, { context: 'valuation', component: 'useValuationCalculatorTracking' });
  };

  const trackCalculationAbandon = (step: number) => {
    logger.info('Valuation calculation abandoned', { step }, { context: 'valuation', component: 'useValuationCalculatorTracking' });
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
