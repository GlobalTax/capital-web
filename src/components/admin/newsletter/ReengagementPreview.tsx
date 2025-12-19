import React, { useState, useMemo } from 'react';
import { Eye, Code, Copy, Download, Check } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { 
  ReengagementType, 
  REENGAGEMENT_TYPES, 
  generateReengagementHtml 
} from './templates/reengagementTemplates';

interface ReengagementPreviewProps {
  reengagementType: ReengagementType;
}

const BREVO_VARIABLES = [
  { name: 'FIRSTNAME', description: 'Nombre del contacto' },
  { name: 'COMPANY', description: 'Empresa del contacto' },
  { name: 'SECTOR', description: 'Sector de la empresa' },
  { name: 'VALUATION', description: 'Última valoración' },
  { name: 'current_month', description: 'Mes actual' },
];

export const ReengagementPreview: React.FC<ReengagementPreviewProps> = ({ 
  reengagementType 
}) => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('preview');

  const config = useMemo(() => 
    REENGAGEMENT_TYPES.find(t => t.id === reengagementType), 
    [reengagementType]
  );

  const htmlContent = useMemo(() => 
    generateReengagementHtml(reengagementType), 
    [reengagementType]
  );

  const handleCopyHtml = async () => {
    try {
      await navigator.clipboard.writeText(htmlContent);
      setCopied(true);
      toast({
        title: "HTML copiado",
        description: "El código HTML ha sido copiado al portapapeles",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Error",
        description: "No se pudo copiar el HTML",
        variant: "destructive",
      });
    }
  };

  const handleDownloadHtml = () => {
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reengagement-${reengagementType}-template.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Archivo descargado",
      description: `reengagement-${reengagementType}-template.html`,
    });
  };

  if (!config) return null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Vista Previa del Email
            </CardTitle>
            <CardDescription className="mt-1">
              {config.label} - {config.description}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleCopyHtml}
              className="gap-2"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? 'Copiado' : 'Copiar HTML'}
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleDownloadHtml}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Descargar
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Subject Line */}
        <div className="rounded-lg border bg-muted/50 p-3">
          <p className="text-xs font-medium text-muted-foreground mb-1">Asunto:</p>
          <p className="font-medium">{config.defaultSubject}</p>
        </div>

        {/* Preview Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="preview" className="gap-2">
              <Eye className="h-4 w-4" />
              Vista Previa
            </TabsTrigger>
            <TabsTrigger value="code" className="gap-2">
              <Code className="h-4 w-4" />
              Código HTML
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="preview" className="mt-4">
            <div className="rounded-lg border overflow-hidden bg-muted/30">
              <iframe
                srcDoc={htmlContent}
                title="Email Preview"
                className="w-full h-[600px] bg-white"
                sandbox="allow-same-origin"
              />
            </div>
          </TabsContent>
          
          <TabsContent value="code" className="mt-4">
            <ScrollArea className="h-[600px] rounded-lg border bg-muted/30">
              <pre className="p-4 text-xs font-mono whitespace-pre-wrap break-all">
                {htmlContent}
              </pre>
            </ScrollArea>
          </TabsContent>
        </Tabs>

        {/* Brevo Variables */}
        <div className="rounded-lg border p-4">
          <p className="text-sm font-medium mb-3">Variables de Brevo utilizadas:</p>
          <div className="flex flex-wrap gap-2">
            {BREVO_VARIABLES.map((variable) => (
              <Badge key={variable.name} variant="secondary" className="font-mono text-xs">
                {'{{contact.' + variable.name + '}}'}
              </Badge>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Asegúrate de que estos campos estén configurados en tu lista de contactos de Brevo.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
