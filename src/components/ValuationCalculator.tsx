import React from 'react';
import { UnifiedCalculator } from '@/features/valuation/components/UnifiedCalculator';
import { V1_CONFIG } from '@/features/valuation/configs/calculator.configs';

const ValuationCalculator = () => {
  return (
    <UnifiedCalculator 
      config={V1_CONFIG}
      className="valuation-calculator-v1"
    />
  );
};

export default ValuationCalculator;