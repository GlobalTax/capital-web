import React, { useState, useEffect } from 'react';
import { ExternalLink, Clock, TrendingUp } from 'lucide-react';
import { InteractiveHoverButton } from '@/components/ui/interactive-hover-button';
import { supabase } from '@/integrations/supabase/client';
import { OperationCard } from '@/components/operations/OperationCard';

interface Operation {
  id: string;
  company_name: string;
  sector: string;
  valuation_amount: number;
  valuation_currency: string;
  year: number;
  description: string;
  short_description?: string;
  is_featured: boolean;
  is_active: boolean;
  display_locations: string[];
  ebitda_multiple?: number;
  growth_percentage?: number;
  revenue_amount?: number;
  ebitda_amount?: number;
  company_size_employees?: string;
  highlights?: string[];
  status?: string;
  deal_type?: string;
  logo_url?: string;
  featured_image_url?: string;
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
        .select(`
          *,
          ebitda_multiple,
          growth_percentage,
          revenue_amount,
          ebitda_amount,
          company_size_employees,
          short_description,
          highlights,
          status,
          deal_type
        `)
        .eq('is_active', true)
        .contains('display_locations', ['compra-empresas'])
        .order('is_featured', { ascending: false })
        .order('year', { ascending: false })
        .limit(3);

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

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-12">
          {operations.length > 0 ? (
            operations.slice(0, 3).map((operation, index) => (
              <OperationCard 
                key={operation.id} 
                operation={operation}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` } as React.CSSProperties}
              />
            ))
          ) : (
            // Placeholder cards using OperationCard format
            Array.from({ length: 3 }).map((_, index) => {
              const placeholderOperation = {
                id: `placeholder-${index}`,
                company_name: index === 0 ? 'Empresa Tecnológica' : index === 1 ? 'Distribuidora Regional' : 'Consultora Especializada',
                sector: index === 0 ? 'Software & Tecnología' : index === 1 ? 'Distribución' : 'Consultoría',
                valuation_amount: index === 0 ? 2800000 : index === 1 ? 1500000 : 950000,
                valuation_currency: 'EUR',
                year: 2024,
                description: index === 0 
                  ? 'Empresa con soluciones tecnológicas innovadoras, crecimiento sostenido y cartera de clientes diversificada en el sector B2B.'
                  : index === 1 
                  ? 'Distribuidora establecida con red comercial consolidada, presencia regional fuerte y oportunidades de expansión.'
                  : 'Consultora especializada con expertise técnico reconocido, clientes recurrentes y potencial de escalabilidad.',
                short_description: index === 0 
                  ? 'Empresa con soluciones tecnológicas innovadoras, crecimiento sostenido y cartera de clientes diversificada.'
                  : index === 1 
                  ? 'Distribuidora establecida con red comercial consolidada y oportunidades de expansión.'
                  : 'Consultora especializada con expertise técnico reconocido y potencial de escalabilidad.',
                is_featured: true,
                ebitda_multiple: index === 0 ? 8.5 : index === 1 ? 6.2 : 7.1,
                growth_percentage: index === 0 ? 35 : index === 1 ? 22 : 28,
                company_size_employees: index === 0 ? '25-50' : index === 1 ? '10-25' : '5-10',
                highlights: index === 0 
                  ? ['SaaS', 'B2B', 'Escalable']
                  : index === 1 
                  ? ['Red establecida', 'Crecimiento', 'Regional']
                  : ['Especialización', 'Recurrente', 'Expertise'],
                status: 'available',
                deal_type: 'sale'
              };
              
              return (
                <OperationCard
                  key={placeholderOperation.id}
                  operation={placeholderOperation}
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` } as React.CSSProperties}
                />
              );
            })
          )}
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