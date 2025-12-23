import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Loader2, Sparkles, Download, Check, ImagePlus, Wand2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AIImageGeneratorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImageGenerated: (imageUrl: string) => void;
}

const presetStyles = [
  { id: 'professional', label: 'Profesional', prompt: 'professional business photo, corporate style, clean background' },
  { id: 'minimal', label: 'Minimalista', prompt: 'minimalist design, simple geometric shapes, clean white background' },
  { id: 'abstract', label: 'Abstracto', prompt: 'abstract business concept, modern art style, vibrant colors' },
  { id: 'infographic', label: 'Infográfico', prompt: 'infographic style, data visualization, clean vector graphics' },
];

export const AIImageGenerator: React.FC<AIImageGeneratorProps> = ({
  open,
  onOpenChange,
  onImageGenerated,
}) => {
  const [prompt, setPrompt] = useState('');
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const { toast } = useToast();

  const generateImage = async () => {
    if (!prompt.trim()) {
      toast({
        title: 'Prompt requerido',
        description: 'Describe la imagen que quieres generar',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);
    setGeneratedImage(null);

    try {
      const stylePrompt = selectedStyle 
        ? presetStyles.find(s => s.id === selectedStyle)?.prompt || ''
        : '';
      
      const fullPrompt = `${prompt}. ${stylePrompt}. High quality, suitable for email newsletter, 600px width, professional look.`;

      const { data, error } = await supabase.functions.invoke('generate-newsletter-image', {
        body: { prompt: fullPrompt },
      });

      if (error) throw error;

      if (data.imageUrl) {
        setGeneratedImage(data.imageUrl);
        toast({
          title: '✨ Imagen generada',
          description: 'Tu imagen está lista para usar',
        });
      } else {
        throw new Error('No se generó la imagen');
      }
    } catch (error) {
      console.error('Error generating image:', error);
      toast({
        title: 'Error al generar',
        description: error instanceof Error ? error.message : 'No se pudo generar la imagen',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApply = () => {
    if (generatedImage) {
      onImageGenerated(generatedImage);
      toast({ title: '✓ Imagen aplicada' });
      handleClose();
    }
  };

  const handleClose = () => {
    setPrompt('');
    setSelectedStyle(null);
    setGeneratedImage(null);
    onOpenChange(false);
  };

  const downloadImage = async () => {
    if (!generatedImage) return;
    
    try {
      const response = await fetch(generatedImage);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `newsletter-image-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast({ title: '⬇️ Imagen descargada' });
    } catch {
      toast({ title: 'Error al descargar', variant: 'destructive' });
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5 text-primary" />
            Generar Imagen con IA
          </DialogTitle>
          <DialogDescription>
            Describe la imagen que necesitas y la IA la creará para ti
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Prompt input */}
          <div className="space-y-2">
            <Label>Descripción de la imagen</Label>
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ej: Gráfico de crecimiento empresarial con flechas ascendentes, colores corporativos azul y blanco..."
              rows={3}
              disabled={isGenerating}
            />
          </div>

          {/* Style presets */}
          <div className="space-y-2">
            <Label>Estilo (opcional)</Label>
            <div className="flex flex-wrap gap-2">
              {presetStyles.map((style) => (
                <Badge
                  key={style.id}
                  variant={selectedStyle === style.id ? 'default' : 'outline'}
                  className="cursor-pointer transition-all hover:bg-primary/10"
                  onClick={() => setSelectedStyle(selectedStyle === style.id ? null : style.id)}
                >
                  {style.label}
                </Badge>
              ))}
            </div>
          </div>

          {/* Generate button */}
          {!generatedImage && (
            <Button
              onClick={generateImage}
              disabled={isGenerating || !prompt.trim()}
              className="w-full gap-2"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generando imagen...
                </>
              ) : (
                <>
                  <ImagePlus className="h-4 w-4" />
                  Generar Imagen
                </>
              )}
            </Button>
          )}

          {/* Generated image preview */}
          {generatedImage && (
            <div className="space-y-3">
              <div className="relative rounded-lg overflow-hidden border bg-muted">
                <img
                  src={generatedImage}
                  alt="Generated"
                  className="w-full h-auto max-h-64 object-contain"
                />
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={downloadImage} className="flex-1 gap-2">
                  <Download className="h-4 w-4" />
                  Descargar
                </Button>
                <Button variant="outline" onClick={generateImage} disabled={isGenerating} className="flex-1 gap-2">
                  <Sparkles className="h-4 w-4" />
                  Regenerar
                </Button>
                <Button onClick={handleApply} className="flex-1 gap-2">
                  <Check className="h-4 w-4" />
                  Usar Imagen
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
