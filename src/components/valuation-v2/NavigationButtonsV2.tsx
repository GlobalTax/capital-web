
import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Calculator } from 'lucide-react';

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
  return (
    <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
      <Button
        onClick={onPrev}
        variant="outline"
        disabled={currentStep === 1}
        className="flex items-center border-gray-900 text-gray-900 hover:bg-gray-100"
      >
        <ChevronLeft className="h-4 w-4 mr-2" />
        Anterior
      </Button>
      
      <div className="text-sm text-gray-500">
        Paso {currentStep} de 4
      </div>
      
      <Button
        onClick={onNext}
        disabled={isNextDisabled}
        className="flex items-center bg-white text-gray-900 border border-gray-900 hover:bg-gray-100"
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

export default NavigationButtonsV2;
