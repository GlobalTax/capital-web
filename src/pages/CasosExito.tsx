
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CaseStudies from '@/components/CaseStudies';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

const CasosExito = () => {
  const location = useLocation();
  const canonical = `${window.location.origin}${location.pathname}`;
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Helmet>
        <title>Casos de Éxito en M&A | Capittal</title>
        <meta name="description" content="Operaciones y proyectos de M&A representativos realizados por Capittal." />
        <link rel="canonical" href={canonical} />
      </Helmet>
      <div className="pt-16">
        <CaseStudies />
      </div>
      <Footer />
    </div>
  );
};

export default CasosExito;
