import React from 'react';
import { CheckCircle, Zap, Shield, TrendingUp, Clock, Users } from 'lucide-react';
import { suiteloopData } from '@/data/suiteloop-data';

const ValueProposition: React.FC = () => {
  const iconMap = {
    'Ahorro de tiempo': Clock,
    'Mejora en precisión': CheckCircle,
    'Escalabilidad': TrendingUp,
    'Integración perfecta': Zap,
    'Seguridad de datos': Shield,
    'Experiencia del cliente': Users,
  };

  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-foreground">
              Beneficios principales
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {suiteloopData.propuestaValor.map((beneficio, index) => {
              const IconComponent = iconMap[beneficio.titulo as keyof typeof iconMap];
              
              return (
                <div key={index} className="text-center p-6 bg-background rounded-lg border border-border">
                  <div className="flex justify-center mb-4">
                    {IconComponent && <IconComponent className="h-8 w-8 text-primary" />}
                  </div>
                  <h3 className="font-semibold text-foreground mb-3">{beneficio.titulo}</h3>
                  <div className="text-2xl font-bold text-primary">{beneficio.impacto}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ValueProposition;