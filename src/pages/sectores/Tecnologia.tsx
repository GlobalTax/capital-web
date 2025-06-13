
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';

const Tecnologia = () => {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <section className="pt-32 pb-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-black mb-6">
              Sector Tecnología
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Especialistas en M&A para empresas tecnológicas, startups y 
              compañías de software.
            </p>
            <Button className="capittal-button text-lg px-8 py-4">
              Explorar Oportunidades
            </Button>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-black mb-8 text-center">
            Experiencia en Tecnología
          </h2>
          <div className="prose prose-lg max-w-4xl mx-auto text-gray-600">
            <p>
              Nuestro equipo tiene amplia experiencia en el sector tecnológico, 
              comprendiendo las particularidades de las empresas tech.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Tecnologia;
