
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
      title: "Alineación de Intereses",
      description: "Estructuramos nuestros honorarios para alinear intereses y maximizar el éxito.",
      icon: Target,
      stats: "Honorarios variables"
    }
  ];


  return (
    <section id="beneficios" className="py-24 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-black mb-6">
            ¿Por qué elegir Capittal?
          </h2>
          <p className="text-lg text-black max-w-3xl mx-auto">
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
                    <IconComponent className="h-6 w-6 text-black" />
                  </div>
                  
                  <h3 className="text-lg font-semibold text-black mb-4">
                    {benefit.title}
                  </h3>
                  
                  <p className="text-black mb-4 leading-relaxed text-sm">
                    {benefit.description}
                  </p>
                  
                  <div className="bg-muted rounded-lg px-3 py-1.5">
                    <span className="text-sm font-medium text-black">
                      {benefit.stats}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Company Track Record */}
        <div className="bg-card border border-border rounded-lg p-8">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-black mb-4">
              Nuestro Historial
            </h3>
            <p className="text-black">
              Una década de experiencia respaldando nuestro compromiso con la excelencia
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-black mb-2">200+</div>
              <div className="text-sm text-black">Empresas Vendidas</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-black mb-2">€902M</div>
              <div className="text-sm text-black">Valor Total</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-black mb-2">98,7%</div>
              <div className="text-sm text-black">Tasa de Éxito</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-black mb-2">5.5x</div>
              <div className="text-sm text-black">Múltiplo Promedio</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VentaEmpresasBenefits;
