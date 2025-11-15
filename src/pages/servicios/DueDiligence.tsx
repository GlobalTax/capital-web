import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { SEOHead } from '@/components/seo';
import { getServiceSchema } from '@/utils/seo';
import DueDiligenceHero from '@/components/due-diligence/DueDiligenceHero';
import DueDiligenceTypes from '@/components/due-diligence/DueDiligenceTypes';
import DueDiligenceProcess from '@/components/due-diligence/DueDiligenceProcess';
import DueDiligenceBenefits from '@/components/due-diligence/DueDiligenceBenefits';
import DueDiligenceFAQ from '@/components/due-diligence/DueDiligenceFAQ';
import DueDiligenceCTA from '@/components/due-diligence/DueDiligenceCTA';

const DueDiligence = () => {
  return (
    <div className="min-h-screen bg-white">
      <SEOHead 
        title="Due Diligence M&A - Análisis Exhaustivo de Empresas | Capittal"
        description="Servicio especializado de due diligence para fusiones y adquisiciones. Análisis financiero, legal, operacional y estratégico de empresas en España."
        canonical="https://capittal.es/servicios/due-diligence"
        keywords="due diligence, análisis empresarial, auditoría M&A, España"
        structuredData={getServiceSchema(
          "Due Diligence M&A",
          "Análisis exhaustivo de empresas para operaciones de fusión y adquisición"
        )}
      />
      <Header />
      <div className="pt-16">
        <DueDiligenceHero />
        <DueDiligenceTypes />
        <DueDiligenceProcess />
        <DueDiligenceBenefits />
        <DueDiligenceFAQ />
        <DueDiligenceCTA />
      </div>
      <Footer />
    </div>
  );
};

export default DueDiligence;
