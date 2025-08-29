import React from 'react';
import { ExternalLink, Clock, TrendingUp } from 'lucide-react';
import { InteractiveHoverButton } from '@/components/ui/interactive-hover-button';

const CurrentOpportunities = () => {
  const opportunities = [
    {
      sector: "Servicios B2B",
      valuation: "5.2M€",
      multiple: "4.8x EBITDA",
      description: "Consultoría especializada con cartera estable de clientes corporativos y margen recurrente del 35%",
      highlights: ["15 años operando", "Equipo de 45 personas", "Contratos plurianuales"],
      growth: "+18%"
    },
    {
      sector: "Tecnología SaaS",
      valuation: "12M€",
      multiple: "8.5x EBITDA",
      description: "Plataforma B2B con 2,500+ clientes activos, ARR de €1.8M y churn rate inferior al 5%",
      highlights: ["MRR creciente", "85% margen bruto", "API escalable"],
      growth: "+45%"
    },
    {
      sector: "Distribución Regional",
      valuation: "8.5M€",
      multiple: "6.2x EBITDA",
      description: "Red de distribución consolidada con acuerdos exclusivos y cobertura en 3 CCAA",
      highlights: ["25 años en mercado", "Red logística propia", "Exclusivas marcas"],
      growth: "+12%"
    },
    {
      sector: "Consumo & Retail",
      valuation: "10M€",
      multiple: "7.1x EBITDA",
      description: "Cadena especializada con 12 puntos de venta y marca reconocida en nicho premium",
      highlights: ["Ubicaciones prime", "Marca registrada", "Margen alto"],
      growth: "+22%"
    }
  ];

  return (
    <section id="opportunities" className="py-20 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-6">
            Oportunidades <span className="text-primary">Actuales</span>
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto mb-8">
            Descubre nuestro pipeline exclusivo de empresas en venta, 
            seleccionadas por su potencial de crecimiento y sinergias estratégicas.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center items-center gap-6 text-sm">
            <div className="flex items-center gap-2 text-green-600 font-medium">
              <Clock className="w-4 h-4" />
              Actualizado hoy
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <TrendingUp className="w-4 h-4" />
              Portfolio gestionado: +€180M
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {opportunities.map((opp, index) => (
            <div 
              key={index}
              className="group p-8 bg-slate-50 rounded-2xl hover:bg-white hover:shadow-xl transition-all duration-300 border border-transparent hover:border-slate-200"
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">
                    {opp.sector}
                  </h3>
                  <div className="flex items-center gap-4 mb-2">
                    <span className="text-2xl font-bold text-primary">
                      {opp.valuation}
                    </span>
                    <span className="text-slate-600 text-sm">
                      {opp.multiple}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                  <TrendingUp className="w-3 h-3" />
                  {opp.growth}
                </div>
              </div>
              
              <p className="text-slate-600 mb-6 leading-relaxed">
                {opp.description}
              </p>
              
              <div className="flex flex-wrap gap-2 mb-6">
                {opp.highlights.map((highlight, idx) => (
                  <span 
                    key={idx}
                    className="px-3 py-1 bg-white text-slate-600 rounded-lg text-xs border border-slate-200"
                  >
                    {highlight}
                  </span>
                ))}
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">Más información disponible</span>
                <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-primary transition-colors" />
              </div>
            </div>
          ))}
        </div>

        {/* Summary stats */}
        <div className="bg-gradient-to-r from-primary/5 to-blue-50 rounded-2xl p-8">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-2xl font-bold text-slate-900 mb-2">47</div>
              <div className="text-slate-600 text-sm">Oportunidades activas</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900 mb-2">€5-25M</div>
              <div className="text-slate-600 text-sm">Rango de valoración</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900 mb-2">6.8x</div>
              <div className="text-slate-600 text-sm">Múltiplo EBITDA promedio</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900 mb-2">80%</div>
              <div className="text-slate-600 text-sm">Deals off-market</div>
            </div>
          </div>
          
          <div className="text-center mt-8">
            <InteractiveHoverButton
              text="Ver Todas las Oportunidades"
              variant="primary"
              size="lg"
              className="bg-primary text-white hover:bg-primary/90"
              onClick={() => document.getElementById('contact-form')?.scrollIntoView({ behavior: 'smooth' })}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default CurrentOpportunities;