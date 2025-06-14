
import React from 'react';
import { Button } from '@/components/ui/button';
import { useValuationCalculator } from '@/hooks/useValuationCalculator';
import StepIndicator from '@/components/valuation/StepIndicator';
import Step1BasicInfo from '@/components/valuation/Step1BasicInfo';
import Step2FinancialData from '@/components/valuation/Step2FinancialData';
import Step3Characteristics from '@/components/valuation/Step3Characteristics';
import Step4Results from '@/components/valuation/Step4Results';
import { ChevronLeft, ChevronRight, Calculator } from 'lucide-react';

const ValuationCalculator = () => {
  const { 
    currentStep,
    companyData, 
    result, 
    isCalculating, 
    updateField, 
    nextStep,
    prevStep,
    goToStep,
    validateStep,
    calculateValuation, 
    resetCalculator 
  } = useValuationCalculator();

  const handleNext = () => {
    if (currentStep === 3) {
      calculateValuation();
    } else {
      nextStep();
    }
  };

  const isNextDisabled = !validateStep(currentStep) || isCalculating;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Calculadora de Valoración Empresarial
          </h1>
          <p className="text-lg text-gray-600">
            Obtén una valoración estimada de tu empresa en pocos pasos
          </p>
        </div>

        {/* Indicador de pasos */}
        <StepIndicator 
          currentStep={currentStep} 
          goToStep={goToStep}
          validateStep={validateStep}
        />

        {/* Contenido del formulario */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          {currentStep === 1 && (
            <Step1BasicInfo 
              companyData={companyData} 
              updateField={updateField} 
            />
          )}
          
          {currentStep === 2 && (
            <Step2FinancialData 
              companyData={companyData} 
              updateField={updateField} 
            />
          )}
          
          {currentStep === 3 && (
            <Step3Characteristics 
              companyData={companyData} 
              updateField={updateField} 
            />
          )}
          
          {currentStep === 4 && (
            <Step4Results 
              result={result}
              companyData={companyData}
              isCalculating={isCalculating}
              resetCalculator={resetCalculator}
            />
          )}

          {/* Navegación */}
          {currentStep < 4 && (
            <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
              <Button
                onClick={prevStep}
                variant="outline"
                disabled={currentStep === 1}
                className="flex items-center"
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Anterior
              </Button>
              
              <div className="text-sm text-gray-500">
                Paso {currentStep} de 3
              </div>
              
              <Button
                onClick={handleNext}
                disabled={isNextDisabled}
                className="flex items-center bg-blue-600 hover:bg-blue-700 text-white"
              >
                {currentStep === 3 ? (
                  <>
                    <Calculator className="h-4 w-4 mr-2" />
                    Calcular Valoración
                  </>
                ) : (
                  <>
                    Siguiente
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ValuationCalculator;
