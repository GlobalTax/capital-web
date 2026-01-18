import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Sparkles, Loader2, ArrowLeft, ArrowRight, Clock, Tag, FileText } from 'lucide-react';
import { useQuickCreateBlog, QuickCreateResult } from '@/hooks/useQuickCreateBlog';

interface QuickCreateBlogModalProps {
  children: React.ReactNode;
  onPostCreated: (postId: string) => void;
}

type ModalStep = 'input' | 'processing' | 'preview';

export const QuickCreateBlogModal = ({ children, onPostCreated }: QuickCreateBlogModalProps) => {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<ModalStep>('input');
  const [rawContent, setRawContent] = useState('');
  const [result, setResult] = useState<QuickCreateResult | null>(null);
  
  const { processContent, createPost, isProcessing, isCreating } = useQuickCreateBlog();

  const handleProcess = async () => {
    if (!rawContent.trim()) return;
    
    setStep('processing');
    const data = await processContent(rawContent);
    
    if (data) {
      setResult(data);
      setStep('preview');
    } else {
      setStep('input');
    }
  };

  const handleCreate = async () => {
    if (!result) return;
    
    const postId = await createPost(result);
    if (postId) {
      setOpen(false);
      resetModal();
      onPostCreated(postId);
    }
  };

  const resetModal = () => {
    setStep('input');
    setRawContent('');
    setResult(null);
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      resetModal();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Creación Rápida con IA
          </DialogTitle>
        </DialogHeader>

        {step === 'input' && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Pega tu contenido y la IA generará automáticamente el título, categoría, tags, excerpt y metadatos SEO.
            </p>
            
            <Textarea
              placeholder="Pega aquí tu contenido completo...

Ejemplo:
El mercado M&A en España en 2025: menos operaciones, más valor

Durante 2025, el mercado de fusiones y adquisiciones en España ha entrado en una fase de madurez selectiva..."
              value={rawContent}
              onChange={(e) => setRawContent(e.target.value)}
              className="min-h-[300px] font-mono text-sm"
            />
            
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {rawContent.split(/\s+/).filter(Boolean).length} palabras
              </span>
              
              <Button 
                onClick={handleProcess}
                disabled={!rawContent.trim() || isProcessing}
                className="gap-2"
              >
                <Sparkles className="h-4 w-4" />
                Procesar con IA
              </Button>
            </div>
          </div>
        )}

        {step === 'processing' && (
          <div className="flex flex-col items-center justify-center py-16 space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">
              Analizando contenido y generando metadatos...
            </p>
          </div>
        )}

        {step === 'preview' && result && (
          <div className="space-y-6">
            {/* Success indicator */}
            <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              Post procesado correctamente
            </div>

            {/* Title */}
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Título
              </label>
              <h3 className="text-xl font-semibold mt-1">{result.title}</h3>
            </div>

            {/* Category & Reading Time */}
            <div className="flex items-center gap-4">
              <Badge variant="secondary">{result.category}</Badge>
              <span className="flex items-center gap-1 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                {result.reading_time} min de lectura
              </span>
            </div>

            <Separator />

            {/* Excerpt */}
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                <FileText className="h-3 w-3" />
                Excerpt
              </label>
              <p className="text-sm mt-1 text-muted-foreground italic">
                "{result.excerpt}"
              </p>
            </div>

            {/* Tags */}
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                <Tag className="h-3 w-3" />
                Tags
              </label>
              <div className="flex flex-wrap gap-2 mt-2">
                {result.tags.map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            <Separator />

            {/* SEO Preview */}
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Vista previa SEO
              </label>
              <div className="mt-2 p-4 bg-muted/50 rounded-lg space-y-1">
                <div className="text-blue-600 dark:text-blue-400 text-base font-medium truncate">
                  {result.meta_title}
                </div>
                <div className="text-green-700 dark:text-green-500 text-xs truncate">
                  capittal.es/blog/{result.slug}
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {result.meta_description}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-4">
              <Button 
                variant="ghost" 
                onClick={() => setStep('input')}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Editar Contenido
              </Button>
              
              <Button 
                onClick={handleCreate}
                disabled={isCreating}
                className="gap-2"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creando...
                  </>
                ) : (
                  <>
                    Crear y Abrir Editor
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
