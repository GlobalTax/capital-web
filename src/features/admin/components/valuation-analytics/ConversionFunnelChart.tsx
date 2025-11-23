import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { TrendingDown } from 'lucide-react';

interface FunnelStep {
  step: number;
  stepName: string;
  count: number;
  percentage: number;
  dropoff: number;
}

interface ConversionFunnelChartProps {
  funnel: FunnelStep[];
}

export const ConversionFunnelChart: React.FC<ConversionFunnelChartProps> = ({ funnel }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Funnel de Conversión</CardTitle>
        <CardDescription>Progreso de usuarios por cada paso del calculador</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {funnel.map((step, index) => (
          <div key={step.step} className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span className="font-medium">Paso {step.step}: {step.stepName}</span>
                {step.dropoff > 0 && (
                  <span className="flex items-center gap-1 text-xs text-destructive">
                    <TrendingDown className="h-3 w-3" />
                    -{step.dropoff.toFixed(1)}%
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">{step.count} usuarios</span>
                <span className="font-medium">{step.percentage.toFixed(1)}%</span>
              </div>
            </div>
            <Progress value={step.percentage} className="h-2" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
