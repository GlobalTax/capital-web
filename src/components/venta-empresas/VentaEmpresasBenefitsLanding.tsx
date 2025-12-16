import React from 'react';
import { TrendingUp, Shield, Clock, Users } from 'lucide-react';

const VentaEmpresasBenefitsLanding = () => {
  const benefits = [
    {
      icon: TrendingUp,
      title: "Máximo Valor de Venta",
      description: "Optimizamos cada aspecto de tu empresa para conseguir el mejor precio del mercado."
    },
    {
      icon: Clock,
      title: "Proceso Eficiente", 
      description: "Valoración profesional y proceso de venta estructurado con tiempos definidos."
    },
    {
      icon: Shield,
      title: "Confidencialidad Total",
      description: "Máxima discreción durante todo el proceso. Tu privacidad es nuestra prioridad."
    },
    {
      icon: Users,
      title: "Equipo Especializado",
      description: "Profesionales dedicados con experiencia en tu sector específico."
    }
  ];

  return (
    <section className="py-20 bg-slate-50">
      <div className="container mx-auto px-4">
        {/* Badge + Title + Subtitle */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900 text-white text-sm font-medium mb-6">
            <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
            NUESTRAS VENTAJAS
          </div>
          
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
            ¿Por Qué Elegir <span className="text-foreground">Capittal</span>?
          </h2>
          
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Combinamos experiencia en M&A, tecnología avanzada y un enfoque personalizado 
            para maximizar el valor de tu empresa.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <div
                key={index}
                className="group p-8 rounded-2xl border border-slate-200 bg-white shadow-md hover:shadow-xl hover:-translate-y-2 transition-all duration-300 text-center"
              >
                {/* Icon Container */}
                <div className="w-16 h-16 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center mb-6 mx-auto group-hover:bg-slate-900 group-hover:border-slate-900 transition-all duration-300">
                  <Icon className="h-8 w-8 text-slate-900 group-hover:text-white transition-colors duration-300" />
                </div>
                
                <h3 className="text-xl font-bold text-foreground mb-3">
                  {benefit.title}
                </h3>
                
                <p className="text-muted-foreground leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default VentaEmpresasBenefitsLanding;
