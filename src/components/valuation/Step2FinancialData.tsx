
import React from 'react';
import FinancialDataForm from './forms/FinancialDataForm';

interface Step2Props {
  companyData: any;
  updateField: (field: string, value: string | number | boolean) => void;
  showValidation?: boolean;
}

const Step2FinancialData: React.FC<Step2Props> = (props) => {
  return <FinancialDataForm {...props} />;
};

export default Step2FinancialData;
