import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, ArrowRight } from 'lucide-react';
import { formatCurrency, normalizeValuationAmount } from '@/shared/utils/format';
import OperationCard from './OperationCard';

interface Operation {
  id: string;
  company_name: string;
  sector: string;
  valuation_amount: number;
  valuation_currency?: string;
  revenue_amount?: number;
  year: number;
  description: string;
  short_description?: string;
  is_featured: boolean;
  is_active: boolean;
  logo_url?: string;
  company_size?: string;
  company_size_employees?: string;
  highlights?: string[];
  deal_type?: string;
  display_locations: string[];
}

interface CurrentOpportunitiesProps {
  displayLocation?: string;
  limit?: number;
  showHeader?: boolean;
  title?: string;
  subtitle?: string;
}

const CurrentOpportunities: React.FC<CurrentOpportunitiesProps> = ({
  displayLocation = 'compra-empresas',
  limit = 6,
  showHeader = true,
  title = "Oportunidades Actuales",
  subtitle = "Descubre las empresas disponibles para adquisición"
}) => {
  const [operations, setOperations] = useState<Operation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  const fetchOperations = async () => {
    try {
      setIsLoading(true);
      
      // Use the list-operations Edge Function
      const { data, error } = await supabase.functions.invoke('list-operations', {
        body: {
          displayLocation,
          limit,
          offset: 0,
          sortBy: 'is_featured'
        }
      });

      if (error) {
        console.error('Error fetching operations via Edge Function:', error);
        setOperations([]);
        setTotalCount(0);
        return;
      }

      setOperations(data.data || []);
      setTotalCount(data.count || 0);

    } catch (error) {
      console.error('Error calling list-operations Edge Function:', error);
      setOperations([]);
      setTotalCount(0);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOperations();
  }, [displayLocation, limit]);

  if (isLoading) {
    return (
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {showHeader && (
            <div className="text-center mb-12">
              <div className="animate-pulse">
                <div className="h-8 bg-muted rounded w-64 mx-auto mb-4"></div>
                <div className="h-4 bg-muted rounded w-96 mx-auto"></div>
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: limit }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                    <div className="h-16 bg-muted rounded"></div>
                    <div className="space-y-2">
                      <div className="h-3 bg-muted rounded"></div>
                      <div className="h-3 bg-muted rounded w-2/3"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {showHeader && (
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              {title}
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              {subtitle}
            </p>
          </div>
        )}

        {operations.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {operations.map((operation) => (
                <OperationCard 
                  key={operation.id} 
                  operation={operation}
                />
              ))}
            </div>

            {/* Stats Summary */}
            {totalCount > limit && (
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-foreground mb-2">
                        Más Oportunidades Disponibles
                      </h3>
                      <p className="text-muted-foreground">
                        Mostrando {operations.length} de {totalCount} oportunidades totales
                      </p>
                    </div>
                    <Button asChild>
                      <a href="/oportunidades">
                        Ver Todas
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Eye className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No hay oportunidades disponibles
              </h3>
              <p className="text-muted-foreground">
                En este momento no hay empresas disponibles para adquisición en esta categoría.
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default CurrentOpportunities;