import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calculator, TrendingUp, Users, ShoppingCart } from 'lucide-react';
import { SectorCalculator } from '@/hooks/useSectorCalculators';

interface SectorCalculatorCardProps {
  calculator: SectorCalculator;
  onCalculate: (calculator: SectorCalculator) => void;
}

const getSectorIcon = (sector: string) => {
  switch (sector.toLowerCase()) {
    case 'tecnología':
      return <Calculator className="h-6 w-6" />;
    case 'salud':
      return <TrendingUp className="h-6 w-6" />;
    case 'retail':
      return <ShoppingCart className="h-6 w-6" />;
    default:
      return <Users className="h-6 w-6" />;
  }
};

const getSectorColor = (sector: string) => {
  switch (sector.toLowerCase()) {
    case 'tecnología':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'salud':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'retail':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export const SectorCalculatorCard: React.FC<SectorCalculatorCardProps> = ({
  calculator,
  onCalculate,
}) => {
  const focusMetrics = calculator.configuration?.focus_metrics || [];
  const multiplierRange = calculator.configuration?.multiplier_range || {};

  return (
    <Card className="h-full hover:shadow-lg transition-all duration-300 border-border/50 bg-card">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              {getSectorIcon(calculator.sector)}
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-foreground">
                {calculator.name}
              </CardTitle>
              <Badge 
                variant="outline" 
                className={`mt-1 ${getSectorColor(calculator.sector)}`}
              >
                {calculator.sector}
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <CardDescription className="text-muted-foreground leading-relaxed">
          {calculator.description}
        </CardDescription>
        
        {focusMetrics.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-foreground mb-2">
              Métricas principales:
            </h4>
            <div className="flex flex-wrap gap-1">
              {focusMetrics.slice(0, 3).map((metric: string) => (
                <Badge 
                  key={metric} 
                  variant="secondary" 
                  className="text-xs px-2 py-1"
                >
                  {metric.replace(/_/g, ' ').toUpperCase()}
                </Badge>
              ))}
              {focusMetrics.length > 3 && (
                <Badge variant="secondary" className="text-xs px-2 py-1">
                  +{focusMetrics.length - 3} más
                </Badge>
              )}
            </div>
          </div>
        )}
        
        {multiplierRange.min && multiplierRange.max && (
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <span className="text-sm text-muted-foreground">
              Rango de múltiplos:
            </span>
            <span className="text-sm font-medium text-foreground">
              {multiplierRange.min}x - {multiplierRange.max}x
            </span>
          </div>
        )}
        
        <Button 
          onClick={() => onCalculate(calculator)}
          className="w-full font-medium"
          size="lg"
        >
          Calcular Valoración
        </Button>
      </CardContent>
    </Card>
  );
};