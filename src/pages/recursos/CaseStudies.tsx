import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { SEOHead } from '@/components/seo';
import { getWebPageSchema } from '@/utils/seo';
import DetailedCaseStudies from '@/components/DetailedCaseStudies';

const CaseStudiesPage = () => {
  return (
    <div className="min-h-screen bg-white">
      <SEOHead 
        title="Casos de Éxito M&A - Operaciones Destacadas | Capittal"
        description="Descubre nuestros casos de éxito en fusiones y adquisiciones. Operaciones reales, resultados verificables y experiencia demostrable en el mercado español."
        canonical="https://capittal.es/recursos/case-studies"
        keywords="casos éxito M&A, operaciones M&A España, transacciones empresariales"
        structuredData={getWebPageSchema(
          "Casos de Éxito M&A",
          "Operaciones destacadas y casos de éxito en fusiones y adquisiciones realizadas por Capittal",
          "https://capittal.es/recursos/case-studies"
        )}
      />
      <Header />
      <div className="pt-16">
        <DetailedCaseStudies />
      </div>
      <Footer />
    </div>
  );
};

export default CaseStudiesPage;
