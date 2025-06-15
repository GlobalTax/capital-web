
import React from 'react';

const LogoCarousel = () => {
  // Logos de ejemplo - puedes reemplazarlos con logos reales
  const logos = [
    { name: 'TechCorp', url: '/placeholder.svg' },
    { name: 'InnovateLab', url: '/placeholder.svg' },
    { name: 'DataFlow', url: '/placeholder.svg' },
    { name: 'CloudVision', url: '/placeholder.svg' },
    { name: 'FinanceMax', url: '/placeholder.svg' },
    { name: 'RetailPro', url: '/placeholder.svg' },
    { name: 'HealthTech', url: '/placeholder.svg' },
    { name: 'AutoMotive', url: '/placeholder.svg' },
  ];

  // Duplicamos los logos para crear el efecto infinito
  const duplicatedLogos = [...logos, ...logos];

  return (
    <section className="py-16 bg-white border-t border-b border-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold text-black mb-4">
            Empresas que Confían en Nosotros
          </h2>
          <p className="text-gray-600 text-lg">
            Más de 200 empresas han confiado en nuestros servicios
          </p>
        </div>
        
        <div className="relative overflow-hidden">
          <div className="flex animate-scroll">
            {duplicatedLogos.map((logo, index) => (
              <div
                key={`${logo.name}-${index}`}
                className="flex-shrink-0 mx-8 grayscale hover:grayscale-0 transition-all duration-300"
              >
                <div className="w-32 h-16 bg-gray-100 border border-gray-300 rounded-lg flex items-center justify-center">
                  <span className="text-gray-500 font-medium text-sm">
                    {logo.name}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default LogoCarousel;
