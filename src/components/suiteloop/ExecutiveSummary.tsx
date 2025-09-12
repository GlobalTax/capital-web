import React from 'react';
import { TrendingUp, Target, Users, BarChart3 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { suiteloopData } from '@/data/suiteloop-data';

const ExecutiveSummary: React.FC = () => {
  const iconMap = {
    'Penetración de mercado': Target,
    'Crecimiento sector': TrendingUp,
    'Asesorías objetivo': Users,
    'Potencial ROI': BarChart3,
  };

  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4">
              <BarChart3 className="w-4 h-4 mr-2" />
              Resumen Ejecutivo
            </Badge>
            <h2 className="text-3xl font-bold mb-4 text-foreground">
              Mercado objetivo y oportunidad
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Análisis del sector de asesorías en España y oportunidad de modernización
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {suiteloopData.insightsEjecutivo.map((insight, index) => {
              const IconComponent = iconMap[insight.titulo as keyof typeof iconMap] || BarChart3;
              
              return (
                <div key={index} className="bg-background p-6 rounded-lg border border-border text-center">
                  <IconComponent className="h-8 w-8 mx-auto mb-3 text-primary" />
                  <div className="text-2xl font-bold text-foreground mb-1">{insight.valor}</div>
                  <div className="text-sm font-medium text-foreground mb-1">{insight.titulo}</div>
                  <div className="text-xs text-muted-foreground">{insight.descripcion}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ExecutiveSummary;