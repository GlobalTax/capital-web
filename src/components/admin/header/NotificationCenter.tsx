
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
import { Bell, CheckCircle, AlertCircle } from 'lucide-react';

const NotificationCenter = React.memo(() => {
  const notifications = React.useMemo(() => [
    {
      id: '1',
      type: 'success',
      title: 'Sistema actualizado',
      message: 'El panel de administración se ha actualizado correctamente',
      time: 'Hace 5 min'
    },
    {
      id: '2',
      type: 'info',
      title: 'Nuevo contenido',
      message: 'Se han agregado 3 nuevos casos de éxito',
      time: 'Hace 1 hora'
    }
  ], []);

  const getIcon = React.useCallback((type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-blue-500" />;
    }
  }, []);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-4 w-4" />
          {notifications.length > 0 && (
            <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full text-xs flex items-center justify-center text-white">
              {notifications.length}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80 bg-white" align="end">
        <DropdownMenuLabel>Notificaciones</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {notifications.length > 0 ? (
          notifications.map((notification) => (
            <DropdownMenuItem key={notification.id} className="cursor-pointer p-4">
              <div className="flex gap-3 w-full">
                {getIcon(notification.type)}
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium">{notification.title}</p>
                  <p className="text-xs text-gray-500">{notification.message}</p>
                  <p className="text-xs text-gray-400">{notification.time}</p>
                </div>
              </div>
            </DropdownMenuItem>
          ))
        ) : (
          <DropdownMenuItem disabled>
            <span className="text-sm text-gray-500">No hay notificaciones</span>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
});

NotificationCenter.displayName = 'NotificationCenter';

export default NotificationCenter;
