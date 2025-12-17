import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { 
  Mail, 
  Send, 
  Users, 
  BarChart3, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Eye,
  RefreshCw,
  Plus,
  FileCode
} from 'lucide-react';
import { OperationSelector } from '@/components/admin/newsletter/OperationSelector';
import { NewsletterPreview } from '@/components/admin/newsletter/NewsletterPreview';
import { CampaignHistory } from '@/components/admin/newsletter/CampaignHistory';
import { BrevoHtmlGenerator } from '@/components/admin/newsletter/BrevoHtmlGenerator';

interface Operation {
  id: string;
  company_name: string;
  sector: string;
  geographic_location: string | null;
  revenue_amount: number | null;
  ebitda_amount: number | null;
  short_description: string | null;
  project_status: string;
}

interface Campaign {
  id: string;
  subject: string;
  intro_text?: string | null;
  operations_included: string[];
  recipients_count: number;
  sent_at: string | null;
  status: string;
  open_count: number;
  click_count: number;
  created_at: string;
  sent_via?: string | null;
  notes?: string | null;
  html_content?: string | null;
}

interface Subscriber {
  id: string;
  email: string;
  name: string | null;
  full_name: string | null;
  is_active: boolean;
  created_at: string;
}

const NewsletterPage: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [subject, setSubject] = useState('Oportunidades de la Semana – Capittal');
  const [introText, setIntroText] = useState('');
  const [selectedOperations, setSelectedOperations] = useState<string[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [showBrevoGenerator, setShowBrevoGenerator] = useState(false);
  const [activeTab, setActiveTab] = useState('create');

  // Fetch subscribers count
  const { data: subscribersData } = useQuery({
    queryKey: ['newsletter-subscribers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('newsletter_subscribers')
        .select('id, email, name, full_name, is_active, created_at')
        .eq('is_active', true);
      if (error) throw error;
      return data as Subscriber[];
    },
  });

  // Fetch campaigns
  const { data: campaigns, isLoading: campaignsLoading } = useQuery({
    queryKey: ['newsletter-campaigns'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('newsletter_campaigns')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);
      if (error) throw error;
      return data as Campaign[];
    },
  });

  // Fetch operations for selector
  const { data: operations } = useQuery({
    queryKey: ['newsletter-operations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('company_operations')
        .select('id, company_name, sector, geographic_location, revenue_amount, ebitda_amount, short_description, project_status')
        .eq('is_active', true)
        .eq('is_deleted', false)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Operation[];
    },
  });

  // Send newsletter mutation
  const sendNewsletter = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('send-weekly-newsletter', {
        body: {
          subject,
          intro_text: introText,
          operation_ids: selectedOperations,
        },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast({
        title: 'Newsletter enviado',
        description: `Se envió a ${data.sent} suscriptores correctamente.`,
      });
      queryClient.invalidateQueries({ queryKey: ['newsletter-campaigns'] });
      setSelectedOperations([]);
      setActiveTab('history');
    },
    onError: (error) => {
      toast({
        title: 'Error al enviar',
        description: error instanceof Error ? error.message : 'Error desconocido',
        variant: 'destructive',
      });
    },
  });

  const subscriberCount = subscribersData?.length || 0;
  const totalCampaigns = campaigns?.length || 0;
  const sentCampaigns = campaigns?.filter(c => c.status === 'sent').length || 0;

  const selectedOps = operations?.filter(op => selectedOperations.includes(op.id)) || [];

  // Handle duplicating a campaign
  const handleDuplicate = (campaign: Campaign) => {
    setSubject(campaign.subject);
    setIntroText(campaign.intro_text || '');
    setSelectedOperations(campaign.operations_included || []);
    setActiveTab('create');
  };

  // Refresh campaigns after creating/updating
  const refreshCampaigns = () => {
    queryClient.invalidateQueries({ queryKey: ['newsletter-campaigns'] });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">📧 Newsletter Semanal</h1>
          <p className="text-muted-foreground">
            Envía oportunidades de inversión a tus suscriptores
          </p>
        </div>
        <Button onClick={() => setActiveTab('create')} className="gap-2">
          <Plus className="h-4 w-4" />
          Nuevo Envío
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{subscriberCount}</p>
                <p className="text-sm text-muted-foreground">Suscriptores</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Send className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{sentCampaigns}</p>
                <p className="text-sm text-muted-foreground">Enviados</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <BarChart3 className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {campaigns?.[0]?.open_count || 0}%
                </p>
                <p className="text-sm text-muted-foreground">Tasa Apertura</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-lg">
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalCampaigns}</p>
                <p className="text-sm text-muted-foreground">Total Campañas</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="create" className="gap-2">
            <Mail className="h-4 w-4" />
            Crear Newsletter
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2">
            <Clock className="h-4 w-4" />
            Historial
          </TabsTrigger>
          <TabsTrigger value="subscribers" className="gap-2">
            <Users className="h-4 w-4" />
            Suscriptores
          </TabsTrigger>
        </TabsList>

        {/* Create Tab */}
        <TabsContent value="create" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Editor */}
            <Card>
              <CardHeader>
                <CardTitle>Configurar Newsletter</CardTitle>
                <CardDescription>
                  Define el asunto e introduce el texto introductorio
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Asunto del email</label>
                  <Input
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Oportunidades de la Semana – Capittal"
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Texto introductorio (opcional)</label>
                  <Textarea
                    value={introText}
                    onChange={(e) => setIntroText(e.target.value)}
                    placeholder="Te compartimos las últimas oportunidades de inversión disponibles en nuestro Marketplace..."
                    rows={3}
                    className="mt-1"
                  />
                </div>
                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground mb-2">
                    Se enviará a <strong>{subscriberCount}</strong> suscriptores activos
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setShowPreview(true)}
                      disabled={selectedOperations.length === 0}
                      className="gap-2"
                    >
                      <Eye className="h-4 w-4" />
                      Vista Previa
                    </Button>
                    <Button
                      onClick={() => setShowBrevoGenerator(true)}
                      disabled={selectedOperations.length === 0}
                      className="gap-2"
                    >
                      <FileCode className="h-4 w-4" />
                      Crear Campaña para Brevo
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Operation Selector */}
            <Card>
              <CardHeader>
                <CardTitle>Seleccionar Operaciones</CardTitle>
                <CardDescription>
                  Elige las operaciones a incluir en el newsletter
                </CardDescription>
              </CardHeader>
              <CardContent>
                <OperationSelector
                  operations={operations || []}
                  selectedIds={selectedOperations}
                  onSelectionChange={setSelectedOperations}
                />
              </CardContent>
            </Card>
          </div>

          {/* Selected Operations Summary */}
          {selectedOperations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Operaciones seleccionadas ({selectedOperations.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {selectedOps.map((op) => (
                    <Badge key={op.id} variant="secondary" className="gap-1">
                      {op.company_name}
                      <button
                        onClick={() => setSelectedOperations(prev => prev.filter(id => id !== op.id))}
                        className="ml-1 hover:text-destructive"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history">
          <CampaignHistory 
            campaigns={campaigns || []} 
            isLoading={campaignsLoading}
        onRefresh={refreshCampaigns}
        operations={operations || []}
        onDuplicate={handleDuplicate}
      />
    </TabsContent>

        {/* Subscribers Tab */}
        <TabsContent value="subscribers">
          <Card>
            <CardHeader>
              <CardTitle>Suscriptores Activos</CardTitle>
              <CardDescription>
                Lista de emails suscritos al newsletter
              </CardDescription>
            </CardHeader>
            <CardContent>
              {subscribersData && subscribersData.length > 0 ? (
                <div className="space-y-2">
                  {subscribersData.map((sub) => (
                    <div key={sub.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center">
                          <Mail className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{sub.email}</p>
                          {sub.name && <p className="text-sm text-muted-foreground">{sub.name}</p>}
                        </div>
                      </div>
                      <Badge variant="outline" className="gap-1">
                        <CheckCircle2 className="h-3 w-3 text-green-500" />
                        Activo
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No hay suscriptores activos</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Preview Modal */}
      {showPreview && (
        <NewsletterPreview
          subject={subject}
          introText={introText}
          operations={selectedOps}
          onClose={() => setShowPreview(false)}
        />
      )}

      {/* Brevo HTML Generator Modal */}
      <BrevoHtmlGenerator
        open={showBrevoGenerator}
        onOpenChange={setShowBrevoGenerator}
        operations={selectedOps}
        subject={subject}
        introText={introText}
        onCampaignCreated={refreshCampaigns}
      />
    </div>
  );
};

export default NewsletterPage;
