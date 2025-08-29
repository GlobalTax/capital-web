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
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-semibold text-slate-900 mb-4">
            Casos de <span className="text-primary">Éxito</span>
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Descubre cómo hemos ayudado a conseguir 
            adquisiciones exitosas y crear valor sostenible.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-12">
          {stories.map((story, index) => (
            <div key={index} className="group">
              <div className="bg-primary/5 p-6 rounded-xl mb-4 hover:bg-primary/10 transition-colors duration-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-white/60 rounded-lg flex items-center justify-center">
                    <story.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">{story.sector}</h3>
                    <p className="text-slate-600 text-sm">{story.title}</p>
                  </div>
                </div>
                
                <div className="text-center p-3 bg-white/60 rounded-lg mb-4">
                  <div className="text-xl font-semibold text-primary">{story.highlight}</div>
                  <div className="text-slate-600 text-sm">Resultado principal</div>
                </div>
              </div>
              
              <div className="bg-slate-25 border border-slate-100 p-6 rounded-xl">
                <p className="text-slate-600 mb-4 text-sm leading-relaxed">
                  {story.description}
                </p>
                
                <div className="grid grid-cols-2 gap-3">
                  {story.results.map((result, idx) => (
                    <div key={idx} className="text-center p-2 bg-white border border-slate-100 rounded-lg">
                      <div className="font-semibold text-slate-900 text-sm">{result.value}</div>
                      <div className="text-xs text-slate-500">{result.metric}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Overall impact */}
        <div className="bg-slate-25 border border-slate-100 rounded-xl p-8">
          <div className="text-center mb-6">
            <h3 className="text-xl font-semibold text-slate-900 mb-2">
              Nuestro Impacto Global
            </h3>
            <p className="text-slate-500 text-sm">
              El valor agregado a través de nuestras intervenciones estratégicas
            </p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-2xl font-semibold text-slate-900 mb-1">€180M</div>
              <div className="text-slate-500 text-sm">Valor creado</div>
            </div>
            <div>
              <div className="text-2xl font-semibold text-slate-900 mb-1">2,450</div>
              <div className="text-slate-500 text-sm">Empleos preservados</div>
            </div>
            <div>
              <div className="text-2xl font-semibold text-slate-900 mb-1">47</div>
              <div className="text-slate-500 text-sm">Integraciones exitosas</div>
            </div>
            <div>
              <div className="text-2xl font-semibold text-slate-900 mb-1">285%</div>
              <div className="text-slate-500 text-sm">ROI promedio</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SuccessStories;