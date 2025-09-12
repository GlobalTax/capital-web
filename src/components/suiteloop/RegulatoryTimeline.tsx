import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Calendar, AlertTriangle } from 'lucide-react';
import { suiteloopData } from '@/data/suiteloop-data';

const RegulatoryTimeline: React.FC = () => {
  const timeline = suiteloopData.timelineRegulatorio;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'activo': return 'bg-green-500';
      case 'próximo': return 'bg-orange-500';
      case 'futuro': return 'bg-blue-500';
      case 'tendencia': return 'bg-purple-500';
      default: return 'bg-muted';
    }
  };

  const getImpactColor = (impacto: string) => {
    switch (impacto) {
      case 'crítico': return 'destructive';
      case 'alto': return 'secondary';
      case 'medio': return 'outline';
      default: return 'outline';
    }
  };

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4">
              <Calendar className="w-4 h-4 mr-2" />
              Timeline Regulatorio
            </Badge>
            <h2 className="text-3xl font-bold mb-4">
              Drivers de modernización
            </h2>
            <p className="text-muted-foreground">
              Los cambios normativos que están transformando el sector
            </p>
          </div>

          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-8 top-6 bottom-6 w-0.5 bg-border"></div>
            
            <div className="space-y-8">
              {timeline.map((item, index) => (
                <div key={index} className="relative flex items-start space-x-6">
                  {/* Timeline dot */}
                  <div className={`flex-shrink-0 w-4 h-4 rounded-full ${getStatusColor(item.status)} relative z-10`}>
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 bg-background border border-border rounded-lg p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center space-x-3 mb-2">
                          <span className="text-sm font-medium text-muted-foreground">{item.fecha}</span>
                          <Badge variant={getImpactColor(item.impacto)}>
                            {item.impacto === 'crítico' && <AlertTriangle className="w-3 h-3 mr-1" />}
                            {item.impacto}
                          </Badge>
                        </div>
                        <h3 className="font-semibold text-foreground mb-1">{item.hito}</h3>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{item.descripcion}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RegulatoryTimeline;