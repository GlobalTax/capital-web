
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMarketingAutomation } from '@/hooks/useMarketingAutomation';
import { supabase } from '@/integrations/supabase/client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Mail, Zap, Target, Clock, Users } from 'lucide-react';

const AutomationAnalytics = () => {
  const { emailSequences, workflows } = useMarketingAutomation();
  const [timeRange, setTimeRange] = useState('7d');
  const [analyticsData, setAnalyticsData] = useState<any>({
    emailMetrics: [],
    workflowMetrics: [],
    conversionFunnel: [],
    performanceOverTime: []
  });

  useEffect(() => {
    loadAnalyticsData();
  }, [timeRange]);

  const loadAnalyticsData = async () => {
    try {
      const endDate = new Date();
      const startDate = new Date();
      
      switch (timeRange) {
        case '7d':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(endDate.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(endDate.getDate() - 90);
          break;
      }

      // Métricas de emails programados
      const { data: scheduledEmails } = await supabase
        .from('scheduled_emails')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      // Métricas de ejecuciones de workflows
      const { data: workflowExecutions } = await supabase
        .from('workflow_executions')
        .select('*')
        .gte('started_at', startDate.toISOString())
        .lte('started_at', endDate.toISOString());

      // Procesar datos para gráficos
      const emailMetrics = processEmailMetrics(scheduledEmails || []);
      const workflowMetrics = processWorkflowMetrics(workflowExecutions || []);
      const performanceOverTime = processPerformanceOverTime(scheduledEmails || [], workflowExecutions || []);

      setAnalyticsData({
        emailMetrics,
        workflowMetrics,
        performanceOverTime,
        conversionFunnel: [
          { name: 'Visitantes', value: 1000, color: '#3B82F6' },
          { name: 'Leads', value: 250, color: '#10B981' },
          { name: 'Emails Enviados', value: 180, color: '#F59E0B' },
          { name: 'Conversiones', value: 45, color: '#EF4444' }
        ]
      });
    } catch (error) {
      console.error('Error loading analytics data:', error);
    }
  };

  const processEmailMetrics = (emails: any[]) => {
    const statusCounts = emails.reduce((acc, email) => {
      acc[email.status] = (acc[email.status] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(statusCounts).map(([status, count]) => ({
      status,
      count,
      percentage: ((count as number) / emails.length * 100).toFixed(1)
    }));
  };

  const processWorkflowMetrics = (executions: any[]) => {
    const statusCounts = executions.reduce((acc, execution) => {
      acc[execution.execution_status] = (acc[execution.execution_status] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(statusCounts).map(([status, count]) => ({
      status,
      count,
      percentage: ((count as number) / executions.length * 100).toFixed(1)
    }));
  };

  const processPerformanceOverTime = (emails: any[], executions: any[]) => {
    const days = [];
    const endDate = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(endDate.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const emailsCount = emails.filter(e => 
        e.created_at.startsWith(dateStr)
      ).length;
      
      const executionsCount = executions.filter(e => 
        e.started_at?.startsWith(dateStr)
      ).length;
      
      days.push({
        date: date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' }),
        emails: emailsCount,
        workflows: executionsCount
      });
    }
    
    return days;
  };

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  return (
    <div className="space-y-6">
      {/* Header con filtros */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Analytics de Automatización</h2>
          <p className="text-gray-600">Métricas de rendimiento y optimización</p>
        </div>
        
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Últimos 7 días</SelectItem>
            <SelectItem value="30d">Últimos 30 días</SelectItem>
            <SelectItem value="90d">Últimos 90 días</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* KPIs principales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Emails Enviados</p>
                <p className="text-2xl font-bold text-blue-600">
                  {analyticsData.emailMetrics.reduce((sum: number, metric: any) => sum + metric.count, 0)}
                </p>
              </div>
              <Mail className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Workflows Ejecutados</p>
                <p className="text-2xl font-bold text-purple-600">
                  {analyticsData.workflowMetrics.reduce((sum: number, metric: any) => sum + metric.count, 0)}
                </p>
              </div>
              <Zap className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tasa de Apertura</p>
                <p className="text-2xl font-bold text-green-600">24.5%</p>
              </div>
              <Target className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tiempo Ahorro</p>
                <p className="text-2xl font-bold text-orange-600">32h</p>
              </div>
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos principales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance over time */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-500" />
              Rendimiento en el Tiempo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analyticsData.performanceOverTime}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="emails" 
                  stroke="#3B82F6" 
                  strokeWidth={2}
                  name="Emails"
                />
                <Line 
                  type="monotone" 
                  dataKey="workflows" 
                  stroke="#8B5CF6" 
                  strokeWidth={2}
                  name="Workflows"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Funnel de conversión */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-green-500" />
              Funnel de Conversión
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analyticsData.conversionFunnel}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percentage }) => `${name}: ${percentage}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {analyticsData.conversionFunnel.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Métricas detalladas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Estado de emails */}
        <Card>
          <CardHeader>
            <CardTitle>Estado de Emails</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={analyticsData.emailMetrics}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="status" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Estado de workflows */}
        <Card>
          <CardHeader>
            <CardTitle>Estado de Workflows</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={analyticsData.workflowMetrics}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="status" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8B5CF6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Insights y recomendaciones */}
      <Card>
        <CardHeader>
          <CardTitle>💡 Insights y Recomendaciones</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">📈 Oportunidad de Mejora</h4>
              <p className="text-blue-800 text-sm">
                La tasa de apertura de emails está un 15% por debajo del promedio de la industria. 
                Considera A/B testing en líneas de asunto.
              </p>
            </div>
            
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-medium text-green-900 mb-2">✅ Buen Rendimiento</h4>
              <p className="text-green-800 text-sm">
                Los workflows están ejecutándose correctamente con 95% de éxito. 
                Excelente automatización del proceso de nurturing.
              </p>
            </div>
            
            <div className="p-4 bg-amber-50 rounded-lg">
              <h4 className="font-medium text-amber-900 mb-2">⚠️ Atención Requerida</h4>
              <p className="text-amber-800 text-sm">
                Algunos emails están quedando en cola por más tiempo del esperado. 
                Revisa la configuración del servidor de emails.
              </p>
            </div>
            
            <div className="p-4 bg-purple-50 rounded-lg">
              <h4 className="font-medium text-purple-900 mb-2">🚀 Próximos Pasos</h4>
              <p className="text-purple-800 text-sm">
                Considera implementar más triggers basados en comportamiento 
                para mejorar la personalización de las secuencias.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AutomationAnalytics;
