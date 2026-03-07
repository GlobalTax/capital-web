import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { callAI, parseAIJson, aiErrorResponse } from "../_shared/ai-helper.ts";

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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { analyticsData }: { analyticsData: AnalyticsData } = await req.json();

    const prompt = `Analiza los siguientes datos de marketing y ventas de Capittal (empresa de M&A):

DATOS:
- ${analyticsData.companies.length} empresas visitantes en ${analyticsData.timeframe}
- ${analyticsData.leads.length} leads activos
- ${analyticsData.events.length} eventos de comportamiento
- ${analyticsData.conversions.length} conversiones

TOP EMPRESAS: ${analyticsData.companies.slice(0, 10).map(c => `${c.domain} (${c.industry || 'N/A'}): ${c.visitCount} visitas, score ${c.engagementScore}/100`).join('\n')}

LEADS CALIENTES: ${analyticsData.leads.filter(l => l.is_hot_lead).slice(0, 5).map(l => `${l.company_name || l.company_domain}: ${l.total_score} pts`).join('\n')}

Genera exactamente 6 insights predictivos: 2 oportunidades, 2 riesgos, 1 optimización, 1 predicción.
Responde SOLO con un JSON array.`;

    const response = await callAI(
      [
        { role: 'system', content: 'Eres un analista experto en M&A y marketing B2B. Genera insights predictivos. Responde con un JSON array de objetos con: type, priority, title, description, confidence, impact, actionable_steps, affected_companies, predicted_value, time_horizon.' },
        { role: 'user', content: prompt }
      ],
      { functionName: 'ai-predictive-analytics', temperature: 0.7, maxTokens: 2000 }
    );

    let insights;
    try {
      insights = parseAIJson<any[]>(response.content);
      if (!Array.isArray(insights)) throw new Error('Not array');
    } catch {
      insights = [{ type: 'opportunity', priority: 'high', title: 'Oportunidades detectadas', description: 'Revisa los leads calientes.', confidence: 75, impact: 'Alto', actionable_steps: ['Contactar leads en 24h'], time_horizon: '30 días' }];
    }

    return new Response(JSON.stringify({
      success: true,
      insights: insights.map(i => ({ ...i, confidence: Math.min(100, Math.max(0, i.confidence || 75)), generated_at: new Date().toISOString(), timeframe: analyticsData.timeframe })),
      metadata: { companies_analyzed: analyticsData.companies.length, leads_analyzed: analyticsData.leads.length, generated_at: new Date().toISOString() }
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error) {
    console.error('Error in AI predictive analytics:', error);
    return aiErrorResponse(error, corsHeaders);
  }
});
