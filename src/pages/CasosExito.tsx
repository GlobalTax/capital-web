
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CaseStudies from '@/components/CaseStudies';
import SEO from '@/components/SEO';

const CasosExito = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <SEO title="Casos de Éxito en M&A" description="Operaciones y proyectos de M&A representativos realizados por Capittal." />
      <div className="pt-16">
        <CaseStudies />
      </div>
      <Footer />
    </div>
  );
};

export default CasosExito;
