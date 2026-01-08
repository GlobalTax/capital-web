import React from 'react';
import { AlertTriangle, TrendingDown, Eye, Users, FileWarning, Calculator } from 'lucide-react';

const mistakes = [
  {
    icon: Calculator,
    title: 'Valorar la empresa incorrectamente',
    description: 'Sin un análisis profesional, puedes perder hasta un 30% del valor real de tu empresa o pedir un precio irreal que espante compradores.',
  },
  {
    icon: Eye,
    title: 'Revelar la venta prematuramente',
    description: 'Empleados, proveedores y clientes se enteran antes de tiempo, generando incertidumbre y debilitando tu posición negociadora.',
  },
  {
    icon: Users,
    title: 'Negociar sin representación',
    description: 'El comprador tiene asesores, abogados y financieros. Negociar solo significa estar en desventaja en cada punto.',
  },
  {
    icon: FileWarning,
    title: 'No preparar la documentación',
    description: 'Un due diligence caótico genera desconfianza y reduce las ofertas. Los compradores descuentan precio ante la incertidumbre.',
  },
  {
    icon: TrendingDown,
    title: 'Aceptar la primera oferta',
    description: 'Sin un proceso competitivo, nunca sabrás si podrías haber conseguido un 20% más. Dejas dinero en la mesa.',
  },
  {
    icon: AlertTriangle,
    title: 'Ignorar las implicaciones fiscales',
    description: 'Sin planificación fiscal, puedes pagar hasta un 45% en impuestos. Una buena estructura puede reducirlo significativamente.',
  },
];

const HubVentaMistakes: React.FC = () => {
  return (
    <section className="py-20 md:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="font-mono text-xs font-light uppercase tracking-widest text-amber-600 mb-4">
            Evita estos errores
          </p>
          <h2 className="text-3xl md:text-4xl font-normal text-slate-900 mb-4">
            6 Errores Que Destruyen Valor
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Errores comunes que cometen los empresarios al vender sin asesoramiento profesional.
          </p>
        </div>

        {/* Mistakes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mistakes.map((mistake, index) => (
            <div
              key={index}
              className="group relative bg-slate-50 border border-slate-200 rounded-xl p-6 hover:bg-white hover:border-slate-300 hover:shadow-lg transition-all"
            >
              {/* Number */}
              <div className="absolute top-4 right-4 text-4xl font-bold text-slate-200 group-hover:text-slate-300 transition-colors">
                {String(index + 1).padStart(2, '0')}
              </div>

              {/* Icon */}
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-amber-100 text-amber-600 mb-4">
                <mistake.icon className="h-6 w-6" />
              </div>

              {/* Content */}
              <h3 className="text-lg font-medium text-slate-900 mb-2">
                {mistake.title}
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {mistake.description}
              </p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <p className="text-slate-600 mb-4">
            No cometas estos errores. Déjate asesorar por profesionales.
          </p>
          <button
            onClick={() => document.getElementById('hero-form')?.scrollIntoView({ behavior: 'smooth' })}
            className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-full font-medium hover:bg-slate-800 transition-colors"
          >
            Hablar con un Asesor
          </button>
        </div>
      </div>
    </section>
  );
};

export default HubVentaMistakes;
