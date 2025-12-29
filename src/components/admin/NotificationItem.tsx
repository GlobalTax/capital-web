import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  User, 
  Calendar, 
  Calculator, 
  AlertCircle, 
  Bell,
  X,
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Notification } from '@/hooks/useRealtimeNotifications';

const typeIcons: Record<Notification['type'], React.ElementType> = {
  lead: User,
  booking: Calendar,
  valuation: Calculator,
  alert: AlertCircle,
  system: Bell,
};

const typeColors: Record<Notification['type'], string> = {
  lead: 'bg-[hsl(var(--status-new-bg))] text-[hsl(var(--status-new))]',
  booking: 'bg-[hsl(var(--status-contacted-bg))] text-[hsl(var(--status-contacted))]',
  valuation: 'bg-[hsl(var(--origin-valuation-bg))] text-[hsl(var(--origin-valuation))]',
  alert: 'bg-[hsl(var(--priority-hot-bg))] text-[hsl(var(--priority-hot))]',
  system: 'bg-muted text-muted-foreground',
};

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
  onClick?: () => void;
}

export function NotificationItem({ 
  notification, 
  onMarkAsRead, 
  onDelete,
  onClick 
}: NotificationItemProps) {
  const Icon = typeIcons[notification.type] || Bell;
  const colorClass = typeColors[notification.type] || typeColors.system;

  const handleClick = () => {
    if (!notification.is_read) {
      onMarkAsRead(notification.id);
    }
    onClick?.();
  };

  return (
    <div 
      className={cn(
        "flex items-start gap-3 p-3 rounded-lg transition-colors cursor-pointer hover:bg-muted/50 group",
        !notification.is_read && "bg-muted/30"
      )}
      onClick={handleClick}
    >
      <div className={cn("p-2 rounded-lg shrink-0", colorClass)}>
        <Icon className="h-4 w-4" />
      </div>
      
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-start justify-between gap-2">
          <p className={cn(
            "text-sm font-medium line-clamp-1",
            !notification.is_read && "text-foreground",
            notification.is_read && "text-muted-foreground"
          )}>
            {notification.title}
          </p>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(notification.id);
            }}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
        
        <p className="text-xs text-muted-foreground line-clamp-2">
          {notification.message}
        </p>
        
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(notification.created_at), { 
              addSuffix: true, 
              locale: es 
            })}
          </span>
          {notification.link && (
            <ExternalLink className="h-3 w-3 text-muted-foreground" />
          )}
          {!notification.is_read && (
            <div className="h-2 w-2 rounded-full bg-[hsl(var(--status-new))]" />
          )}
        </div>
      </div>
    </div>
  );
}
