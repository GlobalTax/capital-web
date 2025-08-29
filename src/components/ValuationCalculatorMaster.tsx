import React from 'react';
import { UnifiedCalculator } from '@/features/valuation/components/UnifiedCalculator';
import { MASTER_CONFIG } from '@/features/valuation/configs/calculator.configs';

const ValuationCalculatorMaster = () => {
  return (
    <UnifiedCalculator 
      config={MASTER_CONFIG}
      className="valuation-calculator-master"
    />
  );
};

export default ValuationCalculatorMaster;