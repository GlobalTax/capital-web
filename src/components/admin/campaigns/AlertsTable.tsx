import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, TrendingDown, TrendingUp, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AlertData } from '@/hooks/useCampaignHistory';

interface AlertsTableProps {
  data: AlertData[];
  isLoading?: boolean;
}

const statusConfig = {
  ok: {
    label: 'OK',
    className: 'bg-green-100 text-green-700 hover:bg-green-100',
  },
  watch: {
    label: 'Vigilar',
    className: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100',
  },
  stop: {
    label: 'Parar',
    className: 'bg-red-100 text-red-700 hover:bg-red-100',
  },
};

const trendConfig = {
  improving: {
    label: 'Mejora',
    icon: TrendingDown,
    className: 'text-green-600',
  },
  worsening: {
    label: 'Empeora',
    icon: TrendingUp,
    className: 'text-red-600',
  },
  stable: {
    label: 'Estable',
    icon: Minus,
    className: 'text-muted-foreground',
  },
};

export const AlertsTable: React.FC<AlertsTableProps> = ({ data, isLoading }) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Alertas y Tendencias
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Alertas y Tendencias
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            No hay alertas disponibles
          </p>
        </CardContent>
      </Card>
    );
  }

  // Sort by priority: stop > watch > ok
  const sortedData = [...data].sort((a, b) => {
    const priority = { stop: 0, watch: 1, ok: 2 };
    return priority[a.currentStatus] - priority[b.currentStatus];
  });

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" />
          Alertas y Tendencias
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="max-h-[400px] overflow-auto">
          <Table>
            <TableHeader className="sticky top-0 bg-background z-10">
              <TableRow>
                <TableHead>Campaña</TableHead>
                <TableHead className="text-center">Estado</TableHead>
                <TableHead className="text-center">Cambios</TableHead>
                <TableHead className="text-center">Tendencia</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedData.map((row, index) => {
                const status = statusConfig[row.currentStatus];
                const trend = trendConfig[row.trend];
                const TrendIcon = trend.icon;

                return (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{row.campaignName}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary" className={cn('font-medium', status.className)}>
                        {status.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <span
                        className={cn(
                          'inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium',
                          row.statusChangeCount > 3
                            ? 'bg-red-100 text-red-700'
                            : row.statusChangeCount > 1
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-muted text-muted-foreground'
                        )}
                      >
                        {row.statusChangeCount}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className={cn('inline-flex items-center gap-1', trend.className)}>
                        <TrendIcon className="h-4 w-4" />
                        <span className="text-xs font-medium">{trend.label}</span>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
