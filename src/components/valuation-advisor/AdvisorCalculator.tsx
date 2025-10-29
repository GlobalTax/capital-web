import React, { useState } from 'react';
import { AdvisorCalculatorForm } from './AdvisorCalculatorForm';
import { AdvisorResultsDisplay } from './AdvisorResultsDisplay';
import { AdvisorValuationResult } from '@/utils/advisorValuationCalculation';

interface FormData {
  sector: string;
  revenue: number;
  ebitda: number;
  netProfit: number;
}

export const AdvisorCalculator: React.FC = () => {
  const [formData, setFormData] = useState<FormData | null>(null);
  const [result, setResult] = useState<AdvisorValuationResult | null>(null);

  const handleCalculationComplete = (data: FormData, calculationResult: AdvisorValuationResult) => {
    setFormData(data);
    setResult(calculationResult);
    
    // Scroll suave hacia arriba
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBack = () => {
    setFormData(null);
    setResult(null);
  };

  if (result && formData) {
    return (
      <AdvisorResultsDisplay 
        result={result} 
        formData={formData}
        onBack={handleBack}
      />
    );
  }

  return (
    <AdvisorCalculatorForm onCalculate={handleCalculationComplete} />
  );
};
