import React from 'react';
import BasicInfoFinancialFormV2 from './BasicInfoFinancialFormV2';
import Step4Results from '@/components/valuation/Step4Results';

interface StepContentProps {
  currentStep: number;
  companyData: any;
  updateField: (field: string, value: string | number | boolean) => void;
  result: any;
  isCalculating: boolean;
  resetCalculator: () => void;
  showValidation?: boolean;
  getFieldState?: (field: string) => {
    isTouched: boolean;
    hasError: boolean;
    isValid: boolean;
    errorMessage?: string;
  };
  handleFieldBlur?: (field: string) => void;
  errors?: Record<string, string>;
  uniqueToken?: string;
}

const StepContentV2: React.FC<StepContentProps> = ({
  currentStep,
  companyData,
  updateField,
  result,
  isCalculating,
  resetCalculator,
  showValidation = false,
  getFieldState,
  handleFieldBlur,
  errors,
  uniqueToken
}) => {
  switch (currentStep) {
    case 1:
      return (
        <BasicInfoFinancialFormV2 
          companyData={companyData} 
          updateField={updateField}
          showValidation={showValidation}
          getFieldState={getFieldState}
          handleFieldBlur={handleFieldBlur}
          errors={errors}
        />
      );
    case 2:
      return (
        <Step4Results 
          result={result}
          companyData={companyData}
          isCalculating={isCalculating}
          resetCalculator={resetCalculator}
          uniqueToken={uniqueToken}
        />
      );
    default:
      return null;
  }
};

export default StepContentV2;