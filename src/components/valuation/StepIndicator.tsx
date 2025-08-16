
import React from 'react';
import { Check } from 'lucide-react';
import { useI18n } from '@/shared/i18n/I18nProvider';

interface StepIndicatorProps {
  currentStep: number;
  goToStep: (step: number) => void;
  validateStep: (step: number) => boolean;
}

const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep, goToStep, validateStep }) => {
  const { t } = useI18n();
  const steps = [
    { number: 1, title: t('steps.company_info') },
    { number: 2, title: t('steps.result') }
  ];
  return (
    <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mb-8">
      {steps.map((step, index) => {
        const isCompleted = currentStep > step.number;
        const isCurrent = currentStep === step.number;
        const isClickable = step.number < currentStep || (step.number === currentStep + 1 && validateStep(currentStep));
        
        return (
          <div key={step.number} className="flex items-center">
            <div className="flex flex-col items-center">
              <button
                aria-label={step.title}
                onClick={() => (isClickable ? goToStep(step.number) : null)}
                disabled={!isClickable}
                className={`w-11 h-11 min-w-[44px] min-h-[44px] rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-200 border ${
                  isCompleted
                    ? 'bg-green-500 text-white border-green-500'
                    : isCurrent
                    ? 'bg-black text-white border-black'
                    : isClickable
                    ? 'bg-white text-black border-black hover:bg-gray-50'
                    : 'bg-white text-gray-400 border-gray-300 cursor-not-allowed'
                }`}
              >
                {isCompleted ? <Check className="w-4 h-4" /> : step.number}
              </button>
              <span
                className={`hidden sm:block text-xs mt-2 text-center max-w-24 truncate leading-tight ${
                  isCurrent ? 'text-black font-medium' : 'text-gray-500'
                }`}
              >
                {step.title}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`hidden sm:block w-12 h-px mx-3 ${isCompleted ? 'bg-green-500' : 'bg-gray-200'}`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default StepIndicator;
