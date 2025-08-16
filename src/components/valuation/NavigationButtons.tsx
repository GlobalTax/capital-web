
import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Calculator } from 'lucide-react';
import { useI18n } from '@/shared/i18n/I18nProvider';

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
  const { t } = useI18n();
  return (
    <div className="flex flex-col sm:flex-row sm:justify-between items-stretch sm:items-center gap-4 mt-8 pt-6 border-t border-gray-200">
      <Button
        onClick={onPrev}
        aria-label={t('aria.prev')}
        variant="outline"
        disabled={currentStep === 1}
        className="flex items-center h-11 border-gray-900 text-gray-900 hover:bg-gray-100"
      >
        <ChevronLeft className="h-4 w-4 mr-2" />
        {t('nav.prev')}
      </Button>
      
      <div className="text-sm text-gray-500">
        {t('nav.step_of', { current: currentStep, total: 2 })}
      </div>
      
      <Button
        onClick={onNext}
        aria-label={currentStep === 1 ? t('aria.calculate') : t('aria.next')}
        disabled={isNextDisabled}
        className="flex items-center h-11 bg-white text-gray-900 border border-gray-900 hover:bg-gray-100"
      >
        {currentStep === 1 ? (
          <>
            <Calculator className="h-4 w-4 mr-2" />
            {t('nav.calculate')}
          </>
        ) : (
          <>
            {t('nav.next')}
            <ChevronRight className="h-4 w-4 ml-2" />
          </>
        )}
      </Button>
    </div>
  );
};

export default NavigationButtons;
