import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  Users,
  Shield,
  Activity,
  TrendingUp,
  AlertTriangle,
  Clock,
  Server,
  Database,
  RefreshCw
} from 'lucide-react';
import { useAdminAnalytics } from '@/hooks/useAdminAnalytics';
import { useAdminSecurity } from '../security/AdminSecurityProvider';
import AdminActivityMonitor from '../enhanced/AdminActivityMonitor';
import { format } from 'date-fns';

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

const EnhancedAdminDashboard = () => {
  const { analytics, isLoading, refreshAnalytics } = useAdminAnalytics();
  const { isSecureSession, recentEvents } = useAdminSecurity();
  const [activeTab, setActiveTab] = useState('overview');

  const getHealthColor = (value: number, threshold: { warning: number; danger: number }) => {
    if (value >= threshold.danger) return 'destructive';
    if (value >= threshold.warning) return 'secondary';
    return 'default';
  };

  const securityEvents = recentEvents.filter(e => 
    ['suspicious_activity', 'permission_denied'].includes(e.type)
  ).slice(0, 5);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Panel de Administración</h1>
          <p className="text-muted-foreground">
            Dashboard avanzado con métricas y monitoreo en tiempo real
          </p>
        </div>
        <Button onClick={refreshAnalytics} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Actualizar
        </Button>
      </div>

      {/* Security Status Bar */}
      <Card className={`border-l-4 ${isSecureSession ? 'border-l-green-500' : 'border-l-red-500'}`}>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className={`h-6 w-6 ${isSecureSession ? 'text-green-600' : 'text-red-600'}`} />
              <div>
                <p className="font-medium">
                  {isSecureSession ? 'Sistema Seguro' : 'Alerta de Seguridad'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {securityEvents.length} eventos de seguridad recientes
                </p>
              </div>
            </div>
            <Badge variant={isSecureSession ? 'default' : 'destructive'}>
              {isSecureSession ? 'Operativo' : 'Requiere Atención'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Vista General</TabsTrigger>
          <TabsTrigger value="analytics">Analíticas</TabsTrigger>
          <TabsTrigger value="performance">Rendimiento</TabsTrigger>
          <TabsTrigger value="security">Seguridad</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Usuarios</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics?.totalUsers}</div>
                <p className="text-xs text-muted-foreground">
                  +12% desde el mes pasado
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Usuarios Activos</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics?.activeUsers}</div>
                <p className="text-xs text-muted-foreground">
                  {analytics?.recentLogins} logins recientes
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Administradores</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics?.adminUsers}</div>
                <p className="text-xs text-muted-foreground">
                  Cuentas administrativas
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tiempo de Carga</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics?.performanceMetrics.averageLoadTime}s</div>
                <p className="text-xs text-muted-foreground">
                  Promedio de respuesta
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Crecimiento de Usuarios</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analytics?.userGrowth}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="count" stroke="hsl(var(--primary))" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Páginas Más Visitadas</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analytics?.popularPages}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="page" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="visits" fill="hsl(var(--primary))" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Análisis Detallado</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Métricas avanzadas y análisis de tendencias próximamente...
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          {/* System Health */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">CPU</CardTitle>
                <Server className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics?.systemHealth.cpuUsage}%</div>
                <Badge variant={getHealthColor(analytics?.systemHealth.cpuUsage || 0, { warning: 70, danger: 90 })}>
                  {analytics?.systemHealth.cpuUsage || 0 < 70 ? 'Óptimo' : 'Alto'}
                </Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Memoria</CardTitle>
                <Database className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics?.systemHealth.memoryUsage}%</div>
                <Badge variant={getHealthColor(analytics?.systemHealth.memoryUsage || 0, { warning: 80, danger: 95 })}>
                  {analytics?.systemHealth.memoryUsage || 0 < 80 ? 'Normal' : 'Crítico'}
                </Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Uptime</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics?.performanceMetrics.uptime}%</div>
                <Badge variant="default">
                  Excelente
                </Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Errores</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{(analytics?.performanceMetrics.errorRate || 0) * 100}%</div>
                <Badge variant={analytics?.performanceMetrics.errorRate || 0 < 0.05 ? 'default' : 'destructive'}>
                  {analytics?.performanceMetrics.errorRate || 0 < 0.05 ? 'Bajo' : 'Alto'}
                </Badge>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <AdminActivityMonitor />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedAdminDashboard;