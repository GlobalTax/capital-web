import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { DistributionData } from '@/types/valuationV4';
import { PieChart as PieChartIcon } from 'lucide-react';
import { formatCurrency, formatPercentage } from '@/shared/utils/format';
interface DistributionChartProps {
  data: DistributionData[];
  title?: string;
}

const DistributionChart = ({ data, title = 'Distribución del Mejor Escenario' }: DistributionChartProps) => {
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="font-semibold">{data.name}</p>
          <p style={{ color: data.color }}>
            {formatCurrency(data.value)}
          </p>
          <p className="text-sm text-muted-foreground">
            {formatPercentage((data.value / data.payload.total) * 100)}
          </p>
        </div>
      );
    }
    return null;
  };

  // Calcular total para porcentajes
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const chartData = data.map(item => ({ ...item, total }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PieChartIcon className="h-5 w-5" />
          {title}
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
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
        
        {/* Leyenda */}
        <div className="flex justify-center gap-6 mt-4">
          {data.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: item.color }}
              />
              <span className="text-sm">{item.name}</span>
              <span className="text-sm font-semibold">
                {formatCurrency(item.value)}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default DistributionChart;