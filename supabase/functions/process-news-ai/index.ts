import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Specialized system prompt for M&A deal identification
const SYSTEM_PROMPT = `Eres un analista senior de M&A especializado en el mercado español e ibérico.
Tu trabajo es identificar y resumir OPERACIONES REALES de compra-venta de empresas.

PRIORIDAD ALTA (relevance_score 7-10) - PUBLICAR:
- Adquisiciones completadas o anunciadas de empresas
- Ventas de empresas, divisiones o unidades de negocio
- Fusiones entre compañías
- OPAs (ofertas públicas de adquisición)
- Compras por fondos de Private Equity (superiores a 10M€)
- Desinversiones de grupos empresariales
- Build-ups y operaciones de consolidación sectorial
- MBOs/MBIs (compras por directivos)

PRIORIDAD MEDIA (relevance_score 4-6) - REVISAR:
- Rondas de financiación de startups superiores a 20M€
- Rumores de operaciones con fuentes fiables
- Procesos de venta en marcha sin cerrar
- Operaciones cross-border con empresas españolas

PRIORIDAD BAJA (relevance_score 0-3) - DESCARTAR:
- Artículos de opinión sin operaciones concretas
- Tendencias generales del mercado sin deals específicos
- Noticias de venture capital/startups menores de 10M€
- Nombramientos de directivos sin operación asociada
- Resultados financieros sin operación de M&A
- Contenido educativo o explicativo sobre M&A
- Rumores sin fuentes concretas
- Noticias antiguas recicladas

Responde SIEMPRE en JSON válido. Extrae información específica de la operación cuando esté disponible.`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Auth verification - skip for scheduled/cron calls
  let body: any = {};
  try {
    body = await req.clone().json();
  } catch {}

  const isScheduledCall = body?.scheduled === true;

  if (!isScheduledCall) {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No autorizado' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseAuth = createClient(supabaseUrl, supabaseKey);
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser(token);
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Token inválido o expirado' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  }

  try {
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    if (!lovableApiKey && !openAIApiKey) {
      console.error('No AI API key configured');
      return new Response(
        JSON.stringify({ success: false, error: 'No AI API key configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get unprocessed news articles
    const { data: unprocessedNews, error: fetchError } = await supabase
      .from('news_articles')
      .select('*')
      .eq('is_processed', false)
      .eq('is_deleted', false)
      .limit(10);

    if (fetchError) {
      console.error('Error fetching unprocessed news:', fetchError);
      throw fetchError;
    }

    if (!unprocessedNews || unprocessedNews.length === 0) {
      console.log('No unprocessed news articles found');
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
        console.log(`Processing article: ${article.title}`);

        const userPrompt = `Analiza esta noticia y extrae información sobre la OPERACIÓN de M&A:

Título: ${article.title}
Fuente: ${article.source_name || 'No especificada'}
Contenido: ${article.content?.substring(0, 4000)}

Evalúa si es una operación REAL de compra-venta y responde en JSON:
{
  "is_ma_deal": true/false,
  "relevance_score": 0-10,
  "deal_type": "adquisición" | "venta" | "fusión" | "opa" | "desinversión" | "mbo" | "private_equity" | "venture_capital" | "otro" | null,
  "buyer": "nombre exacto de la empresa compradora o fondo, o null si no aplica",
  "seller": "nombre exacto de la empresa vendedora, o null si no aplica",
  "target_company": "empresa/activo/división objeto de la operación",
  "deal_value": "valor de la operación en formato '100M€' o 'no especificado'",
  "seo_title": "título SEO máx 70 chars: [Buyer] adquiere/vende [Target] - incluir valor si existe",
  "excerpt": "resumen 160 chars: qué empresa compra/vende qué, por cuánto y sector",
  "summary": "resumen 150-200 palabras de la operación: partes involucradas, términos, contexto estratégico",
  "category": "M&A" | "Private Equity" | "Venture Capital" | "OPA" | "Reestructuración",
  "tags": ["máximo 5 tags: sector, tipo operación, nombres empresas principales"],
  "rejection_reason": "si relevance_score < 5, explicar brevemente por qué no es una operación relevante"
}

IMPORTANTE: Solo asigna relevance_score >= 7 si hay una operación CONCRETA y REAL de compra-venta con partes identificables.`;

        // Try Lovable AI first (free tier)
        let response: Response | null = null;
        let usedProvider = 'lovable';
        
        if (lovableApiKey) {
          try {
            response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${lovableApiKey}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                model: 'google/gemini-2.5-flash',
                messages: [
                  { role: 'system', content: SYSTEM_PROMPT },
                  { role: 'user', content: userPrompt }
                ],
                temperature: 0.3,
                max_tokens: 1200,
              }),
            });
            
            if (!response.ok) {
              console.warn(`[process-news-ai] Lovable AI failed for article ${article.id}, trying OpenAI...`);
              response = null;
            }
          } catch (lovableError) {
            console.warn(`[process-news-ai] Lovable AI error:`, lovableError);
            response = null;
          }
        }

        // Fallback to OpenAI
        if (!response && openAIApiKey) {
          usedProvider = 'openai';
          response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${openAIApiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'gpt-4o-mini',
              messages: [
                { role: 'system', content: SYSTEM_PROMPT },
                { role: 'user', content: userPrompt }
              ],
              temperature: 0.3,
              max_tokens: 1200,
            }),
          });
        }

        if (!response) {
          console.error(`[process-news-ai] No AI service available for article ${article.id}`);
          continue;
        }

        if (!response.ok) {
          console.error(`OpenAI API error for article ${article.id}:`, response.status);
          continue;
        }

        const aiData = await response.json();
        const aiContent = aiData.choices[0]?.message?.content;

        if (!aiContent) {
          console.error(`No AI content for article ${article.id}`);
          continue;
        }

        // Parse AI response
        let parsed;
        try {
          // Extract JSON from response (in case there's extra text)
          const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            parsed = JSON.parse(jsonMatch[0]);
          } else {
            throw new Error('No JSON found in response');
          }
        } catch (parseError) {
          console.error(`Error parsing AI response for article ${article.id}:`, parseError);
          console.error(`Raw AI response: ${aiContent.substring(0, 500)}`);
          continue;
        }

        const relevanceScore = parsed.relevance_score ?? 0;
        const isRelevant = parsed.is_ma_deal && relevanceScore >= 5;

        // If not a relevant M&A deal, mark as processed but soft-delete
        if (!isRelevant) {
          console.log(`⏭️ Descartando (score: ${relevanceScore}): "${article.title.substring(0, 50)}..."`);
          console.log(`   Razón: ${parsed.rejection_reason || 'No es operación de M&A'}`);

          const { error: discardError } = await supabase
            .from('news_articles')
            .update({
              is_processed: true,
              is_deleted: true,
              processed_at: new Date().toISOString(),
              relevance_score: relevanceScore,
              rejection_reason: parsed.rejection_reason || 'No cumple criterios de relevancia',
              ai_metadata: {
                is_ma_deal: parsed.is_ma_deal,
                original_analysis: parsed
              }
            })
            .eq('id', article.id);

          if (!discardError) {
            discardedCount++;
          }
          continue;
        }

        // Update article with AI-processed content for relevant deals
        console.log(`✅ Operación relevante (score: ${relevanceScore}): ${parsed.deal_type || 'M&A'}`);
        if (parsed.buyer) console.log(`   Comprador: ${parsed.buyer}`);
        if (parsed.target_company) console.log(`   Target: ${parsed.target_company}`);
        if (parsed.deal_value) console.log(`   Valor: ${parsed.deal_value}`);

        const { error: updateError } = await supabase
          .from('news_articles')
          .update({
            title: parsed.seo_title || article.title,
            excerpt: parsed.excerpt || article.excerpt,
            content: parsed.summary || article.content,
            category: parsed.category || 'M&A',
            tags: parsed.tags || [],
            deal_type: parsed.deal_type,
            buyer: parsed.buyer,
            seller: parsed.seller,
            target_company: parsed.target_company,
            deal_value: parsed.deal_value,
            relevance_score: relevanceScore,
            ai_metadata: {
              is_ma_deal: true,
              original_analysis: parsed
            },
            is_processed: true,
            processed_at: new Date().toISOString()
          })
          .eq('id', article.id);

        if (updateError) {
          console.error(`Error updating article ${article.id}:`, updateError);
        } else {
          processedCount++;
          console.log(`Successfully processed article: ${article.id}`);
        }

      } catch (error) {
        console.error(`Error processing article ${article.id}:`, error);
      }
    }

    console.log(`\n📊 Finished processing:`);
    console.log(`   ✅ Relevant deals: ${processedCount}`);
    console.log(`   ⏭️ Discarded: ${discardedCount}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Processed ${processedCount} relevant deals, discarded ${discardedCount}`,
        processed: processedCount,
        discarded: discardedCount
      }),
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
