import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ValoracionesHero from '@/components/valoraciones/ValoracionesHero';
import ValoracionesMethodology from '@/components/valoraciones/ValoracionesMethodology';
import ValoracionesMultiples from '@/components/valoraciones/ValoracionesMultiples';
import ValoracionesProcess from '@/components/valoraciones/ValoracionesProcess';
import ValoracionesBenefits from '@/components/valoraciones/ValoracionesBenefits';
import ValoracionesFAQNew from '@/components/valoraciones/ValoracionesFAQNew';
import ValoracionesCTANew from '@/components/valoraciones/ValoracionesCTANew';

const Valoraciones = () => {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <ValoracionesHero />
      <ValoracionesMethodology />
      <ValoracionesMultiples />
      <ValoracionesProcess />
      <ValoracionesBenefits />
      <ValoracionesFAQNew />
      <ValoracionesCTANew />
      <Footer />
    </div>
  );
};

export default Valoraciones;