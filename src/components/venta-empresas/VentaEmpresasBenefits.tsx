
import React from 'react';
import { Users, TrendingUp, Shield, Award, Handshake, Target } from 'lucide-react';

const VentaEmpresasBenefits = () => {
  const benefits = [
    {
      title: "Experiencia Probada",
      description: "Más de 200 operaciones completadas exitosamente en los últimos 10 años.",
      icon: Award,
      stats: "+200 empresas vendidas"
    },
    {
      title: "Valoración Optimizada", 
      description: "Maximizamos el precio de venta mediante análisis profundo y estrategia personalizada.",
      icon: TrendingUp,
      stats: "Incremento promedio del 23%"
    },
    {
      title: "Confidencialidad Total",
      description: "Proceso completamente confidencial que protege tu empresa y empleados.",
      icon: Shield,
      stats: "100% confidencial"
    },
    {
      title: "Red de Compradores",
      description: "Acceso exclusivo a nuestra amplia red de compradores estratégicos e inversores.",
      icon: Users,
      stats: "+500 compradores activos"
    },
    {
      title: "Asesoramiento Integral",
      description: "Te acompañamos en todo el proceso, desde la preparación hasta el cierre.",
      icon: Handshake,
      stats: "Soporte 360°"
    },
    {
      title: "Resultados Garantizados",
      description: "Solo cobramos si vendemos tu empresa. Nuestros intereses están alineados.",
      icon: Target,
      stats: "Solo éxito, sin retainer"
    }
  ];

  // Casos de éxito recientes (anónimos por confidencialidad)
  const casos = [
    {
      tipo: "Empresa de Software",
      detalle: "SaaS B2B - 15 empleados",
      resultado: "Vendida por €12M (6.2x EBITDA)",
      highlight: true
    },
    {
      tipo: "Distribuidora Industrial",
      detalle: "B2B - 45 empleados",
      resultado: "Vendida por €8.5M (4.1x EBITDA)",
      highlight: false
    },
    {
      tipo: "Consultora Tecnológica",
      detalle: "Servicios IT - 22 empleados", 
      resultado: "Vendida por €6.2M (5.8x EBITDA)",
      highlight: false
    },
    {
      tipo: "E-commerce Especializado",
      detalle: "Retail online - 8 empleados",
      resultado: "Vendida por €4.8M (7.1x EBITDA)",
      highlight: true
    }
  ];

  return (
    <section id="beneficios" className="py-24 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-6">
            ¿Por qué elegir Capittal?
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Somos la boutique M&A líder en España. Nuestro enfoque personalizado y 
            experiencia demostrada garantizan los mejores resultados para tu empresa.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {benefits.map((benefit, index) => {
            const IconComponent = benefit.icon;
            return (
              <div key={index} className="group">
                <div className="bg-card border border-border rounded-lg p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ease-out h-full">
                  <div className="bg-muted rounded-lg p-3 w-12 h-12 flex items-center justify-center mb-6">
                    <IconComponent className="h-6 w-6 text-foreground" />
                  </div>
                  
                  <h3 className="text-lg font-semibold text-foreground mb-4">
                    {benefit.title}
                  </h3>
                  
                  <p className="text-muted-foreground mb-4 leading-relaxed text-sm">
                    {benefit.description}
                  </p>
                  
                  <div className="bg-muted rounded-lg px-3 py-1.5">
                    <span className="text-sm font-medium text-foreground">
                      {benefit.stats}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Success Cases */}
        <div className="bg-card border border-border rounded-lg p-8">
          <h3 className="text-2xl font-bold text-foreground mb-8 text-center">
            Casos de Éxito Recientes
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {casos.map((caso, index) => (
              <div key={index} className="border border-border rounded-lg p-6 hover:shadow-md transition-all duration-300 bg-card">
                <div className="flex justify-between items-start mb-3">
                  <h4 className="font-semibold text-foreground">{caso.tipo}</h4>
                  {caso.highlight && (
                    <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                      Destacado
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mb-3">{caso.detalle}</p>
                <p className="text-sm font-medium text-success bg-success/10 rounded px-3 py-1">
                  {caso.resultado}
                </p>
              </div>
            ))}
          </div>

          {/* Overall Results */}
          <div className="grid grid-cols-4 gap-8 text-center border-t border-border pt-8">
            <div>
              <div className="text-3xl font-bold text-foreground mb-2">200+</div>
              <div className="text-sm text-muted-foreground">Empresas Vendidas</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-foreground mb-2">€2.1B</div>
              <div className="text-sm text-muted-foreground">Valor Total</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-foreground mb-2">95%</div>
              <div className="text-sm text-muted-foreground">Tasa de Éxito</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-foreground mb-2">5.2x</div>
              <div className="text-sm text-muted-foreground">Múltiplo Promedio</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VentaEmpresasBenefits;
