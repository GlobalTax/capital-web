import React, { useState } from 'react';
import { Settings, Zap, CheckCircle, XCircle, ExternalLink, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

interface Integration {
  id: string;
  name: string;
  description: string;
  status: 'connected' | 'disconnected' | 'error';
  lastSync?: string;
  config?: Record<string, any>;
}

const IntegrationsManager = () => {
  const [integrations, setIntegrations] = useState<Integration[]>([
    {
      id: 'hubspot',
      name: 'HubSpot CRM',
      description: 'Sincronizar leads y contactos con HubSpot',
      status: 'connected',
      lastSync: '2024-01-15 10:30',
      config: { apiKey: '••••••••••••', autoSync: true }
    },
    {
      id: 'apollo',
      name: 'Apollo.io',
      description: 'Enriquecimiento de datos y prospección',
      status: 'disconnected',
      config: { apiKey: '', autoEnrich: false }
    },
    {
      id: 'google-ads',
      name: 'Google Ads',
      description: 'Seguimiento de conversiones y remarketing',
      status: 'connected',
      lastSync: '2024-01-15 09:15',
      config: { conversionId: 'AW-123456789', remarketingEnabled: true }
    },
    {
      id: 'linkedin-ads',
      name: 'LinkedIn Ads',
      description: 'Campañas publicitarias en LinkedIn',
      status: 'error',
      config: { accountId: '', conversionTracking: false }
    },
    {
      id: 'zapier',
      name: 'Zapier',
      description: 'Automatización de workflows',
      status: 'disconnected',
      config: { webhookUrl: '', enabled: false }
    }
  ]);

  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
  const [isConfiguring, setIsConfiguring] = useState(false);
  const { toast } = useToast();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <XCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      connected: 'default',
      disconnected: 'secondary',
      error: 'destructive'
    };
    
    const labels: Record<string, string> = {
      connected: 'Conectado',
      disconnected: 'Desconectado',
      error: 'Error'
    };

    return (
      <Badge variant={variants[status]}>
        {labels[status]}
      </Badge>
    );
  };

  const handleConnect = async (integration: Integration) => {
    setIsConfiguring(true);
    try {
      // Simular proceso de conexión
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setIntegrations(prev => prev.map(int => 
        int.id === integration.id 
          ? { ...int, status: 'connected' as const, lastSync: new Date().toLocaleString() }
          : int
      ));

      toast({
        title: "Integración conectada",
        description: `${integration.name} se ha conectado correctamente`,
      });
    } catch (error) {
      toast({
        title: "Error de conexión",
        description: `No se pudo conectar con ${integration.name}`,
        variant: "destructive",
      });
    } finally {
      setIsConfiguring(false);
    }
  };

  const handleDisconnect = async (integration: Integration) => {
    setIntegrations(prev => prev.map(int => 
      int.id === integration.id 
        ? { ...int, status: 'disconnected' as const }
        : int
    ));

    toast({
      title: "Integración desconectada",
      description: `${integration.name} se ha desconectado`,
    });
  };

  const handleSync = async (integration: Integration) => {
    try {
      // Simular sincronización
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setIntegrations(prev => prev.map(int => 
        int.id === integration.id 
          ? { ...int, lastSync: new Date().toLocaleString() }
          : int
      ));

      toast({
        title: "Sincronización completada",
        description: `Datos sincronizados con ${integration.name}`,
      });
    } catch (error) {
      toast({
        title: "Error de sincronización",
        description: `No se pudo sincronizar con ${integration.name}`,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Integraciones</h1>
          <p className="text-muted-foreground">
            Conecta con APIs externas y automatiza workflows
          </p>
        </div>
        <Badge variant="outline" className="px-3 py-1">
          {integrations.filter(i => i.status === 'connected').length} activas
        </Badge>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Integraciones Activas</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {integrations.filter(i => i.status === 'connected').length}
            </div>
            <p className="text-xs text-muted-foreground">de {integrations.length} configuradas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sincronizaciones Hoy</CardTitle>
            <RefreshCw className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">actualizaciones automáticas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Datos Procesados</CardTitle>
            <Zap className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1.2k</div>
            <p className="text-xs text-muted-foreground">registros sincronizados</p>
          </CardContent>
        </Card>
      </div>

      {/* Integrations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {integrations.map((integration) => (
          <Card key={integration.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <CardTitle className="flex items-center gap-2">
                    {getStatusIcon(integration.status)}
                    {integration.name}
                  </CardTitle>
                  <CardDescription>{integration.description}</CardDescription>
                </div>
                {getStatusBadge(integration.status)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {integration.lastSync && (
                  <div className="text-sm text-muted-foreground">
                    Última sincronización: {integration.lastSync}
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  {integration.status === 'connected' ? (
                    <>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleSync(integration)}
                      >
                        <RefreshCw className="h-3 w-3 mr-1" />
                        Sincronizar
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => setSelectedIntegration(integration)}
                      >
                        <Settings className="h-3 w-3 mr-1" />
                        Configurar
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => handleDisconnect(integration)}
                      >
                        Desconectar
                      </Button>
                    </>
                  ) : (
                    <Button 
                      size="sm"
                      onClick={() => handleConnect(integration)}
                      disabled={isConfiguring}
                    >
                      {isConfiguring ? 'Conectando...' : 'Conectar'}
                    </Button>
                  )}
                  <Button size="sm" variant="ghost">
                    <ExternalLink className="h-3 w-3 mr-1" />
                    Documentación
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Configuration Modal */}
      {selectedIntegration && (
        <Card className="border-2 border-primary">
          <CardHeader>
            <CardTitle>Configurar {selectedIntegration.name}</CardTitle>
            <CardDescription>
              Ajusta los parámetros de la integración
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="api-key">API Key</Label>
              <Input
                id="api-key"
                type="password"
                placeholder="••••••••••••"
                value={selectedIntegration.config?.apiKey || ''}
              />
            </div>

            {selectedIntegration.id === 'hubspot' && (
              <div className="flex items-center justify-between">
                <div>
                  <Label>Sincronización Automática</Label>
                  <p className="text-sm text-muted-foreground">
                    Sincronizar leads automáticamente cada hora
                  </p>
                </div>
                <Switch checked={selectedIntegration.config?.autoSync || false} />
              </div>
            )}

            <div className="flex gap-2">
              <Button onClick={() => setSelectedIntegration(null)}>
                Guardar Cambios
              </Button>
              <Button variant="outline" onClick={() => setSelectedIntegration(null)}>
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default IntegrationsManager;