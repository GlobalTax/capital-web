import React, { useState, useMemo } from 'react';
import { UnifiedContact } from '@/hooks/useUnifiedContacts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  TrendingUp, 
  Star, 
  Target,
  Activity,
  Calendar,
  Mail,
  Phone,
  Building2,
  Timer,
  Zap,
  ArrowUp,
  ArrowDown,
  Eye,
  PieChart,
  BarChart3,
  LineChart,
  Filter
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { ResponsiveContainer, LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart as RechartsPieChart, Pie, Cell, BarChart as RechartsBarChart, Bar, AreaChart, Area } from 'recharts';

interface ContactsDashboardProps {
  contacts: UnifiedContact[];
}

export const ContactsDashboard: React.FC<ContactsDashboardProps> = ({ contacts }) => {
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [selectedView, setSelectedView] = useState<'overview' | 'funnel' | 'sources' | 'performance'>('overview');

  // Calcular métricas principales
  const metrics = useMemo(() => {
    const now = new Date();
    const periodDays = selectedPeriod === '7d' ? 7 : selectedPeriod === '30d' ? 30 : selectedPeriod === '90d' ? 90 : 365;
    const periodStart = new Date(now.getTime() - periodDays * 24 * 60 * 60 * 1000);
    
    const contactsInPeriod = contacts.filter(c => new Date(c.created_at) >= periodStart);
    const previousPeriodStart = new Date(periodStart.getTime() - periodDays * 24 * 60 * 60 * 1000);
    const previousPeriodContacts = contacts.filter(c => 
      new Date(c.created_at) >= previousPeriodStart && new Date(c.created_at) < periodStart
    );

    const hotLeads = contacts.filter(c => c.is_hot_lead || (c.score || 0) >= 80);
    const opportunities = contacts.filter(c => c.status === 'opportunity');
    const customers = contacts.filter(c => c.status === 'customer');
    const qualified = contacts.filter(c => c.status === 'qualified');

    const conversionRate = contacts.length > 0 ? (customers.length / contacts.length) * 100 : 0;
    const qualificationRate = contacts.length > 0 ? (qualified.length / contacts.length) * 100 : 0;
    const hotLeadRate = contacts.length > 0 ? (hotLeads.length / contacts.length) * 100 : 0;

    // Cambios vs período anterior
    const totalChange = previousPeriodContacts.length > 0 
      ? ((contactsInPeriod.length - previousPeriodContacts.length) / previousPeriodContacts.length) * 100 
      : 0;

    return {
      total: contacts.length,
      newInPeriod: contactsInPeriod.length,
      hotLeads: hotLeads.length,
      opportunities: opportunities.length,
      customers: customers.length,
      qualified: qualified.length,
      conversionRate,
      qualificationRate,
      hotLeadRate,
      totalChange,
      avgScore: contacts.length > 0 
        ? contacts.filter(c => c.score).reduce((sum, c) => sum + (c.score || 0), 0) / contacts.filter(c => c.score).length 
        : 0
    };
  }, [contacts, selectedPeriod]);

  // Datos para gráficos
  const chartData = useMemo(() => {
    // Datos de tendencia por semanas
    const weeks = [];
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const weekStart = new Date(now.getTime() - (i * 7 * 24 * 60 * 60 * 1000));
      const weekEnd = new Date(weekStart.getTime() + (7 * 24 * 60 * 60 * 1000));
      const weekContacts = contacts.filter(c => {
        const contactDate = new Date(c.created_at);
        return contactDate >= weekStart && contactDate < weekEnd;
      });
      
      weeks.push({
        week: `S${12-i}`,
        contacts: weekContacts.length,
        hotLeads: weekContacts.filter(c => c.is_hot_lead || (c.score || 0) >= 80).length,
        opportunities: weekContacts.filter(c => c.status === 'opportunity').length
      });
    }

    // Distribución por fuentes
    const sourceData = [
      { name: 'Web Tracking', value: contacts.filter(c => c.source === 'lead_score').length, color: '#3B82F6' },
      { name: 'Apollo', value: contacts.filter(c => c.source === 'apollo').length, color: '#10B981' },
      { name: 'Web Tracking', value: contacts.filter(c => c.source === 'lead_score').length, color: '#F59E0B' }
    ];

    // Distribución por estados
    const statusData = [
      { name: 'Nuevos', value: contacts.filter(c => c.status === 'new').length, color: '#6B7280' },
      { name: 'Contactados', value: contacts.filter(c => c.status === 'contacted').length, color: '#3B82F6' },
      { name: 'Calificados', value: contacts.filter(c => c.status === 'qualified').length, color: '#10B981' },
      { name: 'Oportunidades', value: contacts.filter(c => c.status === 'opportunity').length, color: '#F59E0B' },
      { name: 'Clientes', value: contacts.filter(c => c.status === 'customer').length, color: '#059669' },
      { name: 'Perdidos', value: contacts.filter(c => c.status === 'lost').length, color: '#DC2626' }
    ];

    // Embudo de conversión
    const funnelData = [
      { stage: 'Leads Totales', count: contacts.length, percentage: 100 },
      { stage: 'Contactados', count: contacts.filter(c => c.status !== 'new').length, percentage: contacts.length > 0 ? (contacts.filter(c => c.status !== 'new').length / contacts.length) * 100 : 0 },
      { stage: 'Calificados', count: contacts.filter(c => ['qualified', 'opportunity', 'customer'].includes(c.status)).length, percentage: contacts.length > 0 ? (contacts.filter(c => ['qualified', 'opportunity', 'customer'].includes(c.status)).length / contacts.length) * 100 : 0 },
      { stage: 'Oportunidades', count: contacts.filter(c => ['opportunity', 'customer'].includes(c.status)).length, percentage: contacts.length > 0 ? (contacts.filter(c => ['opportunity', 'customer'].includes(c.status)).length / contacts.length) * 100 : 0 },
      { stage: 'Clientes', count: contacts.filter(c => c.status === 'customer').length, percentage: contacts.length > 0 ? (contacts.filter(c => c.status === 'customer').length / contacts.length) * 100 : 0 }
    ];

    return { weeks, sourceData, statusData, funnelData };
  }, [contacts]);

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

  return (
    <div className="space-y-6">
      {/* Header con controles */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-admin-text-primary">Dashboard de Contactos</h2>
          <p className="text-admin-text-secondary">Métricas en tiempo real y análisis visual</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={selectedPeriod === '7d' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedPeriod('7d')}
          >
            7D
          </Button>
          <Button
            variant={selectedPeriod === '30d' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedPeriod('30d')}
          >
            30D
          </Button>
          <Button
            variant={selectedPeriod === '90d' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedPeriod('90d')}
          >
            90D
          </Button>
          <Button
            variant={selectedPeriod === '1y' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedPeriod('1y')}
          >
            1A
          </Button>
        </div>
      </div>

      {/* KPIs principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="relative overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-admin-text-secondary">Total Contactos</p>
                <p className="text-3xl font-bold text-admin-text-primary">{metrics.total.toLocaleString()}</p>
                <div className="flex items-center gap-1">
                  {metrics.totalChange >= 0 ? (
                    <ArrowUp className="h-4 w-4 text-green-500" />
                  ) : (
                    <ArrowDown className="h-4 w-4 text-red-500" />
                  )}
                  <span className={`text-sm font-medium ${metrics.totalChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {Math.abs(metrics.totalChange).toFixed(1)}%
                  </span>
                  <span className="text-xs text-admin-text-secondary">vs período anterior</span>
                </div>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-admin-text-secondary">Leads Calientes</p>
                <p className="text-3xl font-bold text-admin-text-primary">{metrics.hotLeads}</p>
                <div className="flex items-center gap-1">
                  <div className="text-sm">
                    <span className="font-medium text-orange-600">{metrics.hotLeadRate.toFixed(1)}%</span>
                    <span className="text-admin-text-secondary ml-1">del total</span>
                  </div>
                </div>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <Star className="h-8 w-8 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-admin-text-secondary">Tasa Conversión</p>
                <p className="text-3xl font-bold text-admin-text-primary">{metrics.conversionRate.toFixed(1)}%</p>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full" 
                    style={{ width: `${Math.min(metrics.conversionRate, 100)}%` }}
                  ></div>
                </div>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <Target className="h-8 w-8 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-admin-text-secondary">Score Promedio</p>
                <p className="text-3xl font-bold text-admin-text-primary">{metrics.avgScore.toFixed(0)}</p>
                <div className="flex items-center gap-1">
                  <Progress value={metrics.avgScore} className="w-20 h-2" />
                  <span className="text-xs text-admin-text-secondary">/100</span>
                </div>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <TrendingUp className="h-8 w-8 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs para diferentes vistas */}
      <Tabs value={selectedView} onValueChange={(value: any) => setSelectedView(value)}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Resumen
          </TabsTrigger>
          <TabsTrigger value="funnel" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Embudo
          </TabsTrigger>
          <TabsTrigger value="sources" className="flex items-center gap-2">
            <PieChart className="h-4 w-4" />
            Fuentes
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Rendimiento
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Tendencia de contactos */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LineChart className="h-5 w-5" />
                  Tendencia de Contactos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsLineChart data={chartData.weeks}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="contacts" stroke="#3B82F6" strokeWidth={2} name="Contactos" />
                    <Line type="monotone" dataKey="hotLeads" stroke="#F59E0B" strokeWidth={2} name="Hot Leads" />
                  </RechartsLineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Estados de contactos */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Distribución por Estado
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={chartData.statusData}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {chartData.statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Métricas secundarias */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-admin-text-secondary">Oportunidades Activas</p>
                    <p className="text-2xl font-bold text-admin-text-primary">{metrics.opportunities}</p>
                    <p className="text-xs text-admin-text-secondary">
                      {metrics.total > 0 ? ((metrics.opportunities / metrics.total) * 100).toFixed(1) : 0}% del total
                    </p>
                  </div>
                  <Activity className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-admin-text-secondary">Nuevos ({selectedPeriod})</p>
                    <p className="text-2xl font-bold text-admin-text-primary">{metrics.newInPeriod}</p>
                    <div className="flex items-center gap-1">
                      {metrics.totalChange >= 0 ? (
                        <ArrowUp className="h-3 w-3 text-green-500" />
                      ) : (
                        <ArrowDown className="h-3 w-3 text-red-500" />
                      )}
                      <span className={`text-xs ${metrics.totalChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {Math.abs(metrics.totalChange).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <Calendar className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-admin-text-secondary">Tasa Calificación</p>
                    <p className="text-2xl font-bold text-admin-text-primary">{metrics.qualificationRate.toFixed(1)}%</p>
                    <Progress value={metrics.qualificationRate} className="w-16 h-2 mt-1" />
                  </div>
                  <Zap className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="funnel" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Embudo de Conversión</CardTitle>
              <p className="text-sm text-admin-text-secondary">
                Visualización del flujo de conversión de leads a clientes
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {chartData.funnelData.map((stage, index) => (
                  <div key={stage.stage} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-admin-text-primary">{stage.stage}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-admin-text-primary">{stage.count}</span>
                        <span className="text-sm text-admin-text-secondary">({stage.percentage.toFixed(1)}%)</span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className={`h-3 rounded-full ${
                          index === 0 ? 'bg-blue-600' :
                          index === 1 ? 'bg-cyan-600' :
                          index === 2 ? 'bg-yellow-600' :
                          index === 3 ? 'bg-orange-600' : 'bg-green-600'
                        }`}
                        style={{ width: `${stage.percentage}%` }}
                      ></div>
                    </div>
                    {index < chartData.funnelData.length - 1 && (
                      <div className="text-center text-xs text-admin-text-secondary">
                        ↓ {index === 0 ? 'Primer contacto' : 
                           index === 1 ? 'Calificación' : 
                           index === 2 ? 'Conversión a oportunidad' : 'Cierre de venta'}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sources" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Fuentes de Contactos</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={chartData.sourceData}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                    >
                      {chartData.sourceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Rendimiento por Fuente</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {chartData.sourceData.map((source, index) => (
                    <div key={source.name} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: source.color }}
                          ></div>
                          <span className="font-medium">{source.name}</span>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">{source.value}</div>
                          <div className="text-xs text-admin-text-secondary">
                            {contacts.length > 0 ? ((source.value / contacts.length) * 100).toFixed(1) : 0}%
                          </div>
                        </div>
                      </div>
                      <Progress 
                        value={contacts.length > 0 ? (source.value / contacts.length) * 100 : 0} 
                        className="h-2"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Análisis de Rendimiento</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={chartData.weeks}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="contacts" stackId="1" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} name="Total Contactos" />
                  <Area type="monotone" dataKey="hotLeads" stackId="2" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.6} name="Hot Leads" />
                  <Area type="monotone" dataKey="opportunities" stackId="3" stroke="#10B981" fill="#10B981" fillOpacity={0.6} name="Oportunidades" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ContactsDashboard;