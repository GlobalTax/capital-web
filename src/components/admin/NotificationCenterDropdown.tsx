import React, { useState } from 'react';
import { Bell, Check, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useRealtimeNotifications } from '@/hooks/useRealtimeNotifications';
import { NotificationItem } from './NotificationItem';
import { LoadingState } from './shared/LoadingState';
import { EmptyState } from './shared/EmptyState';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface NotificationCenterProps {
  userId?: string;
  className?: string;
}

export function NotificationCenter({ userId, className }: NotificationCenterProps) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  
  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification
  } = useRealtimeNotifications(userId);

  const handleNotificationClick = (link?: string) => {
    if (link) {
      navigate(link);
      setOpen(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn("relative", className)}
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 h-4 w-4 flex items-center justify-center rounded-full bg-[hsl(var(--priority-hot))] text-[10px] font-bold text-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      
      <PopoverContent 
        className="w-96 p-0" 
        align="end" 
        sideOffset={8}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <h3 className="font-semibold text-sm">Notificaciones</h3>
          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={markAllAsRead}
              >
                <Check className="h-3 w-3 mr-1" />
                Marcar todo leído
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => {
                navigate('/admin/notifications');
                setOpen(false);
              }}
            >
              <Settings className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <ScrollArea className="max-h-[400px]">
          {isLoading ? (
            <div className="p-4">
              <LoadingState variant="inline" message="Cargando..." />
            </div>
          ) : notifications.length === 0 ? (
            <EmptyState
              preset="no-data"
              title="Sin notificaciones"
              description="No tienes notificaciones nuevas"
              className="py-8"
            />
          ) : (
            <div className="p-2 space-y-1">
              {notifications.slice(0, 10).map(notification => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={markAsRead}
                  onDelete={deleteNotification}
                  onClick={() => handleNotificationClick(notification.link)}
                />
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        {notifications.length > 10 && (
          <div className="px-4 py-3 border-t border-border">
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-xs"
              onClick={() => {
                navigate('/admin/notifications');
                setOpen(false);
              }}
            >
              Ver todas las notificaciones
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
