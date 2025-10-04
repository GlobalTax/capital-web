import React from 'react';
import { Button } from '@/components/ui/button';

const OurGroup = () => {
  const groupServices = [
    {
      title: "Capittal",
      subtitle: "Originación & Valoración",
      description: "Especialistas en identificación de oportunidades, valoración de empresas y estructuración de operaciones de M&A."
    },
    {
      title: "Navarro Legal",
      subtitle: "Asesoramiento Legal & Fiscal", 
      description: "Expertos en derecho mercantil y fiscal, especializados en operaciones de M&A y restructuraciones empresariales."
    }
  ];

  return (
    <section className="py-32 bg-white border-t border-gray-200">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-24">
          <h2 className="text-4xl font-light text-foreground mb-8">
            Grupo Navarro
          </h2>
          <p className="text-xl text-foreground max-w-3xl mx-auto leading-relaxed">
            Capittal forma parte del Grupo Navarro, un ecosistema integral de servicios profesionales. 
            Dos marcas especializadas, un objetivo común: maximizar el valor de tu operación.
          </p>
        </div>

        {/* Group Companies */}
        <div className="grid md:grid-cols-2 gap-16 mb-24">
          {groupServices.map((company, index) => (
            <div key={index} className="text-center">
              <h3 className="text-2xl font-medium text-foreground mb-4">
                {company.title}
              </h3>
              <div className="text-lg text-muted-foreground mb-6 border border-border px-4 py-2 inline-block">
                {company.subtitle}
              </div>
              <p className="text-foreground leading-relaxed">
                {company.description}
              </p>
            </div>
          ))}
        </div>

        {/* Benefits */}
        <div className="text-center mb-24 border-t border-gray-200 pt-24">
          <h3 className="text-2xl font-light text-foreground mb-16">
            Ventajas de la Integración
          </h3>
          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center">
              <h4 className="text-lg font-medium text-foreground mb-4">Servicio 360°</h4>
              <p className="text-foreground leading-relaxed">Cobertura completa desde la valoración hasta el cierre legal</p>
            </div>
            <div className="text-center">
              <h4 className="text-lg font-medium text-foreground mb-4">Mayor Seguridad</h4>
              <p className="text-foreground leading-relaxed">Reducción de riesgos con equipos especializados coordinados</p>
            </div>
            <div className="text-center">
              <h4 className="text-lg font-medium text-foreground mb-4">Optimización de Valor</h4>
              <p className="text-foreground leading-relaxed">Maximización del valor con expertise financiero y legal integrado</p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center border-t border-gray-200 pt-24">
          <h3 className="text-2xl font-light text-foreground mb-8">
            ¿Necesitas asesoramiento integral?
          </h3>
          
          <Button 
            className="px-12 py-4 text-lg font-medium"
          >
            Evaluar
          </Button>
          
          <p className="text-sm text-muted-foreground mt-6">
            Sin compromiso • Confidencial • Resultados en 48h
          </p>
        </div>
      </div>
    </section>
  );
};

export default OurGroup;