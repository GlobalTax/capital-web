
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Team from '@/components/Team';
import SEO from '@/components/SEO';

const Equipo = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <SEO
        title="Equipo de Capittal"
        description="Conoce al equipo de Capittal, especialistas en M&A y valoración de empresas."
      />
      <div className="pt-16">
        <Team />
      </div>
      <Footer />
    </div>
  );
};

export default Equipo;
