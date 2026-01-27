import React from 'react';
import BasicInfoFinancialFormV2 from './BasicInfoFinancialFormV2';
import Step4Results from '@/components/valuation/Step4Results';
import { ManualResultsStep } from '@/components/admin/valuation/ManualResultsStep';

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
  sourceProject?: string;
  extraMetadata?: {
    leadSource?: string;
    leadSourceDetail?: string;
  };
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
  uniqueToken,
  sourceProject,
  extraMetadata
}) => {
  // Check if this is manual admin entry mode
  const isManualMode = sourceProject === 'manual-admin-entry';

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
      // Use ManualResultsStep for admin manual entry (separate Save/Send actions)
      if (isManualMode) {
        return (
          <ManualResultsStep
            result={result}
            companyData={companyData}
            sourceProject={sourceProject}
            extraMetadata={extraMetadata}
            onReset={resetCalculator}
          />
        );
      }
      // Use standard Step4Results for regular calculator (auto email)
      return (
        <Step4Results 
          result={result}
          companyData={companyData}
          isCalculating={isCalculating}
          resetCalculator={resetCalculator}
          uniqueToken={uniqueToken}
          sourceProject={sourceProject}
          extraMetadata={extraMetadata}
        />
      );
    default:
      return null;
  }
};

export default StepContentV2;