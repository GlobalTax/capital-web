import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Lightbulb, TrendingUp, AlertTriangle, Target, Sparkles, RefreshCw } from 'lucide-react';
import { usePredictiveAnalytics } from '@/hooks/usePredictiveAnalytics';
import { Skeleton } from '@/components/ui/skeleton';

interface AIInsight {
  id: string;
  type: 'opportunity' | 'risk' | 'optimization' | 'prediction';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  confidence: number;
  impact: string;
  actions?: string[];
  affectedCompanies?: string[];
  predictedValue?: number;
  timeHorizon?: string;
  source: string;
  timestamp: string;
}

export const AIInsightsPanel: React.FC = () => {
  const { 
    predictiveData, 
    isLoading, 
    isGeneratingInsights,
    refreshPredictiveData 
  } = usePredictiveAnalytics();

  const insights = predictiveData?.insights || [];
  const aiInsights = insights.filter((insight: any) => insight.source === 'openai_ai') as any[];
  const hasAIInsights = aiInsights.length > 0;

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'opportunity':
        return <TrendingUp className="h-4 w-4 text-success" />;
      case 'risk':
        return <AlertTriangle className="h-4 w-4 text-warning" />;
      case 'optimization':
        return <Target className="h-4 w-4 text-info" />;
      case 'prediction':
        return <Lightbulb className="h-4 w-4 text-primary" />;
      default:
        return <Sparkles className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-destructive text-destructive-foreground';
      case 'high':
        return 'bg-warning text-warning-foreground';
      case 'medium':
        return 'bg-info text-info-foreground';
      case 'low':
        return 'bg-muted text-muted-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      notation: 'compact'
    }).format(value);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Insights con IA
          </CardTitle>
          <CardDescription>
            Análisis predictivo generado con inteligencia artificial
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Insights con IA
              {hasAIInsights && (
                <Badge variant="success" className="ml-2">
                  AI Activado
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              {hasAIInsights 
                ? `${aiInsights.length} insights generados con OpenAI`
                : 'Análisis predictivo con inteligencia artificial'
              }
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refreshPredictiveData()}
            disabled={isGeneratingInsights}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isGeneratingInsights ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isGeneratingInsights ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-primary">
              <Sparkles className="h-4 w-4 animate-pulse" />
              <span className="text-sm">Generando insights con IA...</span>
            </div>
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))}
          </div>
        ) : aiInsights.length > 0 ? (
          <div className="space-y-4">
            {aiInsights.slice(0, 6).map((insight) => (
              <div
                key={insight.id}
                className="border rounded-lg p-4 space-y-3 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {getInsightIcon(insight.type)}
                    <h4 className="font-medium text-sm">{insight.title}</h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant="outline" 
                      className={getPriorityColor(insight.priority)}
                    >
                      {insight.priority}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {insight.confidence}% confianza
                    </span>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground">
                  {insight.description}
                </p>

                <div className="flex flex-wrap gap-2">
                  {insight.predictedValue && (
                    <Badge variant="success">
                      Valor: {formatCurrency(insight.predictedValue)}
                    </Badge>
                  )}
                  {insight.timeHorizon && (
                    <Badge variant="outline">
                      Plazo: {insight.timeHorizon}
                    </Badge>
                  )}
                  {insight.affectedCompanies && insight.affectedCompanies.length > 0 && (
                    <Badge variant="outline">
                      {insight.affectedCompanies.length} empresas
                    </Badge>
                  )}
                </div>

                {insight.actions && insight.actions.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">
                      Acciones recomendadas:
                    </p>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      {insight.actions.slice(0, 3).map((action, index) => (
                        <li key={index} className="flex items-start gap-1">
                          <span className="text-primary">•</span>
                          <span>{action}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Fuente: OpenAI GPT-4</span>
                  <span>
                    {new Date(insight.timestamp).toLocaleString('es-ES', {
                      day: '2-digit',
                      month: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              </div>
            ))}

            {aiInsights.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Sparkles className="h-8 w-8 mx-auto mb-3 opacity-50" />
                <p className="text-sm">No hay insights de IA disponibles</p>
                <p className="text-xs mt-1">
                  Haz clic en "Actualizar" para generar nuevos insights
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Sparkles className="h-8 w-8 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No hay insights de IA disponibles</p>
            <p className="text-xs mt-1">
              Los insights se generarán automáticamente con datos suficientes
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};