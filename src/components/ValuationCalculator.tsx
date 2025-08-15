import React, { useEffect } from 'react';
import { useValuationCalculator } from '@/hooks/useValuationCalculator';
import { useValuationCalculatorTracking } from '@/hooks/useValuationCalculatorTracking';
import { useValuationAutosave } from '@/hooks/useValuationAutosave';
import { CompanyData } from '@/types/valuation';
import StepIndicator from '@/components/valuation/StepIndicator';
import StepContent from '@/components/valuation/StepContent';
import NavigationButtons from '@/components/valuation/NavigationButtons';
import { useI18n } from '@/shared/i18n/I18nProvider';

const ValuationCalculator = () => {
  const { t } = useI18n();
  
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

  const {
    uniqueToken,
    hasExistingSession,
    initializeToken,
    createInitialValuation,
    createInitialValuationOnFirstField,
    updateValuation,
    finalizeValuation,
    clearAutosave
  } = useValuationAutosave();

  // Initialize autosave token on mount
  useEffect(() => {
    initializeToken();
  }, [initializeToken]);

  // Track step changes
  useEffect(() => {
    trackStepChange(currentStep);
  }, [currentStep, trackStepChange]);

  // Enhanced updateField with tracking and AUTOSAVE INMEDIATO desde el primer campo
  const trackedUpdateField = async (field: keyof CompanyData, value: any) => {
    updateField(field, value);
    trackFieldUpdate(field, value);
    
    // Crear valoración inicial si es el primer campo completado
    if (!uniqueToken && value && value !== '') {
      console.log(`Primer campo completado: ${field}. Creando registro...`);
      await createInitialValuationOnFirstField(field, value, companyData);
    }
    
    // Actualizar si ya existe token
    if (uniqueToken) {
      updateValuation({ [field]: value });
    }
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

  const handleNext = async () => {
    console.log('handleNext called, currentStep:', currentStep);
    
    if (currentStep === 1) {
      // Step 1: Create initial valuation if not exists
      if (!uniqueToken) {
        console.log('Creating initial valuation for Step 1...');
        const token = await createInitialValuation(companyData);
        if (!token) {
          console.warn('Failed to create initial valuation');
        }
      }
      nextStep();
    } else if (currentStep === 3) {
      console.log('In step 3, calculating valuation...');
      trackCalculationStart();
      try {
        await calculateValuation();
        
        // Finalize autosave with calculation results if we have a token
        if (uniqueToken && result) {
          await finalizeValuation({
            ...companyData,
            finalValuation: result.finalValuation,
            ebitdaMultipleUsed: result.multiples.ebitdaMultipleUsed,
            valuationRangeMin: result.valuationRange.min,
            valuationRangeMax: result.valuationRange.max,
          });
        }
        
        trackCalculationComplete();
      } catch (error) {
        trackCalculationAbandon(currentStep);
      }
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
