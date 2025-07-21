
import { useSimpleFormTracking } from './useSimpleFormTracking';
import { useMAErrorHandler } from './useMAErrorHandler';
import { logger } from '@/utils/logger';
import { ValidationError } from '@/types/errorTypes';

export const useValuationCalculatorTracking = () => {
  const { trackEvent } = useSimpleFormTracking();
  const { handleValuationError, createValuationError } = useMAErrorHandler();

  const trackStepChange = (step: number, companyData?: { sector?: string; companyName?: string }) => {
    logger.debug('Valuation calculator step change', { step, ...companyData }, { 
      context: 'valuation', 
      component: 'useValuationCalculatorTracking'
    });
    trackEvent('valuation_step_change', { step, ...companyData });
  };

  const trackFieldUpdate = (field: string, value: any, companyData?: { sector?: string; companyName?: string }) => {
    logger.debug('Valuation calculator field update', { field, value, ...companyData }, { 
      context: 'valuation', 
      component: 'useValuationCalculatorTracking'
    });
    trackEvent('valuation_field_update', { field, value, ...companyData });
  };

  const trackValidationIssue = (field: string, error: string, companyData?: { sector?: string; companyName?: string }) => {
    logger.warn('Valuation calculator validation issue', { field, error, ...companyData }, { 
      context: 'valuation', 
      component: 'useValuationCalculatorTracking'
    });
    
    // Crear error de validación específico
    const validationError = new ValidationError(error, field, undefined);
    
    trackEvent('valuation_validation_issue', { field, error, ...companyData });
  };

  const trackCalculationStart = (companyData?: { sector?: string; companyName?: string; dealSize?: number }) => {
    logger.info('Valuation calculation started', companyData, { 
      context: 'valuation', 
      component: 'useValuationCalculatorTracking'
    });
    trackEvent('valuation_calculation_start', companyData);
  };

  const trackStepCompletion = (step: number, data: any, companyData?: { sector?: string; companyName?: string }) => {
    logger.info('Valuation step completed', { step, completionData: data, ...companyData }, { 
      context: 'valuation', 
      component: 'useValuationCalculatorTracking'
    });
    trackEvent('valuation_step_completed', { step, data, ...companyData });
  };

  const trackCalculationComplete = (valuation?: any, companyData?: { sector?: string; companyName?: string; dealSize?: number }) => {
    logger.info('Valuation calculation completed', { valuation, ...companyData }, { 
      context: 'valuation', 
      component: 'useValuationCalculatorTracking'
    });
    trackEvent('valuation_calculation_complete', { valuation, ...companyData });
  };

  const trackCalculationError = (error: Error, step: number, companyData?: { sector?: string; companyName?: string; dealSize?: number }) => {
    logger.error('Valuation calculation error', error, { 
      context: 'valuation', 
      component: 'useValuationCalculatorTracking',
      data: { step, ...companyData }
    });

    // Crear error de valoración específico
    const valuationError = createValuationError(
      error.message,
      `step_${step}`,
      { step, ...companyData }
    );

    handleValuationError(valuationError, {
      component: 'ValuationCalculator',
      companyId: companyData?.companyName,
      sector: companyData?.sector,
      transactionType: 'valuation',
      dealSize: companyData?.dealSize
    });

    trackEvent('valuation_calculation_error', { error: error.message, step, ...companyData });
  };

  const trackCalculationAbandon = (step: number, companyData?: { sector?: string; companyName?: string; timeSpent?: number }) => {
    logger.info('Valuation calculation abandoned', { step, ...companyData }, { 
      context: 'valuation', 
      component: 'useValuationCalculatorTracking'
    });
    trackEvent('valuation_calculation_abandon', { step, ...companyData });
  };

  const trackSectorMultipleUsage = (sector: string, multiple: number, companyData?: { companyName?: string; employeeRange?: string }) => {
    logger.info('Sector multiple used in valuation', { sector, multiple, ...companyData }, { 
      context: 'valuation', 
      component: 'useValuationCalculatorTracking'
    });
    trackEvent('valuation_sector_multiple_used', { sector, multiple, ...companyData });
  };

  const trackBusinessRuleApplied = (rule: string, impact: number, companyData?: { sector?: string; companyName?: string }) => {
    logger.info('Business rule applied in valuation', { rule, impact, ...companyData }, { 
      context: 'valuation', 
      component: 'useValuationCalculatorTracking'
    });
    trackEvent('valuation_business_rule_applied', { rule, impact, ...companyData });
  };

  return {
    trackStepChange,
    trackFieldUpdate,
    trackValidationIssue,
    trackCalculationStart,
    trackStepCompletion,
    trackCalculationComplete,
    trackCalculationError,
    trackCalculationAbandon,
    trackSectorMultipleUsage,
    trackBusinessRuleApplied
  };
};
