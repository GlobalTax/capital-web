import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Building, Euro, ExternalLink, TrendingUp } from 'lucide-react';

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

const OperationsTeaser = () => {
  const [operations, setOperations] = useState<Operation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedOperations();
  }, []);

  const fetchFeaturedOperations = async () => {
    try {
      const { data, error } = await supabase
        .from('company_operations')
        .select('*')
        .eq('is_active', true)
        .eq('is_featured', true)
        .order('valuation_amount', { ascending: false })
        .limit(3);

      if (error) {
        console.error('Error fetching operations:', error);
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
      <div className="space-y-6">
        <div className="text-center mb-8">
          <div className="h-8 bg-gray-200 rounded w-64 mx-auto mb-4 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-96 mx-auto animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-gray-200 h-64 rounded-lg animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  if (operations.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-gradient-to-br from-primary/5 to-secondary/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Empresas Destacadas en Venta
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Descubre oportunidades exclusivas de adquisición en nuestro marketplace especializado
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {operations.map((operation) => (
            <Card key={operation.id} className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <Badge variant="secondary" className="rounded-lg">
                    {operation.sector}
                  </Badge>
                  <Building className="w-5 h-5 text-primary" />
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  {operation.company_name}
                </h3>
                
                <p className="text-gray-600 mb-4 text-sm line-clamp-2">
                  {operation.description}
                </p>

                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-gray-600 flex items-center">
                    <Euro className="w-4 h-4 mr-1" />
                    Valoración:
                  </span>
                  <span className="text-lg font-bold text-primary">
                    {operation.valuation_amount}M{operation.valuation_currency}
                  </span>
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <a
                    href={`https://capittalmarket.com/operacion/${operation.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <Button variant="outline" className="w-full hover:bg-primary hover:text-white transition-colors">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Ver en Marketplace
                    </Button>
                  </a>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA para ir al marketplace completo */}
        <div className="text-center">
          <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-200 max-w-2xl mx-auto">
            <TrendingUp className="w-12 h-12 text-primary mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              ¿Buscas más oportunidades?
            </h3>
            <p className="text-gray-600 mb-6">
              Explora nuestro marketplace completo con más de 40 empresas disponibles
              y acceso a oportunidades off-market exclusivas.
            </p>
            <a
              href="https://capittalmarket.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button size="lg" className="px-8">
                <ExternalLink className="w-5 h-5 mr-2" />
                Visitar Capittal Market
              </Button>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default OperationsTeaser;