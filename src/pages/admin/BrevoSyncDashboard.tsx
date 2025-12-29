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
  TrendingUp
} from 'lucide-react';
import { format, subDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';

interface SyncLogEntry {
  id: string;
  entity_id: string;
  entity_type: string;
  sync_status: string;
  brevo_id: string | null;
  sync_error: string | null;
  last_sync_at: string;
  sync_type: string | null;
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

  const handleRefresh = async () => {
    await refetchLogs();
    toast.success('Datos actualizados');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge variant="default" className="bg-green-500"><CheckCircle2 className="w-3 h-3 mr-1" /> Éxito</Badge>;
      case 'failed':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" /> Error</Badge>;
      case 'no_match':
        return <Badge variant="secondary"><AlertTriangle className="w-3 h-3 mr-1" /> Sin coincidencia</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'contact': return <Users className="w-4 h-4" />;
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
        </div>
      </div>

      {/* KPIs principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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

      {/* Tabs por tipo */}
      <Tabs defaultValue="all" onValueChange={setSelectedType}>
        <TabsList>
          <TabsTrigger value="all">Todos</TabsTrigger>
          <TabsTrigger value="contact">Contactos</TabsTrigger>
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
                      <TableHead>Estado</TableHead>
                      <TableHead>Entity ID</TableHead>
                      <TableHead>Brevo ID</TableHead>
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
                        <TableCell>{getStatusBadge(log.sync_status)}</TableCell>
                        <TableCell className="font-mono text-xs">
                          {log.entity_id?.substring(0, 8)}...
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                          {log.brevo_id || '-'}
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
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
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
    </div>
  );
};

export default BrevoSyncDashboard;
