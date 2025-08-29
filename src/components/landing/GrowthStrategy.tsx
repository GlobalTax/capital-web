import React from 'react';
import { TrendingUp, Shield, Target, DollarSign } from 'lucide-react';

const GrowthStrategy = () => {
  const benefits = [
    {
      icon: TrendingUp,
      title: "Expansión Inmediata",
      description: "Acelera tu crecimiento adquiriendo equipos, clientes y capacidades ya establecidas, evitando años de desarrollo orgánico."
    },
    {
      icon: Target,
      title: "Ventaja Competitiva",
      description: "Consolida tu posición en el mercado, elimina competidores y accede a nuevos segmentos de clientes y geografías."
    },
    {
      icon: Shield,
      title: "Diversificación de Riesgos",
      description: "Reduce la dependencia de un solo negocio distribuyendo riesgos entre múltiples sectores y flujos de ingresos."
    },
    {
      icon: DollarSign,
      title: "Retorno Atractivo",
      description: "Genera valor inmediato a través de sinergias operativas, fiscales y financieras con múltiplos atractivos del mercado."
    }
  ];

  return (
    <section className="py-16 bg-slate-25">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-semibold text-slate-900 mb-4">
            Crecimiento a través de <span className="text-primary">Adquisiciones</span>
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Las adquisiciones estratégicas aceleran el crecimiento, 
            crean ventajas competitivas y diversifican el riesgo empresarial.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {benefits.map((benefit, index) => (
            <div 
              key={index} 
              className="group bg-white p-6 rounded-xl border border-slate-100 hover:border-primary/20 transition-all duration-200"
            >
              <div className="w-10 h-10 bg-primary/5 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/10 transition-colors">
                <benefit.icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">
                {benefit.title}
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>

        {/* Statistics */}
        <div className="bg-white border border-slate-100 rounded-xl p-8">
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-2xl font-semibold text-slate-900 mb-1">5x</div>
              <div className="text-slate-500 text-sm">
                Más rápido que crecimiento orgánico
              </div>
            </div>
            <div>
              <div className="text-2xl font-semibold text-slate-900 mb-1">70%</div>
              <div className="text-slate-500 text-sm">
                Fortune 500 crecen vía M&A
              </div>
            </div>
            <div>
              <div className="text-2xl font-semibold text-slate-900 mb-1">325%</div>
              <div className="text-slate-500 text-sm">
                ROI promedio en adquisiciones
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default GrowthStrategy;