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
  Clock, 
  Eye,
  Plus,
  FileCode,
  FileText,
  CheckCircle2
} from 'lucide-react';
import { OperationSelector } from '@/components/admin/newsletter/OperationSelector';
import { NewsletterPreview } from '@/components/admin/newsletter/NewsletterPreview';
import { CampaignHistory } from '@/components/admin/newsletter/CampaignHistory';
import { BrevoHtmlGenerator } from '@/components/admin/newsletter/BrevoHtmlGenerator';
import { NewsletterTypeSelector, NewsletterType, NEWSLETTER_TYPES, getNewsletterTypeConfig } from '@/components/admin/newsletter/NewsletterTypeSelector';

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
  type?: NewsletterType | null;
  articles_included?: string[] | null;
  content_blocks?: unknown[] | null;
  header_image_url?: string | null;
}

const NewsletterPage: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [newsletterType, setNewsletterType] = useState<NewsletterType>('opportunities');
  const [subject, setSubject] = useState(getNewsletterTypeConfig('opportunities').defaultSubject);
  const [introText, setIntroText] = useState('');
  const [selectedOperations, setSelectedOperations] = useState<string[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [showBrevoGenerator, setShowBrevoGenerator] = useState(false);
  const [activeTab, setActiveTab] = useState('create');

  // Fetch campaigns
  const { data: campaigns, isLoading: campaignsLoading } = useQuery({
    queryKey: ['newsletter-campaigns'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('newsletter_campaigns')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
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

  // Campaign stats
  const totalCampaigns = campaigns?.length || 0;
  const sentCampaigns = campaigns?.filter(c => c.status === 'sent').length || 0;
  const draftCampaigns = campaigns?.filter(c => c.status === 'draft').length || 0;

  const selectedOps = operations?.filter(op => selectedOperations.includes(op.id)) || [];
  const currentTypeConfig = getNewsletterTypeConfig(newsletterType);

  // Handle type change
  const handleTypeChange = (type: NewsletterType) => {
    setNewsletterType(type);
    const config = getNewsletterTypeConfig(type);
    setSubject(config.defaultSubject);
    // Reset selections when changing type
    setSelectedOperations([]);
    setIntroText('');
  };

  // Handle duplicating a campaign
  const handleDuplicate = (campaign: Campaign) => {
    const type = campaign.type || 'opportunities';
    setNewsletterType(type);
    setSubject(campaign.subject);
    setIntroText(campaign.intro_text || '');
    setSelectedOperations(campaign.operations_included || []);
    setActiveTab('create');
  };

  // Refresh campaigns after creating/updating
  const refreshCampaigns = () => {
    queryClient.invalidateQueries({ queryKey: ['newsletter-campaigns'] });
  };

  // Check if can proceed (depends on type)
  const canProceed = () => {
    if (newsletterType === 'opportunities') {
      return selectedOperations.length > 0;
    }
    // For other types, we'll add logic in future phases
    return false;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">📧 Newsletter</h1>
          <p className="text-muted-foreground">
            Crea y gestiona campañas de email para tus suscriptores
          </p>
        </div>
        <Button onClick={() => setActiveTab('create')} className="gap-2">
          <Plus className="h-4 w-4" />
          Nueva Campaña
        </Button>
      </div>

      {/* Stats Cards - Updated without subscriber count */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Mail className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalCampaigns}</p>
                <p className="text-sm text-muted-foreground">Total Campañas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{sentCampaigns}</p>
                <p className="text-sm text-muted-foreground">Enviadas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-500/10 rounded-lg">
                <FileText className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{draftCampaigns}</p>
                <p className="text-sm text-muted-foreground">Borradores</p>
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
        </TabsList>

        {/* Create Tab */}
        <TabsContent value="create" className="space-y-6">
          {/* Type Selector */}
          <Card>
            <CardHeader>
              <CardTitle>Tipo de Newsletter</CardTitle>
              <CardDescription>
                Selecciona el tipo de contenido que quieres enviar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <NewsletterTypeSelector
                selectedType={newsletterType}
                onTypeChange={handleTypeChange}
              />
            </CardContent>
          </Card>

          {/* Editor based on type */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Editor */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  {React.createElement(currentTypeConfig.icon, { className: 'h-5 w-5 text-primary' })}
                  <CardTitle>{currentTypeConfig.label}</CardTitle>
                </div>
                <CardDescription>
                  {currentTypeConfig.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Asunto del email</label>
                  <Input
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder={currentTypeConfig.defaultSubject}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Texto introductorio (opcional)</label>
                  <Textarea
                    value={introText}
                    onChange={(e) => setIntroText(e.target.value)}
                    placeholder="Te compartimos las últimas novedades..."
                    rows={3}
                    className="mt-1"
                  />
                </div>

                {/* Type-specific message */}
                {newsletterType !== 'opportunities' && (
                  <div className="p-4 bg-muted/50 rounded-lg border border-dashed">
                    <p className="text-sm text-muted-foreground text-center">
                      El editor para <strong>{currentTypeConfig.label}</strong> estará disponible próximamente.
                      <br />
                      Por ahora, usa el tipo "Oportunidades".
                    </p>
                  </div>
                )}

                <div className="pt-4 border-t">
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setShowPreview(true)}
                      disabled={!canProceed()}
                      className="gap-2"
                    >
                      <Eye className="h-4 w-4" />
                      Vista Previa
                    </Button>
                    <Button
                      onClick={() => setShowBrevoGenerator(true)}
                      disabled={!canProceed()}
                      className="gap-2"
                    >
                      <FileCode className="h-4 w-4" />
                      Crear Campaña para Brevo
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Operation Selector - only for opportunities type */}
            {newsletterType === 'opportunities' && (
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
            )}

            {/* Placeholder for other types - will be implemented in future phases */}
            {newsletterType !== 'opportunities' && (
              <Card className="border-dashed">
                <CardContent className="flex items-center justify-center min-h-[300px]">
                  <div className="text-center text-muted-foreground">
                    <currentTypeConfig.icon className="h-12 w-12 mx-auto mb-4 opacity-30" />
                    <p className="font-medium">Próximamente</p>
                    <p className="text-sm">
                      Selector de contenido para {currentTypeConfig.label.toLowerCase()}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
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
        newsletterType={newsletterType}
      />
    </div>
  );
};

export default NewsletterPage;
