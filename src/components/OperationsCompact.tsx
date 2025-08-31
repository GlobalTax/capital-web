import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Euro, Building } from 'lucide-react';
import { Link } from 'react-router-dom';
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
}

const OperationsCompact = () => {
  const [operations, setOperations] = useState<Operation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOperations = async () => {
      try {
        const { data } = await supabase
          .from('company_operations')
          .select('*')
          .eq('is_featured', true)
          .eq('is_active', true)
          .order('year', { ascending: false })
          .limit(3);

        setOperations(data || []);
      } catch (error) {
        console.error('Error fetching operations:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOperations();
  }, []);

  if (isLoading) {
    return (
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-80 mx-auto mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-96 mx-auto"></div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-gray-200 h-80 rounded-lg animate-pulse"></div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-black mb-6">
            Operaciones en Curso
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Empresas disponibles para adquisición. Oportunidades exclusivas seleccionadas por nuestro equipo.
          </p>
        </div>

        {operations.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              {operations.map((operation) => (
                <Card key={operation.id} className="bg-white border border-gray-300 rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 ease-out group">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <Badge variant="secondary" className="rounded-lg">
                        {operation.sector}
                      </Badge>
                      <Building className="w-5 h-5 text-blue-500" />
                    </div>
                    
                    <h3 className="text-lg font-semibold text-black mb-3 leading-tight">
                      {operation.company_name}
                    </h3>
                    
                    <p className="text-gray-600 mb-4 leading-relaxed text-sm">
                      {operation.description}
                    </p>

                    <div className="space-y-3 mb-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 flex items-center">
                          <Euro className="w-4 h-4 mr-1" />
                          Valoración:
                        </span>
                        <span className="text-xl font-bold text-black">
                          {formatCurrency(operation.valuation_amount, operation.valuation_currency || 'EUR')}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          Año:
                        </span>
                        <span className="font-medium text-black">{operation.year}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="text-center">
              <Link to="/compra-empresas">
                <Button variant="outline" size="lg" className="border border-gray-300 text-black hover:bg-gray-50">
                  Ver Todas las Oportunidades
                </Button>
              </Link>
            </div>
          </>
        ) : (
          <div className="text-center py-16">
            <p className="text-gray-600 text-lg">No hay operaciones destacadas disponibles en este momento.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default OperationsCompact;