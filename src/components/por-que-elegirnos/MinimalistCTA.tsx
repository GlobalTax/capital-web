import React from 'react';
import { useNavigate } from 'react-router-dom';
import { SimpleButton } from '@/components/ui/simple-button';

const MinimalistCTA = () => {
  const navigate = useNavigate();
  
  const handleContactClick = () => {
    navigate('/contacto');
  };

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white border-0.5 border-border rounded-lg p-12 shadow-sm text-center">
          <div className="inline-flex items-center px-4 py-2 bg-black text-white rounded-lg text-sm font-medium mb-6">
            Empezar Ahora
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold text-black mb-6">
            ¿Listo para maximizar el valor de tu empresa?
          </h2>
          
          <p className="text-lg text-gray-600 mb-8 leading-relaxed max-w-2xl mx-auto">
            Solicita una valoración gratuita y descubre el verdadero potencial de tu negocio.
          </p>

          <div className="flex justify-center">
            <SimpleButton 
              text="Contacta"
              variant="primary"
              size="lg"
              onClick={handleContactClick}
            />
          </div>
          
          <p className="text-sm text-gray-500 mt-4">
            Sin compromiso • Confidencial • Resultados en 48h
          </p>
        </div>
      </div>
    </section>
  );
};

export default MinimalistCTA;