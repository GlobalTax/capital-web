import React from 'react';
import CharacteristicsFormMaster from './forms/CharacteristicsFormMaster';

interface Step3MasterProps {
  companyData: any;
  updateField: (field: string, value: string | number) => void;
  showValidation?: boolean;
}

const Step3CharacteristicsMaster: React.FC<Step3MasterProps> = ({ companyData, updateField, showValidation = false }) => {
  return (
    <CharacteristicsFormMaster
      companyData={companyData}
      updateField={updateField}
      showValidation={showValidation}
    />
  );
};

export default Step3CharacteristicsMaster;