
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
    <div className="flex justify-between items-center mt-8 pt-6 border-t-0.5 border-black">
      <Button
        onClick={onPrev}
        disabled={currentStep === 1}
        className="flex items-center bg-white text-black border-0.5 border-black rounded-lg hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ease-out disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
      >
        <ChevronLeft className="h-4 w-4 mr-2" />
        Anterior
      </Button>
      
      <div className="text-sm text-gray-500 font-medium">
        Paso {currentStep} de 3
      </div>
      
      <Button
        onClick={onNext}
        disabled={isNextDisabled}
        className="flex items-center bg-white text-black border-0.5 border-black rounded-lg hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ease-out disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
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
