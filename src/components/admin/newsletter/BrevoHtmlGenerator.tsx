import React, { useState, useMemo } from 'react';
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
import { Copy, Download, Check, Eye, Code } from 'lucide-react';
import { generateBrevoHtml } from './brevoTemplate';

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
}

export const BrevoHtmlGenerator: React.FC<BrevoHtmlGeneratorProps> = ({
  open,
  onOpenChange,
  operations,
  subject,
  introText,
}) => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'preview' | 'code'>('preview');

  const htmlCode = useMemo(() => {
    return generateBrevoHtml(operations, subject, introText);
  }, [operations, subject, introText]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(htmlCode);
      setCopied(true);
      toast({
        title: '✓ HTML copiado',
        description: 'Pega el código en el editor HTML de Brevo',
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = htmlCode;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      toast({
        title: '✓ HTML copiado',
        description: 'Pega el código en el editor HTML de Brevo',
      });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([htmlCode], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `newsletter-capittal-${new Date().toISOString().split('T')[0]}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({
      title: '⬇️ Archivo descargado',
      description: 'Puedes abrir el archivo en tu navegador para previsualizarlo',
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl h-[85vh] flex flex-col p-0">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="flex items-center gap-2">
            📋 HTML para Brevo
            <span className="text-sm font-normal text-muted-foreground">
              ({operations.length} operaciones)
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'preview' | 'code')} className="flex-1 flex flex-col">
            <div className="px-6 py-2 border-b bg-muted/30">
              <div className="flex items-center justify-between">
                <TabsList>
                  <TabsTrigger value="preview" className="gap-2">
                    <Eye className="h-4 w-4" />
                    Vista Previa
                  </TabsTrigger>
                  <TabsTrigger value="code" className="gap-2">
                    <Code className="h-4 w-4" />
                    Código HTML
                  </TabsTrigger>
                </TabsList>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleDownload} className="gap-2">
                    <Download className="h-4 w-4" />
                    Descargar
                  </Button>
                  <Button size="sm" onClick={handleCopy} className="gap-2 min-w-[140px]">
                    {copied ? (
                      <>
                        <Check className="h-4 w-4" />
                        ¡Copiado!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        Copiar HTML
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>

            {/* Preview Tab */}
            <TabsContent value="preview" className="flex-1 m-0 overflow-hidden">
              <div className="h-full bg-slate-100 p-4 overflow-auto">
                <div className="max-w-[650px] mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
                  <iframe
                    srcDoc={htmlCode}
                    title="Email Preview"
                    className="w-full h-[calc(85vh-180px)] border-0"
                    sandbox="allow-same-origin"
                  />
                </div>
              </div>
            </TabsContent>

            {/* Code Tab */}
            <TabsContent value="code" className="flex-1 m-0 overflow-hidden">
              <ScrollArea className="h-full">
                <pre className="p-4 text-xs font-mono bg-slate-900 text-slate-100 overflow-x-auto">
                  <code>{htmlCode}</code>
                </pre>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>

        {/* Instructions */}
        <div className="px-6 py-3 border-t bg-amber-50 text-sm text-amber-800">
          <strong>Instrucciones:</strong> Copia el HTML y pégalo en Brevo → Campañas → Nueva campaña → Editor HTML. 
          Las variables <code className="bg-amber-100 px-1 rounded">{'{{contact.FIRSTNAME}}'}</code> y <code className="bg-amber-100 px-1 rounded">{'{{unsubscribe}}'}</code> se rellenarán automáticamente.
        </div>
      </DialogContent>
    </Dialog>
  );
};
