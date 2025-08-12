import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScenarioResultV4 } from '@/types/valuationV4';
import { TrendingUp, TrendingDown, Minus, Settings } from 'lucide-react';
import { formatCurrency, formatPercentage } from '@/shared/utils/format';
interface QuickScenariosGridProps {
  scenarios: ScenarioResultV4[];
  bestScenarioId: string;
}

const QuickScenariosGrid = ({ scenarios, bestScenarioId }: QuickScenariosGridProps) => {
  const getIcon = (id: string) => {
    switch (id) {
      case 'optimistic': return <TrendingUp className="h-4 w-4" />;
      case 'conservative': return <TrendingDown className="h-4 w-4" />;
      case 'custom': return <Settings className="h-4 w-4" />;
      default: return <Minus className="h-4 w-4" />;
    }
  };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {scenarios.map((scenario) => (
        <Card 
          key={scenario.id} 
          className={`transition-all duration-300 hover:shadow-lg ${
            scenario.id === bestScenarioId ? 'ring-2 ring-primary' : ''
          }`}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              {getIcon(scenario.id)}
              <span className="font-medium text-sm">{scenario.name}</span>
              {scenario.id === bestScenarioId && (
                <Badge variant="secondary" className="text-xs ml-auto">
                  Mejor
                </Badge>
              )}
            </div>
            
            <div className="space-y-2">
              <div>
                <div className="text-xs text-muted-foreground">Valoración</div>
                <div className="text-lg font-bold" style={{ color: scenario.color }}>
                  {formatCurrency(scenario.valuation)}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <div className="text-muted-foreground">Impuestos</div>
                  <div className="font-semibold text-destructive">
                    {formatCurrency(scenario.totalTax)}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground">Neto</div>
                  <div className="font-semibold text-primary">
                    {formatCurrency(scenario.netReturn)}
                  </div>
                </div>
              </div>
              
              <div className="text-xs text-muted-foreground">
                ROI: {formatPercentage(scenario.roi)}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default QuickScenariosGrid;