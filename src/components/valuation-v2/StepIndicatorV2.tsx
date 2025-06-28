
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
  { number: 4, title: 'Datos fiscales' },
  { number: 5, title: 'Resultado' }
];

const StepIndicatorV2: React.FC<StepIndicatorProps> = ({ currentStep, goToStep, validateStep }) => {
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
                className={`w-6 h-6 rounded-sm flex items-center justify-center text-xs font-semibold transition-all duration-200 border ${
                  isCompleted
                    ? 'bg-green-500 text-white border-green-500'
                    : isCurrent
                    ? 'bg-black text-white border-black'
                    : isClickable
                    ? 'bg-white text-black border-black hover:bg-gray-50'
                    : 'bg-white text-gray-400 border-gray-300 cursor-not-allowed'
                }`}
              >
                {isCompleted ? <Check className="w-3 h-3" /> : step.number}
              </button>
              <span className={`text-xs mt-2 text-center max-w-20 leading-tight ${
                isCurrent ? 'text-black font-medium' : 'text-gray-500'
              }`}>
                {step.title}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div className={`w-12 h-px mx-3 ${
                isCompleted ? 'bg-green-500' : 'bg-gray-200'
              }`} />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default StepIndicatorV2;
