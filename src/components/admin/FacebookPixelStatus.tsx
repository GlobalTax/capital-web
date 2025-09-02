import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle, RefreshCw, ExternalLink } from 'lucide-react';

interface FacebookPixelStatusProps {
  pixelId?: string;
}

interface PixelStatus {
  initialized: boolean;
  pixelId?: string;
  timestamp?: string;
  error?: string;
  lastEventTime?: string;
  totalEvents?: number;
}

export const FacebookPixelStatus: React.FC<FacebookPixelStatusProps> = ({ pixelId }) => {
  const [status, setStatus] = useState<PixelStatus | null>(null);
  const [isTestingEvent, setIsTestingEvent] = useState(false);

  const checkPixelStatus = () => {
    const fbPixelStatus = (window as any).fbPixelStatus;
    const fbq = (window as any).fbq;
    
    if (fbPixelStatus) {
      setStatus(fbPixelStatus);
    } else if (fbq) {
      setStatus({
        initialized: true,
        pixelId: 'unknown',
        timestamp: 'unknown'
      });
    } else {
      setStatus({
        initialized: false,
        error: 'Pixel no encontrado'
      });
    }
  };

  const testPixelEvent = async () => {
    setIsTestingEvent(true);
    try {
      if ((window as any).fbq) {
        (window as any).fbq('track', 'ViewContent', {
          content_name: 'Test Event from Admin Panel',
          content_category: 'Testing',
          value: 0,
          currency: 'EUR'
        });
        console.log('✅ Test event sent to Facebook Pixel');
      }
    } catch (error) {
      console.error('❌ Failed to send test event:', error);
    } finally {
      setTimeout(() => {
        setIsTestingEvent(false);
        checkPixelStatus();
      }, 1000);
    }
  };

  useEffect(() => {
    checkPixelStatus();
    
    // Check status every 5 seconds
    const interval = setInterval(checkPixelStatus, 5000);
    
    return () => clearInterval(interval);
  }, []);

  const getStatusBadge = () => {
    if (!status) {
      return <Badge variant="secondary">Cargando...</Badge>;
    }
    
    if (status.error) {
      return <Badge variant="destructive">Error</Badge>;
    }
    
    if (status.initialized && (window as any).fbq && !(window as any).fbq.loadError) {
      return <Badge variant="default" className="bg-green-600">Activo</Badge>;
    }
    
    return <Badge variant="secondary">Inactivo</Badge>;
  };

  const openPixelHelper = () => {
    window.open('https://chrome.google.com/webstore/detail/facebook-pixel-helper/fdgfkebogiimcoedlicjlajpkdmockpc', '_blank');
  };

  const openEventsManager = () => {
    window.open(`https://business.facebook.com/events_manager2/list/pixel/${pixelId || status?.pixelId}`, '_blank');
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            {status?.initialized && !status.error ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-600" />
            )}
            Estado del Facebook Pixel
          </span>
          {getStatusBadge()}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {status && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-2">Información del Pixel</h4>
              <div className="space-y-1 text-sm">
                <div>ID: <code className="bg-muted px-1 rounded">{status.pixelId || pixelId || 'N/A'}</code></div>
                <div>Inicializado: {status.timestamp || 'N/A'}</div>
                {status.totalEvents && (
                  <div>Eventos enviados: {status.totalEvents}</div>
                )}
                {status.lastEventTime && (
                  <div>Último evento: {new Date(status.lastEventTime).toLocaleTimeString()}</div>
                )}
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-2">Diagnóstico</h4>
              <div className="space-y-1 text-sm">
                <div className="flex items-center gap-2">
                  {(window as any).fbq ? '✅' : '❌'} Script cargado
                </div>
                <div className="flex items-center gap-2">
                  {status.initialized ? '✅' : '❌'} Pixel inicializado
                </div>
                <div className="flex items-center gap-2">
                  {!(window as any).fbq?.loadError ? '✅' : '❌'} Sin errores de carga
                </div>
              </div>
            </div>
          </div>
        )}

        {status?.error && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
            <p className="text-sm text-destructive">
              <strong>Error:</strong> {status.error}
            </p>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={checkPixelStatus}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Verificar Estado
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={testPixelEvent}
            disabled={isTestingEvent || !status?.initialized}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isTestingEvent ? 'animate-spin' : ''}`} />
            Enviar Evento de Prueba
          </Button>
          
          <Button variant="outline" size="sm" onClick={openPixelHelper}>
            <ExternalLink className="h-4 w-4 mr-2" />
            Pixel Helper
          </Button>
          
          {(pixelId || status?.pixelId) && (
            <Button variant="outline" size="sm" onClick={openEventsManager}>
              <ExternalLink className="h-4 w-4 mr-2" />
              Events Manager
            </Button>
          )}
        </div>

        <div className="text-xs text-muted-foreground p-3 bg-muted/50 rounded-md">
          <strong>Herramientas de verificación:</strong>
          <br />• Instala Facebook Pixel Helper para ver eventos en tiempo real
          <br />• Usa Events Manager para monitorear eventos en Facebook
          <br />• Verifica en la consola del navegador para logs detallados
        </div>
      </CardContent>
    </Card>
  );
};