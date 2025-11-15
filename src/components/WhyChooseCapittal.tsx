
import React from 'react';

const WhyChooseCapittal = () => {
  const reasons = [
    {
      title: "Experiencia Probada",
      description: "Más de 15 años especializados exclusivamente en M&A, con un track record excepcional.",
      highlight: "200+ operaciones"
    },
    {
      title: "Máximo Valor",
      description: "Conseguimos valoraciones superiores a la media del mercado gracias a nuestro proceso optimizado.",
      highlight: "40% más valor"
    },
    {
      title: "Rapidez y Eficiencia",
      description: "Procesos optimizados que reducen los tiempos sin comprometer la calidad.",
      highlight: "6-8 meses"
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 bg-black text-white rounded-lg text-sm font-medium mb-6">
            La Diferencia Capittal
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold text-black mb-6">
            Por Qué Elegir Capittal
          </h2>
          
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            No somos una consultora generalista. Somos especialistas en M&A que vivimos 
            y respiramos compraventa de empresas todos los días.
          </p>
        </div>

        {/* Main reasons grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8" role="list" aria-label="Razones para elegir Capittal">
          {reasons.map((reason, index) => (
            <div 
              key={index} 
              className="bg-white border-0.5 border-border rounded-lg p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ease-out group"
              role="listitem"
            >
              {/* Highlight */}
              <div className="flex items-center justify-between mb-6">
                <div className="bg-black text-white px-3 py-1 rounded-lg text-sm font-bold border-0.5 border-border">
                  {reason.highlight}
                </div>
              </div>
              
              <h3 className="text-xl font-bold text-black mb-4">
                {reason.title}
              </h3>
              
              <p className="text-gray-600 leading-relaxed">
                {reason.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseCapittal;
