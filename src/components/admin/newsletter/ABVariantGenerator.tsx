import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Loader2, Sparkles, Check, Copy, TrendingUp, Zap, Target } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Variant {
  variant: string;
  approach?: string;
  tone?: string;
  expectedImpact?: string;
}

interface ABVariantGeneratorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: 'subject' | 'intro' | 'cta';
  originalContent: string;
  onSelectVariant: (variant: string) => void;
  context?: {
    newsletterType?: string;
    sector?: string;
  };
}

const typeLabels = {
  subject: { title: 'Variantes de Asunto', icon: '📧', description: 'Genera variantes A/B para mejorar la tasa de apertura' },
  intro: { title: 'Variantes de Introducción', icon: '📝', description: 'Genera variantes A/B del texto introductorio' },
  cta: { title: 'Variantes de CTA', icon: '🔘', description: 'Genera variantes A/B para el botón de acción' },
};

const impactColors: Record<string, string> = {
  high: 'bg-green-100 text-green-800 border-green-200',
  medium: 'bg-amber-100 text-amber-800 border-amber-200',
  low: 'bg-slate-100 text-slate-800 border-slate-200',
};

const approachIcons: Record<string, React.ReactNode> = {
  curiosidad: <Zap className="h-3 w-3" />,
  datos: <TrendingUp className="h-3 w-3" />,
  beneficio: <Target className="h-3 w-3" />,
  urgencia: <Zap className="h-3 w-3" />,
  exclusividad: <Sparkles className="h-3 w-3" />,
};

export const ABVariantGenerator: React.FC<ABVariantGeneratorProps> = ({
  open,
  onOpenChange,
  type,
  originalContent,
  onSelectVariant,
  context = {},
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);
  const { toast } = useToast();

  const generateVariants = async () => {
    if (!originalContent.trim()) {
      toast({
        title: 'Contenido requerido',
        description: 'Escribe primero el contenido original',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);
    setVariants([]);
    setSelectedVariant(null);

    try {
      const { data, error } = await supabase.functions.invoke('generate-newsletter-variants', {
        body: {
          type,
          originalContent,
          context,
          variantCount: 3,
        },
      });

      if (error) throw error;

      if (data.variants && data.variants.length > 0) {
        setVariants(data.variants);
        toast({
          title: '✨ Variantes generadas',
          description: `${data.variants.length} variantes A/B listas`,
        });
      } else {
        throw new Error('No se generaron variantes');
      }
    } catch (error) {
      console.error('Error generating variants:', error);
      toast({
        title: 'Error al generar',
        description: error instanceof Error ? error.message : 'No se pudieron generar las variantes',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApply = () => {
    if (selectedVariant) {
      onSelectVariant(selectedVariant);
      toast({
        title: '✓ Variante aplicada',
        description: 'El contenido ha sido actualizado',
      });
      onOpenChange(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: 'Copiado al portapapeles' });
  };

  const config = typeLabels[type];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span>{config.icon}</span>
            {config.title}
          </DialogTitle>
          <DialogDescription>{config.description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Original content */}
          <div className="p-3 bg-muted rounded-lg">
            <Label className="text-xs text-muted-foreground mb-1 block">Original</Label>
            <p className="text-sm font-medium">{originalContent || '(vacío)'}</p>
          </div>

          {/* Generate button */}
          {variants.length === 0 && (
            <Button
              onClick={generateVariants}
              disabled={isGenerating || !originalContent.trim()}
              className="w-full gap-2"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generando variantes...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Generar Variantes A/B
                </>
              )}
            </Button>
          )}

          {/* Variants list */}
          {variants.length > 0 && (
            <div className="space-y-3">
              <Label className="text-sm font-medium">Selecciona una variante:</Label>
              <RadioGroup value={selectedVariant || ''} onValueChange={setSelectedVariant}>
                {variants.map((v, index) => (
                  <div
                    key={index}
                    className={`relative flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedVariant === v.variant
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-muted-foreground/50'
                    }`}
                    onClick={() => setSelectedVariant(v.variant)}
                  >
                    <RadioGroupItem value={v.variant} id={`variant-${index}`} className="mt-1" />
                    <div className="flex-1 min-w-0">
                      <Label htmlFor={`variant-${index}`} className="text-sm font-medium cursor-pointer block">
                        {v.variant}
                      </Label>
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        {(v.approach || v.tone) && (
                          <Badge variant="outline" className="text-xs gap-1">
                            {approachIcons[v.approach || v.tone || ''] || <Sparkles className="h-3 w-3" />}
                            {v.approach || v.tone}
                          </Badge>
                        )}
                        {v.expectedImpact && (
                          <Badge className={`text-xs ${impactColors[v.expectedImpact] || impactColors.medium}`}>
                            Impacto: {v.expectedImpact}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 shrink-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopy(v.variant);
                      }}
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </RadioGroup>

              <div className="flex gap-2 pt-2">
                <Button variant="outline" onClick={generateVariants} disabled={isGenerating} className="flex-1 gap-2">
                  <Sparkles className="h-4 w-4" />
                  Regenerar
                </Button>
                <Button onClick={handleApply} disabled={!selectedVariant} className="flex-1 gap-2">
                  <Check className="h-4 w-4" />
                  Aplicar Variante
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
