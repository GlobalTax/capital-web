
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import MinimalistHero from '@/components/por-que-elegirnos/MinimalistHero';
import MinimalistDifferentiators from '@/components/por-que-elegirnos/MinimalistDifferentiators';
import MinimalistTestimonials from '@/components/por-que-elegirnos/MinimalistTestimonials';
import MinimalistCTA from '@/components/por-que-elegirnos/MinimalistCTA';

const PorQueElegirnos = () => {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="pt-16">
        <MinimalistHero />
        <MinimalistDifferentiators />
        <MinimalistTestimonials />
        <MinimalistCTA />
      </div>
      <Footer />
    </div>
  );
};

export default PorQueElegirnos;
