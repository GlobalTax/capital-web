import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Activity, 
  Settings, 
  Eye, 
  Users, 
  Target,
  Mail,
  Globe,
  AlertCircle,
  CheckCircle,
  Save
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface TrackingConfig {
  page_tracking: boolean;
  form_tracking: boolean;
  event_tracking: boolean;
  company_identification: boolean;
  lead_scoring: boolean;
  email_automation: boolean;
  ga4_id?: string;
  clarity_id?: string;
  hubspot_tracking?: string;
  custom_domains: string[];
  excluded_ips: string[];
  [key: string]: any; // Para compatibilidad con Json
}

const TrackingConfigPanel = () => {
  const [config, setConfig] = useState<TrackingConfig>({
    page_tracking: true,
    form_tracking: true,
    event_tracking: true,
    company_identification: true,
    lead_scoring: true,
    email_automation: false,
    custom_domains: [],
    excluded_ips: []
  });
  const [isLoading, setIsLoading] = useState(false);
  const [newDomain, setNewDomain] = useState('');
  const [newIp, setNewIp] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const { data, error } = await supabase
        .from('integration_configs')
        .select('*')
        .eq('integration_name', 'tracking_config')
        .single();

      if (data && !error) {
        setConfig({
          ...config,
          ...(data.config_data as any)
        });
      }
    } catch (error) {
      console.error('Error loading tracking config:', error);
    }
  };

  const saveConfig = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('integration_configs')
        .upsert({
          integration_name: 'tracking_config',
          config_data: config as any,
          is_active: true
        });

      if (error) throw error;

      toast({
        title: "Configuración guardada",
        description: "Los cambios se han aplicado correctamente",
      });
    } catch (error) {
      console.error('Error saving config:', error);
      toast({
        title: "Error",
        description: "No se pudo guardar la configuración",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addDomain = () => {
    if (newDomain && !config.custom_domains.includes(newDomain)) {
      setConfig(prev => ({
        ...prev,
        custom_domains: [...prev.custom_domains, newDomain]
      }));
      setNewDomain('');
    }
  };

  const removeDomain = (domain: string) => {
    setConfig(prev => ({
      ...prev,
      custom_domains: prev.custom_domains.filter(d => d !== domain)
    }));
  };

  const addIp = () => {
    if (newIp && !config.excluded_ips.includes(newIp)) {
      setConfig(prev => ({
        ...prev,
        excluded_ips: [...prev.excluded_ips, newIp]
      }));
      setNewIp('');
    }
  };

  const removeIp = (ip: string) => {
    setConfig(prev => ({
      ...prev,
      excluded_ips: prev.excluded_ips.filter(i => i !== ip)
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-light text-foreground tracking-tight">
            Configuración de Seguimiento
          </h1>
          <p className="text-muted-foreground font-light mt-1">
            Configura los sistemas de tracking y analytics
          </p>
        </div>
        <Button onClick={saveConfig} disabled={isLoading} className="flex items-center gap-2">
          <Save className="h-4 w-4" />
          {isLoading ? 'Guardando...' : 'Guardar Cambios'}
        </Button>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="automation">Automatización</TabsTrigger>
          <TabsTrigger value="advanced">Avanzado</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Seguimiento de Páginas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="page-tracking">Activar seguimiento de páginas</Label>
                  <Switch
                    id="page-tracking"
                    checked={config.page_tracking}
                    onCheckedChange={(checked) => setConfig(prev => ({ ...prev, page_tracking: checked }))}
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  Rastrea las páginas visitadas y el tiempo de permanencia
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Seguimiento de Formularios
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="form-tracking">Activar seguimiento de formularios</Label>
                  <Switch
                    id="form-tracking"
                    checked={config.form_tracking}
                    onCheckedChange={(checked) => setConfig(prev => ({ ...prev, form_tracking: checked }))}
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  Monitorea interacciones con formularios y tasas de conversión
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Eventos Personalizados
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="event-tracking">Activar eventos personalizados</Label>
                  <Switch
                    id="event-tracking"
                    checked={config.event_tracking}
                    onCheckedChange={(checked) => setConfig(prev => ({ ...prev, event_tracking: checked }))}
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  Rastrea descargas, clics y otras interacciones específicas
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Lead Scoring
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="lead-scoring">Activar lead scoring</Label>
                  <Switch
                    id="lead-scoring"
                    checked={config.lead_scoring}
                    onCheckedChange={(checked) => setConfig(prev => ({ ...prev, lead_scoring: checked }))}
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  Califica automáticamente la calidad de los leads
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Google Analytics 4</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="ga4-id">Measurement ID</Label>
                  <Input
                    id="ga4-id"
                    placeholder="G-XXXXXXXXXX"
                    value={config.ga4_id || ''}
                    onChange={(e) => setConfig(prev => ({ ...prev, ga4_id: e.target.value }))}
                  />
                </div>
                <div className="flex items-center gap-2">
                  {config.ga4_id ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-yellow-500" />
                  )}
                  <span className="text-sm text-muted-foreground">
                    {config.ga4_id ? 'Configurado' : 'No configurado'}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Microsoft Clarity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="clarity-id">Project ID</Label>
                  <Input
                    id="clarity-id"
                    placeholder="XXXXXXXXXX"
                    value={config.clarity_id || ''}
                    onChange={(e) => setConfig(prev => ({ ...prev, clarity_id: e.target.value }))}
                  />
                </div>
                <div className="flex items-center gap-2">
                  {config.clarity_id ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-yellow-500" />
                  )}
                  <span className="text-sm text-muted-foreground">
                    {config.clarity_id ? 'Configurado' : 'No configurado'}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="automation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Automatización de Email
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="email-automation">Activar emails automáticos</Label>
                <Switch
                  id="email-automation"
                  checked={config.email_automation}
                  onCheckedChange={(checked) => setConfig(prev => ({ ...prev, email_automation: checked }))}
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Envía emails automáticamente basados en el comportamiento del usuario
              </p>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Bienvenida</h4>
                  <p className="text-sm text-muted-foreground">Email al registrarse</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Seguimiento</h4>
                  <p className="text-sm text-muted-foreground">Después de 3 días sin actividad</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Dominios Personalizados
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="ejemplo.com"
                    value={newDomain}
                    onChange={(e) => setNewDomain(e.target.value)}
                  />
                  <Button onClick={addDomain}>Añadir</Button>
                </div>
                <div className="space-y-2">
                  {config.custom_domains.map((domain, index) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded">
                      <span className="text-sm">{domain}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeDomain(domain)}
                      >
                        Eliminar
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  IPs Excluidas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="192.168.1.1"
                    value={newIp}
                    onChange={(e) => setNewIp(e.target.value)}
                  />
                  <Button onClick={addIp}>Añadir</Button>
                </div>
                <div className="space-y-2">
                  {config.excluded_ips.map((ip, index) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded">
                      <span className="text-sm">{ip}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeIp(ip)}
                      >
                        Eliminar
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TrackingConfigPanel;