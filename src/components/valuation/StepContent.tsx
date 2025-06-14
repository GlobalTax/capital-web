
import React from 'react';
import Step1BasicInfo from './Step1BasicInfo';
import Step2FinancialData from './Step2FinancialData';
import Step3Characteristics from './Step3Characteristics';
import Step4Results from './Step4Results';

interface StepContentProps {
  currentStep: number;
  companyData: any;
  updateField: (field: string, value: string | number) => void;
  result: any;
  isCalculating: boolean;
  resetCalculator: () => void;
}

const StepContent: React.FC<StepContentProps> = ({
  currentStep,
  companyData,
  updateField,
  result,
  isCalculating,
  resetCalculator
}) => {
  switch (currentStep) {
    case 1:
      return (
        <Step1BasicInfo 
          companyData={companyData} 
          updateField={updateField} 
        />
      );
    case 2:
      return (
        <Step2FinancialData 
          companyData={companyData} 
          updateField={updateField} 
        />
      );
    case 3:
      return (
        <Step3Characteristics 
          companyData={companyData} 
          updateField={updateField} 
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

export default StepContent;
