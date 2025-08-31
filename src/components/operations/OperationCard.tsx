import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, Users, MapPin, ExternalLink } from 'lucide-react';
import { formatCurrency, formatNumber } from '@/utils/formatters';

interface OperationCardProps {
  operation: {
    id: string;
    company_name: string;
    sector: string;
    valuation_amount: number;
    valuation_currency?: string;
    year: number;
    description: string;
    short_description?: string;
    is_featured: boolean;
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
  };
  className?: string;
  style?: React.CSSProperties;
}

export const OperationCard: React.FC<OperationCardProps> = ({ operation, className = "", style }) => {
  console.log('🏗️ OperationCard - Rendering with operation:', operation);
  console.log('💰 OperationCard - Currency data:', {
    valuation_currency: operation.valuation_currency,
    valuation_amount: operation.valuation_amount
  });
  const displayDescription = operation.short_description || operation.description.substring(0, 120) + '...';
  
  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'in_process': return 'bg-yellow-100 text-yellow-800';
      case 'sold': return 'bg-gray-100 text-gray-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const getDealTypeLabel = (dealType?: string) => {
    switch (dealType) {
      case 'acquisition': return 'Adquisición';
      case 'sale': return 'Venta';
      default: return 'Oportunidad';
    }
  };

  console.log('🎨 OperationCard - About to render card for:', operation.company_name);
  
  return (
    <Card className={`group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 ${className}`} style={style}>
      <div className="p-6">
        {/* Header with status and deal type */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {operation.is_featured && (
              <Badge variant="secondary" className="bg-primary/10 text-primary">
                Destacado
              </Badge>
            )}
            <Badge className={getStatusColor(operation.status)}>
              {operation.status === 'available' ? 'Disponible' : operation.status}
            </Badge>
          </div>
          <span className="text-sm text-muted-foreground font-medium">
            {getDealTypeLabel(operation.deal_type)}
          </span>
        </div>

        {/* Main content layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column - Company info */}
          <div className="lg:col-span-2">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-1">
                  {operation.company_name}
                </h3>
                <p className="text-muted-foreground font-medium">
                  {operation.sector}
                </p>
              </div>
              {operation.company_size_employees && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  {operation.company_size_employees} empleados
                </div>
              )}
            </div>

            <p className="text-muted-foreground mb-4 leading-relaxed">
              {displayDescription}
            </p>

            {/* Highlights */}
            {operation.highlights && operation.highlights.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {operation.highlights.slice(0, 3).map((highlight, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {highlight}
                  </Badge>
                ))}
              </div>
            )}

            {/* Financial metrics */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              {operation.ebitda_multiple && (
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <div className="text-lg font-semibold text-foreground">
                    {operation.ebitda_multiple}x
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Múltiplo EBITDA
                  </div>
                </div>
              )}
              {operation.growth_percentage && (
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-center gap-1 text-lg font-semibold text-green-600">
                    <TrendingUp className="h-4 w-4" />
                    +{operation.growth_percentage}%
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Crecimiento anual
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right column - Financial data and CTA */}
          <div className="lg:col-span-1 flex flex-col justify-between">
            <div className="text-center lg:text-right mb-4">
              {operation.revenue_amount ? (
                <>
                  <div className="text-3xl font-bold text-primary mb-1">
                    {formatCurrency(operation.revenue_amount, operation.valuation_currency || 'EUR')}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Facturación {operation.year}
                  </div>
                  {operation.ebitda_amount && (
                    <div className="mt-2">
                      <div className="text-lg font-semibold text-foreground">
                        {formatCurrency(operation.ebitda_amount, operation.valuation_currency || 'EUR')}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        EBITDA {operation.year}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="text-2xl font-bold text-primary mb-1">
                    Información disponible
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Datos financieros bajo solicitud
                  </div>
                </>
              )}
            </div>

            <div className="space-y-3">
              <Button 
                variant="default" 
                className="w-full group/btn"
                size="lg"
              >
                <span>Información disponible</span>
                <ExternalLink className="h-4 w-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
              </Button>
              
              <div className="text-center">
                <span className="text-xs text-muted-foreground">
                  Ref: OP-{operation.year}-{operation.id.slice(-4).toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default OperationCard;