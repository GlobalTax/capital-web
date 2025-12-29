import React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Bell, CheckCircle, AlertCircle, Info, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

const LinearNotificationCenter = () => {
  const navigate = useNavigate();
  
  // Mock notifications - in production, use useRealtimeNotifications hook
  const notifications = [
    {
      id: '1',
      type: 'success',
      title: 'Sistema actualizado',
      message: 'Panel actualizado correctamente',
      time: 'Hace 5 min',
      read: false
    },
    {
      id: '2',
      type: 'info',
      title: 'Nuevo lead',
      message: 'Valoración recibida de empresa',
      time: 'Hace 1 hora',
      read: false
    }
  ];

  const unreadCount = notifications.filter(n => !n.read).length;
  const hasUnread = unreadCount > 0;

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />;
      case 'warning':
        return <AlertCircle className="h-3.5 w-3.5 text-amber-500" />;
      case 'info':
      default:
        return <Info className="h-3.5 w-3.5 text-blue-500" />;
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 w-8 p-0 relative text-muted-foreground hover:text-foreground"
        >
          <Bell className="h-4 w-4" />
          {/* Dot indicator - only shows when there are unread notifications */}
          {hasUnread && (
            <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full ring-2 ring-[hsl(var(--linear-bg))]" />
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent 
        className="w-72 bg-popover border-[hsl(var(--linear-border))] shadow-md" 
        align="end"
        sideOffset={8}
      >
        <DropdownMenuLabel className="flex items-center justify-between py-2">
          <span className="text-sm font-medium">Notificaciones</span>
          {hasUnread && (
            <span className="text-xs text-muted-foreground">{unreadCount} sin leer</span>
          )}
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator className="bg-[hsl(var(--linear-border))]" />
        
        {notifications.length > 0 ? (
          <>
            {notifications.slice(0, 5).map((notification) => (
              <DropdownMenuItem 
                key={notification.id} 
                className={cn(
                  "cursor-pointer py-2.5 px-3 focus:bg-[hsl(var(--linear-bg-hover))]",
                  !notification.read && "bg-[hsl(var(--accent-primary)/0.05)]"
                )}
              >
                <div className="flex gap-2.5 w-full">
                  <div className="mt-0.5 shrink-0">
                    {getIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0 space-y-0.5">
                    <p className="text-sm font-medium truncate">{notification.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{notification.message}</p>
                    <p className="text-[10px] text-muted-foreground/70">{notification.time}</p>
                  </div>
                </div>
              </DropdownMenuItem>
            ))}
            
            <DropdownMenuSeparator className="bg-[hsl(var(--linear-border))]" />
            
            <DropdownMenuItem 
              className="cursor-pointer py-2 justify-center text-xs text-muted-foreground hover:text-foreground"
              onClick={() => navigate('/admin/notifications')}
            >
              <span>Ver todas</span>
              <ExternalLink className="h-3 w-3 ml-1" />
            </DropdownMenuItem>
          </>
        ) : (
          <div className="py-8 text-center">
            <Bell className="h-8 w-8 mx-auto text-muted-foreground/30 mb-2" />
            <p className="text-sm text-muted-foreground">No hay notificaciones</p>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LinearNotificationCenter;
