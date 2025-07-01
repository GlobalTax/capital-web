
import React, { useEffect } from 'react';
import { useValuationCalculator } from '@/hooks/useValuationCalculator';
import { useValuationCalculatorTracking } from '@/hooks/useValuationCalculatorTracking';
import StepIndicator from '@/components/valuation/StepIndicator';
import StepContent from '@/components/valuation/StepContent';
import NavigationButtons from '@/components/valuation/NavigationButtons';

const ValuationCalculator = () => {
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
  const trackedUpdateField = (field: string, value: any) => {
    updateField(field, value);
    trackFieldUpdate(field, value);
  };

  // Enhanced handleFieldBlur with tracking
  const trackedHandleFieldBlur = (field: string) => {
    handleFieldBlur(field);
    
    // Track validation errors
    const fieldErrors = errors[field];
    if (fieldErrors && fieldErrors.length > 0) {
      trackValidationIssue(field, fieldErrors.join(', '));
    }
  };

  const handleNext = () => {
    console.log('handleNext called, currentStep:', currentStep);
    
    if (currentStep === 3) {
      console.log('In step 3, calculating valuation...');
      trackCalculationStart();
      calculateValuation().then(() => {
        trackCalculationComplete();
      }).catch(() => {
        trackCalculationAbandon(currentStep);
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
    <div className="min-h-screen bg-white py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Calculadora de Valoración Empresarial
          </h1>
          <p className="text-lg text-gray-600">
            Obtén una valoración estimada de tu empresa en pocos pasos
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
