
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Sparkles, 
  Brain, 
  Target, 
  Zap, 
  TrendingUp, 
  BarChart3, 
  Clock, 
  DollarSign,
  CheckCircle,
  AlertCircle,
  Lightbulb
} from 'lucide-react';
import { useAIContentStudio } from '@/hooks/useAIContentStudio';
import { GenerationRequest, GenerationResult } from '@/types/aiContent';

interface AIContentStudioProProps {
  isOpen: boolean;
  onClose: () => void;
  onContentGenerated: (content: string) => void;
  type: 'title' | 'content' | 'excerpt' | 'seo' | 'tags' | 'research';
  currentTitle?: string;
  currentContent?: string;
  category?: string;
}

const AIContentStudioPro = ({ 
  isOpen, 
  onClose, 
  onContentGenerated, 
  type, 
  currentTitle = '',
  currentContent = '',
  category = ''
}: AIContentStudioProProps) => {
  const [prompt, setPrompt] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [generationResults, setGenerationResults] = useState<GenerationResult[]>([]);
  const [activeResult, setActiveResult] = useState<GenerationResult | null>(null);
  
  const {
    isGenerating,
    generateContent,
    availableModels,
    availableTemplates,
    generationHistory
  } = useAIContentStudio();

  const getStudioTitle = () => {
    const titles = {
      title: '🎯 Generador de Títulos Inteligente',
      content: '📝 Escritor de Artículos Experto',
      excerpt: '✨ Creador de Extractos Optimizados',
      seo: '🔍 Optimizador SEO Avanzado',
      tags: '🏷️ Generador de Tags Inteligente',
      research: '🔬 Asistente de Investigación Pro'
    };
    return titles[type] || '🤖 AI Content Studio Pro';
  };

  const getStudioDescription = () => {
    const descriptions = {
      title: 'Genera títulos irresistibles optimizados para SEO y engagement',
      content: 'Crea artículos completos con estructura profesional y contenido experto',
      excerpt: 'Desarrolla extractos que convierten lectores en clientes',
      seo: 'Optimiza meta títulos y descripciones para máxima visibilidad',
      tags: 'Identifica los tags perfectos para tu contenido',
      research: 'Investiga datos actuales y tendencias del mercado M&A'
    };
    return descriptions[type] || 'Herramienta avanzada de generación de contenido con IA';
  };

  const handleGenerate = async () => {
    try {
      const request: GenerationRequest = {
        type,
        prompt,
        context: {
          title: currentTitle,
          category,
          existingContent: currentContent,
          targetAudience: 'empresarios y directivos financieros',
          tone: 'professional'
        },
        model: selectedModel || undefined,
        template: selectedTemplate || undefined,
        options: {
          temperature: 0.7,
          maxTokens: type === 'content' ? 4000 : 1000,
          useResearch: type === 'research',
          includeMetrics: true
        }
      };

      const result = await generateContent(request);
      setGenerationResults(prev => [result, ...prev]);
      setActiveResult(result);
    } catch (error) {
      console.error('Error generating content:', error);
    }
  };

  const handleUseContent = () => {
    if (activeResult) {
      onContentGenerated(activeResult.content);
      onClose();
      resetState();
    }
  };

  const resetState = () => {
    setPrompt('');
    setSelectedModel('');
    setSelectedTemplate('');
    setGenerationResults([]);
    setActiveResult(null);
  };

  const handleClose = () => {
    onClose();
    resetState();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-6xl max-h-[90vh] overflow-hidden border shadow-2xl">
        <CardHeader className="bg-card border-b">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl font-bold flex items-center gap-2">
                <Brain className="h-6 w-6 text-blue-600" />
                {getStudioTitle()}
              </CardTitle>
              <CardDescription className="text-lg mt-1">
                {getStudioDescription()}
              </CardDescription>
            </div>
            <Button variant="outline" onClick={handleClose}>
              ✕
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-0 max-h-[calc(90vh-120px)] overflow-y-auto">
          <Tabs defaultValue="generate" className="w-full">
            <TabsList className="grid w-full grid-cols-3 m-4">
              <TabsTrigger value="generate" className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Generar
              </TabsTrigger>
              <TabsTrigger value="results" className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                Resultados
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Análisis
              </TabsTrigger>
            </TabsList>

            <TabsContent value="generate" className="px-6 pb-6 space-y-6">
              {/* Configuración avanzada */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Modelo de IA</Label>
                  <Select value={selectedModel} onValueChange={setSelectedModel}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selección automática inteligente" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableModels.map((model) => (
                        <SelectItem key={model.id} value={model.id}>
                          <div className="flex items-center justify-between w-full">
                            <span>{model.name}</span>
                            <Badge variant="outline" className="ml-2">
                              {model.provider}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedModel && (
                    <p className="text-xs text-gray-500 mt-1">
                      {availableModels.find(m => m.id === selectedModel)?.description}
                    </p>
                  )}
                </div>

                <div>
                  <Label>Template Experto</Label>
                  <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                    <SelectTrigger>
                      <SelectValue placeholder="Template automático optimizado" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableTemplates
                        .filter(t => t.category === type || t.category === 'general')
                        .map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Input principal */}
              <div>
                <Label className="text-base font-semibold">
                  {type === 'title' && '💡 Tema del artículo'}
                  {type === 'content' && '📝 Título del artículo'}
                  {type === 'excerpt' && '✨ Resumen del contenido'}
                  {type === 'seo' && '🔍 Contenido a optimizar'}
                  {type === 'tags' && '🏷️ Contenido para analizar'}
                  {type === 'research' && '🔬 Tema a investigar'}
                </Label>
                <Textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder={
                    type === 'title' 
                      ? "Ej: Valoración de empresas tecnológicas post-COVID, Estrategias M&A en el sector salud..."
                      : type === 'content'
                      ? "Ej: Cómo valorar una startup tecnológica en 2024"
                      : type === 'research'
                      ? "Ej: Tendencias M&A en España 2024, Múltiplos de valoración sector tech..."
                      : "Describe el contenido que quieres generar..."
                  }
                  rows={3}
                  className="mt-2"
                />
              </div>

              {/* Contexto automático */}
              {(currentTitle || category) && (
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="h-4 w-4 text-blue-600" />
                      <span className="font-medium text-blue-800">Contexto detectado automáticamente</span>
                    </div>
                    <div className="text-sm text-blue-700 space-y-1">
                      {currentTitle && <p><strong>Título:</strong> {currentTitle}</p>}
                      {category && <p><strong>Categoría:</strong> {category}</p>}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Botón de generación */}
              <div className="flex gap-3">
                <Button 
                  onClick={handleGenerate} 
                  disabled={isGenerating || !prompt.trim()}
                  className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold py-3"
                >
                  {isGenerating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Generando con IA...
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4 mr-2" />
                      Generar Contenido Pro
                    </>
                  )}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="results" className="px-6 pb-6">
              {generationResults.length === 0 ? (
                <div className="text-center py-12">
                  <Brain className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No hay resultados aún. ¡Genera tu primer contenido!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {generationResults.map((result, index) => (
                    <Card 
                      key={index} 
                      className={`cursor-pointer transition-all ${
                        activeResult === result ? 'border-blue-500 shadow-lg' : 'hover:shadow-md'
                      }`}
                      onClick={() => setActiveResult(result)}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-2">
                            <Badge className="bg-blue-100 text-blue-800">
                              {availableModels.find(m => m.id === result.model)?.name || result.model}
                            </Badge>
                            <div className="flex items-center gap-1 text-sm text-gray-500">
                              <Clock className="h-3 w-3" />
                              {(result.usage.duration / 1000).toFixed(1)}s
                            </div>
                            <div className="flex items-center gap-1 text-sm text-gray-500">
                              <DollarSign className="h-3 w-3" />
                              ${result.usage.cost.toFixed(4)}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Progress value={result.confidence * 100} className="w-16 h-2" />
                            <span className="text-xs text-gray-500">
                              {Math.round(result.confidence * 100)}%
                            </span>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="bg-gray-50 p-4 rounded-lg max-h-40 overflow-y-auto">
                          <pre className="whitespace-pre-wrap text-sm font-mono">
                            {result.content.substring(0, 300)}
                            {result.content.length > 300 && '...'}
                          </pre>
                        </div>
                        
                        {result.metrics && (
                          <div className="flex gap-4 mt-3 text-xs text-gray-600">
                            <span>📊 Legibilidad: {result.metrics.readability}/10</span>
                            <span>🔍 SEO: {result.metrics.seoScore}/10</span>
                            <span>💫 Engagement: {result.metrics.engagement}/10</span>
                          </div>
                        )}
                        
                        {result.suggestions && result.suggestions.length > 0 && (
                          <div className="mt-3">
                            {result.suggestions.slice(0, 2).map((suggestion, idx) => (
                              <div key={idx} className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 p-2 rounded mb-1">
                                <Lightbulb className="h-3 w-3" />
                                {suggestion}
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                  
                  {activeResult && (
                    <div className="flex gap-2 pt-4 border-t">
                      <Button onClick={handleUseContent} className="bg-green-600 hover:bg-green-700">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Usar este contenido
                      </Button>
                      <Button variant="outline" onClick={handleClose}>
                        Cancelar
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent value="analytics" className="px-6 pb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Uso de Modelos
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {availableModels.map(model => {
                        const usage = generationHistory.filter(h => h.model === model.id).length;
                        const percentage = generationHistory.length > 0 ? (usage / generationHistory.length) * 100 : 0;
                        return (
                          <div key={model.id}>
                            <div className="flex justify-between text-sm">
                              <span>{model.name}</span>
                              <span>{usage} usos</span>
                            </div>
                            <Progress value={percentage} className="h-2" />
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Métricas de Calidad
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {generationHistory.length > 0 ? (
                      <div className="space-y-4">
                        {/* Promedios de calidad */}
                        <div className="text-sm space-y-2">
                          <div className="flex justify-between">
                            <span>Legibilidad promedio:</span>
                            <span className="font-semibold">
                              {(generationHistory.reduce((acc, h) => acc + (h.metrics?.readability || 0), 0) / generationHistory.length).toFixed(1)}/10
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>SEO promedio:</span>
                            <span className="font-semibold">
                              {(generationHistory.reduce((acc, h) => acc + (h.metrics?.seoScore || 0), 0) / generationHistory.length).toFixed(1)}/10
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Confianza promedio:</span>
                            <span className="font-semibold">
                              {Math.round(generationHistory.reduce((acc, h) => acc + h.confidence, 0) / generationHistory.length * 100)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm">No hay datos suficientes para mostrar métricas</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default AIContentStudioPro;
