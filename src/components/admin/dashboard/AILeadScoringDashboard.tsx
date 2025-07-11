import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  Target, 
  TrendingUp, 
  Users, 
  AlertCircle, 
  Sparkles,
  BarChart3,
  Clock,
  CheckCircle
} from 'lucide-react';
import { useAILeadScoring } from '@/hooks/useAILeadScoring';
import { Skeleton } from '@/components/ui/skeleton';

export const AILeadScoringDashboard: React.FC = () => {
  const {
    leadsForAnalysis,
    aiMetrics,
    isLoadingLeads,
    isAnalyzing,
    generateAIScoring,
    analyzePatterns,
    isGenerating
  } = useAILeadScoring();

  const [activeAnalysis, setActiveAnalysis] = useState<string | null>(null);
  const [patterns, setPatterns] = useState<any>(null);

  const handleAnalyzePatterns = async () => {
    const result = await analyzePatterns();
    setPatterns(result);
  };

  const handleStartAnalysis = (type: 'scoring' | 'conversion' | 'segmentation') => {
    setActiveAnalysis(type);
    generateAIScoring({ analysisType: type });
  };

  if (isLoadingLeads) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-64" />
            <Skeleton className="h-4 w-96" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con métricas generales */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            Scoring de Leads con IA
          </CardTitle>
          <CardDescription>
            Análisis predictivo avanzado usando machine learning para optimizar el scoring de leads
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium">Total Leads</span>
              </div>
              <p className="text-2xl font-bold">{aiMetrics?.totalLeads || 0}</p>
              <p className="text-xs text-muted-foreground">
                Leads disponibles para análisis
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium">Listos para IA</span>
              </div>
              <p className="text-2xl font-bold">{aiMetrics?.aiReadyLeads || 0}</p>
              <Progress 
                value={aiMetrics?.readinessPercentage || 0} 
                className="h-2"
              />
              <p className="text-xs text-muted-foreground">
                {aiMetrics?.readinessPercentage?.toFixed(1) || 0}% con datos suficientes
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-emerald-500" />
                <span className="text-sm font-medium">Alta Confianza</span>
              </div>
              <p className="text-2xl font-bold">{aiMetrics?.highConfidenceLeads || 0}</p>
              <Badge 
                variant={aiMetrics?.dataQuality === 'high' ? 'success' : 
                        aiMetrics?.dataQuality === 'medium' ? 'warning' : 'destructive'}
              >
                Calidad: {aiMetrics?.dataQuality || 'low'}
              </Badge>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-purple-500" />
                <span className="text-sm font-medium">Score Promedio</span>
              </div>
              <p className="text-2xl font-bold">{aiMetrics?.avgScore?.toFixed(1) || 0}</p>
              <p className="text-xs text-muted-foreground">
                Puntuación media actual
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs para diferentes análisis */}
      <Tabs defaultValue="scoring" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="scoring">Scoring Predictivo</TabsTrigger>
          <TabsTrigger value="patterns">Análisis de Patrones</TabsTrigger>
          <TabsTrigger value="insights">Insights AI</TabsTrigger>
        </TabsList>

        <TabsContent value="scoring" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Scoring Avanzado
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Recalcula scores usando IA para mayor precisión
                </p>
                <Button
                  onClick={() => handleStartAnalysis('scoring')}
                  disabled={isGenerating || !aiMetrics?.aiReadyLeads}
                  className="w-full"
                >
                  {isGenerating && activeAnalysis === 'scoring' ? (
                    <>
                      <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                      Analizando...
                    </>
                  ) : (
                    <>
                      <Brain className="h-4 w-4 mr-2" />
                      Analizar Scoring
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Predicción Conversión
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Predice probabilidad de conversión por lead
                </p>
                <Button
                  onClick={() => handleStartAnalysis('conversion')}
                  disabled={isGenerating || !aiMetrics?.aiReadyLeads}
                  className="w-full"
                  variant="outline"
                >
                  {isGenerating && activeAnalysis === 'conversion' ? (
                    <>
                      <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                      Prediciendo...
                    </>
                  ) : (
                    <>
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Predecir Conversión
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Segmentación IA
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Segmenta leads automáticamente por comportamiento
                </p>
                <Button
                  onClick={() => handleStartAnalysis('segmentation')}
                  disabled={isGenerating || !aiMetrics?.aiReadyLeads}
                  className="w-full"
                  variant="outline"
                >
                  {isGenerating && activeAnalysis === 'segmentation' ? (
                    <>
                      <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                      Segmentando...
                    </>
                  ) : (
                    <>
                      <Target className="h-4 w-4 mr-2" />
                      Segmentar Leads
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {!aiMetrics?.aiReadyLeads && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-warning mt-0.5" />
                  <div>
                    <h4 className="font-medium">Datos insuficientes para análisis IA</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Se necesitan más eventos de comportamiento en los leads para realizar análisis predictivos precisos.
                      Asegúrate de que los leads tengan actividad registrada (visitas a páginas, descargas, uso de calculadora, etc.).
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="patterns" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Análisis de Patrones de Comportamiento
              </CardTitle>
              <CardDescription>
                Identifica patrones de conversión y factores de riesgo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={handleAnalyzePatterns}
                disabled={isLoadingLeads || !aiMetrics?.aiReadyLeads}
                className="mb-4"
              >
                <Brain className="h-4 w-4 mr-2" />
                Analizar Patrones
              </Button>

              {patterns && (
                <div className="space-y-6">
                  {/* Patrones de alta conversión */}
                  <div>
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-success" />
                      Patrones de Alta Conversión
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {patterns.high_conversion_patterns.map((pattern: any, index: number) => (
                        <Card key={index}>
                          <CardContent className="pt-4">
                            <div className="space-y-2">
                              <Badge variant="success">
                                {pattern.conversion_rate.toFixed(1)}% conversión
                              </Badge>
                              <h5 className="font-medium text-sm">
                                {pattern.pattern.replace('_', ' ').toUpperCase()}
                              </h5>
                              <p className="text-xs text-muted-foreground">
                                {pattern.description}
                              </p>
                              <p className="text-xs">
                                <strong>{pattern.frequency}</strong> leads con este patrón
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>

                  {/* Indicadores de riesgo */}
                  <div>
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-warning" />
                      Indicadores de Riesgo
                    </h4>
                    <div className="space-y-2">
                      {patterns.risk_indicators.map((risk: any, index: number) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded">
                          <div className="flex-1">
                            <h5 className="font-medium text-sm">
                              {risk.indicator.replace('_', ' ').toUpperCase()}
                            </h5>
                            <p className="text-xs text-muted-foreground">{risk.description}</p>
                            <p className="text-xs text-primary">{risk.mitigation}</p>
                          </div>
                          <Badge variant="warning">
                            {risk.risk_level} leads
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Timing óptimo */}
                  <div>
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <Clock className="h-4 w-4 text-info" />
                      Timing Óptimo de Contacto
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card>
                        <CardContent className="pt-4">
                          <h5 className="font-medium text-sm mb-2">Mejores Horarios</h5>
                          <div className="flex flex-wrap gap-1">
                            {patterns.optimal_timing.best_contact_hours.map((hour: number) => (
                              <Badge key={hour} variant="outline" className="text-xs">
                                {hour}:00
                              </Badge>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="pt-4">
                          <h5 className="font-medium text-sm mb-2">Mejores Días</h5>
                          <div className="flex flex-wrap gap-1">
                            {patterns.optimal_timing.best_contact_days.map((day: string) => (
                              <Badge key={day} variant="outline" className="text-xs">
                                {day}
                              </Badge>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Insights Generados por IA
              </CardTitle>
              <CardDescription>
                Recomendaciones automáticas basadas en análisis de datos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Brain className="h-8 w-8 mx-auto mb-3 opacity-50" />
                <p className="text-sm">Los insights aparecerán aquí tras el análisis</p>
                <p className="text-xs mt-1">
                  Ejecuta un análisis de scoring o patrones para generar insights
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};