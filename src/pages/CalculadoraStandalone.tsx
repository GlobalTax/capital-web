import React, { useState } from 'react';
import { CompanyDataV4 } from '@/types/valuationV4';
import StandaloneCompanyForm from '@/components/standalone/StandaloneCompanyForm';
import StandaloneCalculator from '@/components/standalone/StandaloneCalculator';

const CalculadoraStandalone = () => {
  const [companyData, setCompanyData] = useState<CompanyDataV4 | null>(null);

  const handleFormSubmit = (data: CompanyDataV4) => {
    setCompanyData(data);
  };

  const handleReset = () => {
    setCompanyData(null);
  };

  return (
    <>
      {!companyData ? (
        <StandaloneCompanyForm onSubmit={handleFormSubmit} />
      ) : (
        <StandaloneCalculator companyData={companyData} onReset={handleReset} />
      )}
    </>
  );
};

export default CalculadoraStandalone;