// ============= CONVERSION CHART COMPONENT =============
// Componente para gráfico de embudo de conversión

import React, { memo, Suspense } from 'react';
import { 
  LazyResponsiveContainer, 
  LazyBarChart, 
  LazyBar, 
  LazyCartesianGrid, 
  LazyXAxis, 
  LazyYAxis, 
  LazyTooltip 
} from '@/components/shared/LazyChart';

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
    <LazyResponsiveContainer height={height}>
      <Suspense fallback={<div className="h-64 flex items-center justify-center">Cargando gráfico...</div>}>
        <LazyBarChart data={data}>
          <LazyCartesianGrid strokeDasharray="3 3" />
          <LazyXAxis 
            dataKey="stage" 
            tick={{ fontSize: 12 }}
            interval={0}
          />
          <LazyYAxis />
          <LazyTooltip 
            formatter={(value) => [value, 'Cantidad']}
            labelFormatter={(label) => `Etapa: ${label}`}
          />
          <LazyBar 
            dataKey="count" 
            fill="hsl(var(--primary))"
            radius={[4, 4, 0, 0]}
          />
        </LazyBarChart>
      </Suspense>
    </LazyResponsiveContainer>
  );
});

ConversionChart.displayName = 'ConversionChart';

export { ConversionChart };