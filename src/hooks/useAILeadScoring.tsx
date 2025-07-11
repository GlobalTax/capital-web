import { useState, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface LeadScoringPrediction {
  visitor_id: string;
  predicted_score: number;
  conversion_probability: number;
  optimal_contact_time: string;
  recommended_actions: string[];
  score_trend: 'increasing' | 'decreasing' | 'stable';
  risk_factors: string[];
  opportunity_indicators: string[];
  confidence_level: number;
  generated_at: string;
  model_version: string;
}

interface PatternAnalysis {
  high_conversion_patterns: Array<{
    pattern: string;
    conversion_rate: number;
    frequency: number;
    description: string;
  }>;
  risk_indicators: Array<{
    indicator: string;
    risk_level: number;
    description: string;
    mitigation: string;
  }>;
  optimal_timing: {
    best_contact_hours: number[];
    best_contact_days: string[];
    response_rate_by_timing: Record<string, number>;
  };
  segment_insights: Array<{
    segment: string;
    avg_score: number;
    conversion_rate: number;
    recommended_approach: string;
  }>;
}

export const useAILeadScoring = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Obtener datos de leads con eventos para análisis
  const { data: leadsForAnalysis, isLoading: isLoadingLeads } = useQuery({
    queryKey: ['leadsForAIAnalysis'],
    queryFn: async () => {
      const { data: leads, error: leadsError } = await supabase
        .from('lead_scores')
        .select(`
          *,
          events:lead_behavior_events(
            event_type,
            page_path,
            event_data,
            points_awarded,
            created_at
          )
        `)
        .order('total_score', { ascending: false })
        .limit(50);

      if (leadsError) {
        console.warn('Error loading leads for AI analysis:', leadsError);
        return [];
      }

      return leads || [];
    },
    staleTime: 300000, // 5 minutos
    refetchOnWindowFocus: false,
  });

  // Generar predicciones de scoring con IA
  const generateAIScoring = useMutation({
    mutationFn: async ({ 
      analysisType = 'scoring' 
    }: { 
      analysisType?: 'scoring' | 'conversion' | 'segmentation' 
    }) => {
      if (!leadsForAnalysis || leadsForAnalysis.length === 0) {
        throw new Error('No hay datos de leads para analizar');
      }

      setIsAnalyzing(true);

      // Preparar datos para el análisis
      const leadsData = leadsForAnalysis.map(lead => ({
        visitor_id: lead.visitor_id,
        company_domain: lead.company_domain,
        company_name: lead.company_name,
        industry: lead.industry,
        company_size: lead.company_size,
        location: lead.location,
        visit_count: lead.visit_count,
        total_score: lead.total_score,
        events: Array.isArray(lead.events) ? lead.events.map((event: any) => ({
          event_type: event.event_type,
          page_path: event.page_path,
          event_data: event.event_data,
          points_awarded: event.points_awarded,
          created_at: event.created_at
        })) : []
      }));

      console.log('Sending leads to AI for analysis:', leadsData.length);

      const response = await fetch('https://fwhqtzkkvnjkazhaficj.functions.supabase.co/functions/v1/ai-lead-scoring', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ3aHF0emtrdm5qa2F6aGFmaWNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4Mjc5NTMsImV4cCI6MjA2NTQwMzk1M30.Qhb3pRgx3HIoLSjeIulRHorgzw-eqL3WwXhpncHMF7I'}`
        },
        body: JSON.stringify({ 
          leads: leadsData,
          analysis_type: analysisType
        })
      });

      if (!response.ok) {
        throw new Error(`Error en análisis AI: ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.details || 'Error en el análisis AI');
      }

      setIsAnalyzing(false);
      return result;
    },
    onSuccess: (data) => {
      toast({
        title: "Análisis AI completado",
        description: `Se analizaron ${data.metadata.leads_analyzed} leads con éxito`,
      });
      
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['hotLeads'] });
      queryClient.invalidateQueries({ queryKey: ['allLeads'] });
    },
    onError: (error: Error) => {
      setIsAnalyzing(false);
      toast({
        title: "Error en análisis AI",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Análisis de patrones con IA
  const analyzePatterns = useCallback(async (): Promise<PatternAnalysis | null> => {
    if (!leadsForAnalysis || leadsForAnalysis.length === 0) {
      return null;
    }

    try {
      // Analizar patrones de conversión
      const highScoreLeads = leadsForAnalysis.filter(l => l.total_score > 70);
      const mediumScoreLeads = leadsForAnalysis.filter(l => l.total_score >= 40 && l.total_score <= 70);
      const lowScoreLeads = leadsForAnalysis.filter(l => l.total_score < 40);

      // Identificar patrones comunes en leads de alto score
      const commonPatterns = highScoreLeads.reduce((patterns, lead) => {
        const events = Array.isArray(lead.events) ? lead.events : [];
        const hasCalculator = events.some((e: any) => e.event_type?.includes('calculator'));
        const hasContact = events.some((e: any) => e.page_path?.includes('contacto'));
        const hasDownload = events.some((e: any) => e.event_type?.includes('download'));
        
        if (hasCalculator) patterns.calculator++;
        if (hasContact) patterns.contact++;
        if (hasDownload) patterns.download++;
        
        return patterns;
      }, { calculator: 0, contact: 0, download: 0 });

      const totalHighScore = highScoreLeads.length;

      return {
        high_conversion_patterns: [
          {
            pattern: 'calculator_usage',
            conversion_rate: totalHighScore > 0 ? (commonPatterns.calculator / totalHighScore) * 100 : 0,
            frequency: commonPatterns.calculator,
            description: 'Leads que usan la calculadora de valoración tienen mayor probabilidad de conversión'
          },
          {
            pattern: 'contact_page_visit',
            conversion_rate: totalHighScore > 0 ? (commonPatterns.contact / totalHighScore) * 100 : 0,
            frequency: commonPatterns.contact,
            description: 'Visitas a página de contacto indican alta intención de compra'
          },
          {
            pattern: 'content_download',
            conversion_rate: totalHighScore > 0 ? (commonPatterns.download / totalHighScore) * 100 : 0,
            frequency: commonPatterns.download,
            description: 'Descarga de contenido muestra engagement profundo'
          }
        ],
        risk_indicators: [
          {
            indicator: 'low_visit_frequency',
            risk_level: lowScoreLeads.filter(l => l.visit_count < 3).length,
            description: 'Pocas visitas indican bajo interés',
            mitigation: 'Implementar campaña de nurturing'
          },
          {
            indicator: 'no_calculator_usage',
            risk_level: mediumScoreLeads.filter(l => {
              const events = Array.isArray(l.events) ? l.events : [];
              return !events.some((e: any) => e.event_type?.includes('calculator'));
            }).length,
            description: 'Sin uso de calculadora puede indicar baja intención',
            mitigation: 'Promocionar herramienta de valoración'
          }
        ],
        optimal_timing: {
          best_contact_hours: [9, 10, 11, 14, 15, 16], // Horario comercial
          best_contact_days: ['Martes', 'Miércoles', 'Jueves'],
          response_rate_by_timing: {
            'mañana': 85,
            'tarde': 70,
            'noche': 45
          }
        },
        segment_insights: [
          {
            segment: 'Tecnología',
            avg_score: highScoreLeads.filter(l => l.industry === 'Technology').reduce((sum, l) => sum + l.total_score, 0) / Math.max(1, highScoreLeads.filter(l => l.industry === 'Technology').length),
            conversion_rate: 65,
            recommended_approach: 'Enfoque técnico y datos precisos'
          },
          {
            segment: 'Finanzas',
            avg_score: highScoreLeads.filter(l => l.industry === 'Finance').reduce((sum, l) => sum + l.total_score, 0) / Math.max(1, highScoreLeads.filter(l => l.industry === 'Finance').length),
            conversion_rate: 72,
            recommended_approach: 'Enfoque en ROI y métricas financieras'
          }
        ]
      };
    } catch (error) {
      console.error('Error analyzing patterns:', error);
      return null;
    }
  }, [leadsForAnalysis]);

  // Métricas calculadas
  const aiMetrics = useMemo(() => {
    if (!leadsForAnalysis) return null;

    const totalLeads = leadsForAnalysis.length;
    const aiReadyLeads = leadsForAnalysis.filter(l => (l.events || []).length > 2);
    const highConfidenceLeads = leadsForAnalysis.filter(l => l.total_score > 70);
    
    return {
      totalLeads,
      aiReadyLeads: aiReadyLeads.length,
      readinessPercentage: totalLeads > 0 ? (aiReadyLeads.length / totalLeads) * 100 : 0,
      highConfidenceLeads: highConfidenceLeads.length,
      avgScore: totalLeads > 0 ? leadsForAnalysis.reduce((sum, l) => sum + l.total_score, 0) / totalLeads : 0,
      dataQuality: aiReadyLeads.length > totalLeads * 0.7 ? 'high' : aiReadyLeads.length > totalLeads * 0.4 ? 'medium' : 'low'
    };
  }, [leadsForAnalysis]);

  return {
    // Data
    leadsForAnalysis,
    aiMetrics,
    
    // Loading states
    isLoadingLeads,
    isAnalyzing,
    
    // Actions
    generateAIScoring: generateAIScoring.mutate,
    analyzePatterns,
    
    // Status
    isGenerating: generateAIScoring.isPending || isAnalyzing,
    error: generateAIScoring.error
  };
};