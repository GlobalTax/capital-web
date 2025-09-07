import React from 'react';
import { useCountAnimation } from '@/hooks/useCountAnimation';
import { useStatistics, extractNumericValue, extractSuffix } from '@/hooks/useStatistics';

const MinimalistHero = () => {
  const { data: statistics, isLoading } = useStatistics('por-que-elegirnos');

  // Default animations for fallback
  const fallbackExperienceCount = useCountAnimation(25, 2000, '+');
  const fallbackTransactionsCount = useCountAnimation(100, 2500, '+');
  const fallbackValueCount = useCountAnimation(900, 2000, 'M');
  const fallbackSuccessCount = useCountAnimation(98.7, 1800, '%');

  // Create dynamic animations based on database statistics
  const createMetrics = () => {
    if (!statistics || statistics.length === 0) {
      return [
        {
          count: fallbackExperienceCount.count,
          label: "años de experiencia",
          description: "especializados en M&A",
          ref: fallbackExperienceCount.ref
        },
        {
          count: fallbackTransactionsCount.count,
          label: "transacciones exitosas", 
          description: "operaciones completadas",
          ref: fallbackTransactionsCount.ref
        },
        {
          count: fallbackValueCount.count,
          label: "en valor gestionado",
          description: "€900M+ en transacciones",
          ref: fallbackValueCount.ref
        },
        {
          count: fallbackSuccessCount.count,
          label: "tasa de éxito",
          description: "operaciones completadas",
          ref: fallbackSuccessCount.ref
        }
      ];
    }

    return statistics.map(stat => {
      const numValue = extractNumericValue(stat.metric_value);
      const suffix = extractSuffix(stat.metric_value);
      
      // Adjust animation duration based on value size
      let duration = 2000;
      if (numValue > 500) duration = 2500;
      if (numValue > 50 && numValue < 100) duration = 1800;

      const animatedCount = useCountAnimation(numValue, duration, suffix);
      
      return {
        count: animatedCount.count,
        label: stat.metric_label.toLowerCase(),
        description: getDescriptionForMetric(stat.metric_key),
        ref: animatedCount.ref
      };
    });
  };

  const getDescriptionForMetric = (key: string) => {
    const descriptions: Record<string, string> = {
      'years_experience': 'especializados en M&A',
      'total_operations': 'operaciones completadas',
      'total_value': '€900M+ en transacciones',
      'success_rate': 'operaciones completadas'
    };
    return descriptions[key] || 'especialistas en M&A';
  };

  const metrics = createMetrics();

  if (isLoading) {
    return (
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">Cargando métricas...</div>
        </div>
      </section>
    );
  }

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
          
          <p className="text-lg text-foreground max-w-3xl mx-auto leading-relaxed">
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
                ref={metric.ref}
                className="text-3xl font-bold text-card-foreground mb-3"
              >
                {metric.count}
              </div>
              <div className="text-sm font-bold text-card-foreground uppercase tracking-wide mb-2">
                {metric.label}
              </div>
              <p className="text-sm text-card-foreground">
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