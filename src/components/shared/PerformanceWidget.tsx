// ============= PERFORMANCE WIDGET =============
// Widget compacto de rendimiento para cualquier página

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useRealTimeMetrics } from '@/hooks/useRealTimeMetrics';
import { 
  Activity, 
  ChevronDown, 
  ChevronUp, 
  Zap, 
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface PerformanceWidgetProps {
  className?: string;
  compact?: boolean;
}

export const PerformanceWidget = ({ 
  className = '', 
  compact = false 
}: PerformanceWidgetProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { 
    summary, 
    isConnected, 
    detectPerformancePatterns,
    getPerformanceTrend 
  } = useRealTimeMetrics();

  const performancePattern = detectPerformancePatterns();
  const trend = getPerformanceTrend(10);

  const getStatusColor = () => {
    if (summary.averageTime < 200) return 'text-green-500';
    if (summary.averageTime < 500) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getStatusIcon = () => {
    if (performancePattern.trend === 'improving') return TrendingUp;
    if (performancePattern.trend === 'degrading') return TrendingDown;
    return Minus;
  };

  const StatusIcon = getStatusIcon();

  if (compact) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <div className={cn("flex items-center gap-1", getStatusColor())}>
          <Activity className="h-4 w-4" />
          <span className="text-sm font-medium">
            {summary.averageTime.toFixed(0)}ms
          </span>
        </div>
        
        <div className={cn(
          "h-2 w-2 rounded-full",
          isConnected ? "bg-green-500" : "bg-red-500"
        )} />
      </div>
    );
  }

  return (
    <Card className={cn("", className)}>
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header compacto */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className={cn("h-4 w-4", getStatusColor())} />
              <span className="text-sm font-medium">Performance</span>
              <div className={cn(
                "h-2 w-2 rounded-full",
                isConnected ? "bg-green-500" : "bg-red-500"
              )} />
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-6 w-6 p-0"
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Métricas principales */}
          <div className="flex items-center justify-between">
            <div>
              <div className={cn("text-lg font-semibold", getStatusColor())}>
                {summary.averageTime.toFixed(0)}ms
              </div>
              <div className="text-xs text-muted-foreground">
                promedio
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <StatusIcon className={cn(
                "h-4 w-4",
                performancePattern.trend === 'improving' ? 'text-green-500' :
                performancePattern.trend === 'degrading' ? 'text-red-500' :
                'text-muted-foreground'
              )} />
              
              <Badge 
                variant={summary.recentAlerts.length > 0 ? "destructive" : "secondary"}
                className="text-xs"
              >
                {summary.operationsPerSecond.toFixed(1)} ops/s
              </Badge>
            </div>
          </div>

          {/* Detalles expandidos */}
          {isExpanded && (
            <div className="space-y-3 pt-2 border-t border-border">
              {/* Breakdown por categoría */}
              <div>
                <div className="text-xs font-medium mb-2">Por Categoría</div>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(summary.categoryBreakdown).map(([category, count]) => (
                    <div key={category} className="flex justify-between text-xs">
                      <span className="capitalize">{category}</span>
                      <span className="font-medium">{count}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Alertas recientes */}
              {summary.recentAlerts.length > 0 && (
                <div>
                  <div className="flex items-center gap-1 mb-2">
                    <AlertTriangle className="h-3 w-3 text-yellow-500" />
                    <span className="text-xs font-medium">Alertas Recientes</span>
                  </div>
                  <div className="space-y-1">
                    {summary.recentAlerts.slice(0, 2).map((alert, index) => (
                      <div key={index} className="text-xs text-muted-foreground">
                        {alert.message}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Mini gráfico de tendencia */}
              {trend.length > 0 && (
                <div>
                  <div className="text-xs font-medium mb-2">Tendencia</div>
                  <div className="flex items-end gap-1 h-8">
                    {trend.slice(-8).map((point, index) => (
                      <div
                        key={index}
                        className={cn(
                          "w-2 rounded-t transition-all",
                          point.value < 200 ? "bg-green-500" :
                          point.value < 500 ? "bg-yellow-500" :
                          "bg-red-500"
                        )}
                        style={{
                          height: `${Math.min((point.value / 1000) * 100, 100)}%`
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Estado de rendimiento */}
              <div className="flex items-center justify-between pt-2 border-t border-border">
                <div className="flex items-center gap-1">
                  <Zap className="h-3 w-3 text-primary" />
                  <span className="text-xs">
                    {performancePattern.trend === 'improving' ? 'Mejorando' :
                     performancePattern.trend === 'degrading' ? 'Empeorando' :
                     'Estable'}
                  </span>
                </div>
                
                <span className="text-xs text-muted-foreground">
                  {summary.totalOperations} ops totales
                </span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};