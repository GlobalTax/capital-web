import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface LeadData {
  visitor_id: string;
  company_domain?: string;
  company_name?: string;
  industry?: string;
  company_size?: string;
  location?: string;
  visit_count: number;
  total_score: number;
  events: Array<{
    event_type: string;
    page_path?: string;
    event_data: any;
    points_awarded: number;
    created_at: string;
  }>;
}

interface ScoringPrediction {
  visitor_id: string;
  predicted_score: number;
  conversion_probability: number;
  optimal_contact_time: string;
  recommended_actions: string[];
  score_trend: 'increasing' | 'decreasing' | 'stable';
  risk_factors: string[];
  opportunity_indicators: string[];
  confidence_level: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const { leads, analysis_type = 'scoring' }: { 
      leads: LeadData[], 
      analysis_type?: 'scoring' | 'conversion' | 'segmentation' 
    } = await req.json();

    // Preparar datos para análisis ML
    const leadsAnalysis = leads.map(lead => {
      const recentEvents = lead.events.filter(e => 
        new Date(e.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      );
      
      const calculatorUsage = lead.events.filter(e => 
        e.event_type.includes('calculator') || e.page_path?.includes('valoracion')
      ).length;
      
      const contactPageViews = lead.events.filter(e => 
        e.page_path?.includes('contacto') || e.event_type === 'contact_form'
      ).length;
      
      const downloadEvents = lead.events.filter(e => 
        e.event_type.includes('download')
      ).length;

      return {
        visitor_id: lead.visitor_id,
        company_domain: lead.company_domain,
        company_name: lead.company_name,
        industry: lead.industry,
        company_size: lead.company_size,
        visit_count: lead.visit_count,
        current_score: lead.total_score,
        recent_activity: recentEvents.length,
        calculator_usage: calculatorUsage,
        contact_intent: contactPageViews,
        content_engagement: downloadEvents,
        activity_trend: recentEvents.length > 0 ? 'active' : 'dormant',
        last_activity_days: Math.floor(
          (Date.now() - new Date(lead.events[lead.events.length - 1]?.created_at || Date.now()).getTime()) 
          / (1000 * 60 * 60 * 24)
        )
      };
    });

    const prompt = `
Analiza estos leads B2B para Capittal (empresa de M&A) y predice su scoring avanzado:

LEADS A ANALIZAR:
${leadsAnalysis.slice(0, 10).map(lead => `
- ID: ${lead.visitor_id}
- Empresa: ${lead.company_name || lead.company_domain || 'Anónima'}
- Industria: ${lead.industry || 'No especificada'}
- Tamaño: ${lead.company_size || 'No especificado'}
- Visitas: ${lead.visit_count}
- Score actual: ${lead.current_score}
- Actividad reciente: ${lead.recent_activity} eventos
- Uso calculadora: ${lead.calculator_usage} veces
- Interés contacto: ${lead.contact_intent} pageviews
- Engagement contenido: ${lead.content_engagement} descargas
- Última actividad: hace ${lead.last_activity_days} días
`).join('\n')}

Basándote en patrones de comportamiento B2B y tu conocimiento de ventas M&A:

1. Predice el score óptimo para cada lead (0-100)
2. Calcula probabilidad de conversión (0-100%)
3. Identifica momento óptimo de contacto
4. Sugiere acciones específicas
5. Detecta factores de riesgo e indicadores de oportunidad
6. Evalúa tendencia del score

Responde SOLO con un array JSON válido de objetos ScoringPrediction:`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `Eres un experto en machine learning y scoring de leads B2B para M&A.
Analiza patrones de comportamiento y predice scores precisos.
Responde SIEMPRE con un array JSON válido de objetos ScoringPrediction.
Cada predicción debe incluir: visitor_id, predicted_score (0-100), conversion_probability (0-100), optimal_contact_time, recommended_actions (array), score_trend, risk_factors (array), opportunity_indicators (array), confidence_level (0-100).`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3, // Menos creatividad para más precisión
        max_tokens: 3000,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiContent = data.choices[0].message.content;

    // Parsear respuesta JSON
    let predictions: ScoringPrediction[];
    try {
      predictions = JSON.parse(aiContent);
      if (!Array.isArray(predictions)) {
        throw new Error('Response is not an array');
      }
    } catch (parseError) {
      console.error('Error parsing AI response:', aiContent);
      // Fallback a scoring tradicional
      predictions = generateFallbackScoring(leadsAnalysis);
    }

    // Validar y enriquecer predicciones
    const validatedPredictions = predictions.map(pred => ({
      ...pred,
      predicted_score: Math.min(100, Math.max(0, pred.predicted_score || 0)),
      conversion_probability: Math.min(100, Math.max(0, pred.conversion_probability || 0)),
      confidence_level: Math.min(100, Math.max(0, pred.confidence_level || 75)),
      generated_at: new Date().toISOString(),
      model_version: 'gpt-4o-mini-v1',
      analysis_type
    }));

    return new Response(
      JSON.stringify({ 
        success: true,
        predictions: validatedPredictions,
        metadata: {
          leads_analyzed: leads.length,
          analysis_type,
          generated_at: new Date().toISOString(),
          model_confidence: validatedPredictions.reduce((sum, p) => sum + p.confidence_level, 0) / validatedPredictions.length
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in AI lead scoring:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Error generating lead scoring predictions',
        details: error.message,
        fallback: true
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

function generateFallbackScoring(leadsAnalysis: any[]): ScoringPrediction[] {
  return leadsAnalysis.map(lead => {
    // Scoring algoritmo simple basado en reglas
    let predictedScore = lead.current_score;
    
    // Ajustes basados en comportamiento
    if (lead.calculator_usage > 0) predictedScore += 20;
    if (lead.contact_intent > 0) predictedScore += 30;
    if (lead.content_engagement > 2) predictedScore += 15;
    if (lead.visit_count > 5) predictedScore += 10;
    if (lead.last_activity_days < 3) predictedScore += 15;
    
    // Penalizaciones
    if (lead.last_activity_days > 14) predictedScore -= 20;
    if (lead.recent_activity === 0) predictedScore -= 10;
    
    predictedScore = Math.min(100, Math.max(0, predictedScore));
    
    const conversionProbability = Math.min(95, predictedScore * 0.8 + Math.random() * 10);
    
    return {
      visitor_id: lead.visitor_id,
      predicted_score: predictedScore,
      conversion_probability: conversionProbability,
      optimal_contact_time: lead.last_activity_days < 7 ? 'immediate' : 'within_week',
      recommended_actions: [
        'Enviar contenido personalizado',
        'Programar llamada de seguimiento',
        'Ofrecer consulta gratuita'
      ],
      score_trend: lead.recent_activity > 0 ? 'increasing' : 'stable',
      risk_factors: lead.last_activity_days > 14 ? ['Inactividad prolongada'] : [],
      opportunity_indicators: lead.calculator_usage > 0 ? ['Uso de calculadora'] : [],
      confidence_level: 75
    };
  });
}