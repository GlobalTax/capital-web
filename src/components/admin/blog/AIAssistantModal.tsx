import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sparkles, Wand2, FileText, Search, Tag, Loader2, Brain, PenTool } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface AIAssistantModalProps {
  onContentGenerated: (content: string, type: 'title' | 'content' | 'excerpt' | 'seo' | 'tags') => void;
  currentTitle?: string;
  currentContent?: string;
  children: React.ReactNode;
}

const AIAssistantModal: React.FC<AIAssistantModalProps> = ({
  onContentGenerated,
  currentTitle = '',
  currentContent = '',
  children
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [open, setOpen] = useState(false);
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
      
      // Cerrar modal después de generar contenido
      if (type === 'content' || type === 'title') {
        setOpen(false);
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
    "Análisis del mercado M&A español en 2024 con casos de éxito y tendencias emergentes",
    "Guía práctica completa de due diligence comercial para adquisiciones",
    "Métodos de valoración empresarial: DCF, múltiplos y casos prácticos reales",
    "Estrategias de financiación para operaciones de M&A y reestructuraciones",
    "Proceso completo de venta de empresa familiar: preparación y ejecución",
    "Aspectos fiscales clave en operaciones de M&A y optimización tributaria"
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            Asistente de IA para Contenido
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <Tabs defaultValue="generate" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="generate" className="flex items-center gap-2">
                <PenTool className="h-4 w-4" />
                Crear Contenido
              </TabsTrigger>
              <TabsTrigger value="improve" className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Mejorar Existente
              </TabsTrigger>
            </TabsList>

            <TabsContent value="generate" className="space-y-6">
              {/* Prompt Principal */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">¿Qué contenido quieres crear?</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Describe detalladamente el contenido que quieres generar. Ejemplo: 'Análisis completo sobre las tendencias de M&A en el sector tecnológico español para 2024, incluyendo datos de mercado, casos de éxito y proyecciones futuras'"
                    rows={4}
                    className="text-sm"
                  />
                  
                  {/* Opciones de generación */}
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Categoría</Label>
                      <Select 
                        value={options.category} 
                        onValueChange={(value) => setOptions(prev => ({ ...prev, category: value }))}
                      >
                        <SelectTrigger>
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
                      <Label className="text-sm font-medium">Longitud</Label>
                      <Select 
                        value={options.length} 
                        onValueChange={(value: 'corto' | 'medio' | 'largo') => 
                          setOptions(prev => ({ ...prev, length: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="corto">Corto (500-800 palabras)</SelectItem>
                          <SelectItem value="medio">Medio (1000-1500 palabras)</SelectItem>
                          <SelectItem value="largo">Largo (2000+ palabras)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium">Tono</Label>
                      <Select 
                        value={options.tone} 
                        onValueChange={(value: 'profesional' | 'técnico' | 'divulgativo') => 
                          setOptions(prev => ({ ...prev, tone: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="profesional">Profesional</SelectItem>
                          <SelectItem value="técnico">Técnico especializado</SelectItem>
                          <SelectItem value="divulgativo">Divulgativo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  {/* Botones de generación */}
                  <div className="flex gap-3 pt-4">
                    <Button 
                      onClick={() => generateContent('content')}
                      disabled={isGenerating || !prompt.trim()}
                      className="flex-1"
                      size="lg"
                    >
                      {isGenerating ? (
                        <Loader2 className="h-5 w-5 animate-spin mr-2" />
                      ) : (
                        <FileText className="h-5 w-5 mr-2" />
                      )}
                      Generar Artículo Completo
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      onClick={() => generateContent('title')}
                      disabled={isGenerating || !prompt.trim()}
                      size="lg"
                    >
                      {isGenerating ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Wand2 className="h-4 w-4 mr-2" />
                      )}
                      Solo Título
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Ideas rápidas */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Ideas para empezar</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-2">
                    {quickPrompts.map((quickPrompt, index) => (
                      <Button
                        key={index}
                        variant="ghost"
                        onClick={() => setPrompt(quickPrompt)}
                        className="text-left text-sm h-auto py-3 px-4 justify-start"
                      >
                        <span className="line-clamp-2">{quickPrompt}</span>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="improve" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Mejorar contenido existente</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-6">
                    Utiliza la IA para mejorar y optimizar tu contenido actual
                  </p>
                  
                  <div className="grid grid-cols-1 gap-3">
                    <Button 
                      variant="outline" 
                      size="lg"
                      onClick={() => generateContent('excerpt')}
                      disabled={isGenerating || !currentContent}
                      className="flex items-center gap-3 justify-start h-auto py-4"
                    >
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-600">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div className="text-left">
                        <div className="font-medium">Generar Extracto</div>
                        <div className="text-sm text-muted-foreground">Crear resumen atractivo desde el contenido</div>
                      </div>
                      {isGenerating && <Loader2 className="h-4 w-4 animate-spin ml-auto" />}
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      size="lg"
                      onClick={() => generateContent('seo')}
                      disabled={isGenerating || !currentTitle}
                      className="flex items-center gap-3 justify-start h-auto py-4"
                    >
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-100 text-green-600">
                        <Search className="h-5 w-5" />
                      </div>
                      <div className="text-left">
                        <div className="font-medium">Optimizar SEO</div>
                        <div className="text-sm text-muted-foreground">Generar título y descripción optimizados</div>
                      </div>
                      {isGenerating && <Loader2 className="h-4 w-4 animate-spin ml-auto" />}
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      size="lg"
                      onClick={() => generateContent('tags')}
                      disabled={isGenerating || (!currentTitle && !currentContent)}
                      className="flex items-center gap-3 justify-start h-auto py-4"
                    >
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-100 text-purple-600">
                        <Tag className="h-5 w-5" />
                      </div>
                      <div className="text-left">
                        <div className="font-medium">Generar Tags</div>
                        <div className="text-sm text-muted-foreground">Crear etiquetas relevantes automáticamente</div>
                      </div>
                      {isGenerating && <Loader2 className="h-4 w-4 animate-spin ml-auto" />}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AIAssistantModal;