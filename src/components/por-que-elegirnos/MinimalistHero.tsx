import React from 'react';
import { useCountAnimation } from '@/hooks/useCountAnimation';

const MinimalistHero = () => {
  const experienceCount = useCountAnimation(25, 2000, '+');
  const transactionsCount = useCountAnimation(500, 2500, '+');
  const valueCount = useCountAnimation(5, 2000, 'B+');
  const successCount = useCountAnimation(95, 1800, '%');

  const metrics = [
    {
      count: experienceCount,
      label: "años de experiencia",
      description: "especializados en M&A"
    },
    {
      count: transactionsCount,
      label: "transacciones exitosas",
      description: "operaciones completadas"
    },
    {
      count: valueCount,
      label: "en valor gestionado",
      description: "€5B+ en transacciones"
    },
    {
      count: successCount,
      label: "tasa de éxito",
      description: "operaciones completadas"
    }
  ];

  return (
    <section className="py-32 bg-white">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <h1 className="text-5xl lg:text-6xl font-light text-black mb-8 leading-tight">
          Por Qué Elegir Capittal
        </h1>
        
        <p className="text-xl text-black max-w-2xl mx-auto mb-20 leading-relaxed">
          Especialistas en M&A respaldados por el ecosistema integral del Grupo Navarro. 
          Más de dos décadas de experiencia garantizando el éxito de cada transacción.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-16">
          {metrics.map((metric, index) => (
            <div key={index} className="text-center">
              <div 
                ref={metric.count.ref}
                className="text-4xl font-light text-black mb-3"
              >
                {metric.count.count}
              </div>
              <div className="text-sm font-medium text-black uppercase tracking-wide mb-2">
                {metric.label}
              </div>
              <p className="text-sm text-gray-600">
                {metric.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MinimalistHero;