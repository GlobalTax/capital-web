
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { TrendingUp, Users, Building2, Target, Clock, Zap } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface AnalyticsData {
  enrichmentTrends: any[];
  performanceMetrics: any[];
  sourceDistribution: any[];
  successRates: any[];
  responseTimesTrend: any[];
  companyGrowth: any[];
}

const IntegrationsAnalyticsDashboard = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');

  const fetchAnalyticsData = async () => {
    setIsLoading(true);
    try {
      // Calcular rango de fechas
      const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      // Obtener logs de integración para análisis
      const { data: logs } = await supabase
        .from('integration_logs')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: true });

      // Obtener empresas Apollo
      const { data: companies } = await supabase
        .from('apollo_companies')
        .select('*')
        .gte('created_at', startDate.toISOString());

      // Obtener contactos Apollo
      const { data: contacts } = await supabase
        .from('apollo_contacts')
        .select('*')
        .gte('created_at', startDate.toISOString());

      // Procesar datos para gráficos
      const enrichmentTrends = processEnrichmentTrends(logs || []);
      const performanceMetrics = processPerformanceMetrics(logs || []);
      const sourceDistribution = processSourceDistribution(companies || []);
      const successRates = processSuccessRates(logs || []);
      const responseTimesTrend = processResponseTimes(logs || []);
      const companyGrowth = processCompanyGrowth(companies || []);

      setAnalyticsData({
        enrichmentTrends,
        performanceMetrics,
        sourceDistribution,
        successRates,
        responseTimesTrend,
        companyGrowth
      });

    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const processEnrichmentTrends = (logs: any[]) => {
    const dailyData = logs.reduce((acc, log) => {
      const date = new Date(log.created_at).toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = { date, empresas: 0, contactos: 0, total: 0 };
      }
      
      if (log.operation === 'enrich_company') acc[date].empresas++;
      if (log.operation === 'enrich_contacts') acc[date].contactos++;
      acc[date].total++;
      
      return acc;
    }, {});

    return Object.values(dailyData).sort((a: any, b: any) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  };

  const processPerformanceMetrics = (logs: any[]) => {
    return logs.filter(log => log.execution_time_ms).map(log => ({
      timestamp: new Date(log.created_at).toLocaleTimeString('es-ES', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      tiempo: log.execution_time_ms,
      operacion: log.operation,
      estado: log.status
    }));
  };

  const processSourceDistribution = (companies: any[]) => {
    const industries = companies.reduce((acc, company) => {
      const industry = company.industry || 'Sin categoría';
      acc[industry] = (acc[industry] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(industries).map(([name, value]) => ({
      name,
      value,
      percentage: ((value as number) / companies.length * 100).toFixed(1)
    }));
  };

  const processSuccessRates = (logs: any[]) => {
    const operationStats = logs.reduce((acc, log) => {
      if (!acc[log.operation]) {
        acc[log.operation] = { total: 0, success: 0, error: 0 };
      }
      acc[log.operation].total++;
      if (log.status === 'success') acc[log.operation].success++;
      if (log.status === 'error') acc[log.operation].error++;
      return acc;
    }, {});

    return Object.entries(operationStats).map(([operation, stats]: [string, any]) => ({
      operacion: operation.replace('_', ' ').toUpperCase(),
      exitosos: stats.success,
      errores: stats.error,
      tasa_exito: ((stats.success / stats.total) * 100).toFixed(1)
    }));
  };

  const processResponseTimes = (logs: any[]) => {
    return logs
      .filter(log => log.execution_time_ms && log.status === 'success')
      .map(log => ({
        hora: new Date(log.created_at).toLocaleTimeString('es-ES', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        tiempo: log.execution_time_ms,
        operacion: log.operation
      }))
      .slice(-20); // Últimos 20 registros
  };

  const processCompanyGrowth = (companies: any[]) => {
    const dailyGrowth = companies.reduce((acc, company) => {
      const date = new Date(company.created_at).toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = { 
          fecha: date, 
          nuevas_empresas: 0, 
          target_accounts: 0,
          total_contactos: 0
        };
      }
      acc[date].nuevas_empresas++;
      if (company.is_target_account) acc[date].target_accounts++;
      acc[date].total_contactos += company.contacts_count || 0;
      return acc;
    }, {});

    return Object.values(dailyGrowth).sort((a: any, b: any) => 
      new Date(a.fecha).getTime() - new Date(b.fecha).getTime()
    );
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-full"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controles de tiempo */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">📊 Analytics Avanzados</h2>
        <div className="flex gap-2">
          {['7d', '30d', '90d'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1 rounded text-sm ${
                timeRange === range
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {range === '7d' ? '7 días' : range === '30d' ? '30 días' : '90 días'}
            </button>
          ))}
        </div>
      </div>

      {/* Métricas Principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Enriquecimientos Totales</CardTitle>
            <Zap className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analyticsData?.enrichmentTrends.reduce((sum, day) => sum + day.total, 0) || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Últimos {timeRange === '7d' ? '7' : timeRange === '30d' ? '30' : '90'} días
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tiempo Promedio</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analyticsData?.responseTimesTrend.length ? 
                Math.round(analyticsData.responseTimesTrend.reduce((sum, item) => sum + item.tiempo, 0) / analyticsData.responseTimesTrend.length)
                : 0}ms
            </div>
            <p className="text-xs text-muted-foreground">Tiempo de respuesta</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasa de Éxito</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analyticsData?.successRates.length ? 
                Math.round(analyticsData.successRates.reduce((sum, item) => sum + parseFloat(item.tasa_exito), 0) / analyticsData.successRates.length)
                : 0}%
            </div>
            <p className="text-xs text-muted-foreground">Operaciones exitosas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Target Accounts</CardTitle>
            <Target className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analyticsData?.companyGrowth.reduce((sum, day) => sum + day.target_accounts, 0) || 0}
            </div>
            <p className="text-xs text-muted-foreground">Cuentas objetivo identificadas</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos en pestañas */}
      <Tabs defaultValue="trends" className="space-y-4">
        <TabsList>
          <TabsTrigger value="trends">📈 Tendencias</TabsTrigger>
          <TabsTrigger value="performance">⚡ Rendimiento</TabsTrigger>
          <TabsTrigger value="distribution">🎯 Distribución</TabsTrigger>
          <TabsTrigger value="success">✅ Éxito</TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Enriquecimientos por Día</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={analyticsData?.enrichmentTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="empresas" stackId="1" stroke="#8884d8" fill="#8884d8" />
                    <Area type="monotone" dataKey="contactos" stackId="1" stroke="#82ca9d" fill="#82ca9d" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Crecimiento de Empresas</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analyticsData?.companyGrowth}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="fecha" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="nuevas_empresas" stroke="#8884d8" />
                    <Line type="monotone" dataKey="target_accounts" stroke="#82ca9d" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tiempos de Respuesta</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={analyticsData?.responseTimesTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hora" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="tiempo" stroke="#8884d8" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="distribution" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Distribución por Industria</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={analyticsData?.sourceDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percentage }) => `${name} (${percentage}%)`}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {analyticsData?.sourceDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="success" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tasas de Éxito por Operación</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={analyticsData?.successRates}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="operacion" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="exitosos" fill="#82ca9d" />
                  <Bar dataKey="errores" fill="#ff7c7c" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default IntegrationsAnalyticsDashboard;
