import React, { useState } from 'react';
import { Settings, Save, Eye, Code, Zap, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';

const TrackingConfig = () => {
  const [config, setConfig] = useState({
    googleAnalyticsId: '',
    facebookPixelId: '',
    linkedInInsightTag: '',
    hotjarId: '',
    enableHeatmaps: true,
    enableSessionRecording: false,
    enableLeadTracking: true,
    customTrackingCode: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Simular guardado de configuración
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Configuración guardada",
        description: "Los ajustes de tracking se han actualizado correctamente",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo guardar la configuración",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfigChange = (key: string, value: string | boolean) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Configuración de Tracking</h1>
          <p className="text-muted-foreground">
            Configura las herramientas de seguimiento y análisis
          </p>
        </div>
        <Button onClick={handleSave} disabled={isLoading}>
          <Save className="h-4 w-4 mr-2" />
          {isLoading ? 'Guardando...' : 'Guardar Cambios'}
        </Button>
      </div>

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
              value={config.googleAnalyticsId}
              onChange={(e) => handleConfigChange('googleAnalyticsId', e.target.value)}
            />
            <p className="text-sm text-muted-foreground mt-1">
              Formato: G-XXXXXXXXXX (encontrarlo en Analytics → Admin → Flujos de datos)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Social Media Tracking */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Redes Sociales y Publicidad
          </CardTitle>
          <CardDescription>
            Pixels y tags para tracking de campañas publicitarias
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="fb-pixel">Facebook Pixel ID</Label>
            <Input
              id="fb-pixel"
              placeholder="123456789012345"
              value={config.facebookPixelId}
              onChange={(e) => handleConfigChange('facebookPixelId', e.target.value)}
            />
          </div>
          
          <div>
            <Label htmlFor="linkedin-tag">LinkedIn Insight Tag</Label>
            <Input
              id="linkedin-tag"
              placeholder="12345"
              value={config.linkedInInsightTag}
              onChange={(e) => handleConfigChange('linkedInInsightTag', e.target.value)}
            />
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
              value={config.hotjarId}
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
                checked={config.enableHeatmaps}
                onCheckedChange={(checked) => handleConfigChange('enableHeatmaps', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Grabación de Sesiones</Label>
                <p className="text-sm text-muted-foreground">Grabar sesiones de usuarios</p>
              </div>
              <Switch
                checked={config.enableSessionRecording}
                onCheckedChange={(checked) => handleConfigChange('enableSessionRecording', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Tracking de Leads</Label>
                <p className="text-sm text-muted-foreground">Seguimiento avanzado de leads</p>
              </div>
              <Switch
                checked={config.enableLeadTracking}
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
              value={config.customTrackingCode}
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
          <CardTitle>Vista Previa de Configuración</CardTitle>
          <CardDescription>
            Resumen de los servicios de tracking configurados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium">Servicios Activos:</h4>
              <ul className="text-sm space-y-1">
                {config.googleAnalyticsId && <li>✅ Google Analytics</li>}
                {config.facebookPixelId && <li>✅ Facebook Pixel</li>}
                {config.linkedInInsightTag && <li>✅ LinkedIn Insight Tag</li>}
                {config.hotjarId && <li>✅ Hotjar</li>}
                {!config.googleAnalyticsId && !config.facebookPixelId && !config.linkedInInsightTag && !config.hotjarId && (
                  <li className="text-muted-foreground">No hay servicios configurados</li>
                )}
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Opciones Habilitadas:</h4>
              <ul className="text-sm space-y-1">
                {config.enableHeatmaps && <li>✅ Heatmaps</li>}
                {config.enableSessionRecording && <li>✅ Grabación de Sesiones</li>}
                {config.enableLeadTracking && <li>✅ Tracking de Leads</li>}
                {config.customTrackingCode && <li>✅ Código Personalizado</li>}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TrackingConfig;