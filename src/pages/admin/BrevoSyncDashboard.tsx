import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  RefreshCw, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  Users,
  Building2,
  Briefcase,
  Activity,
  Mail,
  MousePointer,
  TrendingUp,
  RotateCcw,
  Clock,
  Zap,
  Webhook,
  UserCheck,
  UserX,
  ListPlus,
  Radio
} from 'lucide-react';
import { format, subDays, formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, CartesianGrid, Legend } from 'recharts';

interface SyncLogEntry {
  id: string;
  entity_id: string;
  entity_type: string;
  sync_status: string;
  sync_type: string | null;
  brevo_id: string | null;
  sync_error: string | null;
  duration_ms: number | null;
  sync_attempts: number | null;
  last_sync_at: string;
  created_at: string;
}

interface SyncStats {
  total: number;
  success: number;
  failed: number;
  pending: number;
}

const BrevoSyncDashboard: React.FC = () => {
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month'>('week');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [isRetrying, setIsRetrying] = useState(false);

  // Calcular fecha de inicio según el rango
  const getStartDate = () => {
    switch (dateRange) {
      case 'today': return subDays(new Date(), 1);
      case 'week': return subDays(new Date(), 7);
      case 'month': return subDays(new Date(), 30);
      default: return subDays(new Date(), 7);
    }
  };

  // Obtener logs de sincronización
  const { data: syncLogs, isLoading: logsLoading, refetch: refetchLogs } = useQuery({
    queryKey: ['brevo-sync-logs', dateRange, selectedType],
    queryFn: async () => {
      let query = supabase
        .from('brevo_sync_log')
        .select('*')
        .gte('created_at', getStartDate().toISOString())
        .order('created_at', { ascending: false })
        .limit(100);

      if (selectedType !== 'all') {
        query = query.eq('entity_type', selectedType);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as SyncLogEntry[];
    },
  });

  // Obtener estadísticas generales
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['brevo-sync-stats', dateRange],
    queryFn: async () => {
      const startDate = getStartDate().toISOString();

      // Stats por tipo de entidad
      const { data: byType, error } = await supabase
        .from('brevo_sync_log')
        .select('entity_type, sync_status')
        .gte('created_at', startDate);

      if (error) throw error;

      const typeStats: Record<string, SyncStats> = {
        contact: { total: 0, success: 0, failed: 0, pending: 0 },
        event: { total: 0, success: 0, failed: 0, pending: 0 },
        webhook_event: { total: 0, success: 0, failed: 0, pending: 0 },
        company: { total: 0, success: 0, failed: 0, pending: 0 },
        deal: { total: 0, success: 0, failed: 0, pending: 0 },
        valuation: { total: 0, success: 0, failed: 0, pending: 0 },
      };

      byType?.forEach(entry => {
        const type = entry.entity_type || 'contact';
        if (!typeStats[type]) {
          typeStats[type] = { total: 0, success: 0, failed: 0, pending: 0 };
        }
        typeStats[type].total++;
        if (entry.sync_status === 'success') {
          typeStats[type].success++;
        } else if (entry.sync_status === 'failed') {
          typeStats[type].failed++;
        } else {
          typeStats[type].pending++;
        }
      });

      return typeStats;
    },
  });

  // Obtener datos para gráfico de tendencias
  const { data: trendData } = useQuery({
    queryKey: ['brevo-sync-trends', dateRange],
    queryFn: async () => {
      const startDate = getStartDate().toISOString();
      
      const { data, error } = await supabase
        .from('brevo_sync_log')
        .select('created_at, sync_status, duration_ms')
        .gte('created_at', startDate)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Agrupar por día
      const byDay: Record<string, { date: string; success: number; failed: number; avgDuration: number; count: number }> = {};
      
      data?.forEach(entry => {
        const day = format(new Date(entry.created_at), 'dd/MM');
        if (!byDay[day]) {
          byDay[day] = { date: day, success: 0, failed: 0, avgDuration: 0, count: 0 };
        }
        if (entry.sync_status === 'success') {
          byDay[day].success++;
        } else {
          byDay[day].failed++;
        }
        if (entry.duration_ms) {
          byDay[day].avgDuration = ((byDay[day].avgDuration * byDay[day].count) + entry.duration_ms) / (byDay[day].count + 1);
          byDay[day].count++;
        }
      });

      return Object.values(byDay);
    },
  });

  // Obtener métricas de performance
  const { data: performanceStats } = useQuery({
    queryKey: ['brevo-performance-stats', dateRange],
    queryFn: async () => {
      const startDate = getStartDate().toISOString();
      
      const { data, error } = await supabase
        .from('brevo_sync_log')
        .select('duration_ms, sync_type')
        .gte('created_at', startDate)
        .not('duration_ms', 'is', null);

      if (error) throw error;

      const durations = data?.map(d => d.duration_ms).filter(Boolean) as number[];
      const avgDuration = durations.length > 0 
        ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
        : 0;
      const maxDuration = durations.length > 0 ? Math.max(...durations) : 0;
      const minDuration = durations.length > 0 ? Math.min(...durations) : 0;

      // Agrupar por tipo de sync
      const byType: Record<string, number[]> = {};
      data?.forEach(d => {
        const type = d.sync_type || 'unknown';
        if (!byType[type]) byType[type] = [];
        if (d.duration_ms) byType[type].push(d.duration_ms);
      });

      const avgByType = Object.entries(byType).map(([type, durations]) => ({
        type,
        avgDuration: Math.round(durations.reduce((a, b) => a + b, 0) / durations.length),
      }));

      return { avgDuration, maxDuration, minDuration, avgByType };
    },
  });

  // Obtener métricas de engagement
  const { data: engagementStats } = useQuery({
    queryKey: ['brevo-engagement-stats'],
    queryFn: async () => {
      // Valuations con engagement
      const { data: valuations } = await supabase
        .from('company_valuations')
        .select('email_opened, email_clicked, email_bounced, email_unsubscribed')
        .eq('is_deleted', false);

      const opened = valuations?.filter(v => v.email_opened).length || 0;
      const clicked = valuations?.filter(v => v.email_clicked).length || 0;
      const bounced = valuations?.filter(v => v.email_bounced).length || 0;
      const unsubscribed = valuations?.filter(v => v.email_unsubscribed).length || 0;
      const total = valuations?.length || 0;

      return {
        total,
        opened,
        clicked,
        bounced,
        unsubscribed,
        openRate: total > 0 ? ((opened / total) * 100).toFixed(1) : '0',
        clickRate: opened > 0 ? ((clicked / opened) * 100).toFixed(1) : '0',
      };
    },
  });

  // Contar fallidos pendientes de retry
  const { data: failedCount } = useQuery({
    queryKey: ['brevo-failed-count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('brevo_sync_log')
        .select('*', { count: 'exact', head: true })
        .eq('sync_status', 'failed')
        .lt('sync_attempts', 3);

      if (error) return 0;
      return count || 0;
    },
  });

  // Webhooks recibidos en tiempo real (auto-refresh cada 5s)
  const { data: recentWebhooks, isLoading: webhooksLoading } = useQuery({
    queryKey: ['brevo-recent-webhooks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('brevo_sync_log')
        .select('*')
        .or('sync_type.ilike.%inbound%,sync_type.ilike.%email_%')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      return data as SyncLogEntry[];
    },
    refetchInterval: 5000, // Auto-refresh cada 5 segundos
  });

  // Helpers para webhooks recibidos
  const getWebhookEventIcon = (syncType: string | null) => {
    if (!syncType) return <Webhook className="w-4 h-4 text-muted-foreground" />;
    if (syncType.startsWith('email_')) return <Mail className="w-4 h-4 text-blue-500" />;
    if (syncType === 'inbound_update') return <UserCheck className="w-4 h-4 text-green-500" />;
    if (syncType === 'inbound_delete') return <UserX className="w-4 h-4 text-red-500" />;
    if (syncType === 'inbound_list') return <ListPlus className="w-4 h-4 text-purple-500" />;
    return <Webhook className="w-4 h-4 text-muted-foreground" />;
  };

  const getWebhookEventLabel = (syncType: string | null) => {
    if (!syncType) return 'Webhook';
    const labels: Record<string, string> = {
      'email_opened': 'Email Abierto',
      'email_clicked': 'Click en Email',
      'email_delivered': 'Email Entregado',
      'email_bounced': 'Rebotado',
      'email_soft_bounced': 'Rebote Suave',
      'email_unsubscribed': 'Baja',
      'email_spam': 'Spam',
      'email_blocked': 'Bloqueado',
      'inbound_update': 'Contacto Actualizado',
      'inbound_delete': 'Contacto Eliminado',
      'inbound_list': 'Añadido a Lista'
    };
    return labels[syncType] || syncType;
  };

  const handleRefresh = async () => {
    await refetchLogs();
    toast.success('Datos actualizados');
  };

  const handleRetryFailed = async () => {
    setIsRetrying(true);
    try {
      const { data, error } = await supabase.functions.invoke('brevo-retry-failed', {
        body: { limit: 50 }
      });

      if (error) throw error;

      toast.success(`Retry completado: ${data.successful} exitosos, ${data.failed} fallidos`);
      refetchLogs();
    } catch (err: any) {
      toast.error('Error al reintentar: ' + err.message);
    } finally {
      setIsRetrying(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge variant="default" className="bg-green-500"><CheckCircle2 className="w-3 h-3 mr-1" /> Éxito</Badge>;
      case 'failed':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" /> Error</Badge>;
      case 'permanently_failed':
        return <Badge variant="destructive" className="bg-red-700"><XCircle className="w-3 h-3 mr-1" /> Fallido Permanente</Badge>;
      case 'no_match':
        return <Badge variant="secondary"><AlertTriangle className="w-3 h-3 mr-1" /> Sin coincidencia</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'contact': return <Users className="w-4 h-4" />;
      case 'valuation': return <TrendingUp className="w-4 h-4" />;
      case 'company': return <Building2 className="w-4 h-4" />;
      case 'deal': return <Briefcase className="w-4 h-4" />;
      case 'event': return <Activity className="w-4 h-4" />;
      case 'webhook_event': return <Mail className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const totalStats = stats ? Object.values(stats).reduce((acc, s) => ({
    total: acc.total + s.total,
    success: acc.success + s.success,
    failed: acc.failed + s.failed,
    pending: acc.pending + s.pending,
  }), { total: 0, success: 0, failed: 0, pending: 0 }) : null;

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Sincronización Brevo</h1>
          <p className="text-muted-foreground">Monitoreo de sincronización bidireccional con Brevo</p>
        </div>
        <div className="flex gap-2">
          <Select value={dateRange} onValueChange={(v: 'today' | 'week' | 'month') => setDateRange(v)}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Hoy</SelectItem>
              <SelectItem value="week">Última semana</SelectItem>
              <SelectItem value="month">Último mes</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Actualizar
          </Button>
          {failedCount && failedCount > 0 && (
            <Button 
              variant="secondary" 
              onClick={handleRetryFailed}
              disabled={isRetrying}
            >
              <RotateCcw className={`w-4 h-4 mr-2 ${isRetrying ? 'animate-spin' : ''}`} />
              Reintentar {failedCount} fallidos
            </Button>
          )}
        </div>
      </div>

      {/* KPIs principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Sincronizaciones</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStats?.total || 0}</div>
            <p className="text-xs text-muted-foreground">
              {dateRange === 'today' ? 'Hoy' : dateRange === 'week' ? 'Última semana' : 'Último mes'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Tasa de Éxito</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {totalStats && totalStats.total > 0 
                ? ((totalStats.success / totalStats.total) * 100).toFixed(1) 
                : '0'}%
            </div>
            <p className="text-xs text-muted-foreground">
              {totalStats?.success || 0} exitosas de {totalStats?.total || 0}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Errores</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{totalStats?.failed || 0}</div>
            <p className="text-xs text-muted-foreground">
              Sincronizaciones fallidas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Tiempo Medio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{performanceStats?.avgDuration || 0}ms</div>
            <p className="text-xs text-muted-foreground">
              Max: {performanceStats?.maxDuration || 0}ms
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Tasa Apertura</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{engagementStats?.openRate || 0}%</div>
            <p className="text-xs text-muted-foreground">
              {engagementStats?.opened || 0} de {engagementStats?.total || 0} emails
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de tendencias */}
      {trendData && trendData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Tendencias de Sincronización
            </CardTitle>
            <CardDescription>Sincronizaciones por día</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }} 
                  />
                  <Legend />
                  <Bar dataKey="success" name="Exitosas" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="failed" name="Fallidas" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Engagement de emails */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Métricas de Email Engagement
          </CardTitle>
          <CardDescription>Datos recibidos de Brevo via webhooks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <Mail className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
              <div className="text-xl font-bold">{engagementStats?.total || 0}</div>
              <div className="text-xs text-muted-foreground">Total Leads</div>
            </div>
            <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
              <CheckCircle2 className="w-6 h-6 mx-auto mb-2 text-green-600" />
              <div className="text-xl font-bold text-green-600">{engagementStats?.opened || 0}</div>
              <div className="text-xs text-muted-foreground">Abiertos</div>
            </div>
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <MousePointer className="w-6 h-6 mx-auto mb-2 text-blue-600" />
              <div className="text-xl font-bold text-blue-600">{engagementStats?.clicked || 0}</div>
              <div className="text-xs text-muted-foreground">Clicks</div>
            </div>
            <div className="text-center p-4 bg-red-50 dark:bg-red-950 rounded-lg">
              <XCircle className="w-6 h-6 mx-auto mb-2 text-red-600" />
              <div className="text-xl font-bold text-red-600">{engagementStats?.bounced || 0}</div>
              <div className="text-xs text-muted-foreground">Rebotados</div>
            </div>
            <div className="text-center p-4 bg-orange-50 dark:bg-orange-950 rounded-lg">
              <AlertTriangle className="w-6 h-6 mx-auto mb-2 text-orange-600" />
              <div className="text-xl font-bold text-orange-600">{engagementStats?.unsubscribed || 0}</div>
              <div className="text-xs text-muted-foreground">Bajas</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Webhooks Recibidos en Tiempo Real */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Webhook className="w-5 h-5" />
              <div>
                <CardTitle>Webhooks Recibidos</CardTitle>
                <CardDescription>Últimos eventos recibidos de Brevo</CardDescription>
              </div>
            </div>
            <Badge className="bg-green-500 flex items-center gap-1.5">
              <Radio className="w-3 h-3 animate-pulse" />
              En vivo
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {webhooksLoading ? (
            <div className="flex justify-center py-8">
              <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : recentWebhooks && recentWebhooks.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">Tipo</TableHead>
                  <TableHead>Evento</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Tiempo</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentWebhooks.map((webhook) => (
                  <TableRow key={webhook.id}>
                    <TableCell>
                      {getWebhookEventIcon(webhook.sync_type)}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-medium">
                        {getWebhookEventLabel(webhook.sync_type)}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground font-mono">
                      {webhook.entity_id?.includes('@') ? webhook.entity_id : '-'}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(webhook.created_at), { addSuffix: true, locale: es })}
                    </TableCell>
                    <TableCell>{getStatusBadge(webhook.sync_status)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Webhook className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No hay webhooks recibidos todavía</p>
              <p className="text-xs mt-1">
                Edita un contacto en Brevo o envía un email de prueba para verificar
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabs por tipo */}
      <Tabs defaultValue="all" onValueChange={setSelectedType}>
        <TabsList>
          <TabsTrigger value="all">Todos</TabsTrigger>
          <TabsTrigger value="contact">Contactos</TabsTrigger>
          <TabsTrigger value="valuation">Valoraciones</TabsTrigger>
          <TabsTrigger value="event">Eventos</TabsTrigger>
          <TabsTrigger value="webhook_event">Webhooks</TabsTrigger>
          <TabsTrigger value="company">Empresas</TabsTrigger>
          <TabsTrigger value="deal">Deals</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedType} className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Log de Sincronización</CardTitle>
              <CardDescription>Últimas {syncLogs?.length || 0} sincronizaciones</CardDescription>
            </CardHeader>
            <CardContent>
              {logsLoading ? (
                <div className="flex justify-center py-8">
                  <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : syncLogs && syncLogs.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Operación</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Duración</TableHead>
                      <TableHead>Intentos</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Error</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {syncLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getTypeIcon(log.entity_type)}
                            <span className="capitalize">{log.entity_type}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {log.sync_type || '-'}
                        </TableCell>
                        <TableCell>{getStatusBadge(log.sync_status)}</TableCell>
                        <TableCell className="text-sm">
                          {log.duration_ms ? `${log.duration_ms}ms` : '-'}
                        </TableCell>
                        <TableCell className="text-center">
                          {log.sync_attempts || 1}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {format(new Date(log.created_at), 'dd/MM HH:mm', { locale: es })}
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate text-xs text-red-600">
                          {log.sync_error || '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No hay registros de sincronización en este período
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Estadísticas por tipo */}
      {stats && (
        <Card>
          <CardHeader>
            <CardTitle>Estadísticas por Tipo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
              {Object.entries(stats).map(([type, typeStats]) => (
                <div key={type} className="border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    {getTypeIcon(type)}
                    <span className="font-medium capitalize">{type}</span>
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total:</span>
                      <span className="font-medium">{typeStats.total}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-600">Éxito:</span>
                      <span className="font-medium text-green-600">{typeStats.success}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-red-600">Error:</span>
                      <span className="font-medium text-red-600">{typeStats.failed}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Performance por tipo de operación */}
      {performanceStats?.avgByType && performanceStats.avgByType.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Rendimiento por Operación
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {performanceStats.avgByType.map(({ type, avgDuration }) => (
                <div key={type} className="text-center p-3 bg-muted/30 rounded-lg">
                  <div className="text-lg font-bold">{avgDuration}ms</div>
                  <div className="text-xs text-muted-foreground capitalize">{type}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BrevoSyncDashboard;
