import React from 'react';
import { Search, Target, BarChart3, Handshake, Users } from 'lucide-react';

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
    <section className="py-20 px-4 bg-slate-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-6">
            Nuestro <span className="text-primary">Proceso de Adquisición</span>
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto mb-8">
            Un proceso estructurado y probado que maximiza las probabilidades de éxito 
            y minimiza los riesgos en cada adquisición.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center items-center gap-8 text-sm font-medium">
            <div className="flex items-center gap-2 text-slate-600">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              Duración total: 3-6 meses
            </div>
            <div className="flex items-center gap-2 text-green-600">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              95% tasa de éxito
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Connection line */}
          <div className="hidden lg:block absolute top-20 left-20 right-20 h-0.5 bg-slate-300"></div>
          
          <div className="grid lg:grid-cols-5 gap-8">
            {steps.map((step, index) => {
              const IconComponent = step.icon;
              return (
                <div key={index} className="relative">
                  {/* Step number for mobile */}
                  <div className="lg:hidden text-center mb-4">
                    <span className="inline-flex items-center justify-center w-8 h-8 bg-primary text-white rounded-full text-sm font-bold">
                      {index + 1}
                    </span>
                  </div>
                  
                  <div className="text-center">
                    {/* Icon circle */}
                    <div className="relative mx-auto mb-6">
                      <div className={`w-16 h-16 ${step.color} rounded-full flex items-center justify-center shadow-lg relative z-10`}>
                        <IconComponent className="w-8 h-8 text-white" />
                      </div>
                      {/* Step number overlay for desktop */}
                      <div className="hidden lg:block absolute -top-2 -right-2 w-6 h-6 bg-white border-2 border-slate-300 rounded-full flex items-center justify-center text-xs font-bold text-slate-600">
                        {index + 1}
                      </div>
                    </div>
                    
                    <h3 className="text-lg font-semibold text-slate-900 mb-3">
                      {step.title}
                    </h3>
                    
                    <p className="text-slate-600 text-sm leading-relaxed mb-4">
                      {step.description}
                    </p>
                    
                    <div className="inline-flex items-center px-3 py-1 bg-white rounded-full text-xs font-medium text-slate-600 border border-slate-200">
                      {step.duration}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Success metrics */}
        <div className="mt-16 grid md:grid-cols-3 gap-8">
          <div className="text-center p-6 bg-white rounded-2xl shadow-sm border border-slate-200">
            <div className="text-2xl font-bold text-slate-900 mb-2">100%</div>
            <div className="text-slate-600">Transparencia en el proceso</div>
          </div>
          <div className="text-center p-6 bg-white rounded-2xl shadow-sm border border-slate-200">
            <div className="text-2xl font-bold text-slate-900 mb-2">€15M</div>
            <div className="text-slate-600">Ahorro promedio en negociación</div>
          </div>
          <div className="text-center p-6 bg-white rounded-2xl shadow-sm border border-slate-200">
            <div className="text-2xl font-bold text-slate-900 mb-2">24/7</div>
            <div className="text-slate-600">Soporte durante el proceso</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AcquisitionProcess;