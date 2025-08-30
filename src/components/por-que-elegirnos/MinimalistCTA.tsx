import React from 'react';
import { Button } from '@/components/ui/button';

const MinimalistCTA = () => {
  const handleContactClick = () => {
    // Scroll to contact section or navigate to contact page
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // You can also navigate to contact page: navigate('/contacto');
  };

  return (
    <section className="py-32 bg-white border-t border-gray-200">
      <div className="max-w-2xl mx-auto px-4 text-center">
        <h2 className="text-4xl font-light text-black mb-8">
          ¿Listo para maximizar el valor de tu empresa?
        </h2>
        
        <p className="text-xl text-black mb-12 leading-relaxed">
          Solicita una evaluación gratuita y descubre el verdadero potencial de tu negocio.
        </p>

        <Button 
          onClick={handleContactClick}
          className="bg-black text-white hover:bg-gray-800 px-12 py-4 text-lg font-medium border-0"
        >
          Evaluación Gratuita
        </Button>
        
        <p className="text-sm text-gray-600 mt-6">
          Sin compromiso • Confidencial • Resultados en 48h
        </p>
      </div>
    </section>
  );
};

export default MinimalistCTA;