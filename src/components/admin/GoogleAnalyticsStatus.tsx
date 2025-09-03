import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, XCircle, AlertCircle, RefreshCw, ExternalLink, Play, Zap } from 'lucide-react';
import { toast } from 'sonner';

interface GoogleAnalyticsStatusProps {
  measurementId: string;
}

interface GAStatus {
  initialized: boolean;
  measurementId: string;
  timestamp: string;
  scriptLoaded?: boolean;
  error?: string;
}

export const GoogleAnalyticsStatus: React.FC<GoogleAnalyticsStatusProps> = ({ measurementId }) => {
  const [status, setStatus] = useState<GAStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const checkGAStatus = () => {
    setIsLoading(true);
    
    // Check global GA status
    const gaStatus = (window as any).gaStatus as GAStatus;
    const gtag = (window as any).gtag;
    const dataLayer = (window as any).dataLayer;
    
    const currentStatus: GAStatus = {
      initialized: !!gaStatus?.initialized,
      measurementId: gaStatus?.measurementId || measurementId,
      timestamp: gaStatus?.timestamp || new Date().toISOString(),
      scriptLoaded: !!gtag && !!dataLayer,
      error: gaStatus?.error
    };
    
    setStatus(currentStatus);
    setIsLoading(false);
    
    console.log('📊 Google Analytics Status Check:', currentStatus);
  };

  useEffect(() => {
    checkGAStatus();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(checkGAStatus, 30000);
    return () => clearInterval(interval);
  }, [measurementId]);

  const testPageView = () => {
    if ((window as any).gtag) {
      const testData = {
        page_title: 'Test Page View - ' + new Date().toISOString(),
        page_location: window.location.href,
        page_path: window.location.pathname,
        test_timestamp: Date.now()
      };
      
      (window as any).gtag('event', 'page_view', testData);
      console.log('📊 Test page_view event sent:', testData);
      toast.success('Evento page_view enviado - Revisa la consola para detalles');
    } else {
      toast.error('Google Analytics no inicializado - gtag no encontrado');
    }
  };

  const testCustomEvent = () => {
    if ((window as any).gtag) {
      const testData = {
        event_category: 'testing',
        event_label: 'manual_test_' + Date.now(),
        value: 1,
        test_timestamp: Date.now(),
        debug_info: 'Manual test from GoogleAnalyticsStatus component'
      };
      
      (window as any).gtag('event', 'test_analytics_connection', testData);
      console.log('📊 Test custom event sent:', testData);
      toast.success('Evento personalizado enviado - Revisa la consola para detalles');
    } else {
      toast.error('Google Analytics no inicializado - gtag no encontrado');
    }
  };

  const forceGA4Initialization = () => {
    console.log('🔄 Forcing GA4 re-initialization...');
    
    // Check current status
    const hasGtag = !!(window as any).gtag;
    const hasDataLayer = !!(window as any).dataLayer;
    const gaStatus = (window as any).gaStatus;
    
    console.log('Current GA4 status:', { hasGtag, hasDataLayer, gaStatus });
    
    if (!hasGtag || !hasDataLayer) {
      // Force load GA4 script
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
      script.onload = () => {
        console.log('✅ GA4 script force-loaded');
        
        // Initialize dataLayer and gtag
        (window as any).dataLayer = (window as any).dataLayer || [];
        const gtag = (...args: any[]) => {
          (window as any).dataLayer.push(args);
        };
        (window as any).gtag = gtag;
        
        // Configure GA4
        gtag('js', new Date());
        gtag('config', measurementId, {
          page_title: document.title,
          page_location: window.location.href,
          send_page_view: true,
          debug_mode: true
        });
        
        console.log('✅ GA4 force-configured with ID:', measurementId);
        
        // Update status
        (window as any).gaStatus = {
          initialized: true,
          measurementId: measurementId,
          timestamp: new Date().toISOString(),
          forceInitialized: true
        };
        
        checkGAStatus();
        toast.success('GA4 forzado a reinicializar');
      };
      script.onerror = () => {
        console.error('❌ Failed to force-load GA4 script');
        toast.error('Error al forzar carga de GA4');
      };
      document.head.appendChild(script);
    } else {
      // Just reconfigure existing GA4
      (window as any).gtag('config', measurementId, {
        page_title: document.title,
        page_location: window.location.href,
        send_page_view: true,
        debug_mode: true
      });
      
      console.log('✅ GA4 reconfigured with existing gtag');
      toast.success('GA4 reconfigurado');
      checkGAStatus();
    }
  };

  const getStatusIcon = () => {
    if (!status) return <AlertCircle className="h-4 w-4 text-muted-foreground" />;
    
    if (status.error) {
      return <XCircle className="h-4 w-4 text-destructive" />;
    }
    
    if (status.initialized && status.scriptLoaded) {
      return <CheckCircle className="h-4 w-4 text-success" />;
    }
    
    return <AlertCircle className="h-4 w-4 text-warning" />;
  };

  const getStatusText = () => {
    if (!status) return 'Verificando...';
    
    if (status.error) return 'Error detectado';
    
    if (status.initialized && status.scriptLoaded) {
      return 'Funcionando correctamente';
    }
    
    if (status.initialized && !status.scriptLoaded) {
      return 'Inicializado pero script no cargado';
    }
    
    return 'No inicializado';
  };

  const getStatusVariant = () => {
    if (!status || status.error) return 'destructive';
    if (status.initialized && status.scriptLoaded) return 'default';
    return 'secondary';
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-sm font-medium">Estado de Google Analytics</CardTitle>
          <CardDescription>
            Diagnóstico en tiempo real del tracking de GA4
          </CardDescription>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={checkGAStatus}
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Actualizar
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Overview */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {getStatusIcon()}
            <span className="text-sm font-medium">Estado General</span>
          </div>
          <Badge variant={getStatusVariant()}>
            {getStatusText()}
          </Badge>
        </div>

        <Separator />

        {/* Detailed Status */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Measurement ID</span>
            <code className="px-2 py-1 bg-muted rounded text-xs">
              {status?.measurementId || measurementId}
            </code>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span>Script cargado</span>
            <Badge variant={status?.scriptLoaded ? 'default' : 'secondary'}>
              {status?.scriptLoaded ? 'Sí' : 'No'}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span>DataLayer disponible</span>
            <Badge variant={(window as any).dataLayer ? 'default' : 'secondary'}>
              {(window as any).dataLayer ? 'Sí' : 'No'}
            </Badge>
          </div>
          
          {status?.timestamp && (
            <div className="flex items-center justify-between text-sm">
              <span>Última inicialización</span>
              <span className="text-xs text-muted-foreground">
                {new Date(status.timestamp).toLocaleString('es-ES')}
              </span>
            </div>
          )}
        </div>

        {status?.error && (
          <>
            <Separator />
            <div className="p-3 bg-destructive/10 rounded-lg">
              <p className="text-sm text-destructive font-medium">Error detectado:</p>
              <p className="text-xs text-destructive/80 mt-1">{status.error}</p>
            </div>
          </>
        )}

        <Separator />

        {/* Testing Section */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Herramientas de Testing</h4>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={testPageView}
              disabled={!status?.scriptLoaded}
            >
              <Play className="h-4 w-4 mr-1" />
              Test Page View
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={testCustomEvent}
              disabled={!status?.scriptLoaded}
            >
              <Zap className="h-4 w-4 mr-1" />
              Test Custom Event
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={forceGA4Initialization}
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              Force Reinit GA4
            </Button>
          </div>
        </div>

        <Separator />

        {/* Verification Links */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Verificación Externa</h4>
          <div className="space-y-1">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start h-auto p-2"
              onClick={() => window.open(`https://analytics.google.com/analytics/web/#/p${measurementId.replace('G-', '')}/reports/intelligenthome`, '_blank')}
            >
              <ExternalLink className="h-3 w-3 mr-2" />
              <div className="text-left">
                <div className="text-xs font-medium">Google Analytics 4</div>
                <div className="text-xs text-muted-foreground">Ver datos en tiempo real</div>
              </div>
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start h-auto p-2"
              onClick={() => window.open('https://tagassistant.google.com/', '_blank')}
            >
              <ExternalLink className="h-3 w-3 mr-2" />
              <div className="text-left">
                <div className="text-xs font-medium">Google Tag Assistant</div>
                <div className="text-xs text-muted-foreground">Verificar implementación</div>
              </div>
            </Button>
          </div>
        </div>

        {/* Troubleshooting Tips */}
        <div className="p-3 bg-muted/50 rounded-lg">
          <h4 className="text-sm font-medium mb-2">💡 Consejos de solución</h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Verifica que el Measurement ID sea correcto</li>
            <li>• Comprueba que no hay bloqueadores de anuncios activos</li>
            <li>• Los datos pueden tardar hasta 24h en aparecer en GA4</li>
            <li>• Usa el informe en tiempo real para verificación inmediata</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};