import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AnalyticsData {
  companies: any[];
  leads: any[];
  events: any[];
  conversions: any[];
  timeframe: string;
}

interface PredictiveInsight {
  type: 'opportunity' | 'risk' | 'optimization' | 'prediction';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  confidence: number;
  impact: string;
  actionable_steps: string[];
  affected_companies?: string[];
  predicted_value?: number;
  time_horizon?: string;
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

    const { analyticsData }: { analyticsData: AnalyticsData } = await req.json();

    // Crear prompt contextual basado en los datos
    const prompt = `
Analiza los siguientes datos de marketing y ventas de Capittal (empresa de M&A) y genera insights predictivos precisos:

DATOS DE ENTRADA:
- ${analyticsData.companies.length} empresas visitantes en ${analyticsData.timeframe}
- ${analyticsData.leads.length} leads activos
- ${analyticsData.events.length} eventos de comportamiento
- ${analyticsData.conversions.length} conversiones registradas

TOP EMPRESAS POR ENGAGEMENT:
${analyticsData.companies.slice(0, 10).map(c => 
  `- ${c.domain} (${c.industry || 'N/A'}): ${c.visitCount} visitas, score ${c.engagementScore}/100`
).join('\n')}

LEADS CALIENTES:
${analyticsData.leads.filter(l => l.is_hot_lead).slice(0, 5).map(l => 
  `- ${l.company_name || l.company_domain}: ${l.total_score} puntos, ${l.visit_count} visitas`
).join('\n')}

TENDENCIAS DE COMPORTAMIENTO:
${analyticsData.events.reduce((acc, e) => {
  acc[e.event_type] = (acc[e.event_type] || 0) + 1;
  return acc;
}, {} as Record<string, number>) && Object.entries(analyticsData.events.reduce((acc, e) => {
  acc[e.event_type] = (acc[e.event_type] || 0) + 1;
  return acc;
}, {} as Record<string, number>)).map(([type, count]) => `- ${type}: ${count} eventos`).join('\n')}

Genera exactamente 6 insights predictivos: 2 de oportunidades, 2 de riesgos, 1 de optimización y 1 predicción específica.

Responde SOLO con un array JSON válido sin texto adicional:`;

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
            content: `Eres un analista experto en M&A y marketing B2B. Genera insights predictivos específicos para Capittal.
Responde SIEMPRE con un array JSON válido de objetos PredictiveInsight.
Cada insight debe tener: type, priority, title, description, confidence (0-100), impact, actionable_steps (array), affected_companies (opcional), predicted_value (opcional), time_horizon (opcional).`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiContent = data.choices[0].message.content;

    // Parsear respuesta JSON
    let insights: PredictiveInsight[];
    try {
      insights = JSON.parse(aiContent);
      if (!Array.isArray(insights)) {
        throw new Error('Response is not an array');
      }
    } catch (parseError) {
      console.error('Error parsing AI response:', aiContent);
      // Fallback a insights genéricos
      insights = generateFallbackInsights(analyticsData);
    }

    // Validar y enriquecer insights
    const validatedInsights = insights.map(insight => ({
      ...insight,
      confidence: Math.min(100, Math.max(0, insight.confidence || 75)),
      generated_at: new Date().toISOString(),
      data_source: 'openai_gpt4o',
      timeframe: analyticsData.timeframe
    }));

    return new Response(
      JSON.stringify({ 
        success: true,
        insights: validatedInsights,
        metadata: {
          companies_analyzed: analyticsData.companies.length,
          leads_analyzed: analyticsData.leads.length,
          events_analyzed: analyticsData.events.length,
          generated_at: new Date().toISOString()
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in AI predictive analytics:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Error generating predictive insights',
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

function generateFallbackInsights(data: AnalyticsData): PredictiveInsight[] {
  const hotLeads = data.leads.filter(l => l.is_hot_lead).length;
  const topCompanies = data.companies.sort((a, b) => b.engagementScore - a.engagementScore).slice(0, 3);
  
  return [
    {
      type: 'opportunity',
      priority: 'high',
      title: 'Oportunidades de leads calientes',
      description: `${hotLeads} leads calientes requieren seguimiento inmediato. Probabilidad de conversión: 65%`,
      confidence: 85,
      impact: 'Alto potencial de ingresos',
      actionable_steps: [
        'Contactar leads calientes en próximas 24h',
        'Personalizar propuesta de valor',
        'Programar llamadas de seguimiento'
      ],
      affected_companies: topCompanies.slice(0, 2).map(c => c.domain),
      predicted_value: hotLeads * 50000,
      time_horizon: '30 días'
    },
    {
      type: 'risk',
      priority: 'medium',
      title: 'Riesgo de leads fríos',
      description: 'Algunos leads están perdiendo engagement. Acción requerida para reactivar.',
      confidence: 75,
      impact: 'Pérdida potencial de oportunidades',
      actionable_steps: [
        'Implementar campaña de reactivación',
        'Enviar contenido de valor',
        'Revisar estrategia de nurturing'
      ],
      time_horizon: '15 días'
    }
  ];
}