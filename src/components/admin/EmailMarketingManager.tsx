import React, { useState } from 'react';
import { useEmailMarketing } from '@/hooks/useEmailMarketing';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Mail, 
  FileText, 
  Send, 
  Calendar,
  Users,
  Eye,
  MousePointer,
  TrendingUp,
  Pause,
  Play
} from 'lucide-react';

export const EmailMarketingManager = () => {
  const { 
    templates, 
    campaigns, 
    isLoading,
    updateCampaignStatus,
    getCampaignAnalytics 
  } = useEmailMarketing();
  
  const [selectedTab, setSelectedTab] = useState('campaigns');

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; color: string }> = {
      draft: { variant: 'secondary', color: 'gray' },
      scheduled: { variant: 'outline', color: 'blue' },
      sending: { variant: 'default', color: 'yellow' },
      sent: { variant: 'default', color: 'green' },
      paused: { variant: 'secondary', color: 'orange' },
      cancelled: { variant: 'destructive', color: 'red' }
    };
    
    const config = variants[status] || variants.draft;
    
    return (
      <Badge variant={config.variant}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-admin-text-primary">
            Email Marketing
          </h1>
          <p className="text-admin-text-secondary">
            Gestiona tus campañas de email y plantillas
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <FileText className="h-4 w-4 mr-2" />
            Nueva Plantilla
          </Button>
          <Button>
            <Send className="h-4 w-4 mr-2" />
            Nueva Campaña
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-admin-text-secondary">
                  Campañas Activas
                </p>
                <p className="text-2xl font-bold text-admin-text-primary">
                  {campaigns.filter(c => ['scheduled', 'sending'].includes(c.status)).length}
                </p>
              </div>
              <Send className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-admin-text-secondary">
                  Plantillas
                </p>
                <p className="text-2xl font-bold text-admin-text-primary">
                  {templates.length}
                </p>
              </div>
              <FileText className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-admin-text-secondary">
                  Enviados Hoy
                </p>
                <p className="text-2xl font-bold text-admin-text-primary">
                  {campaigns
                    .filter(c => c.sent_at && new Date(c.sent_at).toDateString() === new Date().toDateString())
                    .reduce((acc, c) => acc + c.sent_count, 0)
                  }
                </p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-admin-text-secondary">
                  Tasa de Apertura
                </p>
                <p className="text-2xl font-bold text-admin-text-primary">
                  {campaigns.length > 0 
                    ? (campaigns.reduce((acc, c) => acc + c.open_rate, 0) / campaigns.length).toFixed(1)
                    : '0'
                  }%
                </p>
              </div>
              <Eye className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList>
          <TabsTrigger value="campaigns">
            Campañas
            <Badge variant="secondary" className="ml-2">
              {campaigns.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="templates">
            Plantillas
            <Badge variant="secondary" className="ml-2">
              {templates.length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        {/* Campaigns Tab */}
        <TabsContent value="campaigns">
          <div className="grid gap-4">
            {campaigns.map((campaign) => {
              const analytics = getCampaignAnalytics(campaign);
              
              return (
                <Card key={campaign.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold">{campaign.name}</h3>
                          {getStatusBadge(campaign.status)}
                        </div>
                        <p className="text-sm text-admin-text-secondary mb-4">
                          {campaign.subject}
                        </p>
                        
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                          <div className="text-center">
                            <p className="text-sm text-admin-text-secondary">Destinatarios</p>
                            <p className="text-xl font-bold">{campaign.recipients_count}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm text-admin-text-secondary">Enviados</p>
                            <p className="text-xl font-bold text-green-600">{campaign.sent_count}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm text-admin-text-secondary">Aperturas</p>
                            <p className="text-xl font-bold text-blue-600">{analytics.openRate}%</p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm text-admin-text-secondary">Clics</p>
                            <p className="text-xl font-bold text-purple-600">{analytics.clickRate}%</p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm text-admin-text-secondary">Rebotes</p>
                            <p className="text-xl font-bold text-red-600">{campaign.bounced_count}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 ml-4">
                        {campaign.status === 'draft' && (
                          <Button size="sm">
                            <Calendar className="h-4 w-4 mr-2" />
                            Programar
                          </Button>
                        )}
                        {campaign.status === 'sending' && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => updateCampaignStatus(campaign.id, 'paused')}
                          >
                            <Pause className="h-4 w-4 mr-2" />
                            Pausar
                          </Button>
                        )}
                        {campaign.status === 'paused' && (
                          <Button 
                            size="sm"
                            onClick={() => updateCampaignStatus(campaign.id, 'sending')}
                          >
                            <Play className="h-4 w-4 mr-2" />
                            Reanudar
                          </Button>
                        )}
                        <Button size="sm" variant="outline">
                          <TrendingUp className="h-4 w-4 mr-2" />
                          Analytics
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            
            {campaigns.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <Mail className="h-12 w-12 text-admin-text-secondary mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No hay campañas</h3>
                  <p className="text-admin-text-secondary mb-4">
                    Crea tu primera campaña de email para empezar
                  </p>
                  <Button>
                    <Send className="h-4 w-4 mr-2" />
                    Crear Primera Campaña
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {templates.map((template) => (
              <Card key={template.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold">{template.name}</h3>
                      <Badge variant="outline" className="mt-2">
                        {template.template_type}
                      </Badge>
                    </div>
                    <FileText className="h-5 w-5 text-admin-text-secondary" />
                  </div>
                  
                  <p className="text-sm text-admin-text-secondary mb-4">
                    {template.subject}
                  </p>
                  
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      Editar
                    </Button>
                    <Button size="sm">
                      Usar Plantilla
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {templates.length === 0 && (
              <Card className="md:col-span-2 lg:col-span-3">
                <CardContent className="p-8 text-center">
                  <FileText className="h-12 w-12 text-admin-text-secondary mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No hay plantillas</h3>
                  <p className="text-admin-text-secondary mb-4">
                    Crea plantillas reutilizables para tus campañas
                  </p>
                  <Button>
                    <FileText className="h-4 w-4 mr-2" />
                    Crear Primera Plantilla
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};