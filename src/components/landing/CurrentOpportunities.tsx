import React, { useState, useEffect } from 'react';
import { ExternalLink, Clock, TrendingUp } from 'lucide-react';
import { InteractiveHoverButton } from '@/components/ui/interactive-hover-button';
import { supabase } from '@/integrations/supabase/client';

interface Operation {
  id: string;
  company_name: string;
  sector: string;
  valuation_amount: number;
  valuation_currency: string;
  year: number;
  description: string;
  is_featured: boolean;
  is_active: boolean;
  display_locations: string[];
}

const CurrentOpportunities = () => {
  const [operations, setOperations] = useState<Operation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalOperations: 47,
    avgMultiple: 6.8,
    offMarketDeals: 80
  });

  useEffect(() => {
    fetchOperations();
  }, []);

  const fetchOperations = async () => {
    try {
      const { data, error } = await supabase
        .from('company_operations')
        .select('*')
        .eq('is_active', true)
        .contains('display_locations', ['compra-empresas'])
        .order('is_featured', { ascending: false })
        .order('year', { ascending: false })
        .limit(4);

      if (error) {
        console.error('Error fetching operations:', error);
        // Usar datos de respaldo si la consulta falla
        setOperations([]);
      } else {
        setOperations(data || []);
        
        // Actualizar estadísticas basadas en datos reales
        if (data && data.length > 0) {
          const totalCount = await supabase
            .from('company_operations')
            .select('id', { count: 'exact' })
            .eq('is_active', true);
          
          if (totalCount.count) {
            setStats(prev => ({ ...prev, totalOperations: totalCount.count || 47 }));
          }
        }
      }
    } catch (error) {
      console.error('Error:', error);
      setOperations([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Función para formatear datos de operaciones reales
  const formatOperation = (operation: Operation) => ({
    sector: operation.sector,
    valuation: `${operation.valuation_amount}M${operation.valuation_currency}`,
    multiple: "N/A", // Se podría calcular si tuviéramos EBITDA
    description: operation.description,
    highlights: [`Año ${operation.year}`, operation.is_featured ? "Destacado" : "Verificado", "Información disponible"],
    growth: "N/A" // Se podría agregar este campo a la BD
  });

  const opportunities = operations.length > 0 
    ? operations.map(formatOperation)
    : [
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

  if (isLoading) {
    return (
      <section id="opportunities" className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-80 mx-auto mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-96 mx-auto"></div>
            </div>
          </div>
          <div className="grid lg:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-gray-200 h-64 rounded-xl animate-pulse"></div>
            ))}
          </div>
        </div>
      </section>
    );
  }

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
              <div className="text-xl font-semibold text-slate-900 mb-1">{stats.totalOperations}</div>
              <div className="text-slate-500 text-sm">Oportunidades activas</div>
            </div>
            <div>
              <div className="text-xl font-semibold text-slate-900 mb-1">€5-25M</div>
              <div className="text-slate-500 text-sm">Rango de valoración</div>
            </div>
            <div>
              <div className="text-xl font-semibold text-slate-900 mb-1">{stats.avgMultiple}x</div>
              <div className="text-slate-500 text-sm">Múltiplo EBITDA promedio</div>
            </div>
            <div>
              <div className="text-xl font-semibold text-slate-900 mb-1">{stats.offMarketDeals}%</div>
              <div className="text-slate-500 text-sm">Deals off-market</div>
            </div>
          </div>
          
          <div className="text-center mt-6">
            <InteractiveHoverButton
              text="Ver Todas las Oportunidades"
              variant="primary"
              size="lg"
              className="bg-primary text-white hover:bg-primary/90"
              onClick={() => window.location.href = '/operaciones'}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default CurrentOpportunities;