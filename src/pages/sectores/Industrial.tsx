
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';

const Industrial = () => {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <section className="pt-32 pb-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-black mb-6">
              Sector Industrial
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Experiencia en M&A para empresas industriales, manufactureras 
              y de ingeniería.
            </p>
            <Button className="capittal-button text-lg px-8 py-4">
              Analizar Sector
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Industrial;
