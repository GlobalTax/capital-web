import React, { useState } from 'react';
import { Sparkles, Loader2, Eye, Save, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useReengagementTemplates } from '@/hooks/useReengagementTemplates';
import { useToast } from '@/hooks/use-toast';

interface CreateReengagementModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface GeneratedTemplate {
  label: string;
  description: string;
  default_subject: string;
  brevo_segment: string;
  trigger_condition: string;
  html_template: string;
  variables_used: string[];
}

export const CreateReengagementModal: React.FC<CreateReengagementModalProps> = ({
  open,
  onOpenChange,
}) => {
  const { toast } = useToast();
  const { generateWithAI, createTemplate } = useReengagementTemplates();

  // Form state
  const [objective, setObjective] = useState('');
  const [audience, setAudience] = useState('');
  const [tone, setTone] = useState<'profesional' | 'cercano' | 'urgente'>('profesional');
  const [ctaText, setCtaText] = useState('');
  const [ctaUrl, setCtaUrl] = useState('');

  // Generated template state
  const [generatedTemplate, setGeneratedTemplate] = useState<GeneratedTemplate | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('form');

  const handleGenerate = async () => {
    if (!objective || !audience || !ctaText) {
      toast({
        title: 'Campos requeridos',
        description: 'Por favor completa el objetivo, audiencia y CTA',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);
    try {
      const template = await generateWithAI.mutateAsync({
        objective,
        audience,
        tone,
        cta_text: ctaText,
        cta_url: ctaUrl || undefined,
      });

      setGeneratedTemplate(template);
      setActiveTab('preview');
      toast({
        title: 'Template generado',
        description: 'Revisa la vista previa y guarda si es correcto',
      });
    } catch (error) {
      console.error('Error generating template:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!generatedTemplate) return;

    setIsSaving(true);
    try {
      // Generate a unique slug
      const slug = generatedTemplate.label
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') + '-' + Date.now();

      await createTemplate.mutateAsync({
        slug,
        label: generatedTemplate.label,
        description: generatedTemplate.description,
        brevo_segment: generatedTemplate.brevo_segment,
        trigger_condition: generatedTemplate.trigger_condition,
        default_subject: generatedTemplate.default_subject,
        html_template: generatedTemplate.html_template,
        icon: 'mail',
        variables_used: generatedTemplate.variables_used,
        is_system: false,
        is_active: true,
      });

      handleClose();
    } catch (error) {
      console.error('Error saving template:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    setObjective('');
    setAudience('');
    setTone('profesional');
    setCtaText('');
    setCtaUrl('');
    setGeneratedTemplate(null);
    setActiveTab('form');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Crear Template de Re-engagement con IA
          </DialogTitle>
          <DialogDescription>
            Describe el objetivo del email y la IA generará un template profesional
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="form" disabled={isGenerating}>
              Configuración
            </TabsTrigger>
            <TabsTrigger value="preview" disabled={!generatedTemplate}>
              Vista Previa
            </TabsTrigger>
          </TabsList>

          <TabsContent value="form" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="objective">Objetivo del email *</Label>
                  <Textarea
                    id="objective"
                    placeholder="Ej: Recuperar leads que abandonaron la valoración hace 7 días"
                    value={objective}
                    onChange={(e) => setObjective(e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="audience">Audiencia *</Label>
                  <Textarea
                    id="audience"
                    placeholder="Ej: Empresarios que iniciaron pero no completaron la valoración"
                    value={audience}
                    onChange={(e) => setAudience(e.target.value)}
                    rows={3}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Tono del mensaje</Label>
                  <RadioGroup
                    value={tone}
                    onValueChange={(v) => setTone(v as typeof tone)}
                    className="grid grid-cols-3 gap-2"
                  >
                    <div className="flex items-center space-x-2 border rounded-lg p-3 cursor-pointer hover:bg-muted/50">
                      <RadioGroupItem value="profesional" id="profesional" />
                      <Label htmlFor="profesional" className="cursor-pointer">
                        Profesional
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 border rounded-lg p-3 cursor-pointer hover:bg-muted/50">
                      <RadioGroupItem value="cercano" id="cercano" />
                      <Label htmlFor="cercano" className="cursor-pointer">
                        Cercano
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 border rounded-lg p-3 cursor-pointer hover:bg-muted/50">
                      <RadioGroupItem value="urgente" id="urgente" />
                      <Label htmlFor="urgente" className="cursor-pointer">
                        Urgente
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cta">Texto del CTA principal *</Label>
                  <Input
                    id="cta"
                    placeholder="Ej: Completar mi valoración"
                    value={ctaText}
                    onChange={(e) => setCtaText(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ctaUrl">URL del CTA (opcional)</Label>
                  <Input
                    id="ctaUrl"
                    placeholder="https://capittal.es/lp/calculadora"
                    value={ctaUrl}
                    onChange={(e) => setCtaUrl(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t">
              <Button
                onClick={handleGenerate}
                disabled={isGenerating || !objective || !audience || !ctaText}
                className="gap-2"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generando...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Generar con IA
                  </>
                )}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="preview" className="mt-4">
            {generatedTemplate && (
              <div className="space-y-4">
                {/* Template Info */}
                <div className="grid grid-cols-2 gap-4 p-4 rounded-lg border bg-muted/30">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Nombre</p>
                    <p className="font-medium">{generatedTemplate.label}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Trigger</p>
                    <p className="font-medium">{generatedTemplate.trigger_condition}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs font-medium text-muted-foreground">Asunto</p>
                    <p className="font-medium">{generatedTemplate.default_subject}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs font-medium text-muted-foreground mb-1">Variables</p>
                    <div className="flex flex-wrap gap-1">
                      {generatedTemplate.variables_used.map((v) => (
                        <Badge key={v} variant="secondary" className="text-xs font-mono">
                          {v}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Preview iframe */}
                <div className="rounded-lg border overflow-hidden">
                  <ScrollArea className="h-[400px]">
                    <iframe
                      srcDoc={generatedTemplate.html_template}
                      title="Email Preview"
                      className="w-full h-[600px] bg-white border-0"
                      style={{ minHeight: '600px' }}
                    />
                  </ScrollArea>
                </div>

                {/* Actions */}
                <div className="flex justify-between pt-4 border-t">
                  <Button variant="outline" onClick={() => setActiveTab('form')}>
                    Volver a configurar
                  </Button>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={handleClose}>
                      Cancelar
                    </Button>
                    <Button onClick={handleSave} disabled={isSaving} className="gap-2">
                      {isSaving ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Guardando...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4" />
                          Guardar template
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
