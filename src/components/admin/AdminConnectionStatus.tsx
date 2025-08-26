import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';
import { 
  Wifi, 
  WifiOff, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  RefreshCw 
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

type ConnectionStatus = 'checking' | 'online' | 'offline' | 'degraded';

interface ServiceStatus {
  database: boolean;
  auth: boolean;
  tracking: boolean;
  lastChecked: Date;
}

export const AdminConnectionStatus: React.FC = () => {
  const [status, setStatus] = useState<ConnectionStatus>('checking');
  const [services, setServices] = useState<ServiceStatus>({
    database: false,
    auth: false,
    tracking: false,
    lastChecked: new Date()
  });
  const [isRefreshing, setIsRefreshing] = useState(false);

  const checkServices = async () => {
    setIsRefreshing(true);
    const results = {
      database: false,
      auth: false,
      tracking: false,
      lastChecked: new Date()
    };

    try {
      // Check database connection
      const { error: dbError } = await supabase
        .from('admin_users')
        .select('id')
        .limit(1);
      results.database = !dbError;

      // Check auth service
      const { data: { session } } = await supabase.auth.getSession();
      results.auth = !!session;

      // Check tracking service (with short timeout)
      try {
        const controller = new AbortController();
        setTimeout(() => controller.abort(), 2000);
        
        await supabase.functions.invoke('secure-tracking', {
          body: { test: true }
        });
        results.tracking = true;
      } catch {
        results.tracking = false;
      }

    } catch (error) {
      console.warn('Service check failed:', error);
    }

    setServices(results);
    
    // Determine overall status
    if (results.database && results.auth) {
      setStatus('online');
    } else if (results.database || results.auth) {
      setStatus('degraded');
    } else {
      setStatus('offline');
    }

    setIsRefreshing(false);
  };

  useEffect(() => {
    checkServices();
    const interval = setInterval(checkServices, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = () => {
    switch (status) {
      case 'online':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'degraded':
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case 'offline':
        return <WifiOff className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 animate-spin text-blue-500" />;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'online':
        return 'En línea';
      case 'degraded':
        return 'Degradado';
      case 'offline':
        return 'Sin conexión';
      default:
        return 'Verificando...';
    }
  };

  const getStatusVariant = (): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'online':
        return 'default';
      case 'degraded':
        return 'secondary';
      case 'offline':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Badge variant={getStatusVariant()} className="cursor-pointer flex items-center space-x-1">
          {getStatusIcon()}
          <span>{getStatusText()}</span>
        </Badge>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold">Estado de Servicios</h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={checkServices}
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Base de Datos</span>
              {services.database ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-red-500" />
              )}
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm">Autenticación</span>
              {services.auth ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-red-500" />
              )}
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm">Tracking</span>
              {services.tracking ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-amber-500" />
              )}
            </div>
          </div>
          
          <div className="pt-2 border-t text-xs text-muted-foreground">
            Última verificación: {services.lastChecked.toLocaleTimeString()}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};