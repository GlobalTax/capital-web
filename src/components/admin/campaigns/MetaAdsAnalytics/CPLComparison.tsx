// ============= CPL COMPARISON CHART =============
// Visual comparison of CPL Meta vs CPL Real vs CPL Calificado

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CPLComparisonProps {
  campaignName: string;
  cplMeta: number;
  cplReal: number | null;
  cplQualified: number | null;
}

interface CPLComparisonChartProps {
  data: CPLComparisonProps[];
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

const shortenCampaignName = (name: string): string => {
  if (name.includes('Q4')) return 'Q4-API';
  if (name.includes('Valoración')) return 'Valoración';
  if (name.includes('Venta')) return 'Venta';
  if (name.includes('Compra')) return 'Compra';
  if (name.length > 15) return name.substring(0, 12) + '...';
  return name;
};

const CPLIndicator: React.FC<{ cplMeta: number; cplReal: number | null }> = ({ cplMeta, cplReal }) => {
  if (!cplReal) return null;
  
  const diff = ((cplReal - cplMeta) / cplMeta) * 100;
  const isPositive = diff > 5; // More expensive than Meta reports
  const isNegative = diff < -5; // Cheaper than Meta reports
  
  return (
    <div className={cn(
      "flex items-center gap-1 text-xs font-medium",
      isPositive && "text-red-500",
      isNegative && "text-emerald-500",
      !isPositive && !isNegative && "text-muted-foreground"
    )}>
      {isPositive && <TrendingUp className="h-3 w-3" />}
      {isNegative && <TrendingDown className="h-3 w-3" />}
      {!isPositive && !isNegative && <Minus className="h-3 w-3" />}
      <span>{diff > 0 ? '+' : ''}{diff.toFixed(1)}%</span>
    </div>
  );
};

export const CPLComparisonChart: React.FC<CPLComparisonChartProps> = ({ data }) => {
  // Transform data for chart
  const chartData = data.map(d => ({
    name: shortenCampaignName(d.campaignName),
    fullName: d.campaignName,
    'CPL Meta': d.cplMeta,
    'CPL Real': d.cplReal || 0,
    'CPL Calificado': d.cplQualified || 0,
  }));

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const item = data.find(d => shortenCampaignName(d.campaignName) === label);
      return (
        <div className="bg-popover border rounded-lg p-3 shadow-lg">
          <p className="font-medium text-sm mb-2">{item?.campaignName}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-4 text-sm">
              <span style={{ color: entry.color }}>{entry.name}:</span>
              <span className="font-medium">{formatCurrency(entry.value)}</span>
            </div>
          ))}
          {item && (
            <div className="mt-2 pt-2 border-t">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Diferencia Real vs Meta:</span>
                <CPLIndicator cplMeta={item.cplMeta} cplReal={item.cplReal} />
              </div>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  if (data.length === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <div className="h-4 w-4 rounded bg-gradient-to-br from-blue-500 to-emerald-500" />
          Comparativa CPL: Meta vs Realidad
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Coste por lead reportado por Meta vs leads reales en base de datos
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 11 }}
                className="text-muted-foreground"
              />
              <YAxis 
                tickFormatter={(v) => `€${v}`}
                tick={{ fontSize: 11 }}
                className="text-muted-foreground"
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Bar dataKey="CPL Meta" fill="hsl(217, 91%, 60%)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="CPL Real" fill="hsl(160, 84%, 39%)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="CPL Calificado" fill="hsl(142, 76%, 36%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 pt-4 border-t">
          {data.map((item, idx) => (
            <div key={idx} className="text-center">
              <p className="text-xs text-muted-foreground mb-1">
                {shortenCampaignName(item.campaignName)}
              </p>
              <CPLIndicator cplMeta={item.cplMeta} cplReal={item.cplReal} />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default CPLComparisonChart;
