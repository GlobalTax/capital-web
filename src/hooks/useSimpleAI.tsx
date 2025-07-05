import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface UseSimpleAIProps {
  onContentGenerated?: (content: string) => void;
}

export const useSimpleAI = ({ onContentGenerated }: UseSimpleAIProps = {}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const generateTitle = async (topic?: string) => {
    setIsGenerating(true);
    try {
      // Simulación de generación de título
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const titles = [
        "Cómo las Fusiones y Adquisiciones están Transformando el Mercado Español",
        "Guía Completa para la Valoración de Empresas en 2024",
        "Tendencias M&A: Lo que Necesitas Saber para el Próximo Año",
        "Due Diligence Efectivo: Claves para el Éxito en M&A",
        "El Futuro de las Valoraciones Empresariales"
      ];
      
      const randomTitle = titles[Math.floor(Math.random() * titles.length)];
      onContentGenerated?.(randomTitle);
      
      toast({
        title: "Título generado",
        description: "Título atractivo creado con IA",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo generar el título",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const generateContent = async (title: string, category: string) => {
    setIsGenerating(true);
    try {
      // Simulación de generación de contenido
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const content = `# ${title}

## Introducción

En el mundo actual de las fusiones y adquisiciones, es crucial entender las tendencias y mejores prácticas que están definiendo el sector.

## Análisis del Mercado

El mercado de M&A ha experimentado cambios significativos en los últimos años:

- **Digitalización**: Las empresas tecnológicas lideran las operaciones
- **Sostenibilidad**: Criterios ESG cada vez más importantes
- **Regulación**: Nuevas normativas afectan las estructuras de deal

## Factores Clave a Considerar

### 1. Valoración Precisa
La valoración correcta es fundamental para el éxito de cualquier operación.

### 2. Due Diligence Exhaustiva
Un proceso de due diligence riguroso puede prevenir problemas futuros.

### 3. Integración Post-Cierre
La fase de integración determina el éxito a largo plazo.

## Conclusiones

Las operaciones de M&A requieren una aproximación estratégica y bien planificada. Con la experiencia adecuada y los procesos correctos, se pueden lograr resultados excepcionales.

---

*Este artículo ha sido creado por el equipo de expertos de Capittal, líderes en asesoramiento M&A.*`;

      onContentGenerated?.(content);
      
      toast({
        title: "Contenido generado",
        description: "Artículo completo creado con IA",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo generar el contenido",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const optimizeForSEO = async (title: string, content: string) => {
    setIsGenerating(true);
    try {
      // Simulación de optimización SEO
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const seoData = {
        metaTitle: `${title} | Capittal - Expertos en M&A`,
        metaDescription: `Descubre ${title.toLowerCase()} con los expertos de Capittal. Guía completa sobre fusiones, adquisiciones y valoraciones empresariales.`
      };
      
      onContentGenerated?.(`Meta título: ${seoData.metaTitle}\nMeta descripción: ${seoData.metaDescription}`);
      
      toast({
        title: "SEO optimizado",
        description: "Metadatos optimizados para buscadores",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo optimizar el SEO",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    isGenerating,
    generateTitle,
    generateContent,
    optimizeForSEO,
  };
};