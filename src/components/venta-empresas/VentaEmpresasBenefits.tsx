
import React from 'react';
import { Shield, Target, Clock, Users, TrendingUp, Award } from 'lucide-react';

const VentaEmpresasBenefits = () => {
  const benefits = [
    {
      icon: Target,
      title: 'Máxima Valoración',
      description: 'Utilizamos técnicas avanzadas de valoración y posicionamiento estratégico para obtener el mejor precio posible.',
      stats: '+25% valoración promedio'
    },
    {
      icon: Shield,
      title: 'Confidencialidad Total',
      description: 'Proceso completamente confidencial que protege tu empresa, empleados y clientes durante toda la operación.',
      stats: '100% confidencial'
    },
    {
      icon: Users,
      title: 'Red de Compradores',
      description: 'Acceso a nuestra extensa red de compradores estratégicos, fondos de inversión y family offices.',
      stats: '+500 contactos'
    },
    {
      icon: Clock,
      title: 'Eficiencia Temporal',
      description: 'Proceso optimizado que minimiza las distracciones en tu negocio y acelera los tiempos de cierre.',
      stats: '4-6 meses promedio'
    },
    {
      icon: TrendingUp,
      title: 'Optimización Fiscal',
      description: 'Estructuración de la operación para minimizar el impacto fiscal y maximizar el beneficio neto.',
      stats: 'Hasta 15% ahorro'
    },
    {
      icon: Award,
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
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-2xl font-bold text-black mb-6">
            ¿Por Qué Elegir Capittal?
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Más de 15 años de experiencia nos avalan. Hemos ayudado a cientos de empresarios 
            a obtener el máximo valor por sus negocios.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <div key={index} className="capittal-card text-center group">
                <div className="bg-black text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Icon className="h-8 w-8" />
                </div>
                
                <h3 className="text-lg font-bold text-black mb-4">
                  {benefit.title}
                </h3>
                
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {benefit.description}
                </p>
                
                <div className="bg-gray-50 rounded-lg py-3 px-4 border border-gray-200">
                  <span className="text-sm font-bold text-black">
                    {benefit.stats}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h3 className="text-2xl font-bold text-black mb-8">
              Casos de Éxito Recientes
            </h3>
            <div className="space-y-6">
              {casos.map((caso, index) => (
                <div key={index} className={`border-l-4 ${caso.highlight ? 'border-black bg-gray-50' : 'border-gray-300'} pl-6 py-4 rounded-r-lg`}>
                  <h4 className="font-bold text-lg text-black">{caso.tipo}</h4>
                  <p className="text-gray-600 mb-2">{caso.detalle}</p>
                  <p className="text-green-600 font-semibold">{caso.resultado}</p>
                </div>
              ))}
            </div>
          </div>
          
          <div className="capittal-card bg-gray-50">
            <h4 className="text-xl font-bold text-black mb-8 text-center">
              Nuestros Resultados
            </h4>
            <div className="grid grid-cols-2 gap-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-black mb-2">200+</div>
                <div className="text-gray-600 text-sm">Empresas vendidas</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-black mb-2">€2.5B</div>
                <div className="text-gray-600 text-sm">Valor total</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-black mb-2">85%</div>
                <div className="text-gray-600 text-sm">Tasa de éxito</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-black mb-2">4.2x</div>
                <div className="text-gray-600 text-sm">Múltiplo promedio</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VentaEmpresasBenefits;
