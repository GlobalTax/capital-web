import React, { useState } from 'react';
import { AdvisorStepperForm } from './AdvisorStepperForm';
import { AdvisorResultsDisplaySimple } from './AdvisorResultsDisplaySimple';
import { AdvisorFormData, AdvisorValuationSimpleResult } from '@/types/advisor';

export const AdvisorCalculator: React.FC = () => {
  const [formData, setFormData] = useState<AdvisorFormData | null>(null);
  const [result, setResult] = useState<AdvisorValuationSimpleResult | null>(null);

  const handleCalculationComplete = (data: AdvisorFormData, calculationResult: AdvisorValuationSimpleResult) => {
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
      <AdvisorResultsDisplaySimple 
        result={result} 
        formData={formData}
        onBack={handleBack}
      />
    );
  }

  return (
    <AdvisorStepperForm onCalculate={handleCalculationComplete} />
  );
};
