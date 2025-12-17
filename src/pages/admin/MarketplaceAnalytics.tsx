import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Eye, MessageSquare, TrendingUp, Scale, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

interface AnalyticsData {
  total_views: number;
  contact_requests: number;
  views_by_type: { view_type: string; count: number }[];
  top_operations: { id: string; company_name: string; sector: string; view_count: number }[];
  views_by_day: { date: string; views: number }[];
  sector_distribution: { sector: string; count: number }[];
}

const MarketplaceAnalytics: React.FC = () => {
  const [dateRange, setDateRange] = useState('30');

  const { data: analytics, isLoading, refetch } = useQuery({
    queryKey: ['marketplace-analytics', dateRange],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_marketplace_analytics', {
        days_back: parseInt(dateRange)
      });

      if (error) throw error;
      return data as unknown as AnalyticsData;
    }
  });

  const conversionRate = analytics && analytics.total_views > 0
    ? ((analytics.contact_requests / analytics.total_views) * 100).toFixed(1)
    : '0';

  const compareViews = analytics?.views_by_type?.find(v => v.view_type === 'compare')?.count || 0;

  const kpis = [
    { title: 'Vistas Totales', value: analytics?.total_views || 0, icon: Eye, color: 'text-blue-600' },
    { title: 'Solicitudes Contacto', value: analytics?.contact_requests || 0, icon: MessageSquare, color: 'text-green-600' },
    { title: 'Tasa Conversión', value: `${conversionRate}%`, icon: TrendingUp, color: 'text-amber-600' },
    { title: 'Comparaciones', value: compareViews, icon: Scale, color: 'text-purple-600' }
  ];

  const chartData = analytics?.views_by_day?.map(d => ({
    date: format(new Date(d.date), 'dd MMM', { locale: es }),
    vistas: d.views
  })) || [];

  const pieData = analytics?.sector_distribution?.map(s => ({
    name: s.sector,
    value: s.count
  })) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Analytics del Marketplace</h1>
          <p className="text-muted-foreground">Monitoriza el rendimiento del marketplace de operaciones</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Últimos 7 días</SelectItem>
              <SelectItem value="30">Últimos 30 días</SelectItem>
              <SelectItem value="90">Últimos 90 días</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, idx) => (
          <Card key={idx}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{kpi.title}</p>
                  <p className="text-2xl font-bold">{isLoading ? '...' : kpi.value}</p>
                </div>
                <kpi.icon className={`h-8 w-8 ${kpi.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Line Chart - Views by Day */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Vistas por Día</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              {isLoading ? (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  Cargando...
                </div>
              ) : chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="date" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="vistas" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      dot={{ fill: '#3b82f6', r: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  Sin datos en este período
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Pie Chart - Sector Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Por Sector</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              {isLoading ? (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  Cargando...
                </div>
              ) : pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                      label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                    >
                      {pieData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  Sin datos
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Operations */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">🏆 Top 10 Operaciones Más Vistas</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground">Cargando...</p>
          ) : analytics?.top_operations?.length ? (
            <div className="space-y-3">
              {analytics.top_operations.map((op, idx) => (
                <div key={op.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                      {idx + 1}
                    </span>
                    <div>
                      <p className="font-medium">{op.company_name}</p>
                      <p className="text-sm text-muted-foreground">{op.sector}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Eye className="h-4 w-4" />
                    <span className="font-semibold">{op.view_count}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No hay datos de vistas en este período</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MarketplaceAnalytics;
