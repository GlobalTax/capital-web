
import React from 'react';
import CharacteristicsForm from './forms/CharacteristicsForm';

interface Step3Props {
  companyData: any;
  updateField: (field: string, value: string | number) => void;
  showValidation?: boolean;
}

const Step3Characteristics: React.FC<Step3Props> = ({ companyData, updateField, showValidation = false }) => {
  return (
    <CharacteristicsForm
      companyData={companyData}
      updateField={updateField}
      showValidation={showValidation}
    />
  );
};

export default Step3Characteristics;
