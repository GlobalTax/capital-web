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
    // Capturar información del dominio y tracking al montar
    const domainInfo = {
      domain: window.location.hostname,
      url: window.location.href,
      userAgent: navigator.userAgent,
      gtagExists: typeof (window as any).gtag !== 'undefined',
      fbqExists: typeof (window as any).fbq !== 'undefined',
      dataLayerExists: typeof (window as any).dataLayer !== 'undefined',
      eventSynchronizerExists: typeof (window as any).eventSynchronizer !== 'undefined',
      gtagStatus: (window as any).gtagStatus || null,
      fbPixelStatus: (window as any).fbPixelStatus || null,
      dataLayerLength: (window as any).dataLayer?.length || 0,
      isProductionDomain: window.location.hostname === 'capittal.es' || window.location.hostname.includes('capittal.es'),
      isLovableDomain: window.location.hostname.includes('lovableproject.com'),
      isLocalhost: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    };

    setDomainInfo(domainInfo);
    setDebugOutput(JSON.stringify(domainInfo, null, 2));
  }, []);

  const sendTestEvent = async () => {
    try {
      let eventsSuccessful = 0;
      let eventsTotal = 1; // Solo contamos el evento unificado

      // Unified test event via EventSynchronizer (reemplaza llamadas directas a gtag/fbq)
      try {
        const { getEventSynchronizer } = await import('@/utils/analytics/EventSynchronizer');
        const eventSync = getEventSynchronizer();
        
        await eventSync.syncEvent('DEBUG_TEST', {
          content_name: 'Debug Test Event',
          content_category: 'debugging',
          value: 1.00,
          currency: 'EUR',
          source: 'analytics_debugger',
          timestamp: new Date().toISOString()
        });
        
        console.log('✅ Test event sent via EventSynchronizer (FB Pixel + GA4)');
        eventsSuccessful++;
      } catch (error) {
        console.error('❌ Error sending unified test event:', error);
      }

      toast.success(`Eventos enviados: ${eventsSuccessful}/${eventsTotal}. Revisa Google Analytics Real-time y la consola.`);

      // Actualizar debug output con los resultados del test
      const testResults = {
        timestamp: new Date().toISOString(),
        eventsSuccessful,
        eventsTotal,
        gtag: typeof (window as any).gtag !== 'undefined',
        fbq: typeof (window as any).fbq !== 'undefined',
        eventSynchronizer: typeof (window as any).eventSynchronizer !== 'undefined',
        gtagStatus: (window as any).gtagStatus,
        fbPixelStatus: (window as any).fbPixelStatus
      };
      
      setDebugOutput(prev => prev + '\n\n--- TEST RESULTS ---\n' + JSON.stringify(testResults, null, 2));

    } catch (error) {
      console.error('❌ Error sending test events:', error);
      toast.error('Error enviando eventos de prueba. Revisa la consola.');
    }
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
                <div className="flex items-center gap-2">
                  <Badge variant={domainInfo?.gtagExists ? 'default' : 'secondary'}>
                    {domainInfo?.gtagExists ? 'Activo' : 'Inactivo'}
                  </Badge>
                  {domainInfo?.gtagStatus?.loadedFromHTML && (
                    <Badge variant="outline" className="text-xs">HTML</Badge>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Facebook Pixel</span>
                <div className="flex items-center gap-2">
                  <Badge variant={domainInfo?.fbqExists ? 'default' : 'secondary'}>
                    {domainInfo?.fbqExists ? 'Activo' : 'Inactivo'}
                  </Badge>
                  {domainInfo?.fbPixelStatus?.loadedFromHTML && (
                    <Badge variant="outline" className="text-xs">HTML</Badge>
                  )}
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>DataLayer</span>
                <div className="flex items-center gap-2">
                  <Badge variant={domainInfo?.dataLayerExists ? 'default' : 'secondary'}>
                    {domainInfo?.dataLayerExists ? 'Disponible' : 'No disponible'}
                  </Badge>
                  {domainInfo?.dataLayerLength > 0 && (
                    <Badge variant="outline" className="text-xs">
                      {domainInfo.dataLayerLength} events
                    </Badge>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Event Sync</span>
                <Badge variant={domainInfo?.eventSynchronizerExists ? 'default' : 'secondary'}>
                  {domainInfo?.eventSynchronizerExists ? 'Activo' : 'Inactivo'}
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