import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Calculator } from 'lucide-react';

interface NavigationButtonsProps {
  currentStep: number;
  isNextDisabled: boolean;
  onPrev: () => void;
  onNext: () => void;
}

const NavigationButtonsV2: React.FC<NavigationButtonsProps> = ({
  currentStep,
  isNextDisabled,
  onPrev,
  onNext
}) => {
  console.log('🔘 NavigationButtonsV2 render:', { currentStep, isNextDisabled });

  const handleCalculateClick = () => {
    console.log('🔘 Calculate button clicked!', { currentStep, isNextDisabled });
    onNext();
  };

  return (
    <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
      <Button
        onClick={onPrev}
        variant="outline"
        disabled={currentStep === 1}
        className="flex items-center border-gray-900 text-gray-900 hover:shadow-md hover:-translate-y-0.5"
      >
        <ChevronLeft className="h-4 w-4 mr-2" />
        Anterior
      </Button>
      
      <div className="text-sm text-gray-500">
        Paso {currentStep} de 2
      </div>
      
      {currentStep === 1 && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-xs text-gray-700 text-center max-w-xs">
          Al calcular acepto que Capittal procese mis datos para la valoración y envío por WhatsApp si proporcioné mi teléfono.
        </div>
      )}
      
      <div className="space-y-2 flex-1 max-w-xs">
        <Button
          onClick={handleCalculateClick}
          disabled={isNextDisabled}
          variant="outline"
          className="w-full flex items-center justify-center border-gray-900 text-gray-900 hover:shadow-md hover:-translate-y-0.5"
        >
          <Calculator className="h-4 w-4 mr-2" />
          Calcular
        </Button>
        <p className="text-xs text-gray-500 text-center leading-tight">
          Al calcular acepto que Capittal procese mis datos para la valoración y envío por WhatsApp si proporciono mi teléfono.
        </p>
      </div>
    </div>
  );
};

export default NavigationButtonsV2;