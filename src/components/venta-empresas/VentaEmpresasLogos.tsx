
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { formatCurrency } from '@/utils/formatters';

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
}

interface Statistic {
  id: string;
  metric_key: string;
  metric_value: string;
  metric_label: string;
  display_order: number;
  is_active: boolean;
}

const VentaEmpresasLogos = () => {
  const [operations, setOperations] = useState<Operation[]>([]);
  const [statistics, setStatistics] = useState<Statistic[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch operations
      const { data: operationsData, error: operationsError } = await supabase
        .from('company_operations')
        .select('*')
        .eq('is_active', true)
        .order('is_featured', { ascending: false })
        .order('year', { ascending: false })
        .limit(8);

      if (operationsError) {
        console.error('Error fetching operations:', operationsError);
      } else {
        setOperations(operationsData || []);
      }

      // Fetch statistics
      const { data: statisticsData, error: statisticsError } = await supabase
        .from('key_statistics')
        .select('*')
        .eq('is_active', true)
        .order('display_order');

      if (statisticsError) {
        console.error('Error fetching statistics:', statisticsError);
      } else {
        setStatistics(statisticsData || []);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-64 mx-auto mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-96 mx-auto"></div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-black mb-6">
            Operaciones Realizadas
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Estas son algunas de las empresas que hemos ayudado a vender exitosamente 
            en los últimos años, obteniendo los mejores resultados para nuestros clientes.
          </p>
        </div>

        {operations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {operations.map((operacion) => (
              <div key={operacion.id} className={`bg-white border border-gray-300 rounded-lg shadow-sm p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ease-out text-center group ${operacion.is_featured ? 'ring-2 ring-black' : ''}`}>
                {/* Logo placeholder */}
                <div className="bg-gray-100 border border-gray-300 rounded-lg h-20 flex items-center justify-center mb-6 group-hover:bg-gray-50 transition-colors duration-300">
                  <span className="text-gray-500 font-bold text-lg">
                    {operacion.company_name.split(' ').map(word => word[0]).join('')}
                  </span>
                </div>
                
                <h3 className="text-base font-bold text-black mb-2">
                  {operacion.company_name}
                </h3>
                
                <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                  {operacion.description}
                </p>
                
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Sector:</span>
                    <span className="font-medium text-black">{operacion.sector}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Valoración:</span>
                    <span className="font-bold text-green-600">{formatCurrency(operacion.valuation_amount * 1000000, operacion.valuation_currency || 'EUR')}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Año:</span>
                    <span className="font-medium text-black">{operacion.year}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center mb-16">
            <p className="text-gray-600">No hay operaciones disponibles en este momento.</p>
          </div>
        )}

        <div className="bg-white border border-gray-300 rounded-lg shadow-sm p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ease-out max-w-4xl mx-auto">
          {statistics.length > 0 ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
              {statistics.slice(0, 4).map((stat) => (
                <div key={stat.id}>
                  <div className="text-3xl font-bold text-black mb-2">{stat.metric_value}</div>
                  <div className="text-gray-600">{stat.metric_label}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-3xl font-bold text-black mb-2">200+</div>
                <div className="text-gray-600">Operaciones</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-black mb-2">€2.5B</div>
                <div className="text-gray-600">Valor Total</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-black mb-2">15</div>
                <div className="text-gray-600">Años Experiencia</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-black mb-2">85%</div>
                <div className="text-gray-600">Tasa Éxito</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default VentaEmpresasLogos;
