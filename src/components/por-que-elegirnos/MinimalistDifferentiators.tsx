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
    <section className="py-24 bg-white border-t border-gray-200">
      <div className="max-w-4xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-12">
          {differentiators.map((item, index) => (
            <div key={index} className="text-center">
              <div className="text-lg font-medium text-black mb-4 border border-black px-4 py-2 inline-block">
                {item.metric}
              </div>
              
              <h3 className="text-xl font-medium text-black mb-6">
                {item.title}
              </h3>
              
              <p className="text-black leading-relaxed">
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