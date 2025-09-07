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
    <section className="py-16 bg-slate-25">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-semibold text-slate-900 mb-4">
            Por qué elegir <span className="text-primary">Capittal</span>
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Combinamos experiencia, metodología probada y enfoque personalizado 
            para maximizar el valor en cada transacción.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {advantages.map((advantage, index) => (
            <div key={index} className="group">
              <div className="bg-white p-6 rounded-xl border border-slate-100 hover:border-primary/20 transition-all duration-200 h-full">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/5 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-primary/10 transition-colors">
                    <advantage.icon className="w-6 h-6 text-primary" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold text-slate-900 mb-1">
                        {advantage.title}
                      </h3>
                      <p className="text-primary text-sm">
                        {advantage.subtitle}
                      </p>
                    </div>
                    
                    <p className="text-slate-600 text-sm leading-relaxed mb-4">
                      {advantage.description}
                    </p>
                    
                    <div className="px-3 py-1 bg-slate-50 border border-slate-100 rounded-lg text-xs text-slate-600">
                      {advantage.metrics}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Results section */}
        <div className="text-center mb-8">
          <h3 className="text-2xl font-semibold text-slate-900 mb-2">
            Nuestros Resultados Hablan
          </h3>
          <p className="text-slate-600 max-w-xl mx-auto">
            Más de una década creando valor y cerrando operaciones exitosas
          </p>
        </div>

        <div className="bg-white border border-slate-100 rounded-xl p-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 text-center">
            <div>
              <div className="text-xl font-semibold text-slate-900 mb-1">47</div>
              <div className="text-slate-500 text-sm">Transacciones</div>
            </div>
            <div>
              <div className="text-xl font-semibold text-slate-900 mb-1">23</div>
              <div className="text-slate-500 text-sm">Deals completados</div>
            </div>
            <div>
              <div className="text-xl font-semibold text-slate-900 mb-1">98,7%</div>
              <div className="text-slate-500 text-sm">Tasa de éxito</div>
            </div>
            <div>
              <div className="text-xl font-semibold text-slate-900 mb-1">285%</div>
              <div className="text-slate-500 text-sm">ROI promedio</div>
            </div>
            <div>
              <div className="text-xl font-semibold text-slate-900 mb-1">12</div>
              <div className="text-slate-500 text-sm">Años experiencia</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;