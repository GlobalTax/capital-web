
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

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-black mb-6">
            ¿Por Qué Elegir Capittal?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Más de 15 años de experiencia nos avalan. Hemos ayudado a cientos de empresarios 
            a obtener el máximo valor por sus negocios.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <div key={index} className="capittal-card text-center">
                <div className="bg-black text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                  <Icon className="h-8 w-8" />
                </div>
                
                <h3 className="text-xl font-bold text-black mb-4">
                  {benefit.title}
                </h3>
                
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {benefit.description}
                </p>
                
                <div className="bg-gray-100 rounded-lg py-3 px-4">
                  <span className="text-lg font-bold text-black">
                    {benefit.stats}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-16 bg-white rounded-2xl p-8 shadow-lg">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-3xl font-bold text-black mb-6">
                Casos de Éxito Recientes
              </h3>
              <div className="space-y-6">
                <div className="border-l-4 border-black pl-6">
                  <h4 className="font-bold text-lg text-black">Empresa Tecnológica</h4>
                  <p className="text-gray-600">SaaS B2B - 12M€ facturación</p>
                  <p className="text-green-600 font-semibold">Vendida por 48M€ (4x múltiplo)</p>
                </div>
                <div className="border-l-4 border-black pl-6">
                  <h4 className="font-bold text-lg text-black">Distribuidora Industrial</h4>
                  <p className="text-gray-600">Sector industrial - 25M€ facturación</p>
                  <p className="text-green-600 font-semibold">Vendida por 65M€ (2.6x múltiplo)</p>
                </div>
                <div className="border-l-4 border-black pl-6">
                  <h4 className="font-bold text-lg text-black">Cadena de Retail</h4>
                  <p className="text-gray-600">15 tiendas - 8M€ facturación</p>
                  <p className="text-green-600 font-semibold">Vendida por 22M€ (2.75x múltiplo)</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-xl p-8">
              <h4 className="text-2xl font-bold text-black mb-6 text-center">
                Nuestros Resultados
              </h4>
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-black mb-2">200+</div>
                  <div className="text-gray-600">Empresas vendidas</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-black mb-2">€2.5B</div>
                  <div className="text-gray-600">Valor total</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-black mb-2">85%</div>
                  <div className="text-gray-600">Tasa de éxito</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-black mb-2">4.2x</div>
                  <div className="text-gray-600">Múltiplo promedio</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VentaEmpresasBenefits;
