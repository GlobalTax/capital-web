import React from 'react';
import FinancialDataFormMaster from './forms/FinancialDataFormMaster';

interface Step2MasterProps {
  companyData: any;
  updateField: (field: string, value: string | number | boolean) => void;
  showValidation?: boolean;
}

const Step2FinancialDataMaster: React.FC<Step2MasterProps> = (props) => {
  return <FinancialDataFormMaster {...props} />;
};

export default Step2FinancialDataMaster;