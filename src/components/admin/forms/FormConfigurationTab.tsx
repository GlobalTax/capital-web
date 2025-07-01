
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Settings, 
  Bell, 
  Zap, 
  Target,
  Plus,
  Edit,
  Trash2
} from 'lucide-react';

interface FormConfig {
  id: string;
  form_type: string;
  auto_response_enabled: boolean;
  hot_lead_threshold: number;
  notification_emails: string[];
  tracking_enabled: boolean;
  ab_testing_enabled: boolean;
}

const FormConfigurationTab = () => {
  const [configs, setConfigs] = useState<FormConfig[]>([
    {
      id: '1',
      form_type: 'contact',
      auto_response_enabled: true,
      hot_lead_threshold: 80,
      notification_emails: ['admin@capittal.com'],
      tracking_enabled: true,
      ab_testing_enabled: false,
    },
    {
      id: '2', 
      form_type: 'valuation',
      auto_response_enabled: true,
      hot_lead_threshold: 90,
      notification_emails: ['admin@capittal.com', 'sales@capittal.com'],
      tracking_enabled: true,
      ab_testing_enabled: true,
    }
  ]);

  const [newEmail, setNewEmail] = useState('');
  const [editingConfig, setEditingConfig] = useState<string | null>(null);

  const updateConfig = (configId: string, updates: Partial<FormConfig>) => {
    setConfigs(prev => prev.map(config => 
      config.id === configId ? { ...config, ...updates } : config
    ));
  };

  const addNotificationEmail = (configId: string) => {
    if (!newEmail || !newEmail.includes('@')) return;
    
    updateConfig(configId, {
      notification_emails: [...configs.find(c => c.id === configId)?.notification_emails || [], newEmail]
    });
    setNewEmail('');
  };

  const removeNotificationEmail = (configId: string, email: string) => {
    const config = configs.find(c => c.id === configId);
    if (!config) return;
    
    updateConfig(configId, {
      notification_emails: config.notification_emails.filter(e => e !== email)
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">⚙️ Configuración de Formularios</h3>
          <p className="text-sm text-gray-600">Personaliza el comportamiento y automatización de cada formulario</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Formulario
        </Button>
      </div>

      <div className="space-y-6">
        {configs.map((config) => (
          <Card key={config.id} className="border-l-4 border-l-blue-500">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="capitalize flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Formulario: {config.form_type.replace('_', ' ')}
                </CardTitle>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setEditingConfig(config.id)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="general" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="general">General</TabsTrigger>
                  <TabsTrigger value="notifications">Notificaciones</TabsTrigger>
                  <TabsTrigger value="automation">Automatización</TabsTrigger>
                  <TabsTrigger value="scoring">Scoring</TabsTrigger>
                </TabsList>

                <TabsContent value="general" className="space-y-4 mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <Label className="font-medium">Tracking Habilitado</Label>
                        <p className="text-sm text-gray-500">Registrar eventos y analytics</p>
                      </div>
                      <Switch 
                        checked={config.tracking_enabled}
                        onCheckedChange={(checked) => updateConfig(config.id, { tracking_enabled: checked })}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <Label className="font-medium">A/B Testing</Label>
                        <p className="text-sm text-gray-500">Pruebas automáticas de variantes</p>
                      </div>
                      <Switch 
                        checked={config.ab_testing_enabled}
                        onCheckedChange={(checked) => updateConfig(config.id, { ab_testing_enabled: checked })}
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="notifications" className="space-y-4 mt-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <Label className="font-medium">Respuesta Automática</Label>
                        <p className="text-sm text-gray-500">Email automático al usuario</p>
                      </div>
                      <Switch 
                        checked={config.auto_response_enabled}
                        onCheckedChange={(checked) => updateConfig(config.id, { auto_response_enabled: checked })}
                      />
                    </div>

                    <div className="space-y-3">
                      <Label className="font-medium">Emails de Notificación</Label>
                      <div className="flex gap-2">
                        <Input
                          placeholder="nuevo@email.com"
                          value={newEmail}
                          onChange={(e) => setNewEmail(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && addNotificationEmail(config.id)}
                        />
                        <Button onClick={() => addNotificationEmail(config.id)}>
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {config.notification_emails.map((email) => (
                          <Badge key={email} variant="secondary" className="flex items-center gap-1">
                            {email}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-4 w-4 p-0 hover:bg-red-100"
                              onClick={() => removeNotificationEmail(config.id, email)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="automation" className="space-y-4 mt-4">
                  <div className="grid grid-cols-1 gap-4">
                    <Card className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <Zap className="h-5 w-5 text-yellow-500" />
                        <h4 className="font-medium">Workflows Activos</h4>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Email de bienvenida</span>
                          <Badge variant="default">Activo</Badge>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span>Seguimiento 24h</span>
                          <Badge variant="default">Activo</Badge>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span>Alerta lead caliente</span>
                          <Badge variant="default">Activo</Badge>
                        </div>
                      </div>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="scoring" className="space-y-4 mt-4">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="font-medium">Umbral Lead Caliente</Label>
                      <div className="flex items-center gap-4">
                        <Input
                          type="number"
                          value={config.hot_lead_threshold}
                          onChange={(e) => updateConfig(config.id, { hot_lead_threshold: parseInt(e.target.value) || 80 })}
                          className="w-24"
                        />
                        <span className="text-sm text-gray-500">puntos</span>
                        <Badge variant="outline">
                          {config.hot_lead_threshold >= 90 ? "Muy Alto" : 
                           config.hot_lead_threshold >= 70 ? "Alto" : "Medio"}
                        </Badge>
                      </div>
                    </div>

                    <Card className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <Target className="h-5 w-5 text-blue-500" />
                        <h4 className="font-medium">Reglas de Puntuación</h4>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Completar formulario</span>
                          <span className="font-medium">+50 pts</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Email empresarial</span>
                          <span className="font-medium">+20 pts</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Sector objetivo</span>
                          <span className="font-medium">+30 pts</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Tamaño empresa</span>
                          <span className="font-medium">+25 pts</span>
                        </div>
                      </div>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default FormConfigurationTab;
