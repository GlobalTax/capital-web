
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';

const DueDiligence = () => {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <section className="pt-32 pb-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-black mb-6">
              Due Diligence
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Análisis exhaustivo financiero, legal y comercial para identificar 
              riesgos y oportunidades en cada inversión.
            </p>
            <Button className="capittal-button text-lg px-8 py-4">
              Solicitar Análisis
            </Button>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-black mb-8 text-center">
            Servicios de Due Diligence
          </h2>
          <div className="prose prose-lg max-w-4xl mx-auto text-gray-600">
            <p>
              Nuestro proceso de due diligence combina metodologías tradicionales 
              con tecnología avanzada para proporcionar análisis completos y precisos.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default DueDiligence;
