import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Star, Sparkles, TrendingUp } from 'lucide-react';
import { formatCompactCurrency } from '@/shared/utils/format';
import { isRecentOperation } from '@/shared/utils/date';

interface Operation {
  id: string;
  company_name: string;
  sector: string;
  valuation_amount: number;
  valuation_currency: string;
  revenue_amount?: number;
  ebitda_amount?: number;
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
  created_at?: string;
}

interface EnhancedOperationsMobileViewProps {
  operations: Operation[];
  onViewDetails: (operation: Operation) => void;
  isLoading?: boolean;
}

export const EnhancedOperationsMobileView: React.FC<EnhancedOperationsMobileViewProps> = ({
  operations,
  onViewDetails,
  isLoading,
}) => {

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-muted-foreground">Cargando operaciones...</span>
        </div>
      </div>
    );
  }

  if (operations.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No se encontraron operaciones
      </div>
    );
  }

  return (
    <div className="w-full space-y-3">
      {operations.map((operation) => (
        <Card key={operation.id} className="overflow-hidden hover:shadow-md transition-shadow w-full">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              {/* Logo/Avatar */}
              <div className="flex-shrink-0">
                {operation.logo_url && (
                  <img 
                    src={operation.logo_url} 
                    alt={operation.company_name}
                    className="w-14 h-14 rounded-lg object-contain bg-muted p-2"
                  />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="mb-2">
                  <h3 className="font-semibold text-base text-foreground mb-1">
                    {operation.company_name}
                  </h3>
                  <div className="flex items-center gap-1 flex-wrap">
                    <Badge variant="outline" className="text-xs">
                      {operation.sector}
                    </Badge>
                    {operation.is_featured && (
                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 text-xs gap-1">
                        <Star className="h-3 w-3" />
                        Destacada
                      </Badge>
                    )}
                    {isRecentOperation(operation.created_at) && (
                      <Badge className="bg-green-500 text-xs gap-1">
                        <Sparkles className="h-3 w-3" />
                        Nueva
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Financial Info */}
                <div className="grid grid-cols-2 gap-3 my-3 pb-3 border-b">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Facturación</p>
                    <p className="font-semibold text-sm text-green-600">
                      {operation.revenue_amount 
                        ? formatCompactCurrency(operation.revenue_amount, operation.valuation_currency)
                        : <span className="text-muted-foreground text-xs">Consultar</span>
                      }
                    </p>
                  </div>
                  {operation.ebitda_amount && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">EBITDA</p>
                      <p className="font-semibold text-sm text-blue-600">
                        {formatCompactCurrency(operation.ebitda_amount, operation.valuation_currency)}
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Año</p>
                    <p className="font-medium text-sm">{operation.year}</p>
                  </div>
                </div>

                {/* Action Button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onViewDetails(operation)}
                  className="w-full gap-2"
                >
                  <Eye className="h-4 w-4" />
                  Ver detalles completos
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
