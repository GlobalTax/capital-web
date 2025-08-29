import React from 'react';
import { Eye, Globe, Handshake, HeadphonesIcon } from 'lucide-react';

const WhyChooseUs = () => {
  const advantages = [
    {
      icon: Eye,
      title: "80% Off-Market",
      subtitle: "Acceso Exclusivo",
      description: "La mayoría de nuestras oportunidades no están en el mercado público. Acceso directo a vendedores privados y deals confidenciales antes que la competencia.",
      metrics: "Pipeline exclusivo de +200 empresas"
    },
    {
      icon: Globe,
      title: "Experiencia Multisector",
      subtitle: "Conocimiento Especializado",
      description: "Expertise profundo en tecnología, servicios, distribución, consumo e industria. Entendemos las particularidades y múltiplos de cada sector.",
      metrics: "15+ sectores, 150+ transacciones"
    },
    {
      icon: Handshake,
      title: "Negociación Experta",
      subtitle: "Ahorro Garantizado",
      description: "Nuestro equipo de M&A consigue mejores términos y precios. Experiencia en estructuras complejas, earn-outs y mitigación de riesgos.",
      metrics: "15% ahorro promedio vs. asking price"
    },
    {
      icon: HeadphonesIcon,
      title: "Post-Deal Support",
      subtitle: "Integración Garantizada",
      description: "Acompañamiento completo después del cierre. Soporte en integración operativa, optimización de sinergias y maximización del ROI.",
      metrics: "6 meses de soporte incluido"
    }
  ];

  return (
    <section className="py-20 px-4 bg-slate-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-6">
            ¿Por qué <span className="text-primary">Elegirnos</span>?
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Combinamos acceso exclusivo a oportunidades, experiencia multisectorial 
            y un enfoque integral que va más allá de la transacción.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {advantages.map((advantage, index) => {
            const IconComponent = advantage.icon;
            return (
              <div 
                key={index}
                className="group p-8 bg-white rounded-2xl hover:shadow-xl transition-all duration-300 border border-slate-200 hover:border-primary/20"
              >
                <div className="flex items-start gap-6">
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-300">
                      <IconComponent className="w-8 h-8 text-primary" />
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <div className="mb-4">
                      <h3 className="text-xl font-semibold text-slate-900 mb-1">
                        {advantage.title}
                      </h3>
                      <p className="text-primary font-medium text-sm">
                        {advantage.subtitle}
                      </p>
                    </div>
                    
                    <p className="text-slate-600 leading-relaxed mb-4">
                      {advantage.description}
                    </p>
                    
                    <div className="inline-flex items-center px-4 py-2 bg-slate-50 rounded-lg">
                      <span className="text-sm font-medium text-slate-700">
                        {advantage.metrics}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Additional trust indicators */}
        <div className="mt-16 p-8 bg-white rounded-2xl border border-slate-200">
          <div className="text-center mb-8">
            <h3 className="text-xl font-semibold text-slate-900 mb-2">
              Resultados que Hablan por Sí Solos
            </h3>
            <p className="text-slate-600">
              Nuestro track record demuestra la efectividad de nuestro enfoque
            </p>
          </div>
          
          <div className="grid md:grid-cols-5 gap-8 text-center">
            <div className="space-y-2">
              <div className="text-2xl font-bold text-slate-900">€2.8B</div>
              <div className="text-sm text-slate-600">Transacciones cerradas</div>
            </div>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-slate-900">150+</div>
              <div className="text-sm text-slate-600">Deals completados</div>
            </div>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-slate-900">95%</div>
              <div className="text-sm text-slate-600">Tasa de éxito</div>
            </div>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-slate-900">4.2x</div>
              <div className="text-sm text-slate-600">ROI promedio</div>
            </div>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-slate-900">18</div>
              <div className="text-sm text-slate-600">Años experiencia</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;