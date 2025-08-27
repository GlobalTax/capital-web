import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calculator } from 'lucide-react';
import { useValuationCalculatorMaster } from '@/hooks/useValuationCalculatorMaster';
import StepIndicatorMaster from './valuation-master/StepIndicatorMaster';
import StepContentMaster from './valuation-master/StepContentMaster';
import NavigationButtonsMaster from './valuation-master/NavigationButtonsMaster';

const ValuationCalculatorMaster: React.FC = () => {
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
  } = useValuationCalculatorMaster();

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
            <div className="flex items-center justify-center gap-2 mb-4">
              <Calculator className="h-8 w-8 text-primary" />
              <CardTitle className="text-3xl font-bold text-foreground">
                🎯 Calculadora MASTER de Valoración
              </CardTitle>
            </div>
            <p className="text-muted-foreground">
              Valoración completa por pasos • Versión Master Profesional
            </p>
            <div className="mt-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
              📍 Estás en: /calculadora-master (Versión por pasos 1-2-3)
            </div>
          </CardHeader>

          <CardContent className="space-y-8">
            {/* Step Indicator */}
            <StepIndicatorMaster 
              currentStep={currentStep}
              goToStep={goToStep}
              validateStep={validateStep}
            />

            {/* Step Content */}
            <StepContentMaster
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

            {/* Navigation Buttons - Only show for steps 1-3 */}
            {currentStep <= 3 && (
              <NavigationButtonsMaster
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

export default ValuationCalculatorMaster;