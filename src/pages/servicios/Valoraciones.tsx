
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ValoracionesHero from '@/components/valoraciones/ValoracionesHero';
import ValoracionesMethodology from '@/components/valoraciones/ValoracionesMethodology';
import ValoracionesBenefits from '@/components/valoraciones/ValoracionesBenefits';
import ValoracionesFAQ from '@/components/valoraciones/ValoracionesFAQ';
import ValoracionesCTA from '@/components/valoraciones/ValoracionesCTA';

const Valoraciones = () => {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <ValoracionesHero />
      <ValoracionesMethodology />
      <ValoracionesBenefits />
      <ValoracionesFAQ />
      <ValoracionesCTA />
      <Footer />
    </div>
  );
};

export default Valoraciones;
