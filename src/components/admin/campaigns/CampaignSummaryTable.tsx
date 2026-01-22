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
import { BarChart3, TrendingDown, TrendingUp, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CampaignSummary } from '@/hooks/useCampaignHistory';

interface CampaignSummaryTableProps {
  data: CampaignSummary[];
  isLoading?: boolean;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

const formatPercentage = (value: number) => {
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(1)}%`;
};

export const CampaignSummaryTable: React.FC<CampaignSummaryTableProps> = ({
  data,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Resumen por Campaña
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
            <BarChart3 className="h-4 w-4" />
            Resumen por Campaña
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            No hay datos de campañas disponibles
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <BarChart3 className="h-4 w-4" />
          Resumen por Campaña
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="max-h-[400px] overflow-auto">
          <Table>
            <TableHeader className="sticky top-0 bg-background z-10">
              <TableRow>
                <TableHead>Campaña</TableHead>
                <TableHead className="text-right">CPL Medio</TableHead>
                <TableHead className="text-right">Leads Acum.</TableHead>
                <TableHead className="text-right">Gasto Acum.</TableHead>
                <TableHead className="text-right">Δ CPL</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((row, index) => {
                const isPositiveChange = row.cplVariation > 0;
                const isNegativeChange = row.cplVariation < 0;
                const isNeutral = Math.abs(row.cplVariation) < 0.5;

                return (
                  <TableRow key={index}>
                    <TableCell>
                      <div>
                        <span className="font-medium">{row.campaignName}</span>
                        <span className="text-xs text-muted-foreground ml-2">
                          ({row.recordCount} registros)
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(row.avgCpl)}
                    </TableCell>
                    <TableCell className="text-right">{row.totalLeads}</TableCell>
                    <TableCell className="text-right">{formatCurrency(row.totalSpend)}</TableCell>
                    <TableCell className="text-right">
                      <div
                        className={cn(
                          'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
                          isNeutral && 'bg-muted text-muted-foreground',
                          isPositiveChange && !isNeutral && 'bg-red-100 text-red-700',
                          isNegativeChange && !isNeutral && 'bg-green-100 text-green-700'
                        )}
                      >
                        {isNeutral ? (
                          <Minus className="h-3 w-3" />
                        ) : isPositiveChange ? (
                          <TrendingUp className="h-3 w-3" />
                        ) : (
                          <TrendingDown className="h-3 w-3" />
                        )}
                        {formatPercentage(row.cplVariation)}
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
