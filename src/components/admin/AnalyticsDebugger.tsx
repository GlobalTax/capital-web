import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle, XCircle, AlertCircle, Play, Code, Copy } from 'lucide-react';
import { toast } from 'sonner';

export const AnalyticsDebugger = () => {
  const [domainInfo, setDomainInfo] = useState<any>(null);
  const [trackingStatus, setTrackingStatus] = useState<any>(null);
  const [debugOutput, setDebugOutput] = useState<string>('');

  useEffect(() => {
    // Capture domain and tracking info
    const currentDomain = window.location.hostname;
    const currentUrl = window.location.href;
    
    const info = {
      domain: currentDomain,
      url: currentUrl,
      isProductionDomain: currentDomain === 'capittal.es' || currentDomain.includes('capittal.es'),
      isLovableDomain: currentDomain.includes('lovableproject.com'),
      isLocalhost: currentDomain === 'localhost' || currentDomain === '127.0.0.1',
      userAgent: navigator.userAgent,
      gaStatus: (window as any).gaStatus,
      fbPixelStatus: (window as any).fbPixelStatus,
      hasGtag: !!(window as any).gtag,
      hasDataLayer: !!(window as any).dataLayer,
      hasFbq: !!(window as any).fbq,
      eventSynchronizer: !!(window as any).eventSynchronizer
    };

    setDomainInfo(info);
    setDebugOutput(JSON.stringify(info, null, 2));
  }, []);

  const sendTestEvent = () => {
    const testEventData = {
      event_name: 'debug_test_event',
      timestamp: new Date().toISOString(),
      test_id: `test_${Date.now()}`,
      domain: window.location.hostname,
      page: window.location.pathname
    };

    // Send to GA4
    if ((window as any).gtag) {
      (window as any).gtag('event', 'debug_test_event', testEventData);
      console.log('📊 GA4 Debug test event sent:', testEventData);
    }

    // Send to Facebook Pixel
    if ((window as any).fbq) {
      (window as any).fbq('track', 'CustomEvent', testEventData);
      console.log('📊 Facebook Pixel debug test event sent:', testEventData);
    }

    // Send via Event Synchronizer if available
    if ((window as any).eventSynchronizer) {
      (window as any).eventSynchronizer.syncEvent('debug_test_event', testEventData);
      console.log('📊 Event Synchronizer debug test sent:', testEventData);
    }

    toast.success('Eventos de debug enviados - Revisa la consola para detalles');
  };

  const copyDebugInfo = () => {
    navigator.clipboard.writeText(debugOutput);
    toast.success('Información de debug copiada al portapapeles');
  };

  const getDomainStatus = () => {
    if (!domainInfo) return 'secondary';
    if (domainInfo.isProductionDomain) return 'default';
    if (domainInfo.isLovableDomain || domainInfo.isLocalhost) return 'secondary';
    return 'destructive';
  };

  const getDomainText = () => {
    if (!domainInfo) return 'Cargando...';
    if (domainInfo.isProductionDomain) return 'Producción - Tracking Completo';
    if (domainInfo.isLovableDomain) return 'Preview - Testing Habilitado';
    if (domainInfo.isLocalhost) return 'Desarrollo - Testing Habilitado';
    return 'Dominio Desconocido - Tracking Limitado';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Analytics Debugger</CardTitle>
        <CardDescription>
          Herramienta de diagnóstico avanzado para tracking
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Domain Status */}
        <div>
          <h4 className="text-sm font-medium mb-3">Estado del Dominio</h4>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Badge variant={getDomainStatus()}>
                {getDomainText()}
              </Badge>
              <code className="px-2 py-1 bg-muted rounded text-xs">
                {domainInfo?.domain}
              </code>
            </div>
          </div>
        </div>

        <Separator />

        {/* Tracking Services Status */}
        <div>
          <h4 className="text-sm font-medium mb-3">Estado de Servicios</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Google Analytics</span>
                <Badge variant={domainInfo?.hasGtag ? 'default' : 'secondary'}>
                  {domainInfo?.hasGtag ? 'Activo' : 'Inactivo'}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Facebook Pixel</span>
                <Badge variant={domainInfo?.hasFbq ? 'default' : 'secondary'}>
                  {domainInfo?.hasFbq ? 'Activo' : 'Inactivo'}
                </Badge>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>DataLayer</span>
                <Badge variant={domainInfo?.hasDataLayer ? 'default' : 'secondary'}>
                  {domainInfo?.hasDataLayer ? 'Disponible' : 'No disponible'}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Event Sync</span>
                <Badge variant={domainInfo?.eventSynchronizer ? 'default' : 'secondary'}>
                  {domainInfo?.eventSynchronizer ? 'Activo' : 'Inactivo'}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Test Actions */}
        <div>
          <h4 className="text-sm font-medium mb-3">Herramientas de Test</h4>
          <div className="flex flex-wrap gap-2">
            <Button onClick={sendTestEvent} variant="outline" size="sm">
              <Play className="h-4 w-4 mr-1" />
              Enviar Evento de Test
            </Button>
            <Button onClick={copyDebugInfo} variant="outline" size="sm">
              <Copy className="h-4 w-4 mr-1" />
              Copiar Info Debug
            </Button>
          </div>
        </div>

        <Separator />

        {/* Debug Output */}
        <div>
          <h4 className="text-sm font-medium mb-3">Información de Debug</h4>
          <Textarea
            value={debugOutput}
            readOnly
            className="font-mono text-xs"
            rows={12}
          />
        </div>

        {/* Troubleshooting */}
        <div className="p-3 bg-muted/50 rounded-lg">
          <h4 className="text-sm font-medium mb-2">🔧 Pasos de diagnóstico</h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>1. Verifica que el dominio sea reconocido correctamente</li>
            <li>2. Confirma que GA4 y Facebook Pixel estén activos</li>
            <li>3. Envía un evento de test y revisa la consola del navegador</li>
            <li>4. Usa Google Analytics Realtime para verificar la recepción</li>
            <li>5. Revisa Facebook Events Manager para eventos de Meta Pixel</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};