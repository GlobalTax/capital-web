// ============= CAMPAIGN QUALITY BLOCK =============
// Análisis de calidad de leads por campaña/origen

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Award, TrendingUp, AlertTriangle } from 'lucide-react';
import { CampaignQuality } from './types';
import { cn } from '@/lib/utils';

interface CampaignQualityBlockProps {
  data: CampaignQuality[];
  isLoading?: boolean;
}

const formatNumber = (value: number) => {
  return new Intl.NumberFormat('es-ES').format(value);
};

const formatPercent = (value: number) => {
  return new Intl.NumberFormat('es-ES', { 
    minimumFractionDigits: 1, 
    maximumFractionDigits: 1 
  }).format(value) + '%';
};

// Simplify campaign name for display
const getShortCampaignName = (name: string): string => {
  if (name.length <= 20) return name;
  
  // Common patterns
  if (name.toLowerCase().includes('valoración') || name.toLowerCase().includes('valuation')) {
    return 'Valoración';
  }
  if (name.toLowerCase().includes('compra') || name.toLowerCase().includes('acquisition')) {
    return 'Compra';
  }
  if (name.toLowerCase().includes('venta') || name.toLowerCase().includes('seller')) {
    return 'Venta';
  }
  if (name.toLowerCase().includes('colaborador') || name.toLowerCase().includes('collaborator')) {
    return 'Colaborador';
  }
  
  return name.substring(0, 18) + '...';
};

export const CampaignQualityBlock: React.FC<CampaignQualityBlockProps> = ({
  data,
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
            <Award className="h-4 w-4" />
            Calidad por Campaña
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            No hay datos suficientes para mostrar la calidad por campaña
          </div>
        </CardContent>
      </Card>
    );
  }

  // Prepare chart data
  const chartData = data.slice(0, 8).map(item => ({
    name: getShortCampaignName(item.campaign),
    fullName: item.campaign,
    leads: item.totalLeads,
    cualificados: item.qualifiedPercentage,
    reuniones: item.meetingPercentage,
    descartados: item.discardedPercentage,
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    const item = payload[0]?.payload;
    return (
      <div className="bg-background border rounded-lg shadow-lg p-3 text-sm max-w-xs">
        <p className="font-medium mb-2">{item?.fullName || label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="flex items-center gap-2">
            <span 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-muted-foreground">{entry.name}:</span>
            <span className="font-medium">
              {entry.name === 'leads' ? formatNumber(entry.value) : formatPercent(entry.value)}
            </span>
          </p>
        ))}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Award className="h-4 w-4" />
          Calidad por Campaña
        </CardTitle>
        <CardDescription>
          Comparativa de calidad de leads entre diferentes orígenes
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Chart */}
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
              <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="cualificados" name="Cualificados" fill="#10b981" radius={[0, 4, 4, 0]} />
              <Bar dataKey="reuniones" name="Reuniones" fill="#6366f1" radius={[0, 4, 4, 0]} />
              <Bar dataKey="descartados" name="Descartados" fill="#ef4444" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Detailed Table */}
        <div className="overflow-auto max-h-64">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Origen</TableHead>
                <TableHead className="text-right">Leads</TableHead>
                <TableHead className="text-right">Cualif.</TableHead>
                <TableHead className="text-right">Reunión</TableHead>
                <TableHead className="text-right">PSH</TableHead>
                <TableHead className="text-right">Ganado</TableHead>
                <TableHead className="text-right">Descart.</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((item) => (
                <TableRow key={item.campaign}>
                  <TableCell>
                    <span className="font-medium text-sm truncate max-w-[150px] block" title={item.campaign}>
                      {getShortCampaignName(item.campaign)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatNumber(item.totalLeads)}
                  </TableCell>
                  <TableCell className="text-right">
                    <span className={cn(
                      item.qualifiedPercentage >= 20 ? 'text-emerald-600' : 'text-muted-foreground'
                    )}>
                      {formatPercent(item.qualifiedPercentage)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className={cn(
                      item.meetingPercentage >= 10 ? 'text-indigo-600' : 'text-muted-foreground'
                    )}>
                      {formatPercent(item.meetingPercentage)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    {formatPercent(item.pshPercentage)}
                  </TableCell>
                  <TableCell className="text-right">
                    <span className={cn(
                      item.wonPercentage > 0 ? 'text-green-600 font-medium' : 'text-muted-foreground'
                    )}>
                      {formatPercent(item.wonPercentage)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className={cn(
                      item.discardedPercentage >= 30 ? 'text-red-500' : 'text-muted-foreground'
                    )}>
                      {formatPercent(item.discardedPercentage)}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Quality Legend */}
        <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-2 border-t">
          <div className="flex items-center gap-1">
            <TrendingUp className="h-3 w-3 text-emerald-500" />
            <span>Cualificado: llegó a estado avanzado</span>
          </div>
          <div className="flex items-center gap-1">
            <AlertTriangle className="h-3 w-3 text-red-500" />
            <span>Descartado: terminó sin éxito</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
