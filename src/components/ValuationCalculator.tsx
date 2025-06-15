
import React from 'react';
import { useValuationCalculator } from '@/hooks/useValuationCalculator';
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
    updateField, 
    nextStep,
    prevStep,
    goToStep,
    validateStep,
    calculateValuation, 
    resetCalculator 
  } = useValuationCalculator();

  const handleNext = () => {
    console.log('handleNext called, currentStep:', currentStep);
    
    if (currentStep === 3) {
      console.log('In step 3, calculating valuation...');
      calculateValuation();
    } else {
      console.log('Moving to next step...');
      nextStep();
    }
  };

  const isNextDisabled = isCalculating;

  return (
    <div className="min-h-screen bg-white py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-black mb-4">
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

        <div className="bg-white rounded-lg p-8 mb-8 border-0.5 border-black shadow-sm">
          <StepContent
            currentStep={currentStep}
            companyData={companyData}
            updateField={updateField}
            result={result}
            isCalculating={isCalculating}
            resetCalculator={resetCalculator}
            showValidation={showValidation}
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
