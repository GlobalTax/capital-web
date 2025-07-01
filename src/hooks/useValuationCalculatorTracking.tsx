
import { useFormTracking } from './useFormTracking';
import { useCallback, useEffect } from 'react';

export const useValuationCalculatorTracking = () => {
  const {
    trackStart,
    trackFieldChange,
    trackValidationError,
    trackSubmit,
    trackComplete,
    trackAbandon
  } = useFormTracking('valuation_calculator');

  useEffect(() => {
    // Track form start cuando se monta
    trackStart();
  }, [trackStart]);

  const trackStepChange = useCallback((step: number) => {
    trackFieldChange('current_step', step.toString());
  }, [trackFieldChange]);

  const trackFieldUpdate = useCallback((fieldName: string, value: any) => {
    trackFieldChange(fieldName, typeof value === 'string' ? value : JSON.stringify(value));
  }, [trackFieldChange]);

  const trackValidationIssue = useCallback((fieldName: string, error: string) => {
    trackValidationError(fieldName, error);
  }, [trackValidationError]);

  const trackCalculationStart = useCallback(() => {
    trackSubmit();
  }, [trackSubmit]);

  const trackCalculationComplete = useCallback(() => {
    trackComplete();
  }, [trackComplete]);

  const trackCalculationAbandon = useCallback((step?: number) => {
    trackAbandon(step ? `step_${step}` : undefined);
  }, [trackAbandon]);

  return {
    trackStepChange,
    trackFieldUpdate,
    trackValidationIssue,
    trackCalculationStart,
    trackCalculationComplete,
    trackCalculationAbandon
  };
};
