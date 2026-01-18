import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSearchAnalytics } from '@/hooks/useSearchAnalytics';
import { GlobalSearchPanel } from '@/components/admin/GlobalSearchPanel';
import { Search, TrendingUp, MousePointerClick, BarChart3, AlertCircle, Clock } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];

const TYPE_LABELS: Record<string, string> = {
  global: 'Global',
  contacts: 'Contactos',
  funds_sf: 'Search Funds',
  funds_cr: 'Capital Riesgo',
  valuations: 'Valoraciones',
  operations: 'Operaciones',
  news: 'Noticias',
};

export default function SearchAnalyticsPage() {
  const { data: stats, isLoading, error } = useSearchAnalytics(30);

  if (error) {
    return (
      <div className="p-6">
        <div className="text-destructive">Error al cargar analytics: {error.message}</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header con búsqueda global */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Analytics de Búsqueda</h1>
          <p className="text-muted-foreground">
            Análisis de todas las búsquedas realizadas en el sistema
          </p>
        </div>
        <GlobalSearchPanel className="w-full md:w-96" />
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Search className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {isLoading ? '-' : stats?.totalSearches.toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground">Total búsquedas</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <TrendingUp className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {isLoading ? '-' : stats?.uniqueQueries.toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground">Búsquedas únicas</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <MousePointerClick className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {isLoading ? '-' : `${stats?.clickThroughRate}%`}
                </div>
                <div className="text-xs text-muted-foreground">Tasa de clics</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-500/10">
                <BarChart3 className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {isLoading ? '-' : stats?.avgResultsCount}
                </div>
                <div className="text-xs text-muted-foreground">Resultados promedio</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="trends" className="space-y-4">
        <TabsList>
          <TabsTrigger value="trends">Tendencias</TabsTrigger>
          <TabsTrigger value="top">Top Búsquedas</TabsTrigger>
          <TabsTrigger value="no-results">Sin Resultados</TabsTrigger>
          <TabsTrigger value="history">Historial</TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Búsquedas por día</CardTitle>
                <CardDescription>Últimos 30 días</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                    Cargando...
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={stats?.dailyTrend || []}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis
                        dataKey="date"
                        tickFormatter={(value) => format(parseISO(value), 'dd MMM', { locale: es })}
                        className="text-xs"
                      />
                      <YAxis className="text-xs" />
                      <Tooltip
                        labelFormatter={(value) => format(parseISO(value as string), 'dd MMMM yyyy', { locale: es })}
                        contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                      />
                      <Line
                        type="monotone"
                        dataKey="count"
                        stroke="hsl(var(--primary))"
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Distribución por tipo</CardTitle>
                <CardDescription>Categorías de búsqueda</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                    Cargando...
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={(stats?.searchesByType || []).map((item, index) => ({
                          name: TYPE_LABELS[item.type] || item.type,
                          value: item.count,
                          fill: COLORS[index % COLORS.length],
                        }))}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {(stats?.searchesByType || []).map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                )}
                <div className="flex flex-wrap gap-2 justify-center mt-2">
                  {(stats?.searchesByType || []).map((item, index) => (
                    <Badge key={item.type} variant="outline" className="text-xs">
                      <span
                        className="w-2 h-2 rounded-full mr-1 inline-block"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      {TYPE_LABELS[item.type] || item.type}: {item.count}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="top">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Top 10 Búsquedas</CardTitle>
              <CardDescription>Las búsquedas más frecuentes</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center text-muted-foreground py-8">Cargando...</div>
              ) : (
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart
                    data={stats?.topSearches || []}
                    layout="vertical"
                    margin={{ left: 100 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis type="number" />
                    <YAxis type="category" dataKey="query" width={100} className="text-xs" />
                    <Tooltip
                      contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                    />
                    <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="no-results">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-destructive" />
                Búsquedas sin resultados
              </CardTitle>
              <CardDescription>
                Estas búsquedas no encontraron resultados - considera agregar contenido
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center text-muted-foreground py-8">Cargando...</div>
              ) : (stats?.searchesWithNoResults || []).length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  ¡Excelente! Todas las búsquedas encontraron resultados
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Búsqueda</TableHead>
                      <TableHead className="text-right">Veces buscado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(stats?.searchesWithNoResults || []).map((item, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{item.query}</TableCell>
                        <TableCell className="text-right">
                          <Badge variant="destructive">{item.count}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Historial de búsquedas
              </CardTitle>
              <CardDescription>Últimas 50 búsquedas realizadas</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center text-muted-foreground py-8">Cargando...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Búsqueda</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Fuente</TableHead>
                      <TableHead className="text-right">Resultados</TableHead>
                      <TableHead className="text-right">Fecha</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(stats?.recentSearches || []).map((search) => (
                      <TableRow key={search.id}>
                        <TableCell className="font-medium max-w-[200px] truncate">
                          {search.search_query}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {TYPE_LABELS[search.search_type] || search.search_type}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {search.search_source}
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge variant={search.results_count > 0 ? 'secondary' : 'destructive'}>
                            {search.results_count}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground text-sm">
                          {format(parseISO(search.created_at), 'dd MMM HH:mm', { locale: es })}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
