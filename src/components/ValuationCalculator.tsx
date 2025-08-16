import React, { useEffect } from 'react';
import { useValuationCalculator } from '@/hooks/useValuationCalculator';
import { useValuationCalculatorTracking } from '@/hooks/useValuationCalculatorTracking';
import { useValuationAutosave } from '@/hooks/useValuationAutosave';
import { useValuationHeartbeat } from '@/hooks/useValuationHeartbeat';
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
    currentStep: autosaveStep,
    timeSpent,
    hasExistingSession,
    initializeToken,
    createInitialValuation,
    createInitialValuationOnFirstField,
    updateValuation,
    finalizeValuation,
    updateStep,
    clearAutosave,
    flushPendingUpdates
  } = useValuationAutosave();

  // Setup heartbeat for activity tracking
  useValuationHeartbeat({
    uniqueToken,
    currentStep,
    timeSpent,
    startTime: null, // We'll get this from autosave hook
    isActive: currentStep < 4 // Only active during form steps, not results
  });

  // Initialize autosave token on mount
  useEffect(() => {
    initializeToken();
  }, [initializeToken]);

  // Track step changes
  useEffect(() => {
    trackStepChange(currentStep);
    updateStep(currentStep); // Update autosave step tracking
  }, [currentStep, trackStepChange, updateStep]);

  // Enhanced updateField with tracking and AUTOSAVE INMEDIATO desde el primer campo
  const trackedUpdateField = async (field: keyof CompanyData, value: any) => {
    updateField(field, value);
    trackFieldUpdate(field, value);
    
    // Obtener UTMs y referrer actuales
    const urlParams = new URLSearchParams(window.location.search);
    const currentUTMs = {
      utm_source: urlParams.get('utm_source'),
      utm_medium: urlParams.get('utm_medium'),
      utm_campaign: urlParams.get('utm_campaign'),
      referrer: document.referrer || null
    };
    
    // Crear valoración inicial si es el primer campo completado
    if (!uniqueToken && value && value !== '') {
      console.log(`Primer campo completado: ${field}. Creando registro con UTMs...`);
      await createInitialValuationOnFirstField(field, value, {
        ...companyData,
        [field]: value
      }, currentUTMs);
    }
    
    // Actualizar si ya existe token
    if (uniqueToken) {
      updateValuation({ [field]: value }, field);
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

  // Track abandon on unmount and handle page unload flush
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Flush any pending updates before leaving
      flushPendingUpdates();
    };

    const handleUnload = () => {
      if (currentStep < 4 && !result) {
        trackCalculationAbandon(currentStep);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('unload', handleUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('unload', handleUnload);
      handleUnload();
    };
  }, [currentStep, result, trackCalculationAbandon, flushPendingUpdates]);

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
          
          {/* Autosave status indicator */}
          {hasExistingSession && (
            <div className="mt-4 inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-50 text-green-700 border border-green-200">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Sesión recuperada
            </div>
          )}
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
