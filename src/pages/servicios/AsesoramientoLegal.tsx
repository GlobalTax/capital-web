
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AsesoramientoLegalHero from '@/components/asesoramiento-legal/AsesoramientoLegalHero';
import AsesoramientoLegalProcess from '@/components/asesoramiento-legal/AsesoramientoLegalProcess';
import AsesoramientoLegalBenefits from '@/components/asesoramiento-legal/AsesoramientoLegalBenefits';
import AsesoramientoLegalFAQ from '@/components/asesoramiento-legal/AsesoramientoLegalFAQ';
import AsesoramientoLegalCTA from '@/components/asesoramiento-legal/AsesoramientoLegalCTA';

const AsesoramientoLegal = () => {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="pt-16">
        <AsesoramientoLegalHero />
        <AsesoramientoLegalProcess />
        <AsesoramientoLegalBenefits />
        <AsesoramientoLegalFAQ />
        <AsesoramientoLegalCTA />
      </div>
      <Footer />
    </div>
  );
};

export default AsesoramientoLegal;
