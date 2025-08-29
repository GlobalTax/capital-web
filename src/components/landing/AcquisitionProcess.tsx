import React from 'react';
import { Search, Target, BarChart3, Handshake, Users, Clock } from 'lucide-react';

const AcquisitionProcess = () => {
  const steps = [
    {
      icon: Search,
      title: "Definir Criterios",
      description: "Identificamos sectores, tamaños y perfiles de empresas objetivo alineados con tu estrategia",
      duration: "1-2 semanas",
      color: "bg-blue-500"
    },
    {
      icon: Target,
      title: "Identificación de Targets",
      description: "Deal sourcing exclusivo y acceso a nuestro pipeline off-market de oportunidades",
      duration: "4-8 semanas",
      color: "bg-green-500"
    },
    {
      icon: BarChart3,
      title: "Análisis y Valoración",
      description: "Due diligence financiera, comercial y legal. Modelado de sinergias y valoración",
      duration: "4-6 semanas",
      color: "bg-purple-500"
    },
    {
      icon: Handshake,
      title: "Negociación & Cierre",
      description: "Estructuración del deal, negociación de términos y acompañamiento hasta el cierre",
      duration: "6-12 semanas",
      color: "bg-orange-500"
    },
    {
      icon: Users,
      title: "Integración Post-Deal",
      description: "Soporte en la integración operativa, cultural y de sistemas para maximizar sinergias",
      duration: "0-6 meses",
      color: "bg-red-500"
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-semibold text-slate-900 mb-4">
            Proceso de <span className="text-primary">Adquisición</span>
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Metodología probada que garantiza transparencia, eficiencia y 
            resultados óptimos en cada transacción.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              {/* Step number */}
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                  {index + 1}
                </div>
              </div>
              
              {/* Content */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <step.icon className="w-4 h-4 text-primary" />
                  <h3 className="font-semibold text-slate-900">
                    {step.title}
                  </h3>
                </div>
                
                <p className="text-slate-600 text-sm leading-relaxed">
                  {step.description}
                </p>
                
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Clock className="w-3 h-3" />
                  {step.duration}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Process summary */}
        <div className="bg-slate-25 border border-slate-100 rounded-xl p-8">
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-xl font-semibold text-slate-900 mb-1">100%</div>
              <div className="text-slate-500 text-sm">Transparencia en el proceso</div>
            </div>
            <div>
              <div className="text-xl font-semibold text-slate-900 mb-1">15%</div>
              <div className="text-slate-500 text-sm">Ahorro promedio en costes</div>
            </div>
            <div>
              <div className="text-xl font-semibold text-slate-900 mb-1">24/7</div>
              <div className="text-slate-500 text-sm">Soporte durante el proceso</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AcquisitionProcess;