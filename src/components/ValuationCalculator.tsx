import React, { useEffect } from 'react';
import { useValuationCalculator } from '@/hooks/useValuationCalculator';
import { useValuationCalculatorTracking } from '@/hooks/useValuationCalculatorTracking';
import { useValuationAutosave } from '@/hooks/useValuationAutosave';
import { useValuationHeartbeat } from '@/hooks/useValuationHeartbeat';
import { useValuationLoader } from '@/hooks/useValuationLoader';
import { CompanyData } from '@/types/valuation';
import StepIndicator from '@/components/valuation/StepIndicator';
import StepContent from '@/components/valuation/StepContent';
import NavigationButtons from '@/components/valuation/NavigationButtons';
import { SaveStatus } from '@/components/ui/save-status';
import { useI18n } from '@/shared/i18n/I18nProvider';
import { logDebug, logError, logWarning } from '@/core/logging/ConditionalLogger';

const ValuationCalculator = () => {
  const { t } = useI18n();
  
  // Extract token from URL
  const urlParams = new URLSearchParams(window.location.search);
  const urlToken = urlParams.get('token');

  // Load existing valuation if token provided
  const { data: existingValuation, isLoading: isLoadingValuation } = useValuationLoader(urlToken);
  
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
    lastSaved,
    isSaving,
    currentStep: autosaveStep,
    timeSpent,
    hasExistingSession,
    initializeToken,
    createInitialValuation,
    createInitialValuationOnFirstField,
    updateValuation,
    updateValuationImmediate,
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

  // Initialize autosave token on mount or load existing valuation
  useEffect(() => {
    if (urlToken && existingValuation) {
      // Pre-fill form with loaded data
      Object.entries(existingValuation).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          updateField(key as keyof CompanyData, value);
        }
      });
    } else {
      initializeToken();
    }
  }, [initializeToken, urlToken, existingValuation, updateField]);

  // Track step changes
  useEffect(() => {
    trackStepChange(currentStep);
    updateStep(currentStep); // Update autosave step tracking
  }, [currentStep, trackStepChange, updateStep]);

  // Enhanced updateField with tracking y GUARDADO AUTOMÁTICO INMEDIATO desde el primer campo
  const trackedUpdateField = async (field: keyof CompanyData, value: any) => {
    updateField(field, value);
    trackFieldUpdate(field, value);

    // Obtener parámetros UTM del URL para el tracking
    const urlParams = new URLSearchParams(window.location.search);
    const utmData = {
      utm_source: urlParams.get('utm_source'),
      utm_medium: urlParams.get('utm_medium'),
      utm_campaign: urlParams.get('utm_campaign'),
      referrer: document.referrer || null
    };

    try {
      // CREAR valoración inicial si no existe token
      if (!uniqueToken) {
        logDebug(`Primer campo detectado: ${field} = "${value}"`, { 
          context: 'valuation',
          component: 'ValuationCalculator',
          data: { field, value: value?.toString().substring(0, 50) }
        });
        const newToken = await createInitialValuationOnFirstField(field, value, companyData, utmData);
        if (newToken) {
          logDebug('Sistema de guardado automático activado', {
            context: 'valuation',
            component: 'ValuationCalculator'
          });
        }
      } else {
        // CAMPOS CRÍTICOS: guardado inmediato (email, companyName)
        if (field === 'email' || field === 'companyName') {
          logDebug(`Campo crítico detectado: ${field}. Guardado inmediato`, {
            context: 'valuation',
            component: 'ValuationCalculator',
            data: { field }
          });
          await updateValuationImmediate({ [field]: value }, field);
        } else {
          // OTROS CAMPOS: guardado con debounce (300ms)
          updateValuation({ [field]: value }, field);
        }
      }
    } catch (error) {
      logError('Error en guardado automático', error as Error, {
        context: 'valuation',
        component: 'ValuationCalculator',
        data: { field, hasToken: !!uniqueToken }
      });
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
    logDebug('handleNext called', { 
      context: 'valuation',
      component: 'ValuationCalculator',
      data: { currentStep }
    });
    
    if (currentStep === 1) {
      // Step 1: Calculate valuation and move to results
      logDebug('In step 1, calculating valuation', {
        context: 'valuation',
        component: 'ValuationCalculator'
      });
      trackCalculationStart();
      
      // Create initial valuation if not exists
      if (!uniqueToken) {
        logDebug('Creating initial valuation for Step 1', {
          context: 'valuation',
          component: 'ValuationCalculator'
        });
        const token = await createInitialValuation(companyData);
        if (!token) {
          logWarning('Failed to create initial valuation', {
            context: 'valuation',
            component: 'ValuationCalculator'
          });
        }
      }
      
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

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        updateValuationImmediate(companyData, 'flush_exit');
      }
    };

    const handlePageHide = () => {
      updateValuationImmediate(companyData, 'flush_exit');
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('unload', handleUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pagehide', handlePageHide);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('unload', handleUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pagehide', handlePageHide);
      handleUnload();
    };
  }, [currentStep, result, trackCalculationAbandon, flushPendingUpdates, updateValuationImmediate, companyData]);

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
          
          <div className="flex items-center justify-center gap-4 mt-4">
            {/* Save status indicator */}
            <SaveStatus isSaving={isSaving} lastSaved={lastSaved} />
            
            {/* Existing session indicator */}
            {hasExistingSession && (
              <div className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-50 text-green-700 border border-green-200">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Sesión recuperada
              </div>
            )}
          </div>
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

          {currentStep < 2 && (
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
