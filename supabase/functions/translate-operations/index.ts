import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { callAI, parseAIJson, aiErrorResponse } from "../_shared/ai-helper.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TranslateRequest {
  operation_id?: string;
  limit?: number;
  target_language?: 'en' | 'ca';
}

interface TranslatedContent {
  description: string;
  short_description: string;
  highlights: string[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    let body: TranslateRequest = {};
    try { body = await req.json(); } catch { /* Empty body is fine */ }

    const { operation_id, limit = 10, target_language = 'en' } = body;
    console.log(`Starting translation: language=${target_language}, limit=${limit}, operation_id=${operation_id || 'all'}`);

    let query = supabase
      .from('company_operations')
      .select('id, description, short_description, highlights, description_en, highlights_en')
      .eq('is_active', true);

    if (operation_id) {
      query = query.eq('id', operation_id);
    } else {
      if (target_language === 'en') {
        query = query.is('description_en', null);
      } else {
        query = query.is('description_ca', null);
      }
      query = query.limit(limit);
    }

    const { data: operations, error: fetchError } = await query;
    if (fetchError) throw new Error(`Failed to fetch operations: ${fetchError.message}`);

    if (!operations || operations.length === 0) {
      return new Response(JSON.stringify({ success: true, message: 'No operations need translation', translated: 0 }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log(`Found ${operations.length} operations to translate`);
    const results: { id: string; success: boolean; error?: string }[] = [];

    for (const op of operations) {
      try {
        if (!op.description && !op.short_description && (!op.highlights || op.highlights.length === 0)) {
          results.push({ id: op.id, success: true });
          continue;
        }

        const systemPrompt = target_language === 'en'
          ? `You are a professional translator specializing in M&A content. Translate Spanish to English. Keep code names as-is. Respond with ONLY valid JSON: {"description": "...", "short_description": "...", "highlights": ["..."]}`
          : `You are a professional translator specializing in M&A content. Translate Spanish to Catalan. Keep code names as-is. Respond with ONLY valid JSON: {"description": "...", "short_description": "...", "highlights": ["..."]}`;

        const userContent = JSON.stringify({
          description: op.description || '',
          short_description: op.short_description || '',
          highlights: op.highlights || []
        });

        console.log(`Translating operation ${op.id}...`);

        let aiResponse;
        try {
          aiResponse = await callAI(
            [{ role: 'system', content: systemPrompt }, { role: 'user', content: userContent }],
            { model: 'google/gemini-3-flash-preview', temperature: 0.3, maxTokens: 2000, functionName: 'translate-operations' }
          );
        } catch (error) {
          const msg = String(error);
          if (msg.includes('RATE_LIMITED')) {
            results.push({ id: op.id, success: false, error: 'Rate limited - try again later' });
            await new Promise(r => setTimeout(r, 2000));
            continue;
          }
          results.push({ id: op.id, success: false, error: `AI error: ${msg}` });
          continue;
        }

        let translated: TranslatedContent;
        try {
          translated = parseAIJson(aiResponse.content);
        } catch (parseError) {
          console.error(`JSON parse error for ${op.id}:`, parseError);
          results.push({ id: op.id, success: false, error: 'Failed to parse AI response' });
          continue;
        }

        const updateData = target_language === 'en'
          ? { description_en: translated.description || null, short_description_en: translated.short_description || null, highlights_en: translated.highlights?.length > 0 ? translated.highlights : null }
          : { description_ca: translated.description || null, short_description_ca: translated.short_description || null, highlights_ca: translated.highlights?.length > 0 ? translated.highlights : null };

        const { error: updateError } = await supabase.from('company_operations').update(updateData).eq('id', op.id);
        if (updateError) {
          results.push({ id: op.id, success: false, error: updateError.message });
          continue;
        }

        console.log(`Successfully translated operation ${op.id}`);
        results.push({ id: op.id, success: true });
        await new Promise(r => setTimeout(r, 500));

      } catch (opError) {
        results.push({ id: op.id, success: false, error: String(opError) });
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failedCount = results.filter(r => !r.success).length;
    console.log(`Translation complete: ${successCount} success, ${failedCount} failed`);

    return new Response(JSON.stringify({ success: true, message: `Translated ${successCount} operations`, translated: successCount, failed: failedCount, details: results }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Translation error:', error);
    return new Response(JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
