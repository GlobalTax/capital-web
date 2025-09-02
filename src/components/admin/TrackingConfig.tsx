import React, { useEffect } from 'react';
import { Settings, Save, Eye, Code, Zap, Globe, Facebook, Linkedin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTrackingConfig } from '@/hooks/useTrackingConfig';
import { FacebookPixelStatus } from './FacebookPixelStatus';
import { GoogleAnalyticsStatus } from './GoogleAnalyticsStatus';
import EventSyncMonitor from './EventSyncMonitor';

const TrackingConfig = () => {
  const { config, isLoading, isSaving, updateConfig, saveConfiguration } = useTrackingConfig();

  const handleSave = async () => {
    await saveConfiguration(config);
  };

  const handleConfigChange = (key: string, value: string | boolean) => {
    updateConfig(key as any, value);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Configuración de Tracking Optimizada</h1>
          <p className="text-muted-foreground">
            Sistema optimizado de sincronización entre Facebook Pixel y Google Analytics 4
          </p>
        </div>
        <Button 
          onClick={handleSave} 
          disabled={isSaving || isLoading}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? 'Guardando...' : 'Guardar Configuración'}
        </Button>
      </div>

      <Tabs defaultValue="config" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="config">Configuración</TabsTrigger>
          <TabsTrigger value="monitor">Monitor de Eventos 1:1</TabsTrigger>
        </TabsList>

        <TabsContent value="config" className="space-y-6">
          <Alert>
            <Zap className="h-4 w-4" />
            <AlertDescription>
              <strong>Sistema Optimizado 1:1:</strong> Cada evento se mapea perfectamente entre Facebook Pixel y GA4 siguiendo las recomendaciones de Meta para maximizar el rendimiento de tus anuncios.
            </AlertDescription>
          </Alert>

      {/* Analytics Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Google Analytics
          </CardTitle>
          <CardDescription>
            Configuración de Google Analytics 4 para tracking web
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="ga-id">ID de Google Analytics (GA4)</Label>
            <Input
              id="ga-id"
              placeholder="G-XXXXXXXXXX"
              value={config.googleAnalyticsId || ''}
              onChange={(e) => handleConfigChange('googleAnalyticsId', e.target.value)}
            />
            <p className="text-sm text-muted-foreground mt-1">
              Formato: G-XXXXXXXXXX (encontrarlo en Analytics → Admin → Flujos de datos)
            </p>
          </div>

          <div>
            <Label htmlFor="gtm-id">ID de Google Tag Manager</Label>
            <Input
              id="gtm-id"
              placeholder="GTM-XXXXXXXX"
              value={config.googleTagManagerId || ''}
              onChange={(e) => handleConfigChange('googleTagManagerId', e.target.value)}
            />
            <p className="text-sm text-muted-foreground mt-1">
              Formato: GTM-XXXXXXXX (encontrarlo en Tag Manager → Workspace → Container ID)
            </p>
          </div>

          {config.googleAnalyticsId && (
            <GoogleAnalyticsStatus measurementId={config.googleAnalyticsId} />
          )}
        </CardContent>
      </Card>

      {/* Social Media Tracking */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Facebook className="h-5 w-5" />
            Meta Pixel (Facebook)
          </CardTitle>
          <CardDescription>
            Pixel de Meta para tracking de conversiones y audiencias personalizadas
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Zap className="h-4 w-4" />
            <AlertDescription>
              <strong>Mapeo 1:1 Optimizado:</strong> InitiateCheckout (calculadora) → begin_checkout, Lead (formularios) → generate_lead, ViewContent (recursos) → view_item. Parámetros sincronizados automáticamente.
            </AlertDescription>
          </Alert>
          
          <div>
            <Label htmlFor="fb-pixel">Facebook Pixel ID</Label>
            <Input
              id="fb-pixel"
              placeholder="123456789012345"
              value={config.facebookPixelId || ''}
              onChange={(e) => handleConfigChange('facebookPixelId', e.target.value)}
            />
            <p className="text-sm text-muted-foreground mt-1">
              <strong>Cómo obtenerlo:</strong> Facebook Business → Administrador de eventos → Tu píxel → Configuración → ID del píxel
            </p>
          </div>
          
          {config.facebookPixelId && (
            <FacebookPixelStatus pixelId={config.facebookPixelId} />
          )}
          
          <div>
            <Label htmlFor="linkedin-tag">LinkedIn Insight Tag</Label>
            <Input
              id="linkedin-tag"
              placeholder="12345"
              value={config.linkedInInsightTag || ''}
              onChange={(e) => handleConfigChange('linkedInInsightTag', e.target.value)}
            />
            <p className="text-sm text-muted-foreground mt-1">
              Encuentra tu Partner ID en LinkedIn Campaign Manager → Herramientas → Insight Tag
            </p>
          </div>
        </CardContent>
      </Card>

      {/* User Experience Tracking */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Experiencia de Usuario
          </CardTitle>
          <CardDescription>
            Herramientas para analizar el comportamiento del usuario
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="hotjar-id">Hotjar Site ID</Label>
            <Input
              id="hotjar-id"
              placeholder="1234567"
              value={config.hotjarId || ''}
              onChange={(e) => handleConfigChange('hotjarId', e.target.value)}
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Heatmaps</Label>
                <p className="text-sm text-muted-foreground">Activar mapas de calor</p>
              </div>
              <Switch
                checked={config.enableHeatmaps || false}
                onCheckedChange={(checked) => handleConfigChange('enableHeatmaps', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Grabación de Sesiones</Label>
                <p className="text-sm text-muted-foreground">Grabar sesiones de usuarios</p>
              </div>
              <Switch
                checked={config.enableSessionRecording || false}
                onCheckedChange={(checked) => handleConfigChange('enableSessionRecording', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Tracking de Leads</Label>
                <p className="text-sm text-muted-foreground">Seguimiento avanzado de leads</p>
              </div>
              <Switch
                checked={config.enableLeadTracking || false}
                onCheckedChange={(checked) => handleConfigChange('enableLeadTracking', checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Custom Code */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="h-5 w-5" />
            Código Personalizado
          </CardTitle>
          <CardDescription>
            JavaScript personalizado para tracking avanzado
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div>
            <Label htmlFor="custom-code">Código de Tracking Personalizado</Label>
            <Textarea
              id="custom-code"
              placeholder="// Tu código JavaScript personalizado aquí"
              value={config.customTrackingCode || ''}
              onChange={(e) => handleConfigChange('customTrackingCode', e.target.value)}
              rows={8}
              className="font-mono text-sm"
            />
            <p className="text-sm text-muted-foreground mt-1">
              Este código se ejecutará en todas las páginas. Usa con precaución.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Configuration Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Vista Previa - Sistema 1:1 Optimizado</CardTitle>
          <CardDescription>
            Configuración optimizada según las recomendaciones de Meta
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium">Servicios Activos:</h4>
              <ul className="text-sm space-y-1">
                {config.googleAnalyticsId && <li>✅ Google Analytics 4 (GA4)</li>}
                {config.googleTagManagerId && <li>✅ Google Tag Manager</li>}
                {config.facebookPixelId && <li>✅ Meta Pixel (Facebook)</li>}
                {config.linkedInInsightTag && <li>✅ LinkedIn Insight Tag</li>}
                {config.hotjarId && <li>✅ Hotjar</li>}
                {config.facebookPixelId && config.googleAnalyticsId && <li>🎯 <strong>Sincronización 1:1 Activa</strong></li>}
                {!config.googleAnalyticsId && !config.googleTagManagerId && !config.facebookPixelId && !config.linkedInInsightTag && !config.hotjarId && (
                  <li className="text-muted-foreground">No hay servicios configurados</li>
                )}
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Optimizaciones Activas:</h4>
              <ul className="text-sm space-y-1">
                {config.facebookPixelId && config.googleAnalyticsId && <li>✅ Mapeo de eventos 1:1</li>}
                {config.facebookPixelId && config.googleAnalyticsId && <li>✅ Parámetros sincronizados</li>}
                {config.facebookPixelId && config.googleAnalyticsId && <li>✅ Valores consistentes (EUR)</li>}
                {config.enableHeatmaps && <li>✅ Heatmaps</li>}
                {config.enableSessionRecording && <li>✅ Grabación de Sesiones</li>}
                {config.enableLeadTracking && <li>✅ Tracking de Leads</li>}
                {config.customTrackingCode && <li>✅ Código Personalizado</li>}
              </ul>
            </div>
          </div>
          
          {config.facebookPixelId && config.googleAnalyticsId && (
            <Alert className="mt-4">
              <Zap className="h-4 w-4" />
              <AlertDescription>
                <strong>Sistema 1:1 Configurado:</strong> Tus eventos están optimizados para maximizar el rendimiento de Meta Ads con asignaciones perfectas entre plataformas.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
        </TabsContent>

        <TabsContent value="monitor">
          <EventSyncMonitor />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TrackingConfig;