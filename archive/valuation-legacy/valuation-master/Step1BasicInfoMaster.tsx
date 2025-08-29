import React from 'react';
import BasicInfoFormMaster from './forms/BasicInfoFormMaster';

interface Step1MasterProps {
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

const Step1BasicInfoMaster: React.FC<Step1MasterProps> = (props) => {
  return <BasicInfoFormMaster {...props} />;
};

export default Step1BasicInfoMaster;