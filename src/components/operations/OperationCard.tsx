import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, normalizeValuationAmount } from '@/utils/formatters';

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
}

interface OperationCardProps {
  operation: Operation;
  className?: string;
}

const OperationCard: React.FC<OperationCardProps> = ({ operation, className = '' }) => {
  return (
    <Card className={`hover:shadow-lg transition-shadow ${className} ${operation.is_featured ? 'ring-2 ring-primary' : ''}`}>
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Logo/Company Initial */}
          <div className="flex items-center space-x-3">
            {operation.logo_url ? (
              <img 
                src={operation.logo_url} 
                alt={`${operation.company_name} logo`}
                className="w-12 h-12 rounded-lg object-contain bg-gray-50 p-2"
              />
            ) : (
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <span className="text-primary font-bold text-lg">
                  {operation.company_name.split(' ').map(word => word[0]).join('')}
                </span>
              </div>
            )}
            
            <div className="flex-1">
              <h3 className="font-semibold text-lg line-clamp-1">
                {operation.company_name}
              </h3>
              {operation.is_featured && (
                <Badge variant="secondary" className="text-xs mt-1">
                  Destacado
                </Badge>
              )}
            </div>
          </div>
          
          {/* Sector Badge */}
          <Badge variant="outline" className="text-xs w-fit">
            {operation.sector}
          </Badge>
          
          {/* Description */}
          <p className="text-sm text-muted-foreground line-clamp-3">
            {operation.short_description || operation.description}
          </p>
          
          {/* Highlights */}
          {operation.highlights && operation.highlights.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {operation.highlights.slice(0, 2).map((highlight, index) => (
                <span 
                  key={index}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"
                >
                  {highlight}
                </span>
              ))}
            </div>
          )}
          
          {/* Details */}
          <div className="space-y-3 pt-4 border-t">
            {/* Financial Information */}
            <div className="space-y-2">
              {operation.revenue_amount ? (
                <>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Facturación:</span>
                    <span className="font-bold text-green-600">
                      {formatCurrency(normalizeValuationAmount(operation.revenue_amount), operation.valuation_currency || 'EUR')}
                    </span>
                  </div>
                  {operation.valuation_amount && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Valoración:</span>
                      <span className="font-medium text-blue-600">
                        {formatCurrency(normalizeValuationAmount(operation.valuation_amount), operation.valuation_currency || 'EUR')}
                      </span>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Valoración:</span>
                  <span className="font-bold text-green-600">
                    {formatCurrency(normalizeValuationAmount(operation.valuation_amount), operation.valuation_currency || 'EUR')}
                  </span>
                </div>
              )}
            </div>
            
            {/* Year and Company Size */}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-4">
                <div>
                  <span className="text-muted-foreground">Año: </span>
                  <span className="font-medium">{operation.year}</span>
                </div>
                {operation.deal_type && (
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    operation.deal_type === 'sale' 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-orange-100 text-orange-800'
                  }`}>
                    {operation.deal_type === 'sale' ? 'Venta' : 'Adquisición'}
                  </div>
                )}
              </div>
              {(operation.company_size_employees || operation.company_size) && (
                <div>
                  <span className="text-muted-foreground">Empleados: </span>
                  <span className="font-medium">{operation.company_size_employees || operation.company_size}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default OperationCard;