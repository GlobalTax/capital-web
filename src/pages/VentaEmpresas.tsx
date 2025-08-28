
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import VentaEmpresasHero from '@/components/venta-empresas/VentaEmpresasHero';
import VentaEmpresasProcess from '@/components/venta-empresas/VentaEmpresasProcess';
import VentaEmpresasBenefits from '@/components/venta-empresas/VentaEmpresasBenefits';
import VentaEmpresasValuation from '@/components/venta-empresas/VentaEmpresasValuation';
import VentaEmpresasLogos from '@/components/venta-empresas/VentaEmpresasLogos';
import VentaEmpresasFAQ from '@/components/venta-empresas/VentaEmpresasFAQ';
import VentaEmpresasCTA from '@/components/venta-empresas/VentaEmpresasCTA';

const VentaEmpresas = () => {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="pt-16">
        <VentaEmpresasHero />
        <VentaEmpresasProcess />
        <VentaEmpresasBenefits />
        <VentaEmpresasValuation />
        <VentaEmpresasLogos />
        <VentaEmpresasFAQ />
        <VentaEmpresasCTA />
      </div>
      <Footer />
    </div>
  );
};

export default VentaEmpresas;
