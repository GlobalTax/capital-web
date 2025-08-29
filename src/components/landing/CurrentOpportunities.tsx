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
    <section id="opportunities" className="py-16 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-semibold text-slate-900 mb-4">
            Oportunidades <span className="text-primary">Actuales</span>
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-6">
            Descubre nuestro pipeline exclusivo de empresas en venta, 
            seleccionadas por su potencial de crecimiento.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 text-sm">
            <div className="flex items-center gap-2 text-green-600">
              <Clock className="w-4 h-4" />
              Actualizado hoy
            </div>
            <div className="flex items-center gap-2 text-slate-500">
              <TrendingUp className="w-4 h-4" />
              Portfolio: +€180M
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-12">
          {opportunities.map((opp, index) => (
            <div 
              key={index}
              className="group p-6 border border-slate-100 rounded-xl hover:border-primary/20 transition-all duration-200"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    {opp.sector}
                  </h3>
                  <div className="flex items-center gap-3">
                    <span className="text-xl font-semibold text-primary">
                      {opp.valuation}
                    </span>
                    <span className="text-slate-500 text-sm">
                      {opp.multiple}
                    </span>
                  </div>
                </div>
                <div className="px-2 py-1 bg-green-50 text-green-600 rounded text-sm font-medium">
                  {opp.growth}
                </div>
              </div>
              
              <p className="text-slate-600 mb-4 leading-relaxed text-sm">
                {opp.description}
              </p>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {opp.highlights.map((highlight, idx) => (
                  <span 
                    key={idx}
                    className="px-2 py-1 bg-slate-50 text-slate-600 rounded text-xs border border-slate-100"
                  >
                    {highlight}
                  </span>
                ))}
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">Información disponible</span>
                <ExternalLink className="w-4 h-4 text-slate-300 group-hover:text-primary transition-colors" />
              </div>
            </div>
          ))}
        </div>

        {/* Summary stats */}
        <div className="bg-slate-25 border border-slate-100 rounded-xl p-8">
          <div className="grid md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-xl font-semibold text-slate-900 mb-1">47</div>
              <div className="text-slate-500 text-sm">Oportunidades activas</div>
            </div>
            <div>
              <div className="text-xl font-semibold text-slate-900 mb-1">€5-25M</div>
              <div className="text-slate-500 text-sm">Rango de valoración</div>
            </div>
            <div>
              <div className="text-xl font-semibold text-slate-900 mb-1">6.8x</div>
              <div className="text-slate-500 text-sm">Múltiplo EBITDA promedio</div>
            </div>
            <div>
              <div className="text-xl font-semibold text-slate-900 mb-1">80%</div>
              <div className="text-slate-500 text-sm">Deals off-market</div>
            </div>
          </div>
          
          <div className="text-center mt-6">
            <InteractiveHoverButton
              text="Ver Todas las Oportunidades"
              variant="primary"
              size="lg"
              className="bg-primary text-white hover:bg-primary/90"
              onClick={() => window.location.href = '/oportunidades'}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default CurrentOpportunities;