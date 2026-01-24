import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend,
  LineChart,
  Line,
} from 'recharts';
import { 
  Activity, 
  Flame, 
  Brain, 
  Sparkles, 
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import { 
  useApiUsageSummary, 
  useApiUsageByDay, 
  useApiUsageLogs,
  FIRECRAWL_PLANS,
  getRecommendedPlan,
} from '@/hooks/useApiUsage';
import { format, formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

const SERVICE_COLORS = {
  firecrawl: '#F97316',
  openai: '#10B981',
  lovable_ai: '#8B5CF6',
  anthropic: '#EC4899',
};

const SERVICE_ICONS = {
  firecrawl: Flame,
  openai: Brain,
  lovable_ai: Sparkles,
  anthropic: Brain,
};

export function ApiUsageDashboard() {
  const { data: summary, isLoading: summaryLoading } = useApiUsageSummary();
  const { data: dailyData, isLoading: dailyLoading } = useApiUsageByDay(30);
  const { data: recentLogs, isLoading: logsLoading } = useApiUsageLogs(7);

  const firecrawlUsage = summary?.find(s => s.service === 'firecrawl')?.total_credits || 0;
  const recommendedPlan = getRecommendedPlan(firecrawlUsage);
  const currentPlanLimit = FIRECRAWL_PLANS[recommendedPlan].credits;
  const usagePercentage = Math.min((firecrawlUsage / currentPlanLimit) * 100, 100);

  const totalCreditsThisMonth = summary?.reduce((sum, s) => sum + s.total_credits, 0) || 0;
  const totalCallsThisMonth = summary?.reduce((sum, s) => sum + s.total_calls, 0) || 0;

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Créditos este mes</CardDescription>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              {totalCreditsThisMonth}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {totalCallsThisMonth} llamadas API
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Firecrawl</CardDescription>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Flame className="h-5 w-5 text-orange-500" />
              {firecrawlUsage} / {currentPlanLimit}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Progress value={usagePercentage} className="h-2" />
            <p className="text-xs text-muted-foreground">
              Plan recomendado: {FIRECRAWL_PLANS[recommendedPlan].name}
              {FIRECRAWL_PLANS[recommendedPlan].price > 0 && 
                ` ($${FIRECRAWL_PLANS[recommendedPlan].price}/mes)`
              }
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Lovable AI</CardDescription>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-violet-500" />
              {summary?.find(s => s.service === 'lovable_ai')?.total_calls || 0}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Clasificaciones y extracciones
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>OpenAI (fallback)</CardDescription>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Brain className="h-5 w-5 text-emerald-500" />
              {summary?.find(s => s.service === 'openai')?.total_calls || 0}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Usado cuando Lovable AI falla
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Usage Alert */}
      {usagePercentage >= 80 && (
        <Card className="border-amber-500/50 bg-amber-500/5">
          <CardContent className="flex items-center gap-4 py-4">
            <AlertTriangle className="h-8 w-8 text-amber-500" />
            <div>
              <p className="font-medium">Uso elevado de Firecrawl</p>
              <p className="text-sm text-muted-foreground">
                Has usado el {usagePercentage.toFixed(0)}% de tu límite mensual. 
                Considera actualizar al plan {FIRECRAWL_PLANS[recommendedPlan === 'free' ? 'hobby' : 'standard'].name}.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="chart" className="space-y-4">
        <TabsList>
          <TabsTrigger value="chart">Gráfico</TabsTrigger>
          <TabsTrigger value="breakdown">Desglose</TabsTrigger>
          <TabsTrigger value="logs">Logs Recientes</TabsTrigger>
        </TabsList>

        <TabsContent value="chart">
          <Card>
            <CardHeader>
              <CardTitle>Consumo diario (últimos 30 días)</CardTitle>
              <CardDescription>
                Créditos consumidos por servicio cada día
              </CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              {dailyLoading ? (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  Cargando datos...
                </div>
              ) : dailyData && dailyData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dailyData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(value) => format(new Date(value), 'd MMM', { locale: es })}
                      className="text-xs"
                    />
                    <YAxis className="text-xs" />
                    <Tooltip 
                      labelFormatter={(value) => format(new Date(value), 'PPP', { locale: es })}
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Legend />
                    <Bar 
                      dataKey="firecrawl" 
                      name="Firecrawl" 
                      fill={SERVICE_COLORS.firecrawl} 
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar 
                      dataKey="lovable_ai" 
                      name="Lovable AI" 
                      fill={SERVICE_COLORS.lovable_ai}
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar 
                      dataKey="openai" 
                      name="OpenAI" 
                      fill={SERVICE_COLORS.openai}
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  No hay datos de consumo aún
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="breakdown">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {summary?.map((service) => {
              const Icon = SERVICE_ICONS[service.service as keyof typeof SERVICE_ICONS] || Activity;
              const color = SERVICE_COLORS[service.service as keyof typeof SERVICE_COLORS] || '#6B7280';
              
              return (
                <Card key={service.service}>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Icon className="h-5 w-5" style={{ color }} />
                      {service.service}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Créditos usados</span>
                      <span className="font-medium">{service.total_credits}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Llamadas</span>
                      <span className="font-medium">{service.total_calls}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Última llamada</span>
                      <span className="text-sm">
                        {service.last_used 
                          ? formatDistanceToNow(new Date(service.last_used), { addSuffix: true, locale: es })
                          : 'Nunca'}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle>Logs recientes (7 días)</CardTitle>
              <CardDescription>
                Últimas llamadas a APIs externas
              </CardDescription>
            </CardHeader>
            <CardContent>
              {logsLoading ? (
                <p className="text-muted-foreground">Cargando logs...</p>
              ) : recentLogs && recentLogs.length > 0 ? (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {recentLogs.slice(0, 50).map((log) => {
                    const Icon = SERVICE_ICONS[log.service as keyof typeof SERVICE_ICONS] || Activity;
                    const color = SERVICE_COLORS[log.service as keyof typeof SERVICE_COLORS] || '#6B7280';
                    
                    return (
                      <div 
                        key={log.id} 
                        className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/50 text-sm"
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="h-4 w-4" style={{ color }} />
                          <div>
                            <span className="font-medium">{log.operation}</span>
                            <span className="text-muted-foreground ml-2">
                              {log.function_name}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <Badge variant="outline">
                            {log.credits_used} créditos
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(log.created_at), { addSuffix: true, locale: es })}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-muted-foreground">No hay logs recientes</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Plan Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Recomendación de Plan Firecrawl
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(FIRECRAWL_PLANS).map(([key, plan]) => {
              const isRecommended = key === recommendedPlan;
              const isCurrent = firecrawlUsage <= plan.credits;
              
              return (
                <div 
                  key={key}
                  className={`p-4 rounded-lg border ${
                    isRecommended 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{plan.name}</span>
                    {isRecommended && (
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                    )}
                  </div>
                  <p className="text-2xl font-bold">
                    {plan.price === 0 ? 'Gratis' : `$${plan.price}`}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {plan.credits.toLocaleString()} créditos/mes
                  </p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
