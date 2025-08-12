import React, { useEffect } from 'react';
import { useValuationCalculator } from '@/hooks/useValuationCalculator';
import { useValuationCalculatorTracking } from '@/hooks/useValuationCalculatorTracking';
import { CompanyData } from '@/types/valuation';
import StepIndicator from '@/components/valuation/StepIndicator';
import StepContent from '@/components/valuation/StepContent';
import NavigationButtons from '@/components/valuation/NavigationButtons';
import { useI18n } from '@/shared/i18n/I18nProvider';
import { toast } from '@/components/ui/sonner';
import { useAuth } from '@/contexts/AuthContext';

const ValuationCalculator = () => {
  const { t } = useI18n();
  const { isAdmin } = useAuth();
  const { 
    currentStep,
    companyData, 
    result, 
    isCalculating,
    showValidation,
    errors,
    getFieldState,
    handleFieldBlur,
    updateField, 
    nextStep,
    prevStep,
    goToStep,
    validateStep,
    calculateValuation, 
    resetCalculator 
  } = useValuationCalculator();

  const {
    trackStepChange,
    trackFieldUpdate,
    trackValidationIssue,
    trackCalculationStart,
    trackCalculationComplete,
    trackCalculationAbandon
  } = useValuationCalculatorTracking();

  // Track step changes
  useEffect(() => {
    trackStepChange(currentStep);
  }, [currentStep, trackStepChange]);

  // Enhanced updateField with tracking
  const trackedUpdateField = (field: keyof CompanyData, value: any) => {
    updateField(field, value);
    trackFieldUpdate(field, value);
  };

  // Enhanced handleFieldBlur with tracking
  const trackedHandleFieldBlur = (field: keyof CompanyData) => {
    handleFieldBlur(field);
    
    // Track validation errors
    const fieldErrors = errors[field];
    if (fieldErrors) {
      const errorMessage = Array.isArray(fieldErrors) 
        ? fieldErrors.join(', ') 
        : fieldErrors.toString();
      trackValidationIssue(field, errorMessage);
    }
  };

  const handleNext = () => {
    console.log('handleNext called, currentStep:', currentStep);
    
    if (currentStep === 3) {
      console.log('In step 3, calculating valuation...');
      trackCalculationStart();
      let id: string | undefined;
      if (isAdmin) {
        id = toast.loading(t('calc.loading.title'), {
          description: t('calc.loading.subtitle'),
        }) as unknown as string;
      }
      calculateValuation().then(() => {
        trackCalculationComplete();
        if (isAdmin) {
          toast.success(t('calc.success.title'), {
            description: t('calc.success.subtitle'),
            id,
          });
        }
      }).catch(() => {
        trackCalculationAbandon(currentStep);
        if (isAdmin) {
          toast.error(t('calc.error.title'), {
            description: t('calc.error.subtitle'),
            id,
          });
        }
      });
    } else {
      console.log('Moving to next step...');
      nextStep();
    }
  };

  // Track abandon on unmount
  useEffect(() => {
    return () => {
      if (currentStep < 4 && !result) {
        trackCalculationAbandon(currentStep);
      }
    };
  }, [currentStep, result, trackCalculationAbandon]);

  const isNextDisabled = isCalculating;

  return (
    <div className="min-h-screen bg-white py-12 overflow-x-hidden">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {t('calc.title')}
          </h1>
          <p className="text-lg text-gray-600">
            {t('calc.subtitle')}
          </p>
        </div>

        <StepIndicator 
          currentStep={currentStep} 
          goToStep={goToStep}
          validateStep={validateStep}
        />

        <div className="bg-white rounded-lg p-8 mb-8 border-0.5 border-border shadow-sm">
          <StepContent
            currentStep={currentStep}
            companyData={companyData}
            updateField={trackedUpdateField}
            result={result}
            isCalculating={isCalculating}
            resetCalculator={resetCalculator}
            showValidation={showValidation}
            getFieldState={getFieldState}
            handleFieldBlur={trackedHandleFieldBlur}
            errors={errors}
          />

          {currentStep < 4 && (
            <NavigationButtons
              currentStep={currentStep}
              isNextDisabled={isNextDisabled}
              onPrev={prevStep}
              onNext={handleNext}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ValuationCalculator;
