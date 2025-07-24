// ============= CONVERSION CHART COMPONENT =============
// Componente para gráfico de embudo de conversión

import React, { memo } from 'react';
import { ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';

interface ConversionChartProps {
  data: Array<{
    stage: string;
    count: number;
  }>;
  height?: number;
}

const ConversionChart = memo(({ data, height = 300 }: ConversionChartProps) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">No hay datos disponibles</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="stage" 
          tick={{ fontSize: 12 }}
          interval={0}
        />
        <YAxis />
        <Tooltip 
          formatter={(value) => [value, 'Cantidad']}
          labelFormatter={(label) => `Etapa: ${label}`}
        />
        <Bar 
          dataKey="count" 
          fill="hsl(var(--primary))"
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
});

ConversionChart.displayName = 'ConversionChart';

export { ConversionChart };