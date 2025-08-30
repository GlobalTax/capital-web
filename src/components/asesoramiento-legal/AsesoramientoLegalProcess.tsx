
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { FileText, Scale, Shield, CheckCircle, Users } from 'lucide-react';

const AsesoramientoLegalProcess = () => {
  const processSteps = [
    {
      icon: FileText,
      title: "Evaluación Inicial y Análisis de Riesgos",
      description: "Revisión completa de la estructura legal, contratos principales y identificación de contingencias potenciales.",
      duration: "1-2 semanas"
    },
    {
      icon: Scale,
      title: "Due Diligence Legal",
      description: "Investigación exhaustiva de aspectos legales, laborales, fiscales y regulatorios que puedan afectar la transacción.",
      duration: "2-4 semanas"
    },
    {
      icon: Shield,
      title: "Redacción y Negociación Contractual",
      description: "Preparación de LOI, SPA/APA, negociación de términos y estructuración de earn-outs y ajustes de precio.",
      duration: "3-5 semanas"
    },
    {
      icon: Users,
      title: "Coordinación con Reguladores",
      description: "Gestión de autorizaciones sectoriales, notificaciones de competencia y cumplimiento normativo específico.",
      duration: "Variable por sector"
    },
    {
      icon: CheckCircle,
      title: "Formalización y Cierre",
      description: "Coordinación del cierre, firma de documentos, transferencias y seguimiento post-operación.",
      duration: "1 semana"
    }
  ];

  return (
    <section className="py-20 bg-muted/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
            Proceso de Asesoramiento Legal
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Metodología integrada con el timeline global de M&A de Capittal. 
            Cada fase se coordina perfectamente con la valoración y negociación comercial.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {processSteps.map((step, index) => (
            <Card key={index} className="h-full hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <step.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-3">
                  {step.title}
                </h3>
                <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
                  {step.description}
                </p>
                <div className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-medium">
                  {step.duration}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-16 text-center">
          <Card className="inline-block">
            <CardContent className="p-8">
              <h3 className="text-xl font-bold text-foreground mb-4">
                Timeline Total Integrado
              </h3>
              <div className="text-3xl font-bold text-primary mb-2">7-15 semanas</div>
              <p className="text-muted-foreground mb-4">
                Duración desde análisis inicial hasta cierre legal
              </p>
              <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                <strong>Coordinación completa:</strong> El proceso legal se ejecuta en paralelo 
                con la valoración financiera y negociación comercial de Capittal
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default AsesoramientoLegalProcess;
