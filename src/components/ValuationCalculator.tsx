import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import StepContent from './valuation/StepContent';
import NavigationButtons from './valuation/NavigationButtons';
import { useValuationCalculator } from '@/hooks/useValuationCalculator';
import { useI18n } from '@/shared/i18n/I18nProvider';

const ValuationCalculator: React.FC = () => {
  const { t } = useI18n();
  const {
    currentStep,
    companyData,
    result,
    isCalculating,
    showValidation,
    isCurrentStepValid,
    updateField,
    handleFieldBlur,
    getFieldState,
    nextStep,
    prevStep,
    calculateValuation,
    resetCalculator,
    errors
  } = useValuationCalculator();

  const getStepTitle = (step: number) => {
    switch (step) {
      case 1: return t('steps.basic_info');
      case 2: return t('steps.financial_data');
      case 3: return t('steps.characteristics');
      case 4: return t('steps.results');
      default: return '';
    }
  };

  const handleNext = () => {
    if (currentStep === 3) {
      calculateValuation();
    } else {
      nextStep();
    }
  };

  const progressValue = currentStep === 4 ? 100 : ((currentStep - 1) / 3) * 100;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card className="shadow-lg">
        <CardContent className="p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-center text-gray-900 mb-2">
              {t('calculator.title')}
            </h1>
            <p className="text-center text-gray-600 mb-6">
              {t('calculator.subtitle')}
            </p>
            
            {/* Progress Bar - Only show for steps 1-3 */}
            {currentStep <= 3 && (
              <div className="mb-6">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>{getStepTitle(currentStep)}</span>
                  <span>{t('nav.step_of', { current: currentStep, total: 3 })}</span>
                </div>
                <Progress value={progressValue} className="h-2" />
              </div>
            )}
          </div>

          {/* Step Content */}
          <StepContent
            currentStep={currentStep}
            companyData={companyData}
            updateField={updateField}
            result={result}
            isCalculating={isCalculating}
            resetCalculator={resetCalculator}
            showValidation={showValidation}
            getFieldState={getFieldState}
            handleFieldBlur={handleFieldBlur}
            errors={errors}
          />

          {/* Navigation - Only show for steps 1-3 */}
          {currentStep <= 3 && (
            <NavigationButtons
              currentStep={currentStep}
              isNextDisabled={!isCurrentStepValid}
              onPrev={prevStep}
              onNext={handleNext}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ValuationCalculator;