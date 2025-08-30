import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sparkles, Wand2, FileText, Search, Tag, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AIContentAssistantProps {
  onContentGenerated: (content: string, type: 'title' | 'content' | 'excerpt' | 'seo' | 'tags') => void;
  currentTitle?: string;
  currentContent?: string;
  className?: string;
}

const AIContentAssistant: React.FC<AIContentAssistantProps> = ({
  onContentGenerated,
  currentTitle = '',
  currentContent = '',
  className = ""
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [options, setOptions] = useState({
    length: 'medio' as 'corto' | 'medio' | 'largo',
    tone: 'profesional' as 'profesional' | 'técnico' | 'divulgativo',
    category: 'M&A' as string
  });
  const { toast } = useToast();

  const categories = ['M&A', 'Valoración', 'Due Diligence', 'Análisis', 'Estrategia', 'Financiación', 'Legal', 'Fiscal'];

  const generateContent = async (type: 'title' | 'content' | 'excerpt' | 'seo' | 'tags') => {
    if (!prompt.trim() && type !== 'excerpt' && type !== 'seo') {
      toast({
        title: "Prompt requerido",
        description: "Escribe lo que quieres generar",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-blog-content', {
        body: {
          type,
          prompt: type === 'excerpt' ? currentContent : prompt,
          context: {
            title: currentTitle,
            content: currentContent,
            category: options.category,
            length: options.length,
            tone: options.tone
          }
        }
      });

      if (error) throw error;

      onContentGenerated(data.content, type);
      
      toast({
        title: "Contenido generado",
        description: `${type === 'title' ? 'Título' : 
                     type === 'content' ? 'Contenido' :
                     type === 'excerpt' ? 'Extracto' :
                     type === 'seo' ? 'Meta datos SEO' : 'Tags'} generado con éxito`,
      });
      
      // Limpiar prompt después de generar contenido completo
      if (type === 'content') {
        setPrompt('');
      }
    } catch (error) {
      console.error('Error generating content:', error);
      toast({
        title: "Error",
        description: "No se pudo generar el contenido. Inténtalo de nuevo.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const quickPrompts = [
    "Análisis del mercado M&A español en 2024",
    "Guía práctica de due diligence comercial",
    "Tendencias valoración empresarial post-COVID",
    "Estrategias de financiación para adquisiciones",
    "Proceso completo de venta de empresa familiar"
  ];

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Asistente de IA</h3>
      </div>

      <Tabs defaultValue="generate" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="generate">Generar</TabsTrigger>
          <TabsTrigger value="improve">Mejorar</TabsTrigger>
        </TabsList>

        <TabsContent value="generate" className="space-y-4">
          {/* Prompt Input */}
          <div>
            <Label className="text-sm font-medium">¿Qué quieres generar?</Label>
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ejemplo: 'Análisis completo sobre las tendencias de M&A en el sector tecnológico español para 2024, incluyendo datos de mercado y casos de éxito'"
              rows={3}
              className="mt-2"
            />
          </div>

          {/* Options */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label className="text-xs">Categoría</Label>
              <Select 
                value={options.category} 
                onValueChange={(value) => setOptions(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label className="text-xs">Longitud</Label>
              <Select 
                value={options.length} 
                onValueChange={(value: 'corto' | 'medio' | 'largo') => 
                  setOptions(prev => ({ ...prev, length: value }))
                }
              >
                <SelectTrigger className="h-8">
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
              <Label className="text-xs">Tono</Label>
              <Select 
                value={options.tone} 
                onValueChange={(value: 'profesional' | 'técnico' | 'divulgativo') => 
                  setOptions(prev => ({ ...prev, tone: value }))
                }
              >
                <SelectTrigger className="h-8">
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

          {/* Generation Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <Button 
              variant="default" 
              size="sm" 
              onClick={() => generateContent('content')}
              disabled={isGenerating || !prompt.trim()}
              className="flex items-center gap-2"
            >
              {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
              Artículo Completo
            </Button>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => generateContent('title')}
              disabled={isGenerating || !prompt.trim()}
              className="flex items-center gap-2"
            >
              {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
              Solo Título
            </Button>
          </div>

          {/* Quick Prompts */}
          <div>
            <Label className="text-xs text-muted-foreground mb-2 block">Ideas rápidas:</Label>
            <div className="flex flex-wrap gap-2">
              {quickPrompts.slice(0, 2).map((quickPrompt, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  size="sm"
                  onClick={() => setPrompt(quickPrompt)}
                  className="text-xs h-7 px-2"
                >
                  {quickPrompt.substring(0, 30)}...
                </Button>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="improve" className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Mejora el contenido existente con IA
          </p>
          
          <div className="grid grid-cols-1 gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => generateContent('excerpt')}
              disabled={isGenerating || !currentContent}
              className="flex items-center gap-2 justify-start"
            >
              {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
              Generar Extracto desde Contenido
            </Button>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => generateContent('seo')}
              disabled={isGenerating || !currentTitle}
              className="flex items-center gap-2 justify-start"
            >
              {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              Optimizar Meta Tags SEO
            </Button>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => generateContent('tags')}
              disabled={isGenerating || (!currentTitle && !currentContent)}
              className="flex items-center gap-2 justify-start"
            >
              {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Tag className="h-4 w-4" />}
              Generar Tags Relevantes
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AIContentAssistant;