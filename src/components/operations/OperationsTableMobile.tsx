import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Building2, Calendar, TrendingUp, Eye, Star, Sparkles, MoreVertical } from 'lucide-react';
import { formatCurrency, normalizeValuationAmount } from '@/utils/formatters';
import { formatCompactCurrency } from '@/utils/formatters';
import { isRecentOperation } from '@/utils/dateHelpers';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Operation {
  id: string;
  company_name: string;
  sector: string;
  valuation_amount: number;
  valuation_currency: string;
  revenue_amount?: number;
  ebitda_amount?: number;
  year: number;
  is_featured: boolean;
  is_active: boolean;
  logo_url?: string;
  deal_type?: string;
  description: string;
  display_locations: string[];
  created_at?: string;
}

interface OperationsTableMobileProps {
  operations: Operation[];
  selectedOperations: Set<string>;
  onSelectOne: (id: string) => void;
  onViewDetails: (operation: Operation) => void;
  onEdit: (operation: Operation) => void;
  onDuplicate: (operation: Operation) => void;
  onToggleActive: (operation: Operation) => void;
}

export const OperationsTableMobile: React.FC<OperationsTableMobileProps> = ({
  operations,
  selectedOperations,
  onSelectOne,
  onViewDetails,
  onEdit,
  onDuplicate,
  onToggleActive,
}) => {
  const getCompanyInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  const getDealTypeText = (dealType?: string) => {
    switch (dealType) {
      case 'sale': return 'Venta';
      case 'acquisition': return 'Adquisición';
      case 'merger': return 'Fusión';
      case 'restructuring': return 'Reestructuración';
      default: return 'N/D';
    }
  };

  return (
    <div className="space-y-3 animate-fade-in">
      {operations.map((operation) => (
        <Card key={operation.id} className="overflow-hidden hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              {/* Checkbox */}
              <Checkbox
                checked={selectedOperations.has(operation.id)}
                onCheckedChange={() => onSelectOne(operation.id)}
                className="mt-1"
              />

              {/* Logo/Avatar */}
              <div className="flex-shrink-0">
                {operation.logo_url ? (
                  <img 
                    src={operation.logo_url} 
                    alt={operation.company_name}
                    className="w-12 h-12 rounded-lg object-contain bg-muted p-1"
                  />
                ) : (
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <span className="text-primary font-semibold text-sm">
                      {getCompanyInitials(operation.company_name)}
                    </span>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm text-foreground truncate">
                      {operation.company_name}
                    </h3>
                    <div className="flex items-center gap-1 mt-1 flex-wrap">
                      <Badge variant="outline" className="text-xs">
                        {operation.sector}
                      </Badge>
                      {operation.is_featured && (
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 text-xs">
                          <Star className="h-3 w-3 mr-1" />
                          Destacada
                        </Badge>
                      )}
                      {isRecentOperation(operation.created_at) && (
                        <Badge className="bg-green-500 text-xs">
                          <Sparkles className="h-3 w-3 mr-1" />
                          Nuevo
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Actions Dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onViewDetails(operation)}>
                        <Eye className="h-4 w-4 mr-2" />
                        Ver detalles
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onEdit(operation)}>
                        <Building2 className="h-4 w-4 mr-2" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onDuplicate(operation)}>
                        Duplicar
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onToggleActive(operation)}>
                        {operation.is_active ? 'Desactivar' : 'Activar'}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Financial Info */}
                <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
                  <div>
                    <p className="text-muted-foreground mb-0.5">Valoración</p>
                    <p className="font-bold text-primary">
                      {formatCompactCurrency(operation.valuation_amount, operation.valuation_currency)}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-0.5">Facturación</p>
                    <p className="font-semibold text-green-600">
                      {operation.revenue_amount 
                        ? formatCompactCurrency(operation.revenue_amount, operation.valuation_currency)
                        : <span className="text-muted-foreground">N/D</span>
                      }
                    </p>
                  </div>
                </div>

                {/* Bottom Info */}
                <div className="flex items-center justify-between mt-3 pt-3 border-t text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>{operation.year}</span>
                  </div>
                  {operation.deal_type && (
                    <Badge variant="outline" className="text-xs">
                      {getDealTypeText(operation.deal_type)}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
