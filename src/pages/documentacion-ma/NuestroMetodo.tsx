
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import DocumentacionMASidebar from '@/components/documentacion-ma/DocumentacionMASidebar';
import NuestroMetodoContent from '@/components/documentacion-ma/content/NuestroMetodoContent';
import { SEOHead } from '@/components/seo';
import { getArticleSchema } from '@/utils/seo';

const NuestroMetodo = () => {
  return (
    <>
      <SEOHead 
        title="Nuestro Método M&A - Proceso Probado | Capittal"
        description="Conoce nuestro método M&A con más de 200 transacciones exitosas. Proceso probado, metodología estructurada y resultados verificables en fusiones y adquisiciones."
        canonical="https://capittal.es/documentacion-ma/nuestro-metodo"
        keywords="metodología M&A, proceso fusiones adquisiciones, método valoración empresas, sistema M&A"
        structuredData={getArticleSchema(
          "Nuestro Método M&A",
          "Metodología estructurada para fusiones y adquisiciones con resultados probados",
          "https://capittal.es/documentacion-ma/nuestro-metodo",
          "https://capittal.es/images/metodo-ma.jpg",
          new Date().toISOString(),
          new Date().toISOString(),
          "Equipo Capittal"
        )}
      />
      <div className="min-h-screen bg-white">
        <Header />
      <div className="pt-20">
        <div className="flex min-h-screen">
          <DocumentacionMASidebar />
          <div className="flex-1 max-w-4xl mx-auto px-8 py-16">
            <NuestroMetodoContent />
          </div>
        </div>
        </div>
        <Footer />
      </div>
    </>
  );
};

export default NuestroMetodo;
