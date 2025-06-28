
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { GenerationRequest, GenerationResult, ContentStudioConfig } from '@/types/aiContent';
import { AI_MODELS, getOptimalModel } from '@/config/aiModels';
import { AI_PROMPT_TEMPLATES, getPromptTemplate } from '@/config/aiPrompts';

export const useAIContentStudio = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationHistory, setGenerationHistory] = useState<GenerationResult[]>([]);
  const [config, setConfig] = useState<ContentStudioConfig>({
    preferredModel: 'gpt-4o-mini',
    autoOptimization: true,
    enableResearch: true,
    enableMetrics: true,
    customPrompts: []
  });
  const { toast } = useToast();

  const generateContent = useCallback(async (request: GenerationRequest): Promise<GenerationResult> => {
    setIsGenerating(true);
    const startTime = Date.now();

    try {
      // Selección inteligente del modelo
      const selectedModel = request.model || getOptimalModel(request.type, 'medium');
      
      // Obtener template de prompt si está especificado
      const template = request.template ? getPromptTemplate(request.template) : null;
      
      // Preparar el contexto
      const enhancedContext = {
        ...request.context,
        targetAudience: request.context.targetAudience || 'empresarios y directivos financieros',
        tone: request.context.tone || 'professional'
      };

      // Preparar la solicitud para el edge function
      const payload = {
        type: request.type,
        prompt: request.prompt,
        context: enhancedContext,
        model: selectedModel,
        template: template?.id,
        options: {
          temperature: request.options?.temperature || 0.7,
          maxTokens: request.options?.maxTokens || 3000,
          useResearch: request.options?.useResearch && request.type === 'research',
          includeMetrics: request.options?.includeMetrics || config.enableMetrics
        }
      };

      const { data, error } = await supabase.functions.invoke('ai-content-studio', {
        body: payload,
      });

      if (error) throw error;

      const duration = Date.now() - startTime;
      const result: GenerationResult = {
        content: data.content,
        type: request.type,
        model: selectedModel,
        usage: {
          tokens: data.usage?.tokens || 0,
          cost: data.usage?.cost || 0,
          duration
        },
        confidence: data.confidence || 0.85,
        suggestions: data.suggestions || [],
        metrics: data.metrics
      };

      // Agregar al historial
      setGenerationHistory(prev => [result, ...prev.slice(0, 49)]); // Keep last 50

      toast({
        title: "¡Contenido generado con éxito!",
        description: `Generado con ${AI_MODELS.find(m => m.id === selectedModel)?.name} en ${(duration/1000).toFixed(1)}s`,
      });

      return result;
    } catch (error) {
      console.error('Error generating content:', error);
      toast({
        title: "Error en la generación",
        description: "Error al generar contenido. Inténtalo de nuevo.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsGenerating(false);
    }
  }, [config, toast]);

  // Métodos específicos para diferentes tipos de contenido
  const generateTitle = useCallback(async (topic: string, context = {}) => {
    return generateContent({
      type: 'title',
      prompt: topic,
      context,
      template: 'title-optimizer'
    });
  }, [generateContent]);

  const generateArticle = useCallback(async (title: string, context = {}) => {
    return generateContent({
      type: 'content',
      prompt: title,
      context: { ...context, title },
      template: 'ma-article-expert',
      options: { maxTokens: 4000 }
    });
  }, [generateContent]);

  const generateResearch = useCallback(async (topic: string, context = {}) => {
    return generateContent({
      type: 'research',
      prompt: topic,
      context,
      template: 'research-assistant',
      options: { useResearch: true }
    });
  }, [generateContent]);

  const generateBatch = useCallback(async (requests: GenerationRequest[]): Promise<GenerationResult[]> => {
    const results: GenerationResult[] = [];
    
    toast({
      title: "Generación por lotes iniciada",
      description: `Procesando ${requests.length} elementos...`,
    });

    for (const request of requests) {
      try {
        const result = await generateContent(request);
        results.push(result);
        
        // Pequeña pausa entre generaciones para no saturar la API
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error('Error in batch generation:', error);
      }
    }

    toast({
      title: "Generación por lotes completada",
      description: `${results.length}/${requests.length} elementos generados exitosamente`,
    });

    return results;
  }, [generateContent, toast]);

  return {
    // Estado
    isGenerating,
    generationHistory,
    config,
    
    // Configuración
    setConfig,
    
    // Generación básica
    generateContent,
    
    // Métodos específicos
    generateTitle,
    generateArticle,
    generateResearch,
    
    // Funciones avanzadas
    generateBatch,
    
    // Utilidades
    availableModels: AI_MODELS,
    availableTemplates: AI_PROMPT_TEMPLATES,
    
    // Limpieza
    clearHistory: () => setGenerationHistory([])
  };
};
