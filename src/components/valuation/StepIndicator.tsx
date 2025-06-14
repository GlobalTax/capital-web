
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
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors ${
                  isCompleted
                    ? 'bg-green-500 text-white'
                    : isCurrent
                    ? 'bg-blue-600 text-white'
                    : isClickable
                    ? 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                {isCompleted ? <Check className="w-5 h-5" /> : step.number}
              </button>
              <span className={`text-sm mt-2 text-center ${
                isCurrent ? 'text-blue-600 font-medium' : 'text-gray-500'
              }`}>
                {step.title}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div className={`w-16 h-0.5 mx-4 ${
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
