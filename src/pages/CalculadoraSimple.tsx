import React from 'react';
import { I18nProvider } from '@/shared/i18n/I18nProvider';
import ValuationCalculator from '@/components/ValuationCalculator';

const CalculadoraSimple: React.FC = () => {
  return (
    <I18nProvider>
      <ValuationCalculator />
    </I18nProvider>
  );
};

export default CalculadoraSimple;