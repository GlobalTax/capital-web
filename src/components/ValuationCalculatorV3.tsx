import React from 'react';
import { UnifiedCalculator } from '@/features/valuation/components/UnifiedCalculator';
import { V3_CONFIG } from '@/features/valuation/configs/calculator.configs';
import { CompanyDataV3 } from '@/types/valuationV3';

interface ValuationCalculatorV3Props {
  companyData: CompanyDataV3;
}

const ValuationCalculatorV3 = ({ companyData }: ValuationCalculatorV3Props) => {
  return (
    <UnifiedCalculator 
      config={V3_CONFIG}
      initialData={companyData}  
      className="valuation-calculator-v3"
    />
  );
};

export default ValuationCalculatorV3;