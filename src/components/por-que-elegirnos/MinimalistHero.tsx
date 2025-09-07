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
    <section className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium mb-6">
            Líderes en M&A desde 2008
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
            Por Qué Elegir Capittal
          </h1>
          
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Especialistas en M&A respaldados por el ecosistema integral del Grupo Navarro. 
            Más de dos décadas de experiencia garantizando el éxito de cada transacción.
          </p>
        </div>

        {/* Metrics grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {metrics.map((metric, index) => (
            <div 
              key={index} 
              className="bg-card border-0.5 border-border rounded-lg p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ease-out group text-center"
            >
              <div 
                ref={metric.count.ref}
                className="text-3xl font-bold text-card-foreground mb-3"
              >
                {metric.count.count}
              </div>
              <div className="text-sm font-bold text-card-foreground uppercase tracking-wide mb-2">
                {metric.label}
              </div>
              <p className="text-sm text-muted-foreground">
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