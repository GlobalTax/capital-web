
import React from 'react';

const VentaEmpresasBenefits = () => {
  const benefits = [
    {
      title: 'Máxima Valoración',
      description: 'Utilizamos técnicas avanzadas de valoración y posicionamiento estratégico para obtener el mejor precio posible.',
      stats: '+25% valoración promedio'
    },
    {
      title: 'Confidencialidad Total',
      description: 'Proceso completamente confidencial que protege tu empresa, empleados y clientes durante toda la operación.',
      stats: '100% confidencial'
    },
    {
      title: 'Red de Compradores',
      description: 'Acceso a nuestra extensa red de compradores estratégicos, fondos de inversión y family offices.',
      stats: '+500 contactos'
    },
    {
      title: 'Eficiencia Temporal',
      description: 'Proceso optimizado que minimiza las distracciones en tu negocio y acelera los tiempos de cierre.',
      stats: '4-6 meses promedio'
    },
    {
      title: 'Optimización Fiscal',
      description: 'Estructuración de la operación para minimizar el impacto fiscal y maximizar el beneficio neto.',
      stats: 'Hasta 15% ahorro'
    },
    {
      title: 'Asesoramiento Post-Venta',
      description: 'Acompañamiento en la transición y asesoramiento para futuras inversiones del capital obtenido.',
      stats: '12 meses seguimiento'
    }
  ];

  const casos = [
    {
      tipo: 'Empresa Tecnológica',
      detalle: 'SaaS B2B - 12M€ facturación',
      resultado: 'Vendida por 48M€ (4x múltiplo)',
      highlight: true
    },
    {
      tipo: 'Distribuidora Industrial',
      detalle: 'Sector industrial - 25M€ facturación',
      resultado: 'Vendida por 65M€ (2.6x múltiplo)',
      highlight: false
    },
    {
      tipo: 'Cadena de Retail',
      detalle: '15 tiendas - 8M€ facturación',
      resultado: 'Vendida por 22M€ (2.75x múltiplo)',
      highlight: false
    }
  ];

  return (
    <section className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-6">
            ¿Por Qué Elegir Capittal?
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Más de 15 años de experiencia nos avalan. Hemos ayudado a cientos de empresarios 
            a obtener el máximo valor por sus negocios.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {benefits.map((benefit, index) => {
            return (
              <div key={index} className="bg-background border border-border rounded-lg shadow-sm p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ease-out text-center group">
                <div className="bg-muted text-muted-foreground rounded-lg w-12 h-12 flex items-center justify-center mx-auto mb-6 group-hover:bg-muted/80 transition-colors duration-300">
                  <span className="text-sm font-medium">{index + 1}</span>
                </div>
                
                <h3 className="text-lg font-bold text-foreground mb-4">
                  {benefit.title}
                </h3>
                
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  {benefit.description}
                </p>
                
                <div className="bg-muted rounded-lg py-3 px-4 border border-border">
                  <span className="text-sm font-bold text-foreground">
                    {benefit.stats}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h3 className="text-2xl font-bold text-foreground mb-8">
              Casos de Éxito Recientes
            </h3>
            <div className="space-y-6">
              {casos.map((caso, index) => (
                <div key={index} className={`border-l-4 ${caso.highlight ? 'border-foreground bg-muted/50' : 'border-border'} pl-6 py-4 rounded-r-lg`}>
                  <h4 className="font-bold text-lg text-foreground">{caso.tipo}</h4>
                  <p className="text-muted-foreground mb-2">{caso.detalle}</p>
                  <p className="text-green-600 font-semibold">{caso.resultado}</p>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-background border border-border rounded-lg shadow-sm p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ease-out bg-muted/30">
            <h4 className="text-xl font-bold text-foreground mb-8 text-center">
              Nuestros Resultados
            </h4>
            <div className="grid grid-cols-2 gap-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-foreground mb-2">200+</div>
                <div className="text-muted-foreground text-sm">Empresas vendidas</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-foreground mb-2">€2.5B</div>
                <div className="text-muted-foreground text-sm">Valor total</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-foreground mb-2">85%</div>
                <div className="text-muted-foreground text-sm">Tasa de éxito</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-foreground mb-2">4.2x</div>
                <div className="text-muted-foreground text-sm">Múltiplo promedio</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VentaEmpresasBenefits;
