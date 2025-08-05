import React from 'react';
import { Building2, Scale, TrendingUp, Shield } from 'lucide-react';
import { InteractiveHoverButton } from '@/components/ui/interactive-hover-button';

const OurGroup = () => {
  const groupServices = [
    {
      icon: <TrendingUp className="h-8 w-8" />,
      title: "Capittal",
      subtitle: "Originación & Valoración",
      description: "Especialistas en identificación de oportunidades, valoración de empresas y estructuración de operaciones de M&A.",
      services: ["Valoraciones empresariales", "Due Diligence financiero", "Originación de operaciones", "Estructuración de deals"]
    },
    {
      icon: <Scale className="h-8 w-8" />,
      title: "Navarro Legal",
      subtitle: "Asesoramiento Legal & Fiscal",
      description: "Expertos en derecho mercantil y fiscal, especializados en operaciones de M&A y restructuraciones empresariales.",
      services: ["Asesoramiento legal M&A", "Due Diligence legal", "Estructuración fiscal", "Documentación jurídica"]
    }
  ];

  const groupBenefits = [
    {
      icon: <Building2 className="h-6 w-6" />,
      title: "Servicio 360°",
      description: "Cobertura completa desde la valoración hasta el cierre legal"
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Mayor Seguridad",
      description: "Reducción de riesgos con equipos especializados coordinados"
    },
    {
      icon: <TrendingUp className="h-6 w-6" />,
      title: "Optimización de Valor",
      description: "Maximización del valor con expertise financiero y legal integrado"
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-secondary via-background to-accent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-6">
            Grupo Capittal + Navarro
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            La sinergia perfecta entre expertise financiero y legal para operaciones de M&A exitosas. 
            Dos marcas especializadas, un objetivo común: maximizar el valor de tu operación.
          </p>
        </div>

        {/* Group Companies */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {groupServices.map((company, index) => (
            <div key={index} className="bg-card border border-border rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center mb-6">
                <div className="bg-primary text-primary-foreground p-3 rounded-lg mr-4">
                  {company.icon}
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-foreground">{company.title}</h3>
                  <p className="text-muted-foreground font-medium">{company.subtitle}</p>
                </div>
              </div>
              
              <p className="text-muted-foreground mb-6 leading-relaxed">
                {company.description}
              </p>
              
              <ul className="space-y-2">
                {company.services.map((service, idx) => (
                  <li key={idx} className="flex items-center text-sm">
                    <div className="w-2 h-2 bg-primary rounded-full mr-3 flex-shrink-0"></div>
                    <span className="text-foreground">{service}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Group Benefits */}
        <div className="bg-card border border-border rounded-xl p-8 mb-12">
          <h3 className="text-2xl font-bold text-foreground text-center mb-8">
            Ventajas de la Integración
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            {groupBenefits.map((benefit, index) => (
              <div key={index} className="text-center">
                <div className="bg-primary text-primary-foreground p-3 rounded-lg w-fit mx-auto mb-4">
                  {benefit.icon}
                </div>
                <h4 className="font-semibold text-foreground mb-2">{benefit.title}</h4>
                <p className="text-muted-foreground text-sm leading-relaxed">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <h3 className="text-2xl font-bold text-foreground mb-4">
            ¿Necesitas asesoramiento integral?
          </h3>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Contacta con nosotros y descubre cómo nuestro enfoque integrado puede maximizar 
            el valor y minimizar los riesgos de tu operación.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <InteractiveHoverButton 
              text="Consulta Valoración"
              variant="primary"
              size="lg"
            />
            <a href="https://navarro.es" target="_blank" rel="noopener noreferrer">
              <InteractiveHoverButton 
                text="Consulta Legal"
                variant="secondary"
                size="lg"
              />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default OurGroup;