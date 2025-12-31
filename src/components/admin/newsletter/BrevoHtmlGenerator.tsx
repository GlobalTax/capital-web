import React, { useState, useMemo, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';
import { Copy, Check, Eye, Code, RefreshCw, Monitor, Tablet, Smartphone, AlertTriangle, Image as ImageIcon, Link2, FileText, Settings2, History, Copy as CopyIcon } from 'lucide-react';
import { generateBrevoHtml } from './brevoTemplate';
import { PostCopyConfirmation } from './PostCopyConfirmation';
import { NewsletterType, getNewsletterTypeConfig } from './NewsletterTypeSelector';
import { ContentBlock } from './ContentBlockEditor';
import { generateNewsHtml } from './templates/newsTemplate';
import { generateUpdatesHtml } from './templates/updatesTemplate';
import { generateEducationalHtml } from './templates/educationalTemplate';
import { generateBuySideHtml, BuySideMandate } from './templates/buysideTemplate';
import { generateReengagementHtml, ReengagementType } from './templates/reengagementTemplates';
import { generateSeasonalHtml, SeasonalType } from './templates/seasonalTemplates';
import { ExportDropdown } from './ExportDropdown';
import { TemplateVersionHistory } from './TemplateVersionHistory';
import { ThemeSelector } from './ThemeSelector';
import { HeaderFooterConfig } from './HeaderFooterConfig';
import { CustomTemplateEditor } from './CustomTemplateEditor';
import { getThemeById, NewsletterTheme } from '@/config/newsletterThemes';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

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

interface BrevoHtmlGeneratorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  operations: Operation[];
  subject: string;
  introText: string;
  onCampaignCreated?: () => void;
  newsletterType?: NewsletterType;
  selectedArticles?: string[];
  selectedBuySideMandates?: string[];
  contentBlocks?: ContentBlock[];
  headerImageUrl?: string | null;
  reengagementType?: ReengagementType;
  seasonalType?: SeasonalType;
  seasonalYear?: number;
}

type PreviewMode = 'desktop' | 'tablet' | 'mobile';

const previewWidths: Record<PreviewMode, number> = {
  desktop: 600,
  tablet: 480,
  mobile: 320,
};

