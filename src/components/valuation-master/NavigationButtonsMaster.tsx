import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Calculator } from 'lucide-react';
import { useI18n } from '@/shared/i18n/I18nProvider';

interface NavigationButtonsMasterProps {
  currentStep: number;
  isNextDisabled: boolean;
  onPrev: () => void;
  onNext: () => void;
}

const NavigationButtonsMaster: React.FC<NavigationButtonsMasterProps> = ({
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
        {t('nav.step_of', { current: currentStep, total: 1 })}
      </div>
      
      {currentStep === 1 && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-xs text-gray-700 text-center sm:max-w-xs">
          Al calcular acepto que Capittal procese mis datos para la valoración y envío por WhatsApp si proporcioné mi teléfono.
        </div>
      )}
      
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

export default NavigationButtonsMaster;