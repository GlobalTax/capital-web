import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Clock, 
  MessageSquareX, 
  TrendingUp, 
  AlertTriangle, 
  Users,
  ArrowRight 
} from 'lucide-react';
import { suiteloopData } from '@/data/suiteloop-data';

const PainPoints: React.FC = () => {
  const dolores = suiteloopData.dolores;
  
  const iconMap = {
    Clock,
    MessageSquareX,
    TrendingUp,
    AlertTriangle,
    Users
  };

  const impactColorMap = {
    9: "text-red-600 bg-red-100 dark:bg-red-900/20 dark:text-red-400",
    8: "text-orange-600 bg-orange-100 dark:bg-orange-900/20 dark:text-orange-400", 
    7: "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400",
    6: "text-blue-600 bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400"
  };

  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4">
              <AlertTriangle className="w-4 h-4 mr-2" />
              Pain Points del Sector
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Los 5 dolores críticos de las asesorías
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Análisis basado en entrevistas con +200 despachos y datos operacionales. 
              <strong>SuiteLoop</strong> aborda directamente estos pain points sin disrupciones.
            </p>
          </div>

          {/* Pain Points Grid */}
          <div className="grid gap-6 mb-12">
            {dolores.map((dolor, index) => {
              const Icon = iconMap[dolor.icon as keyof typeof iconMap];
              const impacto = dolor.impacto as keyof typeof impactColorMap;
              
              return (
                <Card key={index} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-l-4 border-l-primary">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      {/* Icon & Impact Score */}
                      <div className="flex-shrink-0">
                        <div className="p-3 bg-primary/10 rounded-lg mb-3">
                          <Icon className="w-6 h-6 text-primary" />
                        </div>
                        <Badge 
                          variant="secondary"
                          className={`text-xs font-bold ${impactColorMap[impacto]}`}
                        >
                          {dolor.impacto}/10
                        </Badge>
                      </div>

                      {/* Content */}
                      <div className="flex-1 space-y-4">
                        <div>
                          <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                            {dolor.pain}
                          </h3>
                          <p className="text-muted-foreground leading-relaxed">
                            {dolor.descripcion}
                          </p>
                        </div>

                        {/* Impact Progress */}
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Impacto en productividad</span>
                            <span className="font-semibold">{dolor.impacto * 10}%</span>
                          </div>
                          <Progress 
                            value={dolor.impacto * 10} 
                            className="h-2"
                          />
                        </div>
                      </div>

                      {/* Arrow Indicator */}
                      <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <ArrowRight className="w-5 h-5 text-primary" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Solution Preview */}
          <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
            <CardContent className="p-8 text-center">
              <div className="space-y-4">
                <h3 className="text-2xl font-bold">
                  SuiteLoop aborda el 87% de estos pain points
                </h3>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Portal cliente (<strong>-60% emails</strong>) • OCR automatizado (<strong>-35% tiempo contable</strong>) • 
                  Tesorería PSD2 (<strong>conciliación real-time</strong>) • Convive con A3/Sage (<strong>sin migraciones</strong>)
                </p>
                <div className="flex justify-center gap-2 flex-wrap mt-6">
                  <Badge>BiLoop Portal</Badge>
                  <Badge>OCRLoop IA</Badge>
                  <Badge>CashLoop PSD2</Badge>
                  <Badge>DataLoop iPaaS</Badge>
                  <Badge variant="outline">Post-OnPrem</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default PainPoints;