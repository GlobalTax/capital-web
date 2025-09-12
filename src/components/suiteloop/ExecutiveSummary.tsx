import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Users, Calendar, DollarSign } from 'lucide-react';
import { suiteloopData } from '@/data/suiteloop-data';

const ExecutiveSummary: React.FC = () => {
  const insights = suiteloopData.insightsEjecutivo;
  
  const iconMap = {
    "67k Asesorías en España": Users,
    "Target Modernización": TrendingUp,
    "Driver e-Factura": Calendar,
    "Oportunidad Post-OnPrem": DollarSign
  };

  const trendColorMap = {
    estable: "bg-muted text-muted-foreground",
    creciente: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
    urgente: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
    explosiva: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
  };

  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Resumen ejecutivo
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Los datos clave que definen el presente y futuro del sector de asesorías en España
            </p>
          </div>

          {/* Cards Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {insights.map((insight, index) => {
              const Icon = iconMap[insight.titulo as keyof typeof iconMap] || TrendingUp;
              
              return (
                <Card key={index} className="relative group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-0 bg-card/80 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {/* Icon & Trend */}
                      <div className="flex items-center justify-between">
                        <div className="p-3 bg-primary/10 rounded-lg">
                          <Icon className="w-6 h-6 text-primary" />
                        </div>
                        <Badge 
                          variant="secondary" 
                          className={`text-xs ${trendColorMap[insight.tendencia as keyof typeof trendColorMap]}`}
                        >
                          {insight.tendencia}
                        </Badge>
                      </div>

                      {/* Value */}
                      <div>
                        <div className="text-2xl md:text-3xl font-bold text-primary mb-2">
                          {insight.valor}
                        </div>
                        <h3 className="font-semibold text-foreground mb-2">
                          {insight.titulo}
                        </h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {insight.descripcion}
                        </p>
                      </div>
                    </div>
                  </CardContent>

                  {/* Hover Effect */}
                  <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                </Card>
              );
            })}
          </div>

          {/* Bottom CTA */}
          <div className="mt-12 text-center">
            <p className="text-muted-foreground mb-4">
              Datos actualizados en enero 2025 • Fuente: Análisis interno + INE + Registros Mercantiles
            </p>
            <div className="inline-flex items-center gap-2 text-sm text-primary font-medium">
              <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              Metodología completa disponible en el informe PDF
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ExecutiveSummary;