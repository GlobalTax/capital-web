import React from 'react';
import FinancialDataForm from './forms/FinancialDataForm';

interface Step2Props {
  companyData: any;
  updateField: (field: string, value: string | number | boolean) => void;
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

const Step2FinancialData: React.FC<Step2Props> = (props) => {
  return <FinancialDataForm {...props} />;
};

export default Step2FinancialData;