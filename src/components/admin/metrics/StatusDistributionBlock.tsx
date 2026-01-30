// ============= STATUS DISTRIBUTION BLOCK =============
// Muestra la distribución de leads por estado con tabla y gráfico

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Users, BarChart3 } from 'lucide-react';
import { StatusDistribution } from './types';
import { STATUS_COLOR_MAP } from '@/hooks/useContactStatuses';

interface StatusDistributionBlockProps {
  data: StatusDistribution[];
  totalLeads: number;
  isLoading?: boolean;
}

// Map status color names to actual hex colors for charts
const getChartColor = (colorName: string): string => {
  const colorMap: Record<string, string> = {
    blue: '#3b82f6',
    purple: '#a855f7',
    cyan: '#06b6d4',
    indigo: '#6366f1',
    orange: '#f97316',
    yellow: '#eab308',
    green: '#22c55e',
    red: '#ef4444',
    gray: '#6b7280',
    emerald: '#10b981',
    slate: '#64748b',
    amber: '#f59e0b',
    teal: '#14b8a6',
    pink: '#ec4899',
  };
  return colorMap[colorName] || '#6b7280';
};

const formatNumber = (value: number) => {
  return new Intl.NumberFormat('es-ES').format(value);
};

const formatPercent = (value: number) => {
  return new Intl.NumberFormat('es-ES', { 
    minimumFractionDigits: 1, 
    maximumFractionDigits: 1 
  }).format(value) + '%';
};

export const StatusDistributionBlock: React.FC<StatusDistributionBlockProps> = ({
  data,
  totalLeads,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <div className="h-5 bg-muted rounded w-48" />
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-muted rounded" />
        </CardContent>
      </Card>
    );
  }

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="h-4 w-4" />
            Distribución por Estado
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            No hay datos suficientes para mostrar la distribución
          </div>
        </CardContent>
      </Card>
    );
  }

  // Prepare chart data
  const chartData = data.map(item => ({
    name: item.label,
    value: item.count,
    color: getChartColor(item.color),
    percentage: item.percentage,
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    const item = payload[0].payload;
    return (
      <div className="bg-background border rounded-lg shadow-lg p-3 text-sm">
        <p className="font-medium">{item.name}</p>
        <p className="text-muted-foreground">
          {formatNumber(item.value)} leads ({formatPercent(item.percentage)})
        </p>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Users className="h-4 w-4" />
          Distribución por Estado
        </CardTitle>
        <CardDescription>
          {formatNumber(totalLeads)} leads totales distribuidos en {data.length} estados
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pie Chart */}
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Table */}
          <div className="overflow-auto max-h-64">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Leads</TableHead>
                  <TableHead className="text-right">%</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((item) => {
                  const colors = STATUS_COLOR_MAP[item.color] || STATUS_COLOR_MAP.gray;
                  return (
                    <TableRow key={item.status_key}>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className={`${colors.bg} ${colors.text} border-0`}
                        >
                          {item.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatNumber(item.count)}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {formatPercent(item.percentage)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
