
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import DueDiligenceHero from '@/components/due-diligence/DueDiligenceHero';
import DueDiligenceProcess from '@/components/due-diligence/DueDiligenceProcess';
import DueDiligenceBenefits from '@/components/due-diligence/DueDiligenceBenefits';
import DueDiligenceFAQ from '@/components/due-diligence/DueDiligenceFAQ';
import DueDiligenceCTA from '@/components/due-diligence/DueDiligenceCTA';

const DueDiligence = () => {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="pt-16">
        <DueDiligenceHero />
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
