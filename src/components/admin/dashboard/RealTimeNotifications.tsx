import { Bell, AlertTriangle, TrendingUp, Users, X, Wifi, WifiOff } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useRealTimeNotifications } from '@/hooks/useRealTimeNotifications';

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
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    dismissNotification, 
    isConnected 
  } = useRealTimeNotifications();


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
            {isConnected ? (
              <Wifi className="h-4 w-4 text-green-500" />
            ) : (
              <WifiOff className="h-4 w-4 text-red-500" />
            )}
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