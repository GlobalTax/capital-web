
import React from 'react';
import { Check } from 'lucide-react';

interface StepIndicatorProps {
  currentStep: number;
  goToStep: (step: number) => void;
  validateStep: (step: number) => boolean;
}

const steps = [
  { number: 1, title: 'Información básica' },
  { number: 2, title: 'Datos financieros' },
  { number: 3, title: 'Características' },
  { number: 4, title: 'Resultado' }
];

const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep, goToStep, validateStep }) => {
  return (
    <div className="flex items-center justify-center mb-8">
      {steps.map((step, index) => {
        const isCompleted = currentStep > step.number;
        const isCurrent = currentStep === step.number;
        const isClickable = step.number < currentStep || (step.number === currentStep + 1 && validateStep(currentStep));
        
        return (
          <div key={step.number} className="flex items-center">
            <div className="flex flex-col items-center">
              <button
                onClick={() => isClickable ? goToStep(step.number) : null}
                disabled={!isClickable}
                className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-semibold transition-all duration-300 ease-out border-0.5 ${
                  isCompleted
                    ? 'bg-green-500 text-white border-green-500 shadow-sm'
                    : isCurrent
                    ? 'bg-black text-white border-black shadow-sm'
                    : isClickable
                    ? 'bg-white text-black border-black hover:shadow-lg hover:-translate-y-1'
                    : 'bg-gray-100 text-gray-400 border-gray-300 cursor-not-allowed'
                }`}
              >
                {isCompleted ? <Check className="w-4 h-4" /> : step.number}
              </button>
              <span className={`text-xs mt-2 text-center max-w-20 leading-tight ${
                isCurrent ? 'text-black font-medium' : 'text-gray-500'
              }`}>
                {step.title}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div className={`w-12 h-0.5 mx-3 ${
                isCompleted ? 'bg-green-500' : 'bg-gray-200'
              }`} />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default StepIndicator;
