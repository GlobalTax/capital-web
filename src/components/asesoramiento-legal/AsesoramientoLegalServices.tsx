import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Scale, FileCheck, Users, Shield, Handshake } from 'lucide-react';

const AsesoramientoLegalServices = () => {
  const services = [
    {
      icon: Scale,
      title: "Due Diligence Legal",
      description: "Revisión exhaustiva de contratos, contingencias y riesgos legales. Identificamos problemas potenciales antes de que se conviertan en obstáculos para la transacción."
    },
    {
      icon: FileCheck,
      title: "Documentación M&A",
      description: "Preparación y revisión de LOI, SPA/APA, Disclosure Letter y TSA. Aseguramos que todos los documentos protejan tus intereses."
    },
    {
      icon: Users,
      title: "Derecho Societario",
      description: "Estructuras societarias, juntas de accionistas y gobierno corporativo. Optimizamos la estructura legal para la operación."
    },
    {
      icon: Shield,
      title: "Compliance Regulatorio",
      description: "Cumplimiento de leyes fiscales, laborales, de competencia y normativa sectorial. Minimizamos riesgos regulatorios."
    },
    {
      icon: Handshake,
      title: "Negociación Contractual",
      description: "Diseño de clausulado para maximizar valor: earn-outs, ajustes de precio, no competencia. Protegemos tu inversión."
    }
  ];

  return (
    <section className="py-20 bg-muted/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Servicios Legales Especializados
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Cobertura legal completa para operaciones corporativas con la experiencia de Navarro Legal
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <Card key={index} className="h-full hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <service.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">{service.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{service.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AsesoramientoLegalServices;