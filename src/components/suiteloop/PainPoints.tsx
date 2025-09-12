import React from 'react';
import { Clock, FileText, AlertTriangle, Users } from 'lucide-react';
import { suiteloopData } from '@/data/suiteloop-data';

const PainPoints: React.FC = () => {
  const iconMap = {
    'Gestión ineficiente del tiempo': Clock,
    'Procesos manuales repetitivos': FileText,
    'Falta de integración entre sistemas': AlertTriangle,
    'Dificultad para escalar servicios': Users,
  };

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-foreground">
              Principales desafíos
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {suiteloopData.dolores.map((dolor, index) => {
              const IconComponent = iconMap[dolor.titulo as keyof typeof iconMap];
              
              return (
                <div key={index} className="p-6 border border-border rounded-lg bg-background">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      {IconComponent && <IconComponent className="h-6 w-6 text-primary" />}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground mb-2">{dolor.titulo}</h3>
                      <p className="text-sm text-muted-foreground">{dolor.descripcion}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default PainPoints;