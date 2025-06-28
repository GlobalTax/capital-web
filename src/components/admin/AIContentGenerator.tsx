
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sparkles, RefreshCw } from 'lucide-react';
import { useAIContentGeneration } from '@/hooks/useAIContentGeneration';

interface AIContentGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
  onContentGenerated: (content: string) => void;
  type: 'title' | 'content' | 'excerpt' | 'seo' | 'tags';
  currentTitle?: string;
  currentContent?: string;
  category?: string;
}

const AIContentGenerator = ({ 
  isOpen, 
  onClose, 
  onContentGenerated, 
  type, 
  currentTitle = '',
  currentContent = '',
  category = ''
}: AIContentGeneratorProps) => {
  const [prompt, setPrompt] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');
  const { isGenerating, generateTitle, generateFullContent, generateExcerpt, generateSEO, generateTags } = useAIContentGeneration();

  const getModalTitle = () => {
    switch (type) {
      case 'title': return 'Generar Título con IA';
      case 'content': return 'Generar Contenido con IA';
      case 'excerpt': return 'Generar Extracto con IA';
      case 'seo': return 'Optimizar SEO con IA';
      case 'tags': return 'Generar Tags con IA';
      default: return 'Generar con IA';
    }
  };

  const getPromptLabel = () => {
    switch (type) {
      case 'title': return 'Tema del artículo';
      case 'content': return 'Título del artículo (se generará contenido completo)';
      case 'excerpt': return 'Resumen del contenido';
      case 'seo': return 'El SEO se optimizará basándose en el título actual';
      case 'tags': return 'Los tags se generarán basándose en el título y contenido actuales';
      default: return 'Descripción';
    }
  };

  const handleGenerate = async () => {
    try {
      let result = '';
      
      switch (type) {
        case 'title':
          result = await generateTitle(prompt, category);
          break;
        case 'content':
          result = await generateFullContent(prompt || currentTitle, category);
          break;
        case 'excerpt':
          result = await generateExcerpt(currentTitle, prompt || currentContent.substring(0, 500));
          break;
        case 'seo':
          result = await generateSEO(currentTitle);
          break;
        case 'tags':
          result = await generateTags(currentTitle, currentContent);
          break;
      }
      
      setGeneratedContent(result);
    } catch (error) {
      console.error('Error generating content:', error);
    }
  };

  const handleUseContent = () => {
    onContentGenerated(generatedContent);
    onClose();
    setGeneratedContent('');
    setPrompt('');
  };

  const handleClose = () => {
    onClose();
    setGeneratedContent('');
    setPrompt('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-500" />
            {getModalTitle()}
          </DialogTitle>
          <DialogDescription>
            Utiliza IA para generar contenido profesional optimizado para el sector M&A
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {(type === 'title' || type === 'content' || type === 'excerpt') && (
            <div>
              <Label htmlFor="prompt">{getPromptLabel()}</Label>
              {type === 'excerpt' ? (
                <Textarea
                  id="prompt"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder={
                    type === 'title' 
                      ? "Ej: Valoración de empresas tecnológicas, Due diligence en el sector salud, etc."
                      : type === 'content'
                      ? "Ej: Cómo valorar una startup tecnológica"
                      : "Describe brevemente el contenido del artículo"
                  }
                  rows={3}
                />
              ) : (
                <Input
                  id="prompt"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder={
                    type === 'title' 
                      ? "Ej: Valoración de empresas tecnológicas, Due diligence en el sector salud, etc."
                      : "Ej: Cómo valorar una startup tecnológica"
                  }
                />
              )}
            </div>
          )}

          {(type === 'seo' || type === 'tags') && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-800">
                {type === 'seo' 
                  ? `Se optimizará el SEO basándose en el título actual: "${currentTitle}"`
                  : `Se generarán tags basándose en el título y contenido actuales`
                }
              </p>
            </div>
          )}

          <div className="flex gap-2">
            <Button 
              onClick={handleGenerate} 
              disabled={isGenerating || ((type === 'title' || type === 'content' || type === 'excerpt') && !prompt.trim())}
              className="flex items-center gap-2"
            >
              {isGenerating ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              {isGenerating ? 'Generando...' : 'Generar'}
            </Button>
          </div>

          {generatedContent && (
            <div className="border rounded-lg p-4 bg-gray-50">
              <div className="flex justify-between items-center mb-2">
                <Label className="font-semibold">Contenido generado:</Label>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleGenerate}
                  disabled={isGenerating}
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Regenerar
                </Button>
              </div>
              <div className="bg-white p-3 rounded border max-h-60 overflow-y-auto">
                <pre className="whitespace-pre-wrap text-sm">{generatedContent}</pre>
              </div>
              <div className="flex gap-2 mt-3">
                <Button onClick={handleUseContent}>
                  Usar este contenido
                </Button>
                <Button variant="outline" onClick={handleClose}>
                  Cancelar
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AIContentGenerator;
