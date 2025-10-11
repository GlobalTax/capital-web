import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatCurrency, normalizeValuationAmount } from '@/shared/utils/format';
import { highlightText } from '@/shared/utils/string';
import { isRecentOperation } from '@/shared/utils/date';
import { Eye } from 'lucide-react';
import OperationDetailsModal from './OperationDetailsModal';

interface Operation {
  id: string;
  company_name: string;
  sector: string;
  valuation_amount: number;
  valuation_currency?: string;
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
  created_at?: string;
}

interface OperationCardProps {
  operation: Operation;
  className?: string;
  searchTerm?: string;
}

const OperationCard: React.FC<OperationCardProps> = ({ operation, className = '', searchTerm }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
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
                loading="lazy"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
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
                {searchTerm ? (
                  <span dangerouslySetInnerHTML={{ __html: highlightText(operation.company_name, searchTerm) }} />
                ) : (
                  operation.company_name
                )}
              </h3>
              <div className="flex items-center gap-1 mt-1">
                {operation.is_featured && (
                  <Badge variant="secondary" className="text-xs">
                    Destacado
                  </Badge>
                )}
                {isRecentOperation(operation.created_at) && (
                  <Badge className="text-xs bg-green-500 hover:bg-green-600">
                    Nuevo
                  </Badge>
                )}
              </div>
            </div>
          </div>
          
          {/* Sector Badge */}
          <Badge variant="outline" className="text-xs w-fit">
            {operation.sector}
          </Badge>
          
          {/* Description */}
          <p className="text-sm text-muted-foreground line-clamp-3">
            {searchTerm ? (
              <span dangerouslySetInnerHTML={{ 
                __html: highlightText(operation.short_description || operation.description, searchTerm) 
              }} />
            ) : (
              operation.short_description || operation.description
            )}
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
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Facturación:</span>
                <span className="font-bold text-green-600">
                  {operation.revenue_amount 
                    ? formatCurrency(normalizeValuationAmount(operation.revenue_amount), operation.valuation_currency || 'EUR')
                    : 'Consultar'
                  }
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">EBITDA:</span>
                <span className="font-medium text-blue-600">
                  {operation.ebitda_amount 
                    ? formatCurrency(normalizeValuationAmount(operation.ebitda_amount), operation.valuation_currency || 'EUR')
                    : 'Consultar'
                  }
                </span>
              </div>
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
          
          {/* Ver Detalles Button */}
          <Button 
            variant="outline" 
            className="w-full mt-4"
            onClick={() => setIsModalOpen(true)}
          >
            <Eye className="mr-2 h-4 w-4" />
            Ver Detalles
          </Button>
        </div>
      </CardContent>
    </Card>
    
    <OperationDetailsModal 
      operation={operation}
      isOpen={isModalOpen}
      onClose={() => setIsModalOpen(false)}
    />
    </>
  );
};

export default OperationCard;