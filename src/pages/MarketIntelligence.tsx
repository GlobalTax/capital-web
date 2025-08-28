import React, { useEffect } from 'react';
import { HomeLayout } from '@/shared';
import MarketInsights from '@/components/MarketInsights';

const MarketIntelligence = () => {
  useEffect(() => {
    document.title = 'Market Intelligence - Capittal';
    
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', 'Accede a nuestro análisis avanzado del mercado M&A. Datos, tendencias e insights del sector para tomar mejores decisiones de inversión.');
  }, []);

  return (
    <HomeLayout>
      <div className="pt-16">
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h1 className="text-4xl md:text-5xl font-bold text-black mb-6">
                Market Intelligence
              </h1>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Análisis avanzado del mercado M&A con datos actualizados, tendencias sectoriales 
                y insights exclusivos para optimizar tus decisiones estratégicas.
              </p>
            </div>
          </div>
        </section>
        <MarketInsights />
      </div>
    </HomeLayout>
  );
};

export default MarketIntelligence;