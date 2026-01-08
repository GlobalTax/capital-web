import React from 'react';
import { Calculator, Users, Shield, Handshake, HeartHandshake, Wallet } from 'lucide-react';

const benefits = [
  {
    icon: Calculator,
    title: 'Valoración Profesional',
    description: 'Conoce el valor real de tu empresa antes de negociar',
  },
  {
    icon: Users,
    title: 'Red de Compradores',
    description: 'Acceso a inversores cualificados nacionales e internacionales',
  },
  {
    icon: Shield,
    title: 'Confidencialidad Total',
    description: 'Protegemos tu información y la de tus empleados',
  },
  {
    icon: Handshake,
    title: 'Negociación Experta',
    description: 'Conseguimos las mejores condiciones para ti',
  },
  {
    icon: HeartHandshake,
    title: 'Acompañamiento Integral',
    description: 'Desde la valoración hasta el cierre notarial',
  },
  {
    icon: Wallet,
    title: 'Sin Coste Inicial',
    description: 'Solo cobramos si vendemos tu empresa',
  },
];

const HubVentaBenefits: React.FC = () => {
  return (
    <section className="py-20 md:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="font-mono text-xs font-light uppercase tracking-widest text-slate-500 mb-4">
            Ventajas competitivas
          </p>
          <h2 className="text-3xl md:text-4xl font-normal text-slate-900">
            Maximiza el Valor de Tu Empresa
          </h2>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <div 
              key={index}
              className="group p-6 rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-lg transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center mb-4 group-hover:bg-slate-900 group-hover:text-white transition-colors">
                <benefit.icon className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-medium text-slate-900 mb-2">
                {benefit.title}
              </h3>
              <p className="text-sm text-slate-600">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HubVentaBenefits;
