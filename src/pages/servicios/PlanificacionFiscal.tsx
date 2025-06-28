
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PlanificacionFiscalHero from '@/components/planificacion-fiscal/PlanificacionFiscalHero';
import PlanificacionFiscalProcess from '@/components/planificacion-fiscal/PlanificacionFiscalProcess';
import PlanificacionFiscalBenefits from '@/components/planificacion-fiscal/PlanificacionFiscalBenefits';
import PlanificacionFiscalFAQ from '@/components/planificacion-fiscal/PlanificacionFiscalFAQ';
import PlanificacionFiscalCTA from '@/components/planificacion-fiscal/PlanificacionFiscalCTA';

const PlanificacionFiscal = () => {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="pt-16">
        <PlanificacionFiscalHero />
        <PlanificacionFiscalProcess />
        <PlanificacionFiscalBenefits />
        <PlanificacionFiscalFAQ />
        <PlanificacionFiscalCTA />
      </div>
      <Footer />
    </div>
  );
};

export default PlanificacionFiscal;
