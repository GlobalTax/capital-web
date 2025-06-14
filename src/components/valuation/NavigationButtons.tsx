
import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Calculator } from 'lucide-react';

interface NavigationButtonsProps {
  currentStep: number;
  isNextDisabled: boolean;
  onPrev: () => void;
  onNext: () => void;
}

const NavigationButtons: React.FC<NavigationButtonsProps> = ({
  currentStep,
  isNextDisabled,
  onPrev,
  onNext
}) => {
  return (
    <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
      <Button
        onClick={onPrev}
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
        onClick={onNext}
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
  );
};

export default NavigationButtons;
