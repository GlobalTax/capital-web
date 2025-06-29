
import { useState } from 'react';
import { useAIContentGeneration } from '@/hooks/useAIContentGeneration';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface GenerateLeadMagnetOptions {
  title: string;
  type: 'report' | 'whitepaper' | 'checklist' | 'template';
  sector: string;
  description: string;
}

export const useLeadMagnetGeneration = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { generateContent } = useAIContentGeneration();
  const { toast } = useToast();

  const generateLeadMagnetContent = async (options: GenerateLeadMagnetOptions) => {
    setIsGenerating(true);

    try {
      let prompt = '';
      
      switch (options.type) {
        case 'report':
          prompt = `
            Genera un informe profesional completo sobre "${options.title}" para el sector ${options.sector}.
            
            Estructura requerida:
            1. RESUMEN EJECUTIVO (2-3 párrafos)
            2. ANÁLISIS DEL MERCADO
               - Tamaño del mercado y tendencias
               - Principales jugadores
               - Oportunidades identificadas
            3. MÚLTIPLOS DE VALORACIÓN TÍPICOS
               - EBITDA multiples por subsector
               - Revenue multiples
               - Comparativas históricas
            4. CASOS DE ÉXITO RECIENTES
               - 3-4 transacciones destacadas
               - Análisis de valoraciones
            5. RECOMENDACIONES ESTRATÉGICAS
               - Para compradores
               - Para vendedores
               - Timing del mercado
            6. PERSPECTIVAS 2024-2025
            
            Tono: Profesional, técnico pero accesible. Incluye datos específicos y insights accionables.
            Longitud: 2500-3000 palabras
          `;
          break;

        case 'whitepaper':
          prompt = `
            Crea un whitepaper técnico sobre "${options.title}" en el contexto de M&A para ${options.sector}.
            
            Estructura:
            1. INTRODUCCIÓN Y PROBLEMÁTICA
            2. METODOLOGÍA DE ANÁLISIS
            3. HALLAZGOS CLAVE
               - Análisis cuantitativo
               - Tendencias cualitativas
            4. FRAMEWORK PROPUESTO
            5. CASOS DE APLICACIÓN
            6. CONCLUSIONES Y RECOMENDACIONES
            
            Incluye gráficos conceptuales, tablas de datos y referencias.
            Tono: Académico-profesional, respaldado por datos.
            Longitud: 2000-2500 palabras
          `;
          break;

        case 'checklist':
          prompt = `
            Desarrolla un checklist completo y práctico: "${options.title}" para ${options.sector}.
            
            Formato:
            - FASE 1: PREPARACIÓN
              ☐ Item 1 con explicación breve
              ☐ Item 2 con explicación breve
              [continuar...]
            
            - FASE 2: EJECUCIÓN
              ☐ Items específicos...
            
            - FASE 3: CIERRE
              ☐ Items de finalización...
            
            Incluye:
            - 15-25 items por fase
            - Explicaciones de 1-2 líneas por item
            - Tips específicos para ${options.sector}
            - Recursos adicionales
            
            Tono: Práctico, directo, orientado a acción.
          `;
          break;

        case 'template':
          prompt = `
            Crea una plantilla práctica: "${options.title}" especializada para ${options.sector}.
            
            Incluye:
            1. INSTRUCCIONES DE USO
            2. TEMPLATE PRINCIPAL
               - Secciones claramente marcadas
               - Campos a completar: [COMPLETAR]
               - Ejemplos específicos del sector
            3. GUÍA DE MEJORES PRÁCTICAS
            4. ERRORES COMUNES A EVITAR
            5. RECURSOS COMPLEMENTARIOS
            
            Formato: Estructura clara con espacios para completar.
            Debe ser inmediatamente usable y específico para ${options.sector}.
          `;
          break;
      }

      const content = await generateContent({
        type: 'content',
        prompt,
        context: {
          title: options.title,
          category: options.sector,
          contentType: options.type
        }
      });

      // Generar PDF del contenido
      const pdfResponse = await supabase.functions.invoke('generate-pdf-report', {
        body: {
          content,
          title: options.title,
          subtitle: `${options.type.toUpperCase()} - ${options.sector}`,
          branding: 'Capittal',
          watermark: true,
          includeContactInfo: true
        }
      });

      let fileUrl = null;
      if (pdfResponse.data?.url) {
        fileUrl = pdfResponse.data.url;
      }

      toast({
        title: "¡Contenido generado exitosamente!",
        description: `${options.type} creado con IA. ${fileUrl ? 'PDF disponible para descarga.' : ''}`,
      });

      return {
        content,
        fileUrl
      };

    } catch (error) {
      console.error('Error generando lead magnet:', error);
      toast({
        title: "Error",
        description: "Error al generar el contenido. Inténtalo de nuevo.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    generateLeadMagnetContent,
    isGenerating
  };
};
