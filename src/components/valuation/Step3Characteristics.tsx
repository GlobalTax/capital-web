import React from 'react';
import CharacteristicsForm from './forms/CharacteristicsForm';

interface Step3Props {
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

const Step3Characteristics: React.FC<Step3Props> = (props) => {
  return <CharacteristicsForm {...props} />;
};

export default Step3Characteristics;