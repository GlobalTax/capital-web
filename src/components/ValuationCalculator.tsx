import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calculator } from 'lucide-react';
import { useValuationCalculator } from '@/hooks/useValuationCalculator';
import { useI18n } from '@/shared/i18n/I18nProvider';
import StepIndicator from './valuation/StepIndicator';
import StepContent from './valuation/StepContent';
import NavigationButtons from './valuation/NavigationButtons';
import LanguageSelector from './valuation/LanguageSelector';

const ValuationCalculator: React.FC = () => {
  const {
    companyData,
    currentStep,
    result,
    isCalculating,
    showValidation,
    isStepValid,
    updateField,
    handleFieldBlur,
    getFieldState,
    validateStep,
    goToStep,
    nextStep,
    prevStep,
    resetCalculator
  } = useValuationCalculator();

  const { t } = useI18n();

  const errors = React.useMemo(() => {
    const errorMap: Record<string, string> = {};
    Object.keys(companyData).forEach(field => {
      const fieldState = getFieldState(field);
      if (fieldState.hasError && fieldState.errorMessage) {
        errorMap[field] = fieldState.errorMessage;
      }
    });
    return errorMap;
  }, [getFieldState, companyData]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 mx-auto">
                <Calculator className="h-8 w-8 text-primary" />
                <CardTitle className="text-3xl font-bold text-foreground">
                  {t('calc.title')}
                </CardTitle>
              </div>
              <LanguageSelector />
            </div>
            <p className="text-muted-foreground">
              {t('calc.subtitle')}
            </p>
          </CardHeader>

          <CardContent className="space-y-8">
            {/* Step Indicator */}
            <StepIndicator 
              currentStep={currentStep}
              goToStep={goToStep}
              validateStep={validateStep}
            />

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

            {/* Navigation Buttons - Only show for step 1 */}
            {currentStep === 1 && (
              <NavigationButtons
                currentStep={currentStep}
                isNextDisabled={!isStepValid || isCalculating}
                onPrev={prevStep}
                onNext={nextStep}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ValuationCalculator;