import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Activity, 
  AlertTriangle, 
  Shield, 
  Users, 
  Clock, 
  Eye,
  Download,
  RefreshCw
} from 'lucide-react';
import { useAdminSecurity } from '../security/AdminSecurityProvider';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'critical': return 'destructive';
    case 'high': return 'destructive';
    case 'medium': return 'secondary';
    case 'low': return 'outline';
    default: return 'outline';
  }
};

const getEventIcon = (type: string) => {
  switch (type) {
    case 'login_attempt': return Clock;
    case 'permission_denied': return Shield;
    case 'suspicious_activity': return AlertTriangle;
    case 'role_change': return Users;
    default: return Activity;
  }
};

const AdminActivityMonitor = () => {
  const { recentEvents, isSecureSession, sessionExpiry } = useAdminSecurity();
  const [filter, setFilter] = useState<string>('all');
  const [autoRefresh, setAutoRefresh] = useState(true);

  const filteredEvents = recentEvents.filter(event => {
    if (filter === 'all') return true;
    if (filter === 'security') return ['suspicious_activity', 'permission_denied'].includes(event.type);
    if (filter === 'auth') return ['login_attempt', 'role_change'].includes(event.type);
    return event.severity === filter;
  });

  const exportEvents = () => {
    const data = filteredEvents.map(event => ({
      timestamp: format(event.timestamp, 'yyyy-MM-dd HH:mm:ss'),
      type: event.type,
      severity: event.severity,
      userId: event.userId || 'N/A',
      details: JSON.stringify(event.details)
    }));

    const csv = [
      'Timestamp,Type,Severity,User ID,Details',
      ...data.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `admin-activity-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(() => {
      // Auto-refresh logic would go here
    }, 30000);

    return () => clearInterval(interval);
  }, [autoRefresh]);

  return (
    <div className="space-y-6">
      {/* Session Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Estado de Seguridad
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Badge variant={isSecureSession ? 'default' : 'destructive'}>
                {isSecureSession ? 'Sesión Segura' : 'Sesión Insegura'}
              </Badge>
              {sessionExpiry && (
                <span className="text-sm text-muted-foreground">
                  Expira: {format(sessionExpiry, 'HH:mm:ss', { locale: es })}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAutoRefresh(!autoRefresh)}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
                Auto-refresh
              </Button>
              <Button variant="outline" size="sm" onClick={exportEvents}>
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Activity Feed */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Monitor de Actividad ({filteredEvents.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" onValueChange={setFilter}>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="all">Todos</TabsTrigger>
              <TabsTrigger value="security">Seguridad</TabsTrigger>
              <TabsTrigger value="auth">Autenticación</TabsTrigger>
              <TabsTrigger value="high">Críticos</TabsTrigger>
              <TabsTrigger value="medium">Advertencias</TabsTrigger>
            </TabsList>

            <TabsContent value={filter} className="mt-4">
              <ScrollArea className="h-96 w-full">
                <div className="space-y-3">
                  {filteredEvents.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Eye className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No hay eventos para mostrar</p>
                      <p className="text-sm">Los eventos de actividad aparecerán aquí</p>
                    </div>
                  ) : (
                    filteredEvents.map((event) => {
                      const EventIcon = getEventIcon(event.type);
                      
                      return (
                        <Card key={event.id} className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="p-2 rounded-full bg-muted">
                              <EventIcon className="h-4 w-4" />
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <Badge variant={getSeverityColor(event.severity) as any}>
                                  {event.severity.toUpperCase()}
                                </Badge>
                                <span className="text-sm font-medium capitalize">
                                  {event.type.replace('_', ' ')}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {format(event.timestamp, 'HH:mm:ss')}
                                </span>
                              </div>
                              
                              {event.userId && (
                                <p className="text-sm text-muted-foreground mb-1">
                                  Usuario: {event.userId.slice(0, 8)}...
                                </p>
                              )}
                              
                              <div className="text-sm">
                                {Object.entries(event.details).map(([key, value]) => (
                                  <div key={key} className="flex gap-2">
                                    <span className="font-medium">{key}:</span>
                                    <span className="text-muted-foreground">
                                      {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </Card>
                      );
                    })
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminActivityMonitor;