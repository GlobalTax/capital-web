import React from 'react';

const MinimalistDifferentiators = () => {
const differentiators = [
    {
      title: "Especialización Exclusiva",
      description: "No somos una consultora generalista. Nos dedicamos exclusivamente a M&A desde hace más de 25 años, lo que nos da una ventaja competitiva única.",
      metric: "Solo M&A"
    },
    {
      title: "Resultados Medibles",
      description: "Nuestros clientes obtienen valoraciones superiores a la media del mercado gracias a nuestro proceso optimizado y red de contactos.",
      metric: "40% más valor"
    },
    {
      title: "Proceso Optimizado",
      description: "Reducimos los tiempos de cierre sin comprometer la calidad, mientras la mayoría del mercado tarda el doble.",
      metric: "6-8 meses"
    },
    {
      title: "Ecosistema Integral",
      description: "Más de 70 especialistas coordinados: abogados, fiscales, laborales y economistas trabajando para maximizar el valor de tu transacción.",
      metric: "70+ especialistas"
    },
    {
      title: "Grupo Navarro",
      description: "Capittal + Navarro Legal: servicio 360° desde la valoración hasta el cierre legal, reduciendo riesgos y optimizando resultados.",
      metric: "Servicio 360°"
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 bg-black text-white rounded-lg text-sm font-medium mb-6">
            Nuestras Ventajas Competitivas
          </div>
          
          <h2 className="text-3xl md:text-4xl font-normal text-black mb-6">
            Lo Que Nos Diferencia
          </h2>
          
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            No somos una consultora generalista. Somos especialistas en M&A que vivimos 
            y respiramos compraventa de empresas todos los días.
          </p>
        </div>

        {/* Differentiators grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {differentiators.map((item, index) => (
            <div 
              key={index} 
              className="bg-white border-0.5 border-border rounded-lg p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ease-out group"
            >
              {/* Highlight metric */}
              <div className="flex items-center justify-between mb-6">
                <div className="bg-black text-white px-3 py-1 rounded-lg text-sm font-bold border-0.5 border-border">
                  {item.metric}
                </div>
              </div>
              
              <h3 className="text-xl font-normal text-black mb-4">
                {item.title}
              </h3>
              
              <p className="text-gray-600 leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MinimalistDifferentiators;