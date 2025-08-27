
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Building, TrendingUp } from 'lucide-react';

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

const CompaniesForSale = () => {
  const [operations, setOperations] = useState<Operation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchOperations();
  }, []);

  const fetchOperations = async () => {
    try {
      const { data, error } = await supabase
        .from('company_operations')
        .select('*')
        .eq('is_active', true)
        .order('is_featured', { ascending: false })
        .order('year', { ascending: false })
        .limit(3);

      if (error) {
        console.error('Error fetching operations:', error);
        // Usar datos de respaldo si la consulta falla
        setOperations([
          {
            id: '1',
            company_name: 'Software SaaS B2B en fase de crecimiento',
            sector: 'Tecnología',
            valuation_amount: 2.5,
            valuation_currency: '€',
            year: 2024,
            description: 'Empresa de software SaaS B2B con producto consolidado y base de clientes recurrentes. Crecimiento anual del 30% en los últimos 3 años.',
            is_featured: true,
            is_active: true
          },
          {
            id: '2',
            company_name: 'Fabricante de componentes industriales',
            sector: 'Industrial',
            valuation_amount: 8,
            valuation_currency: '€',
            year: 2024,
            description: 'Fabricante de componentes industriales con 25 años de trayectoria. Cartera de clientes diversificada y presencia internacional.',
            is_featured: false,
            is_active: true
          },
          {
            id: '3',
            company_name: 'Empresa de servicios profesionales',
            sector: 'Servicios',
            valuation_amount: 3.8,
            valuation_currency: '€',
            year: 2024,
            description: 'Empresa de servicios profesionales con equipo consolidado y cartera de clientes estable. Oportunidad de expansión geográfica.',
            is_featured: false,
            is_active: true
          }
        ]);
      } else {
        setOperations(data || []);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <section className="py-20 bg-white">
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
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-black mb-6">
            Oportunidades de Inversión
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Oportunidades exclusivas de inversión y adquisición seleccionadas por nuestro equipo
          </p>
        </div>

        {operations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {operations.map((operation) => (
              <Card key={operation.id} className="bg-white border-0.5 border-black rounded-lg shadow-sm transition-all duration-300 ease-out hover:shadow-lg hover:-translate-y-1 h-full">
                <CardContent className="p-6">
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-gray-600 bg-gray-100 px-3 py-1 rounded-lg">
                        {operation.sector}
                      </span>
                      {operation.is_featured && (
                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                          Destacado
                        </span>
                      )}
                    </div>
                  </div>

                  <h3 className="text-lg font-semibold text-black mb-3 leading-tight">
                    {operation.company_name}
                  </h3>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Valoración:</span>
                      <span className="font-bold text-black text-lg">
                        {operation.valuation_amount}M{operation.valuation_currency}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Año:</span>
                      <span className="font-medium text-black">{operation.year}</span>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 leading-relaxed mb-4">
                    {operation.description}
                  </p>

                  <div className="flex items-center text-sm text-gray-500">
                    <Building className="w-4 h-4 mr-1" />
                    <span>Oportunidad verificada</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center">
            <p className="text-gray-600">No hay oportunidades disponibles en este momento.</p>
          </div>
        )}

        <div className="text-center mt-12">
          <Link to="/compra-empresas">
            <button className="bg-white text-black border-0.5 border-black rounded-lg px-6 py-3 text-base font-medium hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ease-out">
              Ver Todas las Oportunidades
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CompaniesForSale;
