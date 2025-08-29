import React, { useState } from 'react';
import { BasicCompanyData } from '@/types/basicCompany';
import StandaloneCompanyForm from '@/components/standalone/StandaloneCompanyForm';
import BasicStandaloneCalculator from '@/components/standalone/BasicStandaloneCalculator';

const CalculadoraStandalone = () => {
  const [companyData, setCompanyData] = useState<BasicCompanyData | null>(null);

  const handleFormSubmit = (data: BasicCompanyData) => {
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
        <BasicStandaloneCalculator companyData={companyData} onReset={handleReset} />
      )}
    </>
  );
};

export default CalculadoraStandalone;