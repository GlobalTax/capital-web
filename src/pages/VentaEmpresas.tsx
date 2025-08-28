
import React from 'react';
import { HomeLayout } from '@/shared';
import VentaEmpresasHero from '@/components/venta-empresas/VentaEmpresasHero';
import VentaEmpresasProcess from '@/components/venta-empresas/VentaEmpresasProcess';
import VentaEmpresasBenefits from '@/components/venta-empresas/VentaEmpresasBenefits';
import VentaEmpresasValuation from '@/components/venta-empresas/VentaEmpresasValuation';
import VentaEmpresasLogos from '@/components/venta-empresas/VentaEmpresasLogos';
import VentaEmpresasFAQ from '@/components/venta-empresas/VentaEmpresasFAQ';
import VentaEmpresasCTA from '@/components/venta-empresas/VentaEmpresasCTA';

const VentaEmpresas = () => {
  return (
    <HomeLayout>
      <VentaEmpresasHero />
      <VentaEmpresasProcess />
      <VentaEmpresasBenefits />
      <VentaEmpresasValuation />
      <VentaEmpresasLogos />
      <VentaEmpresasFAQ />
      <VentaEmpresasCTA />
    </HomeLayout>
  );
};

export default VentaEmpresas;
