import React, { useState } from 'react';
import { 
  Bell, 
  Check, 
  Trash2, 
  Filter,
  User,
  Calendar,
  Calculator,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useRealtimeNotifications, Notification } from '@/hooks/useRealtimeNotifications';
import { NotificationItem } from '@/components/admin/NotificationItem';
import { LoadingState, EmptyState } from '@/components/admin/shared';
import { useNavigate } from 'react-router-dom';

export default function NotificationsPage() {
  const navigate = useNavigate();
  // TODO: Get actual user ID from auth context
  const userId = undefined;
  
  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification
  } = useRealtimeNotifications(userId);

  const [filter, setFilter] = useState<'all' | Notification['type']>('all');

  const filteredNotifications = filter === 'all' 
    ? notifications 
    : notifications.filter(n => n.type === filter);

  const unreadNotifications = filteredNotifications.filter(n => !n.is_read);
  const readNotifications = filteredNotifications.filter(n => n.is_read);

  const typeStats = {
    lead: notifications.filter(n => n.type === 'lead').length,
    booking: notifications.filter(n => n.type === 'booking').length,
    valuation: notifications.filter(n => n.type === 'valuation').length,
    alert: notifications.filter(n => n.type === 'alert').length,
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Notificaciones</h1>
        <LoadingState variant="list" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Notificaciones</h1>
          <p className="text-muted-foreground">
            {unreadCount} sin leer de {notifications.length} totales
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" onClick={markAllAsRead}>
            <Check className="h-4 w-4 mr-2" />
            Marcar todo como leído
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="cursor-pointer hover:bg-muted/50" onClick={() => setFilter('lead')}>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[hsl(var(--status-new-bg))]">
                <User className="h-4 w-4 text-[hsl(var(--status-new))]" />
              </div>
              <div>
                <p className="text-2xl font-bold">{typeStats.lead}</p>
                <p className="text-xs text-muted-foreground">Leads</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:bg-muted/50" onClick={() => setFilter('booking')}>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[hsl(var(--status-contacted-bg))]">
                <Calendar className="h-4 w-4 text-[hsl(var(--status-contacted))]" />
              </div>
              <div>
                <p className="text-2xl font-bold">{typeStats.booking}</p>
                <p className="text-xs text-muted-foreground">Reservas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:bg-muted/50" onClick={() => setFilter('valuation')}>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[hsl(var(--origin-valuation-bg))]">
                <Calculator className="h-4 w-4 text-[hsl(var(--origin-valuation))]" />
              </div>
              <div>
                <p className="text-2xl font-bold">{typeStats.valuation}</p>
                <p className="text-xs text-muted-foreground">Valoraciones</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:bg-muted/50" onClick={() => setFilter('alert')}>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[hsl(var(--priority-hot-bg))]">
                <AlertCircle className="h-4 w-4 text-[hsl(var(--priority-hot))]" />
              </div>
              <div>
                <p className="text-2xl font-bold">{typeStats.alert}</p>
                <p className="text-xs text-muted-foreground">Alertas</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <div className="flex gap-1">
          {(['all', 'lead', 'booking', 'valuation', 'alert'] as const).map(type => (
            <Button
              key={type}
              variant={filter === type ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setFilter(type)}
            >
              {type === 'all' ? 'Todas' : 
               type === 'lead' ? 'Leads' :
               type === 'booking' ? 'Reservas' :
               type === 'valuation' ? 'Valoraciones' : 'Alertas'}
            </Button>
          ))}
        </div>
      </div>

      {/* Notifications list */}
      <Tabs defaultValue="unread" className="w-full">
        <TabsList>
          <TabsTrigger value="unread">
            Sin leer ({unreadNotifications.length})
          </TabsTrigger>
          <TabsTrigger value="read">
            Leídas ({readNotifications.length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="unread" className="mt-4">
          {unreadNotifications.length === 0 ? (
            <Card>
              <CardContent className="py-8">
                <EmptyState
                  preset="no-data"
                  title="Todo al día"
                  description="No tienes notificaciones pendientes"
                />
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-2 space-y-1">
                {unreadNotifications.map(notification => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onMarkAsRead={markAsRead}
                    onDelete={deleteNotification}
                    onClick={() => notification.link && navigate(notification.link)}
                  />
                ))}
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="read" className="mt-4">
          {readNotifications.length === 0 ? (
            <Card>
              <CardContent className="py-8">
                <EmptyState
                  preset="no-data"
                  title="Sin historial"
                  description="No hay notificaciones leídas"
                />
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-2 space-y-1">
                {readNotifications.map(notification => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onMarkAsRead={markAsRead}
                    onDelete={deleteNotification}
                    onClick={() => notification.link && navigate(notification.link)}
                  />
                ))}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
