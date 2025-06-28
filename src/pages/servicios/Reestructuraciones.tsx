
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ReestructuracionesHero from '@/components/reestructuraciones/ReestructuracionesHero';
import ReestructuracionesProcess from '@/components/reestructuraciones/ReestructuracionesProcess';
import ReestructuracionesBenefits from '@/components/reestructuraciones/ReestructuracionesBenefits';
import ReestructuracionesFAQ from '@/components/reestructuraciones/ReestructuracionesFAQ';
import ReestructuracionesCTA from '@/components/reestructuraciones/ReestructuracionesCTA';

const Reestructuraciones = () => {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="pt-16">
        <ReestructuracionesHero />
        <ReestructuracionesProcess />
        <ReestructuracionesBenefits />
        <ReestructuracionesFAQ />
        <ReestructuracionesCTA />
      </div>
      <Footer />
    </div>
  );
};

export default Reestructuraciones;
