import React from 'react';
import { TrendingUp, Users, Globe, Award } from 'lucide-react';

const SuccessStories = () => {
  const stories = [
    {
      icon: TrendingUp,
      sector: "SaaS B2B",
      title: "Consolidación Tecnológica",
      description: "Adquisición de startup SaaS por grupo tecnológico consolidado. Integración de equipos y ampliación de producto.",
      results: [
        { label: "ROI primer año", value: "25%" },
        { label: "Crecimiento ARR", value: "+40%" },
        { label: "Tiempo integración", value: "4 meses" }
      ],
      highlight: "ROI 25% primer año",
      color: "bg-blue-500"
    },
    {
      icon: Users,
      sector: "Distribución Regional",
      title: "Expansión Geográfica",
      description: "Grupo distribuidor adquiere competidor regional para consolidar mercado y optimizar red logística.",
      results: [
        { label: "Sinergias anuales", value: "+€2M" },
        { label: "Reducción costes", value: "18%" },
        { label: "Nuevos mercados", value: "3 CCAA" }
      ],
      highlight: "+€2M en sinergias",
      color: "bg-green-500"
    },
    {
      icon: Globe,
      sector: "Servicios Profesionales",
      title: "Diversificación de Servicios",
      description: "Firma de consultoría adquiere boutique especializada para ampliar cartera de servicios y clientela.",
      results: [
        { label: "Nuevos mercados", value: "5 países" },
        { label: "Crecimiento facturación", value: "+65%" },
        { label: "Retención talento", value: "95%" }
      ],
      highlight: "Expansión a 5 mercados",
      color: "bg-purple-500"
    }
  ];

  return (
    <section className="py-20 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-6">
            Casos de <span className="text-primary">Éxito</span>
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Descubre cómo hemos ayudado a nuestros clientes a crear valor 
            a través de adquisiciones estratégicas exitosas.
          </p>
        </div>

        <div className="space-y-8">
          {stories.map((story, index) => {
            const IconComponent = story.icon;
            return (
              <div 
                key={index}
                className="group p-8 bg-slate-50 rounded-2xl hover:bg-white hover:shadow-xl transition-all duration-300 border border-transparent hover:border-slate-200"
              >
                <div className="grid lg:grid-cols-3 gap-8 items-center">
                  {/* Left - Icon and Title */}
                  <div className="flex items-center gap-6">
                    <div className={`w-16 h-16 ${story.color} rounded-2xl flex items-center justify-center shadow-lg`}>
                      <IconComponent className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-slate-500 mb-1">
                        {story.sector}
                      </div>
                      <h3 className="text-xl font-semibold text-slate-900 mb-2">
                        {story.title}
                      </h3>
                      <div className="inline-flex items-center px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                        <Award className="w-3 h-3 mr-1" />
                        {story.highlight}
                      </div>
                    </div>
                  </div>

                  {/* Center - Description */}
                  <div>
                    <p className="text-slate-600 leading-relaxed">
                      {story.description}
                    </p>
                  </div>

                  {/* Right - Results */}
                  <div className="grid grid-cols-1 gap-4">
                    {story.results.map((result, idx) => (
                      <div key={idx} className="flex justify-between items-center p-3 bg-white rounded-lg border border-slate-200">
                        <span className="text-sm text-slate-600">{result.label}</span>
                        <span className="font-semibold text-slate-900">{result.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary metrics */}
        <div className="mt-16 p-8 bg-gradient-to-r from-primary/5 to-blue-50 rounded-2xl">
          <div className="text-center mb-8">
            <h3 className="text-xl font-semibold text-slate-900 mb-2">
              Impacto Agregado de Nuestras Transacciones
            </h3>
            <p className="text-slate-600">
              Resultados acumulados de las últimas 50 adquisiciones gestionadas
            </p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-slate-900 mb-2">€180M+</div>
              <div className="text-slate-600">Valor creado</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-slate-900 mb-2">1,200+</div>
              <div className="text-slate-600">Empleos preservados</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-slate-900 mb-2">95%</div>
              <div className="text-slate-600">Integraciones exitosas</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-slate-900 mb-2">4.2x</div>
              <div className="text-slate-600">ROI promedio</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SuccessStories;