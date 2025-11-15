import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { SEOHead } from '@/components/seo';
import { getWebPageSchema } from '@/utils/seo';
import MinimalistHero from '@/components/por-que-elegirnos/MinimalistHero';
import MinimalistDifferentiators from '@/components/por-que-elegirnos/MinimalistDifferentiators';
import MinimalistTestimonials from '@/components/por-que-elegirnos/MinimalistTestimonials';
import MinimalistCTA from '@/components/por-que-elegirnos/MinimalistCTA';

const PorQueElegirnos = () => {
  return (
    <div className="min-h-screen bg-white">
      <SEOHead 
        title="¿Por Qué Elegir Capittal? - Tu Socio Estratégico en M&A"
        description="Descubre por qué más de 200 empresas confían en Capittal para sus operaciones de M&A. Experiencia, red de inversores y resultados probados."
        canonical="https://capittal.es/por-que-elegirnos"
        keywords="M&A España, asesor M&A, venta empresas España"
        structuredData={getWebPageSchema(
          "¿Por Qué Elegir Capittal?",
          "Razones para confiar en Capittal como tu socio estratégico en M&A",
          "https://capittal.es/por-que-elegirnos"
        )}
      />
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
