import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, AlertTriangle, Brain, Target, Zap } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Prediction {
  id: string;
  type: 'revenue' | 'leads' | 'conversion' | 'churn';
  title: string;
  currentValue: number;
  predictedValue: number;
  confidence: number;
  timeframe: '7d' | '30d' | '90d';
  trend: 'up' | 'down' | 'stable';
  insights: string[];
}

interface Alert {
  id: string;
  type: 'warning' | 'opportunity' | 'critical';
  message: string;
  impact: 'high' | 'medium' | 'low';
  action?: string;
}

export function PredictiveAnalytics() {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simular carga de predicciones (aquí irían las llamadas a la IA)
    const mockPredictions: Prediction[] = [
      {
        id: '1',
        type: 'leads',
        title: 'Generación de Leads (30 días)',
        currentValue: 245,
        predictedValue: 312,
        confidence: 87,
        timeframe: '30d',
        trend: 'up',
        insights: [
          'Incremento esperado del 27% basado en tendencias estacionales',
          'Campañas de contenido mostrando mayor engagement',
          'Tráfico orgánico en crecimiento sostenido'
        ]
      },
      {
        id: '2',
        type: 'conversion',
        title: 'Tasa de Conversión (7 días)',
        currentValue: 3.2,
        predictedValue: 2.8,
        confidence: 73,
        timeframe: '7d',
        trend: 'down',
        insights: [
          'Posible saturación en canales principales',
          'Calidad de leads requiere optimización',
          'Recomendable revisar scoring de leads'
        ]
      },
      {
        id: '3',
        type: 'revenue',
        title: 'Ingresos Proyectados (90 días)',
        currentValue: 45600,
        predictedValue: 52400,
        confidence: 92,
        timeframe: '90d',
        trend: 'up',
        insights: [
          'Pipeline robusto con deals de alto valor',
          'Ciclo de ventas optimizándose consistentemente',
          'Retención de clientes en máximos históricos'
        ]
      }
    ];

    const mockAlerts: Alert[] = [
      {
        id: '1',
        type: 'opportunity',
        message: 'Se detectó un aumento del 40% en interacciones con contenido sobre "valoraciones"',
        impact: 'high',
        action: 'Crear campaña específica para este segmento'
      },
      {
        id: '2',
        type: 'warning',
        message: 'La tasa de apertura de emails ha bajado 15% en la última semana',
        impact: 'medium',
        action: 'Revisar líneas de asunto y segmentación'
      },
      {
        id: '3',
        type: 'critical',
        message: '3 leads calientes sin actividad en las últimas 48 horas',
        impact: 'high',
        action: 'Contacto inmediato requerido'
      }
    ];

    setTimeout(() => {
      setPredictions(mockPredictions);
      setAlerts(mockAlerts);
      setIsLoading(false);
    }, 1500);
  }, []);

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-red-500" />;
      default: return <Target className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'opportunity': return <Zap className="h-4 w-4 text-blue-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'critical': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default: return <Brain className="h-4 w-4" />;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 animate-pulse" />
          <h2 className="text-xl font-semibold">Analizando datos con IA...</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-1/3 mb-4"></div>
                <div className="space-y-2">
                  <div className="h-3 bg-muted rounded"></div>
                  <div className="h-3 bg-muted rounded w-4/5"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Brain className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-semibold">Analytics Predictivos</h2>
        <Badge variant="secondary">IA</Badge>
      </div>

      {/* Alertas Críticas */}
      <div className="space-y-3">
        <h3 className="text-lg font-medium">Alertas Inteligentes</h3>
        {alerts.map((alert) => (
          <Alert key={alert.id} className="border-l-4 border-l-primary">
            <div className="flex items-start gap-3">
              {getAlertIcon(alert.type)}
              <div className="flex-1 space-y-2">
                <AlertDescription className="text-sm">
                  {alert.message}
                </AlertDescription>
                <div className="flex items-center gap-2">
                  <Badge className={getImpactColor(alert.impact)}>
                    {alert.impact.toUpperCase()}
                  </Badge>
                  {alert.action && (
                    <span className="text-xs text-muted-foreground">
                      Acción: {alert.action}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </Alert>
        ))}
      </div>

      {/* Predicciones */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Predicciones Basadas en IA</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {predictions.map((prediction) => (
            <Card key={prediction.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">
                    {prediction.title}
                  </CardTitle>
                  {getTrendIcon(prediction.trend)}
                </div>
                <CardDescription className="text-xs">
                  Predicción para {prediction.timeframe}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold">
                      {prediction.type === 'revenue' 
                        ? `€${prediction.predictedValue.toLocaleString()}`
                        : prediction.predictedValue.toLocaleString()
                      }
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Actual: {prediction.type === 'revenue' 
                        ? `€${prediction.currentValue.toLocaleString()}`
                        : prediction.currentValue.toLocaleString()
                      }
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">
                      {prediction.confidence}% confianza
                    </div>
                    <Progress value={prediction.confidence} className="w-16 h-2" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="text-xs font-medium text-muted-foreground">
                    Insights de IA:
                  </div>
                  <ul className="space-y-1 text-xs">
                    {prediction.insights.slice(0, 2).map((insight, index) => (
                      <li key={index} className="flex items-start gap-1">
                        <span className="text-primary mt-1">•</span>
                        <span>{insight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}