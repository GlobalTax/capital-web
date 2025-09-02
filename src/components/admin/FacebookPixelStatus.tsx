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
  blocked?: boolean;
  scriptLoaded?: boolean;
}

export const FacebookPixelStatus: React.FC<FacebookPixelStatusProps> = ({ pixelId }) => {
  const [status, setStatus] = useState<PixelStatus | null>(null);
  const [isTestingEvent, setIsTestingEvent] = useState(false);

  const checkPixelStatus = () => {
    const fbq = (window as any).fbq;
    const fbPixelStatus = (window as any).fbPixelStatus;
    
    // Enhanced ad blocker and script detection
    const fbScript = document.querySelector('script[src*="fbevents.js"]') ||
                    document.querySelector('script[src*="connect.facebook.net"]');
    const scriptLoaded = !!fbScript;
    
    // Check for ad blocker interference
    let isBlocked = false;
    let blockingReason = '';
    
    if (!fbq && !scriptLoaded) {
      isBlocked = true;
      blockingReason = 'Script bloqueado por ad blocker';
    } else if (fbq && fbq.loadError) {
      isBlocked = true;
      blockingReason = 'Error de carga del script';
    } else if (fbq && !fbq.loaded && scriptLoaded) {
      isBlocked = true;
      blockingReason = 'Script cargado pero no inicializado';
    }
    
    if (fbPixelStatus) {
      setStatus({
        initialized: fbPixelStatus.initialized,
        pixelId: fbPixelStatus.pixelId,
        timestamp: fbPixelStatus.timestamp,
        error: fbPixelStatus.error || (isBlocked ? blockingReason : undefined),
        lastEventTime: fbPixelStatus.lastEventTime,
        totalEvents: fbPixelStatus.totalEvents || 0,
        blocked: isBlocked,
        scriptLoaded: scriptLoaded,
      });
    } else if (fbq) {
      setStatus({
        initialized: true,
        pixelId: pixelId || 'unknown',
        timestamp: new Date().toISOString(),
        totalEvents: 0,
        blocked: isBlocked,
        scriptLoaded: scriptLoaded,
        error: isBlocked ? blockingReason : undefined,
      });
    } else {
      setStatus({
        initialized: false,
        error: isBlocked ? blockingReason : 'Facebook Pixel no encontrado',
        totalEvents: 0,
        blocked: isBlocked,
        scriptLoaded: scriptLoaded,
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
    
    if (status.blocked) {
      return <Badge variant="destructive">Bloqueado</Badge>;
    }
    
    if (status.error) {
      return <Badge variant="destructive">Error</Badge>;
    }
    
    if (status.initialized) {
      return <Badge variant="default" className="bg-green-600">Activo</Badge>;
    }
    
    return <Badge variant="outline">Inactivo</Badge>;
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
                  {status?.scriptLoaded ? '✅' : '❌'} Script cargado
                </div>
                <div className="flex items-center gap-2">
                  {status.initialized ? '✅' : '❌'} Pixel inicializado
                </div>
                <div className="flex items-center gap-2">
                  {!status?.blocked ? '✅' : '❌'} Ad Blocker
                </div>
                <div className="flex items-center gap-2">
                  {!(window as any).fbq?.loadError ? '✅' : '❌'} Sin errores de carga
                </div>
              </div>
              
              {status?.blocked && (
                <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
                  <strong>⚠️ Ad Blocker Detectado</strong><br />
                  Desactiva temporalmente tu bloqueador de anuncios (AdBlock, uBlock Origin, etc.) para verificar que el pixel funciona correctamente.
                </div>
              )}
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
            disabled={isTestingEvent || !status?.initialized || status?.blocked}
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
          <strong>🔍 Guía completa de verificación:</strong>
          <div className="mt-2 space-y-1">
            <div><strong>1. Meta Pixel Helper:</strong> Instala la extensión desde Chrome Web Store</div>
            <div><strong>2. Desactivar bloqueadores:</strong> Pausa AdBlock, uBlock Origin o similar</div>
            <div><strong>3. Recargar página:</strong> Pulsa F5 para recargar completamente</div>
            <div><strong>4. Verificar icono:</strong> El icono &lt;/&gt; debe volverse azul con "1"</div>
            <div><strong>5. Pixel ID esperado:</strong> <code>{pixelId || status?.pixelId || '1474959750187377'}</code></div>
            <div><strong>6. Estado esperado:</strong> "Active" en Meta Pixel Helper</div>
          </div>
          
          {status?.blocked && (
            <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded">
              <div className="text-yellow-800 text-xs">
                <strong>⚠️ Bloqueador detectado:</strong> Meta Pixel Helper no funcionará hasta que desactives temporalmente tu bloqueador de anuncios.
              </div>
            </div>
          )}
          
          {status?.initialized && status?.scriptLoaded && !status?.blocked && (
            <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded">
              <div className="text-green-800 text-xs">
                <strong>✅ Todo configurado:</strong> Meta Pixel Helper debería mostrar el pixel como activo ahora.
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};