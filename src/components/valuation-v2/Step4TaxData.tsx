
import React from 'react';
import TaxDataForm from './forms/TaxDataForm';

interface Step4Props {
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

const Step4TaxData: React.FC<Step4Props> = (props) => {
  return <TaxDataForm {...props} />;
};

export default Step4TaxData;
