import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { callAI, hasAIService } from "../_shared/ai-helper.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SYSTEM_PROMPT = `Eres un analista senior de M&A especializado en el mercado español e ibérico.
Tu trabajo es identificar y resumir OPERACIONES REALES de compra-venta de empresas.

PRIORIDAD ALTA (relevance_score 7-10): Adquisiciones, ventas, fusiones, OPAs, PE >10M€, desinversiones, build-ups, MBOs/MBIs
PRIORIDAD MEDIA (relevance_score 4-6): Rondas >20M€, rumores fiables, procesos en marcha, cross-border
PRIORIDAD BAJA (relevance_score 0-3): Opinión, tendencias sin deals, VC <10M€, nombramientos, resultados financieros

Responde SIEMPRE en JSON válido.`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  let body: any = {};
  try { body = await req.clone().json(); } catch {}

  const isScheduledCall = body?.scheduled === true;

  if (!isScheduledCall) {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No autorizado' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseAuth = createClient(supabaseUrl, supabaseKey);
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Token inválido o expirado' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
  }

  try {
    if (!hasAIService()) {
      return new Response(JSON.stringify({ success: false, error: 'No AI API key configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: unprocessedNews, error: fetchError } = await supabase
      .from('news_articles').select('*')
      .eq('is_processed', false).eq('is_deleted', false).limit(10);

    if (fetchError) throw fetchError;

    if (!unprocessedNews || unprocessedNews.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: 'No articles to process', processed: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Processing ${unprocessedNews.length} news articles with AI...`);

    let processedCount = 0;
    let discardedCount = 0;

    for (const article of unprocessedNews) {
      try {
        const userPrompt = `Analiza esta noticia y extrae información sobre la OPERACIÓN de M&A:

Título: ${article.title}
Fuente: ${article.source_name || 'No especificada'}
Contenido: ${article.content?.substring(0, 4000)}

Evalúa si es una operación REAL y responde en JSON:
{
  "is_ma_deal": true/false,
  "relevance_score": 0-10,
  "deal_type": "adquisición"|"venta"|"fusión"|"opa"|"desinversión"|"mbo"|"private_equity"|"venture_capital"|"otro"|null,
  "buyer": "nombre o null",
  "seller": "nombre o null",
  "target_company": "empresa objeto",
  "deal_value": "100M€ o no especificado",
  "seo_title": "título SEO max 70 chars",
  "excerpt": "resumen 160 chars",
  "summary": "resumen 150-200 palabras",
  "category": "M&A"|"Private Equity"|"Venture Capital"|"OPA"|"Reestructuración",
  "tags": ["max 5 tags"],
  "rejection_reason": "si relevance_score < 5"
}`;

        let aiResponse;
        try {
          aiResponse = await callAI(
            [{ role: 'system', content: SYSTEM_PROMPT }, { role: 'user', content: userPrompt }],
            { temperature: 0.3, maxTokens: 1200, functionName: 'process-news-ai' }
          );
        } catch (error) {
          console.error(`AI error for article ${article.id}:`, error);
          continue;
        }

        let parsed;
        try {
          const jsonMatch = aiResponse.content.match(/\{[\s\S]*\}/);
          if (jsonMatch) parsed = JSON.parse(jsonMatch[0]);
          else throw new Error('No JSON found');
        } catch {
          console.error(`Parse error for article ${article.id}`);
          continue;
        }

        const relevanceScore = parsed.relevance_score ?? 0;
        const isRelevant = parsed.is_ma_deal && relevanceScore >= 5;

        if (!isRelevant) {
          console.log(`⏭️ Descartando (score: ${relevanceScore}): "${article.title.substring(0, 50)}..."`);
          await supabase.from('news_articles').update({
            is_processed: true, is_deleted: true, processed_at: new Date().toISOString(),
            relevance_score: relevanceScore,
            rejection_reason: parsed.rejection_reason || 'No cumple criterios',
            ai_metadata: { is_ma_deal: parsed.is_ma_deal, original_analysis: parsed }
          }).eq('id', article.id);
          discardedCount++;
          continue;
        }

        console.log(`✅ Operación relevante (score: ${relevanceScore}): ${parsed.deal_type || 'M&A'}`);

        await supabase.from('news_articles').update({
          title: parsed.seo_title || article.title,
          excerpt: parsed.excerpt || article.excerpt,
          content: parsed.summary || article.content,
          category: parsed.category || 'M&A',
          tags: parsed.tags || [],
          deal_type: parsed.deal_type,
          buyer: parsed.buyer, seller: parsed.seller,
          target_company: parsed.target_company,
          deal_value: parsed.deal_value,
          relevance_score: relevanceScore,
          ai_metadata: { is_ma_deal: true, original_analysis: parsed },
          is_processed: true, processed_at: new Date().toISOString()
        }).eq('id', article.id);

        processedCount++;

      } catch (error) {
        console.error(`Error processing article ${article.id}:`, error);
      }
    }

    console.log(`\n📊 Finished: ✅ ${processedCount} relevant, ⏭️ ${discardedCount} discarded`);

    return new Response(
      JSON.stringify({ success: true, message: `Processed ${processedCount} relevant deals, discarded ${discardedCount}`, processed: processedCount, discarded: discardedCount }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in process-news-ai:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
