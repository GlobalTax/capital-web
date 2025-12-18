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
import { Copy, Download, Check, Eye, Code, RefreshCw } from 'lucide-react';
import { generateBrevoHtml } from './brevoTemplate';
import { PostCopyConfirmation } from './PostCopyConfirmation';
import { NewsletterType, getNewsletterTypeConfig } from './NewsletterTypeSelector';
import { ContentBlock } from './ContentBlockEditor';
import { generateNewsHtml } from './templates/newsTemplate';
import { generateUpdatesHtml } from './templates/updatesTemplate';
import { generateEducationalHtml } from './templates/educationalTemplate';

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
  contentBlocks?: ContentBlock[];
  headerImageUrl?: string | null;
}

export const BrevoHtmlGenerator: React.FC<BrevoHtmlGeneratorProps> = ({
  open,
  onOpenChange,
  operations,
  subject,
  introText,
  onCampaignCreated,
  newsletterType = 'opportunities',
  selectedArticles = [],
  contentBlocks = [],
  headerImageUrl = null,
}) => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'preview' | 'code'>('preview');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [campaignId, setCampaignId] = useState<string | null>(null);
  const [isCreatingDraft, setIsCreatingDraft] = useState(false);
  const [articles, setArticles] = useState<any[]>([]);

  // Fetch articles when needed
  useEffect(() => {
    if (open && newsletterType === 'news' && selectedArticles.length > 0) {
      fetchArticles();
    }
  }, [open, newsletterType, selectedArticles]);

  const fetchArticles = async () => {
    const { data } = await supabase
      .from('blog_posts')
      .select('id, title, slug, excerpt, category, featured_image_url, reading_time')
      .in('id', selectedArticles);
    if (data) setArticles(data);
  };

  const htmlCode = useMemo(() => {
    switch (newsletterType) {
      case 'opportunities':
        return generateBrevoHtml(operations, subject, introText);
      case 'news':
        return generateNewsHtml(articles, subject, introText, headerImageUrl);
      case 'updates':
        return generateUpdatesHtml(contentBlocks, subject, headerImageUrl);
      case 'educational':
        return generateEducationalHtml(contentBlocks, subject, [], headerImageUrl);
      default:
        return generateBrevoHtml(operations, subject, introText);
    }
  }, [operations, subject, introText, newsletterType, articles, contentBlocks, headerImageUrl]);

  useEffect(() => {
    if (open && !campaignId) {
      const hasContent = 
        (newsletterType === 'opportunities' && operations.length > 0) ||
        (newsletterType === 'news' && selectedArticles.length > 0) ||
        (['updates', 'educational'].includes(newsletterType) && contentBlocks.length > 0);
      
      if (hasContent) createDraftCampaign();
    }
    if (!open) {
      setCampaignId(null);
      setCopied(false);
      setArticles([]);
    }
  }, [open]);

  const createDraftCampaign = async () => {
    setIsCreatingDraft(true);
    try {
      const { data, error } = await supabase
        .from('newsletter_campaigns')
        .insert({
          subject,
          intro_text: introText,
          operations_included: operations.map(op => op.id),
          articles_included: selectedArticles,
          content_blocks: contentBlocks,
          header_image_url: headerImageUrl,
          status: 'draft',
          sent_via: 'brevo',
          html_content: htmlCode,
          recipients_count: 0,
          open_count: 0,
          click_count: 0,
          type: newsletterType,
        })
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
                  <TabsList>
                    <TabsTrigger value="preview" className="gap-2"><Eye className="h-4 w-4" />Vista Previa</TabsTrigger>
                    <TabsTrigger value="code" className="gap-2"><Code className="h-4 w-4" />Código HTML</TabsTrigger>
                  </TabsList>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleDownload} className="gap-2">
                      <Download className="h-4 w-4" />Descargar
                    </Button>
                    <Button size="sm" onClick={handleCopy} className="gap-2 min-w-[140px]">
                      {copied ? <><Check className="h-4 w-4" />¡Copiado!</> : <><Copy className="h-4 w-4" />Copiar HTML</>}
                    </Button>
                  </div>
                </div>
              </div>

              <TabsContent value="preview" className="flex-1 m-0 overflow-hidden">
                <div className="h-full bg-slate-100 p-4 overflow-auto">
                  <div className="max-w-[650px] mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
                    <iframe srcDoc={htmlCode} title="Email Preview" className="w-full h-[calc(85vh-180px)] border-0" sandbox="allow-same-origin" />
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

          <div className="px-6 py-3 border-t bg-amber-50 text-sm text-amber-800">
            <strong>Instrucciones:</strong> Copia el HTML y pégalo en Brevo → Campañas → Nueva campaña → Editor HTML.
          </div>
        </DialogContent>
      </Dialog>

      <PostCopyConfirmation open={showConfirmation} onOpenChange={setShowConfirmation} onConfirmSent={handleConfirmSent} onKeepDraft={handleKeepDraft} />
    </>
  );
};
