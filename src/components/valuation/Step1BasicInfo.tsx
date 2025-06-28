
import React from 'react';
import BasicInfoForm from './forms/BasicInfoForm';

interface Step1Props {
  companyData: any;
  updateField: (field: string, value: string | number) => void;
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

const Step1BasicInfo: React.FC<Step1Props> = (props) => {
  return <BasicInfoForm {...props} />;
};

export default Step1BasicInfo;
