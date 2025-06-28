
import React from 'react';
import Step1BasicInfo from '../valuation/Step1BasicInfo';
import Step2FinancialData from '../valuation/Step2FinancialData';
import Step3Characteristics from '../valuation/Step3Characteristics';
import Step4Results from './Step4Results';

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
  errors
}) => {
  switch (currentStep) {
    case 1:
      return (
        <Step1BasicInfo 
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
        <Step2FinancialData 
          companyData={companyData} 
          updateField={updateField}
          showValidation={showValidation}
        />
      );
    case 3:
      return (
        <Step3Characteristics 
          companyData={companyData} 
          updateField={updateField}
          showValidation={showValidation}
        />
      );
    case 4:
      return (
        <Step4Results 
          result={result}
          companyData={companyData}
          isCalculating={isCalculating}
          resetCalculator={resetCalculator}
        />
      );
    default:
      return null;
  }
};

export default StepContentV2;
