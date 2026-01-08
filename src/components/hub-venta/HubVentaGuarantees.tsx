import React from 'react';
import { Shield, Lock, Gift, Users, Award, Clock } from 'lucide-react';

const guarantees = [
  {
    icon: Gift,
    title: 'Sin coste si no vendemos',
    description: 'Solo cobramos success fee cuando cerramos la operación. Tu riesgo es cero.',
  },
  {
    icon: Lock,
    title: 'Confidencialidad blindada',
    description: 'NDA obligatorio para cada interesado. Tu empresa permanece anónima hasta que tú decidas.',
  },
  {
    icon: Award,
    title: 'Valoración gratuita',
    description: 'Análisis profesional de tu empresa sin compromiso. Sabrás el valor real antes de decidir.',
  },
  {
    icon: Users,
    title: 'Acompañamiento completo',
    description: 'Desde la primera reunión hasta la firma notarial. Nunca estarás solo en el proceso.',
  },
  {
    icon: Shield,
    title: 'Red de expertos',
    description: 'Acceso a fiscalistas, abogados especializados y notarios de confianza.',
  },
  {
    icon: Clock,
    title: 'Respuesta en 24h',
    description: 'Respondemos a todas tus consultas en menos de 24 horas laborables.',
  },
];

const HubVentaGuarantees: React.FC = () => {
  return (
    <section className="py-20 md:py-28 bg-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="font-mono text-xs font-light uppercase tracking-widest text-slate-400 mb-4">
            Nuestro compromiso
          </p>
          <h2 className="text-3xl md:text-4xl font-normal text-white mb-4">
            Garantías y Compromisos
          </h2>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto">
            Trabajamos con un modelo que alinea nuestros intereses con los tuyos.
          </p>
        </div>

        {/* Guarantees Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {guarantees.map((guarantee, index) => (
            <div
              key={index}
              className="bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-colors"
            >
              {/* Icon */}
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-white/10 text-white mb-4">
                <guarantee.icon className="h-6 w-6" />
              </div>

              {/* Content */}
              <h3 className="text-lg font-medium text-white mb-2">
                {guarantee.title}
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                {guarantee.description}
              </p>
            </div>
          ))}
        </div>

        {/* Trust Badge */}
        <div className="mt-12 flex justify-center">
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/10 rounded-full">
            <Shield className="h-5 w-5 text-green-400" />
            <span className="text-sm text-slate-300">
              Todos nuestros compromisos por escrito
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HubVentaGuarantees;
