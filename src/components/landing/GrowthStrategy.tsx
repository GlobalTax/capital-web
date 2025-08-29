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
    <section className="py-20 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-6">
            ¿Por qué Crecer por <span className="text-primary">Adquisiciones</span>?
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Las adquisiciones estratégicas son el camino más eficiente para acelerar el crecimiento, 
            diversificar riesgos y crear valor sostenible en el largo plazo.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {benefits.map((benefit, index) => {
            const IconComponent = benefit.icon;
            return (
              <div 
                key={index}
                className="group p-8 bg-slate-50 rounded-2xl hover:bg-white hover:shadow-xl transition-all duration-300 border border-transparent hover:border-slate-200"
              >
                <div className="mb-6">
                  <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-300">
                    <IconComponent className="w-8 h-8 text-primary" />
                  </div>
                </div>
                
                <h3 className="text-xl font-semibold text-slate-900 mb-4">
                  {benefit.title}
                </h3>
                
                <p className="text-slate-600 leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Stats row */}
        <div className="mt-16 p-8 bg-gradient-to-r from-primary/5 to-blue-50 rounded-2xl">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-slate-900 mb-2">3-5x</div>
              <div className="text-slate-600">Más rápido que crecimiento orgánico</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-slate-900 mb-2">85%</div>
              <div className="text-slate-600">De las empresas del Fortune 500 crecen por M&A</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-slate-900 mb-2">12-18%</div>
              <div className="text-slate-600">ROI promedio en adquisiciones bien ejecutadas</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default GrowthStrategy;