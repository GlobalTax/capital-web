import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Calendar,
  CheckCircle,
  Clock,
  TrendingUp,
  FileText,
  ArrowRight,
  AlertCircle
} from 'lucide-react';
import { suiteloopData } from '@/data/suiteloop-data';

const RegulatoryTimeline: React.FC = () => {
  const timeline = suiteloopData.timelineRegulatorio;

  const statusIcons = {
    activo: CheckCircle,
    próximo: Clock,
    tendencia: TrendingUp,
    futuro: Calendar
  };

  const statusColors = {
    activo: "text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400",
    próximo: "text-orange-600 bg-orange-100 dark:bg-orange-900/20 dark:text-orange-400",
    tendencia: "text-blue-600 bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400",
    futuro: "text-muted-foreground bg-muted"
  };

  const impactColors = {
    crítico: "border-red-500 bg-red-50 dark:bg-red-900/10",
    alto: "border-orange-500 bg-orange-50 dark:bg-orange-900/10",
    medio: "border-blue-500 bg-blue-50 dark:bg-blue-900/10"
  };

  const checklist90Dias = [
    "Auditoría de procesos actuales de facturación",
    "Implementación de portal cliente BiLoop",
    "Configuración OCR para documentos fiscales", 
    "Integración tesorería PSD2 con bancos principales",
    "Setup automático SIF en Planner",
    "Formación equipo en nuevos workflows",
    "Testing completo con clientes piloto",
    "Go-live escalonado por carteras de clientes"
  ];

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4">
              <Calendar className="w-4 h-4 mr-2" />
              Regulación & Oportunidades
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Timeline regulatorio: de Crea y Crece al SIF
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Los cambios normativos están acelerando la digitalización. 
              <strong>SuiteLoop</strong> te prepara para cumplir con <strong>SIF 2025</strong> y 
              aprovechar la ola de IA en contabilidad.
            </p>
          </div>

          {/* Timeline */}
          <div className="relative mb-12">
            {/* Timeline Line */}
            <div className="absolute left-1/2 transform -translate-x-0.5 h-full w-0.5 bg-gradient-to-b from-primary via-accent to-muted" />

            <div className="space-y-8">
              {timeline.map((item, index) => {
                const StatusIcon = statusIcons[item.status as keyof typeof statusIcons];
                const isLeft = index % 2 === 0;
                
                return (
                  <div key={index} className="relative">
                    {/* Timeline Node */}
                    <div className="absolute left-1/2 transform -translate-x-1/2 z-10">
                      <div className="w-12 h-12 bg-background border-4 border-primary rounded-full flex items-center justify-center">
                        <StatusIcon className="w-5 h-5 text-primary" />
                      </div>
                    </div>

                    {/* Content */}
                    <div className={`flex ${isLeft ? 'justify-end pr-8' : 'justify-start pl-8'}`}>
                      <div className="w-full max-w-md">
                        <Card className={`${impactColors[item.impacto as keyof typeof impactColors]} border-2`}>
                          <CardContent className="p-6">
                            <div className="space-y-3">
                              {/* Header */}
                              <div className="flex items-center justify-between">
                                <Badge 
                                  variant="secondary"
                                  className={statusColors[item.status as keyof typeof statusColors]}
                                >
                                  {item.fecha}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  {item.impacto} impacto
                                </Badge>
                              </div>

                              {/* Title */}
                              <h3 className="font-bold text-lg">
                                {item.hito}
                              </h3>

                              {/* Description */}
                              <p className="text-sm text-muted-foreground">
                                {item.descripcion}
                              </p>

                              {/* Status Badge */}
                              <div className="flex items-center gap-2 pt-2">
                                <StatusIcon className="w-4 h-4" />
                                <span className="text-sm font-medium capitalize">
                                  {item.status}
                                </span>
                                {item.status === 'próximo' && (
                                  <Badge variant="destructive" className="text-xs animate-pulse">
                                    URGENTE
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Checklist 90 días */}
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Checklist */}
            <Card className="border-2 border-primary/20 bg-primary/5">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <AlertCircle className="w-6 h-6 text-primary" />
                    <h3 className="text-xl font-bold">
                      Roadmap compliant en 90 días
                    </h3>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-4">
                    Plan paso a paso para llegar SIF-ready antes del Q1 2025:
                  </p>

                  <div className="space-y-3">
                    {checklist90Dias.map((item, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center mt-0.5">
                          <span className="text-xs font-bold text-primary">
                            {index + 1}
                          </span>
                        </div>
                        <span className="text-sm">{item}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 border-t border-primary/20">
                    <Badge variant="outline" className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                      ✅ Timeline realista validado con +50 implementaciones
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* SuiteLoop Advantage */}
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="space-y-6">
                  <div className="flex items-center gap-2">
                    <FileText className="w-6 h-6 text-primary" />
                    <h3 className="text-xl font-bold">
                      SuiteLoop: SIF-ready desde día 1
                    </h3>
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div className="flex items-center gap-2 text-green-700 dark:text-green-300 font-semibold mb-2">
                        <CheckCircle className="w-5 h-5" />
                        Compliance automático
                      </div>
                      <ul className="space-y-1 text-sm text-green-600 dark:text-green-400">
                        <li>• Planner genera reportes SIF automáticamente</li>
                        <li>• Validación e-factura en tiempo real</li>
                        <li>• Formato XML nativo según normativa</li>
                        <li>• APIs Hacienda pre-configuradas</li>
                      </ul>
                    </div>

                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300 font-semibold mb-2">
                        <Clock className="w-5 h-5" />
                        Implementación express
                      </div>
                      <ul className="space-y-1 text-sm text-blue-600 dark:text-blue-400">
                        <li>• Setup completo en &lt; 2 semanas</li>
                        <li>• Migración de datos automatizada</li>
                        <li>• Formación incluida en el onboarding</li>
                        <li>• Soporte dedicado durante transición</li>
                      </ul>
                    </div>

                    <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                      <div className="flex items-center gap-2 text-orange-700 dark:text-orange-300 font-semibold mb-2">
                        <TrendingUp className="w-5 h-5" />
                        Ventaja competitiva
                      </div>
                      <ul className="space-y-1 text-sm text-orange-600 dark:text-orange-400">
                        <li>• Tus clientes cumplen antes que competencia</li>
                        <li>• Reduces riesgo de sanciones fiscales</li>
                        <li>• Portal cliente diferenciador vs otros despachos</li>
                        <li>• Posicionamiento como despacho tech-forward</li>
                      </ul>
                    </div>
                  </div>

                  <Button size="lg" className="w-full">
                    <Calendar className="w-5 h-5 mr-2" />
                    Planificar mi roadmap SIF
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RegulatoryTimeline;