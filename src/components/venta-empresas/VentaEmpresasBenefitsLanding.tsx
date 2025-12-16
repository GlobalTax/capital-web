import React from 'react';
import { TrendingUp, Shield, Clock, Users } from 'lucide-react';

const VentaEmpresasBenefitsLanding = () => {
  const benefits = [
    {
      icon: <TrendingUp className="h-8 w-8" />,
      title: "Máximo Valor de Venta",
      description: "Optimizamos cada aspecto de tu empresa para conseguir el mejor precio del mercado."
    },
    {
      icon: <Clock className="h-8 w-8" />,
      title: "Proceso Eficiente", 
      description: "Valoración profesional y proceso de venta estructurado con tiempos definidos."
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: "Confidencialidad Total",
      description: "Máxima discreción durante todo el proceso. Tu privacidad es nuestra prioridad."
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: "Equipo Especializado",
      description: "Profesionales dedicados con experiencia en tu sector específico."
    }
  ];

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
            ¿Por Qué Elegir <span className="text-primary">Capittal</span>?
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="group p-6 rounded-xl border border-border bg-card hover:shadow-lg transition-all duration-300 text-center"
            >
              <div className="text-primary mb-4 flex justify-center group-hover:scale-110 transition-transform duration-300">
                {benefit.icon}
              </div>
              
              <h3 className="text-lg font-bold text-foreground mb-2">
                {benefit.title}
              </h3>
              
              <p className="text-sm text-muted-foreground leading-relaxed">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default VentaEmpresasBenefitsLanding;