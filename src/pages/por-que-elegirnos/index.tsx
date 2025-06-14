import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PorQueElegirnosHero from '@/components/por-que-elegirnos/PorQueElegirnosHero';
import PorQueElegirnosExperience from '@/components/por-que-elegirnos/PorQueElegirnosExperience';
import PorQueElegirnosApproach from '@/components/por-que-elegirnos/PorQueElegirnosApproach';
import PorQueElegirnosResults from '@/components/por-que-elegirnos/PorQueElegirnosResults';
import PorQueElegirnosTestimonials from '@/components/por-que-elegirnos/PorQueElegirnosTestimonials';

const PorQueElegirnos = () => {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="pt-16">
        <PorQueElegirnosHero />
        <PorQueElegirnosExperience />
        <PorQueElegirnosApproach />
        <PorQueElegirnosTestimonials />
        <PorQueElegirnosResults />
      </div>
      <Footer />
    </div>
  );
};

export default PorQueElegirnos;