export const BrevoHtmlGenerator: React.FC<BrevoHtmlGeneratorProps> = ({
  open,
  onOpenChange,
  operations,
  subject,
  introText,
  onCampaignCreated,
  newsletterType = 'opportunities',
  selectedArticles = [],
  selectedBuySideMandates = [],
  contentBlocks = [],
  headerImageUrl = null,
  reengagementType = 'reactivation',
  seasonalType = 'new_year',
  seasonalYear = new Date().getFullYear(),
}) => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'preview' | 'code'>('preview');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [campaignId, setCampaignId] = useState<string | null>(null);
  const [isCreatingDraft, setIsCreatingDraft] = useState(false);
  const [articles, setArticles] = useState<any[]>([]);
  const [buySideMandates, setBuySideMandates] = useState<BuySideMandate[]>([]);
  const [previewMode, setPreviewMode] = useState<PreviewMode>('desktop');
  const [showSettings, setShowSettings] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState<NewsletterTheme>(getThemeById('capittal-classic'));
  const [headerVariant, setHeaderVariant] = useState('centered');
  const [footerVariant, setFooterVariant] = useState('complete');
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [showDuplicateEditor, setShowDuplicateEditor] = useState(false);

  // Fetch articles when needed
  useEffect(() => {
    if (open && newsletterType === 'news' && selectedArticles.length > 0) {
      fetchArticles();
    }
    if (open && newsletterType === 'buyside' && selectedBuySideMandates.length > 0) {
      fetchBuySideMandates();
    }
  }, [open, newsletterType, selectedArticles, selectedBuySideMandates]);

  const fetchArticles = async () => {
    const { data } = await supabase
      .from('blog_posts')
      .select('id, title, slug, excerpt, category, featured_image_url, reading_time')
      .in('id', selectedArticles);
    if (data) setArticles(data);
  };

  const fetchBuySideMandates = async () => {
    const { data } = await supabase
      .from('buy_side_mandates')
      .select('id, title, sector, geographic_scope, revenue_min, revenue_max, description, is_new')
      .in('id', selectedBuySideMandates);
    if (data) setBuySideMandates(data as BuySideMandate[]);
  };

  const htmlCode = useMemo(() => {
    switch (newsletterType) {
      case 'opportunities':
        return generateBrevoHtml(operations, subject, introText);
      case 'buyside':
        return generateBuySideHtml(buySideMandates, subject, introText);
      case 'news':
        return generateNewsHtml(articles, subject, introText, headerImageUrl);
      case 'updates':
        return generateUpdatesHtml(contentBlocks, subject, headerImageUrl);
      case 'educational':
        return generateEducationalHtml(contentBlocks, subject, [], headerImageUrl);
      case 'automation':
        return generateReengagementHtml(reengagementType);
      case 'seasonal':
        return generateSeasonalHtml(seasonalType, seasonalYear);
      default:
        return generateBrevoHtml(operations, subject, introText);
    }
  }, [operations, subject, introText, newsletterType, articles, buySideMandates, contentBlocks, headerImageUrl, reengagementType, seasonalType, seasonalYear]);

  // HTML Statistics
  const htmlStats = useMemo(() => {
    const sizeInBytes = new Blob([htmlCode]).size;
    const sizeInKB = (sizeInBytes / 1024).toFixed(1);
    const imageCount = (htmlCode.match(/<img/g) || []).length;
    const linkCount = (htmlCode.match(/<a /g) || []).length;
    const isOverLimit = sizeInBytes > 102400; // 102KB Gmail limit
    
    return { sizeInBytes, sizeInKB, imageCount, linkCount, isOverLimit };
  }, [htmlCode]);

  useEffect(() => {
    if (open && !campaignId) {
      const hasContent = 
        (newsletterType === 'opportunities' && operations.length > 0) ||
        (newsletterType === 'buyside' && selectedBuySideMandates.length > 0) ||
        (newsletterType === 'news' && selectedArticles.length > 0) ||
        (['updates', 'educational'].includes(newsletterType) && contentBlocks.length > 0);
      
      if (hasContent) createDraftCampaign();
    }
    if (!open) {
      setCampaignId(null);
      setCopied(false);
      setArticles([]);
      setBuySideMandates([]);
      setPreviewMode('desktop');
    }
  }, [open]);

  const createDraftCampaign = async () => {
    setIsCreatingDraft(true);
    try {
      const { data, error } = await supabase
        .from('newsletter_campaigns')
        .insert([{
          subject,
          intro_text: introText,
          operations_included: operations.map(op => op.id),
          articles_included: selectedArticles,
          buy_side_mandates_included: selectedBuySideMandates,
          content_blocks: contentBlocks as unknown as Json,
          header_image_url: headerImageUrl,
          status: 'draft',
          sent_via: 'brevo',
          html_content: htmlCode,
          recipients_count: 0,
          open_count: 0,
          click_count: 0,
          type: newsletterType,
        }])
        .select()
        .single();

      if (error) throw error;
      setCampaignId(data.id);
      toast({ title: '📋 Borrador creado', description: 'La campaña se ha guardado como borrador' });
      onCampaignCreated?.();
    } catch (error) {
      console.error('Error creating draft:', error);
      toast({ title: 'Error', description: 'No se pudo crear el borrador', variant: 'destructive' });
    } finally {
      setIsCreatingDraft(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(htmlCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      setShowConfirmation(true);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = htmlCode;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      setShowConfirmation(true);
    }
  };

  const handleConfirmSent = async () => {
    if (!campaignId) return;
    try {
      const { error } = await supabase
        .from('newsletter_campaigns')
        .update({ status: 'sent', sent_at: new Date().toISOString() })
        .eq('id', campaignId);
      if (error) throw error;
      toast({ title: '✓ Campaña marcada como enviada' });
      setShowConfirmation(false);
      onOpenChange(false);
      onCampaignCreated?.();
    } catch {
      toast({ title: 'Error', description: 'No se pudo actualizar el estado', variant: 'destructive' });
    }
  };

  const handleKeepDraft = () => {
    setShowConfirmation(false);
    toast({ title: '📝 Guardado como borrador' });
  };

  const handleDownload = () => {
    const blob = new Blob([htmlCode], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `newsletter-${newsletterType}-${new Date().toISOString().split('T')[0]}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({ title: '⬇️ Archivo descargado' });
  };

  const typeConfig = getNewsletterTypeConfig(newsletterType);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-5xl h-[85vh] flex flex-col p-0">
          <DialogHeader className="px-6 py-4 border-b">
            <DialogTitle className="flex items-center gap-2">
              📋 {typeConfig.label}
              {isCreatingDraft && <RefreshCw className="h-4 w-4 animate-spin text-muted-foreground" />}
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 flex flex-col overflow-hidden">
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'preview' | 'code')} className="flex-1 flex flex-col">
              <div className="px-6 py-2 border-b bg-muted/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <TabsList>
                      <TabsTrigger value="preview" className="gap-2"><Eye className="h-4 w-4" />Vista Previa</TabsTrigger>
                      <TabsTrigger value="code" className="gap-2"><Code className="h-4 w-4" />Código HTML</TabsTrigger>
                    </TabsList>
                    
                    {/* Responsive Preview Toggle */}
                    {activeTab === 'preview' && (
                      <div className="flex items-center gap-1 border rounded-lg p-1 bg-background">
                        <Button
                          variant={previewMode === 'desktop' ? 'secondary' : 'ghost'}
                          size="sm"
                          className="h-7 w-7 p-0"
                          onClick={() => setPreviewMode('desktop')}
                          title="Desktop (600px)"
                        >
                          <Monitor className="h-4 w-4" />
                        </Button>
                        <Button
                          variant={previewMode === 'tablet' ? 'secondary' : 'ghost'}
                          size="sm"
                          className="h-7 w-7 p-0"
                          onClick={() => setPreviewMode('tablet')}
                          title="Tablet (480px)"
                        >
                          <Tablet className="h-4 w-4" />
                        </Button>
                        <Button
                          variant={previewMode === 'mobile' ? 'secondary' : 'ghost'}
                          size="sm"
                          className="h-7 w-7 p-0"
                          onClick={() => setPreviewMode('mobile')}
                          title="Mobile (320px)"
                        >
                          <Smartphone className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowVersionHistory(!showVersionHistory)}
                      className="gap-1.5"
                      title="Historial de versiones"
                    >
                      <History className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowSettings(!showSettings)}
                      className="gap-1.5"
                      title="Configuración de tema"
                    >
                      <Settings2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowDuplicateEditor(true)}
                      className="gap-1.5"
                      title="Duplicar como template"
                    >
                      <CopyIcon className="h-4 w-4" />
                    </Button>
                    <ExportDropdown html={htmlCode} subject={subject} />
                    <Button size="sm" onClick={handleCopy} className="gap-2 min-w-[140px]">
                      {copied ? <><Check className="h-4 w-4" />¡Copiado!</> : <><Copy className="h-4 w-4" />Copiar HTML</>}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Settings Panel */}
              <Collapsible open={showSettings}>
                <CollapsibleContent>
                  <div className="px-6 py-4 border-b bg-muted/20 space-y-4">
                    <ThemeSelector
                      selectedThemeId={selectedTheme.id}
                      onThemeChange={setSelectedTheme}
                    />
                    <HeaderFooterConfig
                      headerVariant={headerVariant}
                      footerVariant={footerVariant}
                      onHeaderChange={setHeaderVariant}
                      onFooterChange={setFooterVariant}
                    />
                  </div>
                </CollapsibleContent>
              </Collapsible>

              {/* Version History Panel */}
              <Collapsible open={showVersionHistory}>
                <CollapsibleContent>
                  <div className="px-6 py-4 border-b bg-muted/20">
                    <TemplateVersionHistory
                      campaignId={campaignId}
                      currentHtml={htmlCode}
                      currentSubject={subject}
                      currentIntro={introText}
                      onRestore={(html) => {
                        toast({ title: '✓ Versión restaurada - recarga para ver cambios' });
                      }}
                    />
                  </div>
                </CollapsibleContent>
              </Collapsible>

              <TabsContent value="preview" className="flex-1 m-0 overflow-hidden">
                <div className="h-full bg-slate-100 p-4 overflow-auto">
                  <div 
                    className="mx-auto bg-white rounded-lg shadow-lg overflow-hidden transition-all duration-300"
                    style={{ width: previewWidths[previewMode], maxWidth: '100%' }}
                  >
                    <iframe srcDoc={htmlCode} title="Email Preview" className="w-full h-[calc(85vh-220px)] border-0" sandbox="allow-same-origin" />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="code" className="flex-1 m-0 overflow-hidden">
                <ScrollArea className="h-full">
                  <pre className="p-4 text-xs font-mono bg-slate-900 text-slate-100 overflow-x-auto"><code>{htmlCode}</code></pre>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </div>

          {/* HTML Statistics Bar */}
          <div className="px-6 py-2 border-t bg-muted/30 flex items-center gap-4 text-xs text-muted-foreground">
            <div className={`flex items-center gap-1.5 ${htmlStats.isOverLimit ? 'text-destructive font-medium' : ''}`}>
              {htmlStats.isOverLimit && <AlertTriangle className="h-3.5 w-3.5" />}
              <FileText className="h-3.5 w-3.5" />
              <span>{htmlStats.sizeInKB} KB</span>
              {htmlStats.isOverLimit && <span className="text-destructive">(supera 102KB de Gmail)</span>}
            </div>
            <div className="flex items-center gap-1.5">
              <ImageIcon className="h-3.5 w-3.5" />
              <span>{htmlStats.imageCount} imágenes</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Link2 className="h-3.5 w-3.5" />
              <span>{htmlStats.linkCount} enlaces</span>
            </div>
          </div>

          <div className="px-6 py-3 border-t bg-amber-50 text-sm text-amber-800">
            <strong>Instrucciones:</strong> Copia el HTML y pégalo en Brevo → Campañas → Nueva campaña → Editor HTML.
          </div>
        </DialogContent>
      </Dialog>

      <PostCopyConfirmation open={showConfirmation} onOpenChange={setShowConfirmation} onConfirmSent={handleConfirmSent} onKeepDraft={handleKeepDraft} />
      
      {/* Duplicate as Custom Template Editor */}
      <CustomTemplateEditor
        open={showDuplicateEditor}
        onOpenChange={setShowDuplicateEditor}
        duplicateFromHtml={htmlCode}
      />
    </>
  );
};
