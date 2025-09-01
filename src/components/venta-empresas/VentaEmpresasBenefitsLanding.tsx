import React from 'react';
import { TrendingUp, Shield, Clock, Target, Users, Award } from 'lucide-react';

const VentaEmpresasBenefitsLanding = () => {
  const benefits = [
    {
      icon: <TrendingUp className="h-8 w-8" />,
      title: "Máximo Valor de Venta",
      description: "Optimizamos cada aspecto de tu empresa para conseguir el mejor precio del mercado.",
      highlight: "Resultados superiores"
    },
    {
      icon: <Clock className="h-8 w-8" />,
      title: "Proceso Eficiente", 
      description: "Valoración profesional y proceso de venta estructurado con tiempos definidos.",
      highlight: "Proceso optimizado"
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: "Confidencialidad Total",
      description: "Máxima discreción durante todo el proceso. Tu privacidad es nuestra prioridad.",
      highlight: "100% confidencial"
    },
    {
      icon: <Target className="h-8 w-8" />,
      title: "Resultados Comprobados",
      description: "Más del 98,7% de nuestras operaciones se completan exitosamente.",
      highlight: "98,7% tasa de éxito"
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: "Equipo Especializado",
      description: "Profesionales dedicados con experiencia en tu sector específico.",
      highlight: "Atención personalizada"
    },
    {
      icon: <Award className="h-8 w-8" />,
      title: "Experiencia Demostrada",
      description: "Más de 200 operaciones exitosas y €2.5B en transacciones gestionadas.",
      highlight: "Trayectoria sólida"
    }
  ];

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-foreground mb-6">
            ¿Por Qué Elegir <span className="text-primary">Capittal</span>?
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Nuestro enfoque especializado y experiencia comprobada garantizan 
            resultados excepcionales en cada operación de venta.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="group p-8 rounded-xl border border-border bg-card hover:shadow-lg transition-all duration-300"
            >
              <div className="text-primary mb-4 group-hover:scale-110 transition-transform duration-300">
                {benefit.icon}
              </div>
              
              <h3 className="text-xl font-bold text-foreground mb-3">
                {benefit.title}
              </h3>
              
              <p className="text-muted-foreground mb-4 leading-relaxed">
                {benefit.description}
              </p>
              
              <div className="inline-flex items-center px-3 py-1 bg-muted text-muted-foreground rounded-full text-sm font-medium border border-border">
                {benefit.highlight}
              </div>
            </div>
          ))}
        </div>

        {/* Social Proof Section */}
        <div className="bg-card border border-border rounded-xl p-8 text-center">
          <h3 className="text-2xl font-bold text-foreground mb-6">Resultados que Nos Respaldan</h3>
          
          <div className="grid md:grid-cols-3 gap-8 mb-6">
            <div className="space-y-2">
              <div className="text-3xl font-bold text-primary">4.9/5</div>
              <div className="text-lg font-semibold text-foreground">Valoración</div>
              <div className="text-sm text-muted-foreground">Satisfacción clientes</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-primary">98,7%</div>
              <div className="text-lg font-semibold text-foreground">Éxito</div>
              <div className="text-sm text-muted-foreground">Operaciones completadas</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-primary">€2.5B+</div>
              <div className="text-lg font-semibold text-foreground">Valor</div>
              <div className="text-sm text-muted-foreground">Transacciones gestionadas</div>
            </div>
          </div>

          <div className="max-w-2xl mx-auto">
            <p className="italic text-lg text-muted-foreground">
              "El equipo de Capittal logró un precio de venta superior a nuestras expectativas iniciales. 
              Su profesionalismo y conocimiento del mercado fueron clave en el éxito de la operación."
            </p>
            <p className="mt-4 text-foreground font-semibold">
              - María González, Fundadora TechSolutions
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VentaEmpresasBenefitsLanding;