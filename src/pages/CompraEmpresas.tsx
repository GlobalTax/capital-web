
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CompraEmpresasHero from '@/components/compra-empresas/CompraEmpresasHero';
import CompraEmpresasProcess from '@/components/compra-empresas/CompraEmpresasProcess';
import CompraEmpresasBenefits from '@/components/compra-empresas/CompraEmpresasBenefits';
import CompaniesForSale from '@/components/CompaniesForSale';
import CompraEmpresasCTA from '@/components/compra-empresas/CompraEmpresasCTA';

const CompraEmpresas = () => {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="pt-16">
        <CompraEmpresasHero />
        <CompaniesForSale />
        <CompraEmpresasProcess />
        <CompraEmpresasBenefits />
        <CompraEmpresasCTA />
      </div>
      <Footer />
    </div>
  );
};

export default CompraEmpresas;
