
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { usePredictiveAnalytics } from '@/hooks/usePredictiveAnalytics';
import { 
  TrendingUp, TrendingDown, AlertTriangle, Target, 
  Brain, Zap, Eye, BarChart3, Users, Clock 
} from 'lucide-react';
import { 
  LazyResponsiveContainer, 
  LazyLineChart, 
  LazyLine, 
  LazyXAxis, 
  LazyYAxis, 
  LazyCartesianGrid, 
  LazyTooltip, 
  LazyPieChart, 
  LazyPie, 
  LazyCell, 
  LazyBarChart, 
  LazyBar 
} from '@/components/shared/LazyChart';

const PredictiveDashboard = () => {
  const { 
    predictiveData, 
    analytics, 
    isLoading, 
    isGeneratingInsights,
    refreshPredictiveData 
  } = usePredictiveAnalytics();

  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Dashboard Predictivo</h2>
          <div className="flex items-center space-x-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
            <span className="text-sm text-gray-600">Generando predicciones...</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!predictiveData || !analytics) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          No hay datos suficientes para generar predicciones. Los datos se actualizarán automáticamente.
        </AlertDescription>
      </Alert>
    );
  }

  const priorityColors = {
    critical: 'destructive',
    high: 'secondary',
    medium: 'default',
    low: 'outline'
  } as const;

  const trendColors = {
    up: '#22c55e',
    down: '#ef4444', 
    stable: '#6b7280'
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="h-6 w-6 text-blue-600" />
            Dashboard Predictivo IA
          </h2>
          <p className="text-gray-600 mt-1">
            Análisis predictivo e insights automáticos basados en IA
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {isGeneratingInsights && (
            <div className="flex items-center space-x-2 text-blue-600">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
              <span className="text-sm">Generando insights...</span>
            </div>
          )}
          <Button onClick={refreshPredictiveData} variant="outline" size="sm">
            Actualizar Predicciones
          </Button>
        </div>
      </div>

      {/* Métricas Clave */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Oportunidades de Alto Valor</CardTitle>
            <Target className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{analytics.highValueOpportunities}</div>
            <p className="text-xs text-gray-600">
              Probabilidad de conversión {'>'}80%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Probabilidad Promedio</CardTitle>
            <BarChart3 className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {analytics.averageConversionProbability.toFixed(1)}%
            </div>
            <p className="text-xs text-gray-600">
              Conversión esperada
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Insights Críticos</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{analytics.criticalInsights}</div>
            <p className="text-xs text-gray-600">
              Requieren atención inmediata
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tiempo a Conversión</CardTitle>
            <Clock className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {Math.round(analytics.avgTimeToConversion)} días
            </div>
            <p className="text-xs text-gray-600">
              Promedio estimado
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs Principal */}
      <Tabs defaultValue="opportunities" className="space-y-4">
        <TabsList>
          <TabsTrigger value="opportunities">Top Oportunidades</TabsTrigger>
          <TabsTrigger value="insights">Insights IA</TabsTrigger>
          <TabsTrigger value="trends">Tendencias de Mercado</TabsTrigger>
          <TabsTrigger value="predictions">Predicciones</TabsTrigger>
        </TabsList>

        {/* Top Oportunidades */}
        <TabsContent value="opportunities" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-green-600" />
                Oportunidades de Mayor Valor
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {predictiveData.topOpportunities.map((opportunity, index) => (
                  <div key={opportunity.companyDomain} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-bold text-green-600">#{index + 1}</span>
                        </div>
                        <div>
                          <h4 className="font-semibold">{opportunity.companyDomain}</h4>
                          <div className="flex items-center space-x-2">
                            <Progress 
                              value={opportunity.conversionProbability} 
                              className="w-24 h-2" 
                            />
                            <span className="text-sm font-medium text-green-600">
                              {opportunity.conversionProbability.toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-600">Conversión estimada</div>
                        <div className="font-semibold">{opportunity.predictedTimeToConversion} días</div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <h5 className="font-medium text-green-600 mb-2">Factores Clave</h5>
                        <ul className="space-y-1">
                          {opportunity.keyFactors.slice(0, 3).map((factor, i) => (
                            <li key={i} className="flex items-start space-x-2">
                              <div className="w-1.5 h-1.5 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                              <span className="text-gray-700">{factor}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h5 className="font-medium text-blue-600 mb-2">Acciones Recomendadas</h5>
                        <ul className="space-y-1">
                          {opportunity.recommendedActions.slice(0, 2).map((action, i) => (
                            <li key={i} className="flex items-start space-x-2">
                              <Zap className="w-3 h-3 text-blue-400 mt-1 flex-shrink-0" />
                              <span className="text-gray-700">{action}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <Badge variant="secondary">
                        Confianza: {opportunity.confidence}%
                      </Badge>
                      <Button size="sm" onClick={() => setSelectedCompany(opportunity.companyDomain)}>
                        Ver Detalles
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Insights IA */}
        <TabsContent value="insights" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Insights por Prioridad */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  Insights Críticos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {predictiveData.insights
                    .filter(i => i.priority === 'critical' || i.priority === 'high')
                    .slice(0, 5)
                    .map((insight, index) => (
                    <div key={insight.id} className="border-l-4 border-red-400 pl-4 py-2">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant={priorityColors[insight.priority] as any}>
                          {insight.priority.toUpperCase()}
                        </Badge>
                        <span className="text-xs text-gray-500">{insight.category}</span>
                      </div>
                      <h4 className="font-semibold text-sm">{insight.title}</h4>
                      <p className="text-xs text-gray-600 mt-1">{insight.description}</p>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-xs text-blue-600">
                          Confianza: {insight.confidence}%
                        </span>
                        <span className="text-xs text-gray-500">{insight.timeframe}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recomendaciones de Optimización */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  Optimizaciones Sugeridas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {predictiveData.optimizationSuggestions.slice(0, 5).map((suggestion, index) => (
                    <div key={suggestion.id} className="border-l-4 border-green-400 pl-4 py-2">
                      <h4 className="font-semibold text-sm">{suggestion.title}</h4>
                      <p className="text-xs text-gray-600 mt-1">{suggestion.description}</p>
                      <div className="mt-2">
                        <span className="text-xs text-green-600">
                          Impacto: {suggestion.potentialImpact}
                        </span>
                      </div>
                      <div className="mt-2 space-y-1">
                        {suggestion.recommendations.slice(0, 2).map((rec, i) => (
                          <div key={i} className="text-xs text-gray-700 flex items-start space-x-2">
                            <span className="text-green-500">→</span>
                            <span>{rec}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Anomalías Detectadas */}
          {predictiveData.anomalies.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5 text-orange-600" />
                  Anomalías Detectadas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {predictiveData.anomalies.map((anomaly, index) => (
                    <Alert key={index}>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription className="text-sm">
                        {anomaly}
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Tendencias de Mercado */}
        <TabsContent value="trends" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Tendencias por Sector</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {predictiveData.marketTrends.map((trend, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        {trend.trendDirection === 'up' ? (
                          <TrendingUp className="h-5 w-5 text-green-600" />
                        ) : trend.trendDirection === 'down' ? (
                          <TrendingDown className="h-5 w-5 text-red-600" />
                        ) : (
                          <div className="h-5 w-5 bg-gray-400 rounded-full" />
                        )}
                        <div>
                          <h4 className="font-semibold">{trend.sector}</h4>
                          <p className="text-sm text-gray-600">{trend.predictedImpact}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">
                          Confianza: {trend.confidence}%
                        </div>
                        <div className="text-xs text-gray-500">{trend.timeframe}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Distribución de Oportunidades</CardTitle>
              </CardHeader>
              <CardContent>
                <LazyResponsiveContainer height={300}>
                  <LazyPieChart>
                    <LazyPie
                      data={[
                        { name: 'Alto Valor (>80%)', value: analytics.highValueOpportunities, color: '#22c55e' },
                        { name: 'Medio (50-80%)', value: predictiveData.predictions.filter(p => p.conversionProbability >= 50 && p.conversionProbability < 80).length, color: '#f59e0b' },
                        { name: 'Bajo (<50%)', value: predictiveData.predictions.filter(p => p.conversionProbability < 50).length, color: '#ef4444' }
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={120}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {[0, 1, 2].map((index) => (
                        <LazyCell key={index} fill={['#22c55e', '#f59e0b', '#ef4444'][index]} />
                      ))}
                    </LazyPie>
                    <LazyTooltip />
                  </LazyPieChart>
                </LazyResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Predicciones Detalladas */}
        <TabsContent value="predictions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                Todas las Predicciones
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Empresa</th>
                      <th className="text-left p-2">Probabilidad</th>
                      <th className="text-left p-2">Tiempo Estimado</th>
                      <th className="text-left p-2">Confianza</th>
                      <th className="text-left p-2">Score Oportunidad</th>
                      <th className="text-left p-2">Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {predictiveData.predictions.slice(0, 20).map((prediction) => (
                      <tr key={prediction.companyDomain} className="border-b hover:bg-gray-50">
                        <td className="p-2 font-medium">{prediction.companyDomain}</td>
                        <td className="p-2">
                          <div className="flex items-center space-x-2">
                            <Progress value={prediction.conversionProbability} className="w-16 h-2" />
                            <span className="text-sm font-medium">
                              {prediction.conversionProbability.toFixed(1)}%
                            </span>
                          </div>
                        </td>
                        <td className="p-2">{prediction.predictedTimeToConversion} días</td>
                        <td className="p-2">{prediction.confidence}%</td>
                        <td className="p-2">
                          <Badge variant={prediction.opportunityScore > 70 ? 'default' : 'secondary'}>
                            {prediction.opportunityScore.toFixed(0)}
                          </Badge>
                        </td>
                        <td className="p-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setSelectedCompany(prediction.companyDomain)}
                          >
                            Ver
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PredictiveDashboard;
