import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line,
} from 'recharts';
import { Brain, Sparkles, Zap, Clock, DollarSign, AlertTriangle } from 'lucide-react';
import {
  useAIUsageSummary, useAIUsageByDay, useAIUsageByFunction, useAIUsageLogs,
} from '@/hooks/useAIUsage';
import { format, formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

export function AIUsageDashboard() {
  const { data: summary, isLoading: summaryLoading } = useAIUsageSummary();
  const { data: dailyData, isLoading: dailyLoading } = useAIUsageByDay(30);
  const { data: byFunction, isLoading: fnLoading } = useAIUsageByFunction(30);
  const { data: recentLogs, isLoading: logsLoading } = useAIUsageLogs(7);

  const totalCalls = summary?.reduce((s, p) => s + p.total_calls, 0) || 0;
  const totalTokens = summary?.reduce((s, p) => s + p.total_tokens, 0) || 0;
  const totalCost = summary?.reduce((s, p) => s + p.total_cost, 0) || 0;
  const totalErrors = summary?.reduce((s, p) => s + p.error_count, 0) || 0;

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Llamadas IA (mes)</CardDescription>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              {totalCalls.toLocaleString()}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {totalErrors > 0 && <span className="text-destructive">{totalErrors} errores</span>}
              {totalErrors === 0 && 'Sin errores'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Tokens consumidos</CardDescription>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Brain className="h-5 w-5 text-emerald-500" />
              {totalTokens > 1000000 
                ? `${(totalTokens / 1000000).toFixed(1)}M`
                : totalTokens > 1000 
                  ? `${(totalTokens / 1000).toFixed(0)}K` 
                  : totalTokens}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Input + Output</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Coste estimado</CardDescription>
            <CardTitle className="text-2xl flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-amber-500" />
              ${totalCost.toFixed(4)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Este mes (estimación)</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Proveedores</CardDescription>
          </CardHeader>
          <CardContent className="space-y-1">
            {summary?.map((s) => (
              <div key={s.provider} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1.5">
                  {s.provider === 'lovable' 
                    ? <Sparkles className="h-3.5 w-3.5 text-violet-500" />
                    : <Brain className="h-3.5 w-3.5 text-emerald-500" />
                  }
                  {s.provider}
                </span>
                <span className="font-medium">{s.total_calls}</span>
              </div>
            ))}
            {(!summary || summary.length === 0) && (
              <p className="text-xs text-muted-foreground">Sin datos aún</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="chart" className="space-y-4">
        <TabsList>
          <TabsTrigger value="chart">Consumo diario</TabsTrigger>
          <TabsTrigger value="functions">Por función</TabsTrigger>
          <TabsTrigger value="logs">Logs recientes</TabsTrigger>
        </TabsList>

        <TabsContent value="chart">
          <Card>
            <CardHeader>
              <CardTitle>Tokens diarios (últimos 30 días)</CardTitle>
              <CardDescription>Por proveedor</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              {dailyLoading ? (
                <div className="h-full flex items-center justify-center text-muted-foreground">Cargando...</div>
              ) : dailyData && dailyData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dailyData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="date" tickFormatter={(v) => format(new Date(v), 'd MMM', { locale: es })} className="text-xs" />
                    <YAxis className="text-xs" tickFormatter={(v) => v > 1000 ? `${(v/1000).toFixed(0)}K` : v} />
                    <Tooltip
                      labelFormatter={(v) => format(new Date(v), 'PPP', { locale: es })}
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                      formatter={(value: number, name: string) => [
                        value > 1000 ? `${(value/1000).toFixed(1)}K tokens` : `${value} tokens`,
                        name === 'lovable' ? 'Lovable AI' : 'OpenAI'
                      ]}
                    />
                    <Legend />
                    <Bar dataKey="lovable" name="Lovable AI" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="openai" name="OpenAI" fill="#10B981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  No hay datos de consumo IA aún. Los datos aparecerán cuando las funciones migradas se ejecuten.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="functions">
          <Card>
            <CardHeader>
              <CardTitle>Top funciones por consumo (30 días)</CardTitle>
              <CardDescription>Tokens totales por Edge Function</CardDescription>
            </CardHeader>
            <CardContent>
              {fnLoading ? (
                <p className="text-muted-foreground">Cargando...</p>
              ) : byFunction && byFunction.length > 0 ? (
                <div className="space-y-2">
                  {byFunction.slice(0, 15).map((fn) => (
                    <div key={fn.function_name} className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/50 text-sm">
                      <div className="flex-1">
                        <span className="font-medium font-mono text-xs">{fn.function_name}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge variant="outline">{fn.total_calls} calls</Badge>
                        <span className="text-xs text-muted-foreground w-20 text-right">
                          {fn.total_tokens > 1000 ? `${(fn.total_tokens/1000).toFixed(1)}K` : fn.total_tokens} tok
                        </span>
                        <span className="text-xs text-muted-foreground w-16 text-right">
                          ${fn.total_cost.toFixed(4)}
                        </span>
                        <span className="text-xs text-muted-foreground w-16 text-right flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {fn.avg_duration_ms > 1000 ? `${(fn.avg_duration_ms/1000).toFixed(1)}s` : `${fn.avg_duration_ms}ms`}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">Sin datos aún</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle>Logs recientes (7 días)</CardTitle>
              <CardDescription>Últimas llamadas a IA</CardDescription>
            </CardHeader>
            <CardContent>
              {logsLoading ? (
                <p className="text-muted-foreground">Cargando...</p>
              ) : recentLogs && recentLogs.length > 0 ? (
                <div className="space-y-1.5 max-h-96 overflow-y-auto">
                  {recentLogs.slice(0, 50).map((log) => (
                    <div key={log.id} className="flex items-center justify-between py-1.5 px-3 rounded-lg bg-muted/50 text-sm">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        {log.provider === 'lovable'
                          ? <Sparkles className="h-3.5 w-3.5 text-violet-500 shrink-0" />
                          : <Brain className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                        }
                        <span className="font-mono text-xs truncate">{log.function_name}</span>
                        {log.status !== 'success' && (
                          <Badge variant="destructive" className="text-[10px] px-1 py-0">
                            {log.status}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-xs text-muted-foreground">{log.tokens_total} tok</span>
                        <span className="text-xs text-muted-foreground">{log.duration_ms}ms</span>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(log.created_at), { addSuffix: true, locale: es })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No hay logs recientes</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
