
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AcquisitionHero from '@/components/landing/AcquisitionHero';
import GrowthStrategy from '@/components/landing/GrowthStrategy';
import AcquisitionProcess from '@/components/landing/AcquisitionProcess';
import OperationsSection from '@/components/operations/OperationsSection';
import WhyChooseUs from '@/components/landing/WhyChooseUs';
import SuccessStories from '@/components/landing/SuccessStories';
import AcquisitionCTA from '@/components/landing/AcquisitionCTA';

const CompraEmpresas = () => {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="pt-16">
        <AcquisitionHero />
        <GrowthStrategy />
        <AcquisitionProcess />
        <OperationsSection 
          variant="full" 
          showFilters={true}
          showStats={true}
          showCTA={true}
          displayLocation="compra-empresas"
        />
        <WhyChooseUs />
        <SuccessStories />
        <AcquisitionCTA />
      </div>
      <Footer />
    </div>
  );
};

export default CompraEmpresas;
