import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Building2, DollarSign, Calendar, Star, User } from 'lucide-react';
import { Operation } from '../../types/operations';
import { formatCurrency } from '@/shared/utils/format';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';

interface KanbanCardProps {
  operation: Operation;
  assignedUserName?: string;
}

export const KanbanCard: React.FC<KanbanCardProps> = ({ operation, assignedUserName }) => {
  const navigate = useNavigate();

  return (
    <Card
      className="cursor-pointer hover:shadow-md transition-shadow border-l-4"
      style={{ borderLeftColor: operation.is_featured ? 'hsl(var(--primary))' : 'transparent' }}
      onClick={() => navigate(`/admin/operations/${operation.id}`)}
    >
      <CardContent className="p-4 space-y-3">
        {/* Header con nombre y featured */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm truncate">{operation.company_name}</h3>
            <p className="text-xs text-muted-foreground truncate">{operation.sector}</p>
          </div>
          {operation.is_featured && (
            <Star className="h-4 w-4 text-primary fill-primary flex-shrink-0" />
          )}
        </div>

        {/* Valoración */}
        <div className="flex items-center gap-1.5 text-sm">
          <DollarSign className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="font-medium">
            {formatCurrency(operation.valuation_amount, operation.valuation_currency)}
          </span>
        </div>

        {/* Métricas financieras si existen */}
        {(operation.revenue_amount || operation.ebitda_amount) && (
          <div className="flex gap-2 text-xs text-muted-foreground">
            {operation.revenue_amount && (
              <span>Rev: {formatCurrency(operation.revenue_amount, operation.valuation_currency)}</span>
            )}
            {operation.ebitda_amount && (
              <span>EBITDA: {formatCurrency(operation.ebitda_amount, operation.valuation_currency)}</span>
            )}
          </div>
        )}

        {/* Usuario asignado */}
        {operation.assigned_to && (
          <div className="flex items-center gap-2">
            <Avatar className="h-5 w-5">
              <AvatarFallback className="text-xs">
                {assignedUserName?.[0]?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs text-muted-foreground truncate">
              {assignedUserName || 'Asignado'}
            </span>
          </div>
        )}

        {/* Fecha de creación */}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground pt-2 border-t">
          <Calendar className="h-3 w-3" />
          <span>
            {formatDistanceToNow(new Date(operation.created_at), {
              addSuffix: true,
              locale: es,
            })}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};
