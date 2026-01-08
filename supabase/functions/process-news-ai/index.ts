import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    if (!openAIApiKey) {
      console.error('OPENAI_API_KEY not configured');
      return new Response(
        JSON.stringify({ success: false, error: 'OpenAI API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get unprocessed news articles
    const { data: unprocessedNews, error: fetchError } = await supabase
      .from('news_articles')
      .select('*')
      .eq('is_processed', false)
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

    for (const article of unprocessedNews) {
      try {
        console.log(`Processing article: ${article.title}`);

        const prompt = `Analiza la siguiente noticia del sector M&A español y genera:
1. Un título SEO-friendly (máximo 70 caracteres)
2. Un extracto/resumen (máximo 160 caracteres) 
3. Un resumen más extenso (150-200 palabras)
4. Categoría: elegir entre "M&A", "Private Equity", "Venture Capital", "Due Diligence", "Valoración", "Reestructuración", "Fiscal"
5. Tags relevantes (máximo 5, separados por coma)

Noticia original:
Título: ${article.title}
Contenido: ${article.content?.substring(0, 3000)}

Responde SOLO en formato JSON con esta estructura exacta:
{
  "seo_title": "...",
  "excerpt": "...",
  "summary": "...",
  "category": "...",
  "tags": ["tag1", "tag2", ...]
}`;

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
                content: 'Eres un experto en M&A y comunicación corporativa. Generas contenido SEO optimizado para noticias del sector de fusiones y adquisiciones en España. Responde siempre en JSON válido.' 
              },
              { role: 'user', content: prompt }
            ],
            temperature: 0.7,
            max_tokens: 1000,
          }),
        });

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
          continue;
        }

        // Update article with AI-processed content
        const { error: updateError } = await supabase
          .from('news_articles')
          .update({
            title: parsed.seo_title || article.title,
            excerpt: parsed.excerpt || article.excerpt,
            content: parsed.summary || article.content,
            category: parsed.category || 'M&A',
            tags: parsed.tags || [],
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

    console.log(`Finished processing. Total processed: ${processedCount}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Processed ${processedCount} articles with AI`,
        processed: processedCount
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
