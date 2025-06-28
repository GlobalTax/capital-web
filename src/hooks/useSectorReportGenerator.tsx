
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAIContentStudio } from '@/hooks/useAIContentStudio';
import { supabase } from '@/integrations/supabase/client';
import { SectorReportRequest, SectorReportResult, SectorData } from '@/types/sectorReports';

export const useSectorReportGenerator = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedReports, setGeneratedReports] = useState<SectorReportResult[]>([]);
  const { generateContent } = useAIContentStudio();
  const { toast } = useToast();

  const fetchSectorData = useCallback(async (sector: string): Promise<SectorData> => {
    const sectorData: SectorData = {};

    try {
      // Obtener múltiplos del sector
      const { data: multiples } = await supabase
        .from('sector_valuation_multiples')
        .select('*')
        .ilike('sector_name', `%${sector}%`)
        .eq('is_active', true);

      // Obtener casos de éxito del sector
      const { data: caseStudies } = await supabase
        .from('case_studies')
        .select('*')
        .ilike('sector', `%${sector}%`)
        .eq('is_active', true)
        .limit(5);

      // Obtener estadísticas relevantes
      const { data: statistics } = await supabase
        .from('key_statistics')
        .select('*')
        .eq('is_active', true);

      sectorData.multiples = multiples || [];
      sectorData.caseStudies = caseStudies || [];
      sectorData.statistics = statistics || [];

    } catch (error) {
      console.error('Error fetching sector data:', error);
    }

    return sectorData;
  }, []);

  const generateSectorReport = useCallback(async (request: SectorReportRequest): Promise<SectorReportResult> => {
    setIsGenerating(true);

    try {
      // Obtener datos del sector
      const sectorData = await fetchSectorData(request.sector);

      // Construir contexto para la IA
      const context = {
        sector: request.sector,
        reportType: request.reportType,
        period: request.period,
        depth: request.depth,
        targetAudience: request.targetAudience,
        includeData: request.includeData,
        sectorData: JSON.stringify(sectorData),
        customFocus: request.customFocus || ''
      };

      // Generar el reporte usando la IA
      const result = await generateContent({
        type: 'content',
        prompt: buildSectorReportPrompt(request),
        context,
        template: 'sector-report-generator',
        options: {
          maxTokens: request.depth === 'advanced' ? 6000 : request.depth === 'intermediate' ? 4000 : 2500,
          temperature: 0.7
        }
      });

      // Procesar y estructurar el resultado
      const sections = parseSectorReportSections(result.content);
      
      const reportResult: SectorReportResult = {
        id: crypto.randomUUID(),
        title: `Reporte ${getReportTypeLabel(request.reportType)} - ${request.sector}`,
        content: result.content,
        sector: request.sector,
        reportType: request.reportType,
        generatedAt: new Date(),
        wordCount: result.content.split(/\s+/).length,
        sections,
        metadata: {
          includeData: request.includeData,
          period: request.period,
          depth: request.depth
        }
      };

      setGeneratedReports(prev => [reportResult, ...prev]);

      toast({
        title: "¡Reporte generado exitosamente!",
        description: `Reporte de ${request.sector} generado con ${reportResult.wordCount} palabras`,
      });

      return reportResult;
    } catch (error) {
      console.error('Error generating sector report:', error);
      toast({
        title: "Error al generar reporte",
        description: "Error al generar el reporte sectorial. Inténtalo de nuevo.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsGenerating(false);
    }
  }, [generateContent, fetchSectorData, toast]);

  return {
    isGenerating,
    generatedReports,
    generateSectorReport,
    clearReports: () => setGeneratedReports([])
  };
};

function buildSectorReportPrompt(request: SectorReportRequest): string {
  const typePrompts = {
    'market-analysis': `un análisis completo del mercado del sector ${request.sector}`,
    'ma-trends': `un análisis de las tendencias M&A en el sector ${request.sector}`,
    'valuation-multiples': `un análisis de múltiplos de valoración para el sector ${request.sector}`,
    'due-diligence': `una guía de due diligence específica para el sector ${request.sector}`
  };

  return `Genera ${typePrompts[request.reportType]} con nivel de profundidad ${request.depth} dirigido a ${request.targetAudience}. ${request.customFocus ? `Enfoque especial en: ${request.customFocus}` : ''}`;
}

function getReportTypeLabel(type: string): string {
  const labels = {
    'market-analysis': 'Análisis de Mercado',
    'ma-trends': 'Tendencias M&A',
    'valuation-multiples': 'Múltiplos de Valoración',
    'due-diligence': 'Due Diligence Sectorial'
  };
  return labels[type as keyof typeof labels] || type;
}

function parseSectorReportSections(content: string) {
  // Lógica básica para extraer secciones del contenido
  const sections = {
    executiveSummary: '',
    marketAnalysis: '',
    opportunities: '',
    conclusions: ''
  };

  // Implementación simple - podrías mejorar esto con regex más sofisticados
  const lines = content.split('\n');
  let currentSection = 'executiveSummary';
  
  lines.forEach(line => {
    if (line.toLowerCase().includes('resumen ejecutivo') || line.toLowerCase().includes('executive summary')) {
      currentSection = 'executiveSummary';
    } else if (line.toLowerCase().includes('análisis de mercado') || line.toLowerCase().includes('market analysis')) {
      currentSection = 'marketAnalysis';
    } else if (line.toLowerCase().includes('oportunidades') || line.toLowerCase().includes('opportunities')) {
      currentSection = 'opportunities';
    } else if (line.toLowerCase().includes('conclusiones') || line.toLowerCase().includes('conclusions')) {
      currentSection = 'conclusions';
    } else if (line.trim()) {
      sections[currentSection as keyof typeof sections] += line + '\n';
    }
  });

  return sections;
}
