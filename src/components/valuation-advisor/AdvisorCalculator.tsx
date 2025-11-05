import React, { useState } from 'react';
import { AdvisorStepperForm } from './AdvisorStepperForm';
import { AdvisorResultsDisplaySimple } from './AdvisorResultsDisplaySimple';
import { AdvisorFormData, AdvisorValuationSimpleResult } from '@/types/advisor';

export const AdvisorCalculator: React.FC = () => {
  const [formData, setFormData] = useState<AdvisorFormData | null>(null);
  const [result, setResult] = useState<AdvisorValuationSimpleResult | null>(null);
  const [valuationId, setValuationId] = useState<string | null>(null);

  const handleCalculationComplete = (
    data: AdvisorFormData, 
    calculationResult: AdvisorValuationSimpleResult,
    savedValuationId?: string
  ) => {
    setFormData(data);
    setResult(calculationResult);
    setValuationId(savedValuationId || null);
    
    // Scroll suave hacia arriba
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBack = () => {
    setFormData(null);
    setResult(null);
    setValuationId(null);
  };

  if (result && formData) {
    return (
      <AdvisorResultsDisplaySimple 
        result={result} 
        formData={formData}
        valuationId={valuationId}
        onBack={handleBack}
      />
    );
  }

  return (
    <AdvisorStepperForm onCalculate={handleCalculationComplete} />
  );
};
