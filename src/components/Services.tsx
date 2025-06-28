
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, TrendingUp, FileText, Calculator, Scale, Users } from 'lucide-react';

const Services = () => {
  const services = [
    {
      icon: TrendingUp,
      title: "Venta de Empresas",
      description: "Proceso completo de M&A para maximizar el valor de tu empresa. Desde la preparación hasta el cierre de la operación.",
      features: ["Valoración gratuita", "Marketing estratégico", "Negociación profesional"],
      link: "/venta-empresas"
    },
    {
      icon: Calculator,
      title: "Valoraciones",
      description: "Valoraciones profesionales con metodologías reconocidas internacionalmente para toma de decisiones estratégicas.",
      features: ["Múltiplos de mercado", "DCF detallado", "Análisis comparativo"],
      link: "/servicios/valoraciones"
    },
    {
      icon: FileText,
      title: "Due Diligence",
      description: "Análisis exhaustivo de oportunidades de inversión para minimizar riesgos y maximizar el retorno.",
      features: ["Análisis financiero", "Legal y fiscal", "Operacional"],
      link: "/servicios/due-diligence"
    },
    {
      icon: Scale,
      title: "Asesoramiento Legal",
      description: "Soporte legal completo en operaciones M&A con nuestro equipo de abogados especializados.",
      features: ["Contratos M&A", "Estructura legal", "Compliance"],
      link: "/servicios/asesoramiento-legal"
    },
    {
      icon: Users,
      title: "Reestructuraciones",
      description: "Optimización de la estructura empresarial para mejorar la eficiencia y preparar futuras operaciones.",
      features: ["Reorganización societaria", "Optimización fiscal", "Governance"],
      link: "/servicios/reestructuraciones"
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 bg-black text-white rounded-lg badge-text mb-6">
            Servicios Especializados
          </div>
          
          <h2 className="section-title text-black mb-6">
            Servicios de M&A de Extremo a Extremo
          </h2>
          
          <p className="section-subtitle max-w-3xl mx-auto">
            Ofrecemos una gama completa de servicios especializados en M&A, desde la valoración inicial 
            hasta el cierre exitoso de la operación.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {services.map((service, index) => {
            const IconComponent = service.icon;
            return (
              <Card key={index} className="capittal-card group">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-black text-white rounded-lg">
                      <IconComponent className="h-6 w-6" />
                    </div>
                  </div>
                  
                  <CardTitle className="card-title">
                    {service.title}
                  </CardTitle>
                  
                  <CardDescription className="card-description">
                    {service.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <ul className="space-y-2 mb-6">
                    {service.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="help-text flex items-center">
                        <div className="w-1.5 h-1.5 bg-black rounded-full mr-3 flex-shrink-0"></div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  
                  <Button variant="outline" className="w-full group-hover:bg-black group-hover:text-white transition-colors">
                    <span className="button-label-sm">Más Información</span>
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* CTA */}
        <div className="text-center">
          <Button className="capittal-button button-label bg-black text-white hover:bg-gray-800">
            Solicitar Consulta Gratuita
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Services;
