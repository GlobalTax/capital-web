import React, { useEffect, useState } from 'react';
import { useValuationCalculatorMaster } from '@/hooks/useValuationCalculatorMaster';
import { useValuationCalculatorTracking } from '@/hooks/useValuationCalculatorTracking';
import { useValuationAutosave } from '@/hooks/useValuationAutosave';
import { useValuationHeartbeat } from '@/hooks/useValuationHeartbeat';
import StepIndicatorMaster from './valuation-master/StepIndicatorMaster';
import StepContentMaster from './valuation-master/StepContentMaster';
import NavigationButtonsMaster from './valuation-master/NavigationButtonsMaster';
import { useI18n } from '@/shared/i18n/I18nProvider';

const ValuationCalculatorMaster = () => {
  const { t } = useI18n();
  const [startTime] = useState<Date>(new Date());
  
  const {
    currentStep,
    companyData,
    result,
    isCalculating,
    showValidation,
    updateField,
    handleFieldBlur,
    getFieldState,
    errors,
    nextStep,
    prevStep,
    goToStep,
    validateStep,
    calculateValuation,
    resetCalculator
  } = useValuationCalculatorMaster();

  const {
    trackStepChange,
    trackFieldUpdate,
    trackCalculationStart,
    trackStepCompletion,
    trackCalculationComplete,
    trackCalculationAbandon
  } = useValuationCalculatorTracking();

  const {
    uniqueToken,
    lastSaved,
    isSaving,
    currentStep: autosaveStep,
    timeSpent,
    initializeToken,
    createInitialValuation,
    updateValuation,
    finalizeValuation
  } = useValuationAutosave();

  useValuationHeartbeat({
    uniqueToken,
    currentStep,
    timeSpent,
    startTime,
    isActive: true
  });

  useEffect(() => {
    initializeToken();
  }, [initializeToken]);

  useEffect(() => {
    if (currentStep !== autosaveStep) {
      trackStepChange(currentStep);
    }
  }, [currentStep, autosaveStep, trackStepChange]);

  useEffect(() => {
    return () => {
      if (currentStep < 4 && !result) {
        trackCalculationAbandon(currentStep);
      }
    };
  }, [currentStep, result, trackCalculationAbandon]);

  const trackedUpdateField = (field: string, value: string | number | boolean) => {
    updateField(field as any, value);
    trackFieldUpdate(field, value);
    
    if (!uniqueToken && field === 'contactName' && value) {
      createInitialValuation({ [field]: value } as any);
    } else if (uniqueToken) {
      updateValuation({ [field]: value } as any, field);
    }
  };

  const trackedHandleFieldBlur = (field: string) => {
    handleFieldBlur(field as any);
  };

  const handleNext = async () => {
    if (currentStep === 3) {
      trackCalculationStart();
      await calculateValuation();
      trackCalculationComplete(result);
      
      if (uniqueToken && result) {
        await finalizeValuation({
          ...companyData,
          finalValuation: result.finalValuation,
          ebitdaMultipleUsed: result.multiples.ebitdaMultipleUsed,
          valuationRangeMin: result.valuationRange.min,
          valuationRangeMax: result.valuationRange.max
        });
      }
    } else {
      trackStepCompletion(currentStep, companyData);
      nextStep();
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          {t('calculator.title')}
        </h1>
        <p className="text-lg text-gray-600">
          {t('calculator.subtitle')}
        </p>
      </div>

      <StepIndicatorMaster
        currentStep={currentStep}
        goToStep={goToStep}
        validateStep={validateStep}
      />

      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <StepContentMaster
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
          <NavigationButtonsMaster
            currentStep={currentStep}
            isNextDisabled={false}
            onPrev={prevStep}
            onNext={handleNext}
          />
        )}
      </div>
    </div>
  );
};

export default ValuationCalculatorMaster;