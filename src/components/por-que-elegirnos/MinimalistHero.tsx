import React, { useMemo } from 'react';
import { useCountAnimation } from '@/hooks/useCountAnimation';
import { useStatistics, extractNumericValue, extractSuffix } from '@/hooks/useStatistics';

const MinimalistHero = () => {
  const { data: statistics, isLoading } = useStatistics('por-que-elegirnos');

  // Process statistics data to determine hook parameters
  const hookParams = useMemo(() => {
    if (!statistics || statistics.length === 0) {
      return [
        { value: 25, duration: 2000, suffix: '+' },
        { value: 100, duration: 2500, suffix: '+' },
        { value: 900, duration: 2000, suffix: 'M' },
        { value: 98.7, duration: 1800, suffix: '%' }
      ];
    }

    return statistics.slice(0, 4).map(stat => {
      const numValue = extractNumericValue(stat.metric_value);
      const suffix = extractSuffix(stat.metric_value);
      
      // Adjust animation duration based on value size
      let duration = 2000;
      if (numValue > 500) duration = 2500;
      if (numValue > 50 && numValue < 100) duration = 1800;

      return { value: numValue, duration, suffix };
    });
  }, [statistics]);

  // Fixed hooks - always render the same number
  const stat1 = useCountAnimation(hookParams[0]?.value || 0, hookParams[0]?.duration || 2000, hookParams[0]?.suffix || '');
  const stat2 = useCountAnimation(hookParams[1]?.value || 0, hookParams[1]?.duration || 2000, hookParams[1]?.suffix || '');
  const stat3 = useCountAnimation(hookParams[2]?.value || 0, hookParams[2]?.duration || 2000, hookParams[2]?.suffix || '');
  const stat4 = useCountAnimation(hookParams[3]?.value || 0, hookParams[3]?.duration || 2000, hookParams[3]?.suffix || '');

  // Create metrics using fixed hooks
  const createMetrics = () => {
    const hooks = [stat1, stat2, stat3, stat4];
    
    if (!statistics || statistics.length === 0) {
      return [
        {
          count: hooks[0].count,
          label: "años de experiencia",
          description: "especializados en M&A",
          ref: hooks[0].ref
        },
        {
          count: hooks[1].count,
          label: "transacciones exitosas", 
          description: "operaciones completadas",
          ref: hooks[1].ref
        },
        {
          count: hooks[2].count,
          label: "en valor gestionado",
          description: "€900M+ en transacciones",
          ref: hooks[2].ref
        },
        {
          count: hooks[3].count,
          label: "tasa de éxito",
          description: "operaciones completadas",
          ref: hooks[3].ref
        }
      ];
    }

    return statistics.slice(0, 4).map((stat, index) => ({
      count: hooks[index].count,
      label: stat.metric_label.toLowerCase(),
      description: getDescriptionForMetric(stat.metric_key),
      ref: hooks[index].ref
    }));
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