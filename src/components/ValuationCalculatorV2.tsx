import React from 'react';
import { UnifiedCalculator } from '@/features/valuation/components/UnifiedCalculator';
import { V2_CONFIG } from '@/features/valuation/configs/calculator.configs';

const ValuationCalculatorV2 = () => {
  return (
    <UnifiedCalculator 
      config={V2_CONFIG}
      className="valuation-calculator-v2"
    />
  );
};

export default ValuationCalculatorV2;
