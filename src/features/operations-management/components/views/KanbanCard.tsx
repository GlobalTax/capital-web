import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, Calendar, DollarSign, TrendingUp } from 'lucide-react';
import { formatCurrency } from '@/shared/utils/format';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import type { Operation } from '../../types/operations';

interface KanbanCardProps {
  operation: Operation;
  onClick: (operation: Operation) => void;
}

export const KanbanCard: React.FC<KanbanCardProps> = ({ operation, onClick }) => {
  const daysInStatus = operation.updated_at
    ? Math.floor((Date.now() - new Date(operation.updated_at).getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  return (
    <Card
      className="p-4 cursor-pointer hover:shadow-md transition-all border-l-4"
      style={{ borderLeftColor: operation.is_featured ? 'hsl(var(--accent))' : 'hsl(var(--border))' }}
      onClick={() => onClick(operation)}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <Building2 className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <h3 className="font-semibold text-sm truncate">{operation.company_name}</h3>
        </div>
        {operation.is_featured && (
          <Badge variant="secondary" className="text-xs flex-shrink-0">
            Destacada
          </Badge>
        )}
      </div>

      {/* Sector */}
      <div className="mb-3">
        <Badge variant="outline" className="text-xs">
          {operation.sector}
        </Badge>
      </div>

      {/* Valuation */}
      <div className="flex items-center gap-2 text-sm font-medium mb-2">
        <DollarSign className="h-4 w-4 text-green-600" />
        <span className="text-green-700">
          {formatCurrency(operation.valuation_amount, operation.valuation_currency || 'EUR')}
        </span>
      </div>

      {/* Metrics */}
      {(operation.revenue_amount || operation.ebitda_amount) && (
        <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
          {operation.revenue_amount && (
            <div className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              <span>{formatCurrency(operation.revenue_amount, 'EUR', true)}</span>
            </div>
          )}
          {operation.ebitda_amount && (
            <div className="flex items-center gap-1">
              <span className="font-medium">EBITDA:</span>
              <span>{formatCurrency(operation.ebitda_amount, 'EUR', true)}</span>
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-muted-foreground pt-3 border-t">
        <div className="flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          <span>
            {operation.updated_at
              ? formatDistanceToNow(new Date(operation.updated_at), {
                  addSuffix: true,
                  locale: es,
                })
              : 'Sin fecha'}
          </span>
        </div>
        {daysInStatus > 30 && (
          <Badge variant="destructive" className="text-xs">
            {daysInStatus}d sin cambios
          </Badge>
        )}
      </div>
    </Card>
  );
};
