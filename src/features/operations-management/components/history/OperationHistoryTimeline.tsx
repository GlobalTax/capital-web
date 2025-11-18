import React, { useMemo } from 'react';
import { useOperationHistory } from '../../hooks/useOperationHistory';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  History, 
  Edit, 
  Plus, 
  UserCheck, 
  Trash2, 
  TrendingUp,
  Building2,
  Tag
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface OperationHistoryTimelineProps {
  operationId: string;
}

const getChangeIcon = (changeType: string) => {
  switch (changeType) {
    case 'create':
      return <Plus className="h-4 w-4" />;
    case 'update':
      return <Edit className="h-4 w-4" />;
    case 'status_change':
      return <TrendingUp className="h-4 w-4" />;
    case 'assignment':
      return <UserCheck className="h-4 w-4" />;
    case 'delete':
      return <Trash2 className="h-4 w-4" />;
    default:
      return <History className="h-4 w-4" />;
  }
};

const getChangeColor = (changeType: string) => {
  switch (changeType) {
    case 'create':
      return 'bg-green-500';
    case 'update':
      return 'bg-blue-500';
    case 'status_change':
      return 'bg-purple-500';
    case 'assignment':
      return 'bg-orange-500';
    case 'delete':
      return 'bg-red-500';
    default:
      return 'bg-gray-500';
  }
};

const getChangeLabel = (fieldChanged: string) => {
  const labels: Record<string, string> = {
    created: 'Operación creada',
    status: 'Estado',
    assigned_to: 'Asignación',
    valuation_amount: 'Valoración',
    company_name: 'Nombre de empresa',
    sector: 'Sector',
    deleted: 'Operación eliminada',
  };
  return labels[fieldChanged] || fieldChanged;
};

const formatValue = (value: any): string => {
  if (value === null || value === undefined) return 'Sin asignar';
  if (typeof value === 'number') {
    return `${(value / 1000000).toFixed(2)}M€`;
  }
  if (typeof value === 'string') {
    return value;
  }
  return JSON.stringify(value);
};

export const OperationHistoryTimeline: React.FC<OperationHistoryTimelineProps> = ({
  operationId,
}) => {
  const { history, isLoading } = useOperationHistory(operationId);

  const groupedHistory = useMemo(() => {
    const groups: Record<string, typeof history> = {};
    history.forEach((entry) => {
      const date = new Date(entry.changed_at).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(entry);
    });
    return groups;
  }, [history]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Historial de Cambios
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (history.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <History className="h-5 w-5" />
            Historial de Cambios
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            No hay cambios registrados para esta operación
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <History className="h-5 w-5" />
          Historial de Cambios
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {history.length} cambios registrados
        </p>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[500px] pr-4">
          <div className="space-y-6">
            {Object.entries(groupedHistory).map(([date, entries]) => (
              <div key={date} className="space-y-4">
                <h4 className="text-sm font-semibold text-muted-foreground sticky top-0 bg-background py-1">
                  {date}
                </h4>
                <div className="space-y-3 relative pl-6 before:absolute before:left-2 before:top-0 before:bottom-0 before:w-px before:bg-border">
                  {entries.map((entry, index) => (
                    <div key={entry.id} className="relative">
                      {/* Timeline dot */}
                      <div
                        className={`absolute -left-6 top-2 h-4 w-4 rounded-full ${getChangeColor(
                          entry.change_type
                        )} flex items-center justify-center text-white`}
                      >
                        {getChangeIcon(entry.change_type)}
                      </div>

                      {/* Change card */}
                      <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm">
                              {getChangeLabel(entry.field_changed)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {entry.user?.full_name || entry.user?.email || 'Sistema'}
                            </p>
                          </div>
                          <Badge variant="outline" className="text-xs shrink-0">
                            {formatDistanceToNow(new Date(entry.changed_at), {
                              addSuffix: true,
                              locale: es,
                            })}
                          </Badge>
                        </div>

                        {/* Show value changes */}
                        {entry.change_type !== 'create' && entry.change_type !== 'delete' && (
                          <div className="flex items-center gap-2 text-xs">
                            <span className="text-muted-foreground line-through">
                              {formatValue(entry.old_value)}
                            </span>
                            <span className="text-muted-foreground">→</span>
                            <span className="font-medium text-foreground">
                              {formatValue(entry.new_value)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
