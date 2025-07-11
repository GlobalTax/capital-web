import { useState, useEffect } from 'react';
import { Bell, AlertTriangle, TrendingUp, Users, X } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';

interface RealTimeNotification {
  id: string;
  type: 'hot_lead' | 'new_valuation' | 'content_performance' | 'system_alert';
  title: string;
  message: string;
  priority: 'high' | 'medium' | 'low';
  timestamp: Date;
  isRead: boolean;
  data?: Record<string, any>;
}

export function RealTimeNotifications() {
  const [notifications, setNotifications] = useState<RealTimeNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Cargar notificaciones iniciales
    loadNotifications();

    // Configurar subscripción en tiempo real
    const channel = supabase
      .channel('dashboard-notifications')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'lead_alerts' },
        (payload) => handleNewNotification(payload.new)
      )
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'company_valuations' },
        (payload) => handleNewValuation(payload.new)
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadNotifications = async () => {
    try {
      // Simular carga de notificaciones recientes
      const mockNotifications: RealTimeNotification[] = [
        {
          id: '1',
          type: 'hot_lead',
          title: 'Nuevo Lead Caliente',
          message: 'Empresa tecnológica con score 92 requiere atención inmediata',
          priority: 'high',
          timestamp: new Date(Date.now() - 10 * 60 * 1000),
          isRead: false
        },
        {
          id: '2',
          type: 'new_valuation',
          title: 'Nueva Valoración',
          message: 'Valoración completada para empresa del sector retail',
          priority: 'medium',
          timestamp: new Date(Date.now() - 30 * 60 * 1000),
          isRead: false
        },
        {
          id: '3',
          type: 'content_performance',
          title: 'Contenido Viral',
          message: 'El blog post "M&A en 2024" ha superado 1000 visualizaciones',
          priority: 'low',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
          isRead: true
        }
      ];

      setNotifications(mockNotifications);
      setUnreadCount(mockNotifications.filter(n => !n.isRead).length);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const handleNewNotification = (alertData: any) => {
    const notification: RealTimeNotification = {
      id: alertData.id,
      type: alertData.alert_type as any,
      title: 'Nueva Alerta',
      message: alertData.message,
      priority: alertData.priority as any,
      timestamp: new Date(alertData.created_at),
      isRead: false,
      data: alertData
    };

    setNotifications(prev => [notification, ...prev]);
    setUnreadCount(prev => prev + 1);
  };

  const handleNewValuation = (valuationData: any) => {
    const notification: RealTimeNotification = {
      id: `val_${valuationData.id}`,
      type: 'new_valuation',
      title: 'Nueva Valoración Completada',
      message: `${valuationData.company_name} - ${valuationData.industry}`,
      priority: 'medium',
      timestamp: new Date(valuationData.created_at),
      isRead: false,
      data: valuationData
    };

    setNotifications(prev => [notification, ...prev]);
    setUnreadCount(prev => prev + 1);
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, isRead: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    const notification = notifications.find(n => n.id === id);
    if (notification && !notification.isRead) {
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'hot_lead':
        return <TrendingUp className="h-4 w-4" />;
      case 'new_valuation':
        return <Users className="h-4 w-4" />;
      case 'content_performance':
        return <Bell className="h-4 w-4" />;
      case 'system_alert':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'secondary';
      case 'low':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notificaciones en Tiempo Real
          </div>
          {unreadCount > 0 && (
            <Badge variant="destructive">{unreadCount}</Badge>
          )}
        </CardTitle>
        <CardDescription>
          Alertas y actualizaciones importantes del sistema
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No hay notificaciones recientes
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
                  !notification.isRead ? 'bg-muted/50' : 'hover:bg-muted/30'
                }`}
              >
                <div className="flex-shrink-0 mt-1">
                  {getNotificationIcon(notification.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{notification.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {notification.message}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant={getPriorityColor(notification.priority) as any}>
                          {notification.priority}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Intl.RelativeTimeFormat('es', { numeric: 'auto' }).format(
                            Math.round((notification.timestamp.getTime() - Date.now()) / (1000 * 60)),
                            'minute'
                          )}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex gap-1">
                      {!notification.isRead && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => markAsRead(notification.id)}
                          className="h-6 w-6 p-0"
                        >
                          <Bell className="h-3 w-3" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => dismissNotification(notification.id)}
                        className="h-6 w-6 p-0"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}