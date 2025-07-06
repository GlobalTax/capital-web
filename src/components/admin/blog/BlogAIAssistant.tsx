import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { X, Wand2, Lightbulb, Sparkles } from 'lucide-react';
import { BlogPost } from '@/types/blog';
import { useRealAI } from '@/hooks/useRealAI';
import { useToast } from '@/hooks/use-toast';

interface BlogAIAssistantProps {
  post: BlogPost;
  updatePost: (updates: Partial<BlogPost>) => void;
  onClose: () => void;
}

const BlogAIAssistant = ({ post, updatePost, onClose }: BlogAIAssistantProps) => {
  const [prompt, setPrompt] = useState('');
  const [options, setOptions] = useState({
    length: 'medio' as 'corto' | 'medio' | 'largo',
    tone: 'profesional' as 'profesional' | 'técnico' | 'divulgativo'
  });
  const { toast } = useToast();

  const { isGenerating, generateTitle, generateContent, optimizeForSEO } = useRealAI({
    onContentGenerated: (content: string, type: 'title' | 'content' | 'seo') => {
      if (type === 'title') {
        updatePost({ 
          title: content,
          slug: content.toLowerCase()
            .replace(/[áàäâ]/g, 'a')
            .replace(/[éèëê]/g, 'e')
            .replace(/[íìïî]/g, 'i')
            .replace(/[óòöô]/g, 'o')
            .replace(/[úùüû]/g, 'u')
            .replace(/ñ/g, 'n')
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-'),
          meta_title: content
        });
      } else if (type === 'content') {
        updatePost({ content });
      } else if (type === 'seo') {
        const lines = content.split('\n');
        const metaTitle = lines.find(line => line.includes('Meta título'))?.split(':')[1]?.trim() || '';
        const metaDescription = lines.find(line => line.includes('Meta descripción'))?.split(':')[1]?.trim() || '';
        updatePost({
          meta_title: metaTitle || post.meta_title,
          meta_description: metaDescription || post.meta_description
        });
      }
    }
  });

  const handleGenerate = () => {
    if (!prompt.trim()) {
      toast({
        title: "Prompt requerido",
        description: "Escribe lo que quieres generar",
        variant: "destructive"
      });
      return;
    }

    generateContent(prompt, {
      category: post.category,
      length: options.length,
      tone: options.tone
    });
  };

  const quickPrompts = [
    "Análisis del mercado M&A español en 2024",
    "Guía práctica de due diligence comercial",  
    "Tendencias valoración empresarial post-COVID",
    "Estrategias de financiación para startups",
    "Marco legal fusiones y adquisiciones",
    "Planificación fiscal en operaciones M&A"
  ];

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-background border-l border-border shadow-xl z-50 overflow-y-auto">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Asistente IA
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Acciones Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={() => generateTitle(post.category)}
                disabled={isGenerating}
              >
                <Lightbulb className="h-4 w-4 mr-2" />
                Generar título
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={() => optimizeForSEO(post.title, post.content)}
                disabled={isGenerating || !post.title}
              >
                <Wand2 className="h-4 w-4 mr-2" />
                Optimizar SEO
              </Button>
            </CardContent>
          </Card>

          <Separator />

          {/* Custom Prompt */}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Prompt Personalizado</label>
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe exactamente lo que quieres que genere la IA..."
                rows={4}
                className="resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Longitud</label>
                <Select
                  value={options.length}
                  onValueChange={(value: 'corto' | 'medio' | 'largo') =>
                    setOptions(prev => ({ ...prev, length: value }))
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="corto">Corto</SelectItem>
                    <SelectItem value="medio">Medio</SelectItem>
                    <SelectItem value="largo">Largo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground">Tono</label>
                <Select
                  value={options.tone}
                  onValueChange={(value: 'profesional' | 'técnico' | 'divulgativo') =>
                    setOptions(prev => ({ ...prev, tone: value }))
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="profesional">Profesional</SelectItem>
                    <SelectItem value="técnico">Técnico</SelectItem>
                    <SelectItem value="divulgativo">Divulgativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
              className="w-full"
            >
              {isGenerating ? 'Generando...' : 'Generar Contenido'}
            </Button>
          </div>

          <Separator />

          {/* Quick Prompts */}
          <div>
            <label className="text-sm font-medium mb-3 block">Plantillas Rápidas</label>
            <div className="space-y-2">
              {quickPrompts.map((quickPrompt) => (
                <Button
                  key={quickPrompt}
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-left h-auto p-3 whitespace-normal"
                  onClick={() => setPrompt(quickPrompt)}
                >
                  {quickPrompt}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogAIAssistant;