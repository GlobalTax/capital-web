import React from 'react';
import Step1BasicInfoMaster from './Step1BasicInfoMaster';
import Step2FinancialDataMaster from './Step2FinancialDataMaster';
import Step3CharacteristicsMaster from './Step3CharacteristicsMaster';
import Step4ResultsMaster from './Step4ResultsMaster';

interface StepContentMasterProps {
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

const StepContentMaster: React.FC<StepContentMasterProps> = ({
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
        <Step1BasicInfoMaster 
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
        <Step2FinancialDataMaster 
          companyData={companyData} 
          updateField={updateField}
          showValidation={showValidation}
        />
      );
    case 3:
      return (
        <Step3CharacteristicsMaster 
          companyData={companyData} 
          updateField={updateField}
          showValidation={showValidation}
        />
      );
    case 4:
      return (
        <Step4ResultsMaster 
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

export default StepContentMaster;