import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    let body: TranslateRequest = {};
    try {
      body = await req.json();
    } catch {
      // Empty body is fine, use defaults
    }

    const { operation_id, limit = 10, target_language = 'en' } = body;

    console.log(`Starting translation: language=${target_language}, limit=${limit}, operation_id=${operation_id || 'all'}`);

    // Build query for operations needing translation
    let query = supabase
      .from('company_operations')
      .select('id, description, short_description, highlights, description_en, highlights_en')
      .eq('is_active', true);

    if (operation_id) {
      query = query.eq('id', operation_id);
    } else {
      // Get operations without English translations
      if (target_language === 'en') {
        query = query.is('description_en', null);
      } else {
        query = query.is('description_ca', null);
      }
      query = query.limit(limit);
    }

    const { data: operations, error: fetchError } = await query;

    if (fetchError) {
      throw new Error(`Failed to fetch operations: ${fetchError.message}`);
    }

    if (!operations || operations.length === 0) {
      return new Response(JSON.stringify({
        success: true,
        message: 'No operations need translation',
        translated: 0
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log(`Found ${operations.length} operations to translate`);

    const results: { id: string; success: boolean; error?: string }[] = [];

    for (const op of operations) {
      try {
        // Skip if no content to translate
        if (!op.description && !op.short_description && (!op.highlights || op.highlights.length === 0)) {
          console.log(`Skipping operation ${op.id}: no content`);
          results.push({ id: op.id, success: true });
          continue;
        }

        const systemPrompt = target_language === 'en' 
          ? `You are a professional translator specializing in M&A (Mergers & Acquisitions) content.
Translate the following Spanish company descriptions to English.
Maintain a professional business tone and accurate M&A terminology.
Keep company/project code names (like "Proyecto X") as-is.
You MUST respond with ONLY valid JSON, no markdown, no explanation.
Return JSON format: {"description": "...", "short_description": "...", "highlights": ["...", "..."]}`
          : `You are a professional translator specializing in M&A (Mergers & Acquisitions) content.
Translate the following Spanish company descriptions to Catalan.
Maintain a professional business tone and accurate M&A terminology.
Keep company/project code names (like "Proyecto X") as-is.
You MUST respond with ONLY valid JSON, no markdown, no explanation.
Return JSON format: {"description": "...", "short_description": "...", "highlights": ["...", "..."]}`;

        const userContent = JSON.stringify({
          description: op.description || '',
          short_description: op.short_description || '',
          highlights: op.highlights || []
        });

        console.log(`Translating operation ${op.id}...`);

        const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${LOVABLE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'google/gemini-3-flash-preview',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userContent }
            ],
            temperature: 0.3,
            max_tokens: 2000,
          }),
        });

        if (!aiResponse.ok) {
          const errorText = await aiResponse.text();
          console.error(`AI error for ${op.id}:`, aiResponse.status, errorText);
          
          if (aiResponse.status === 429) {
            results.push({ id: op.id, success: false, error: 'Rate limited - try again later' });
            // Wait a bit before continuing
            await new Promise(r => setTimeout(r, 2000));
            continue;
          }
          
          results.push({ id: op.id, success: false, error: `AI error: ${aiResponse.status}` });
          continue;
        }

        const aiData = await aiResponse.json();
        const content = aiData.choices?.[0]?.message?.content;

        if (!content) {
          console.error(`No content in AI response for ${op.id}`);
          results.push({ id: op.id, success: false, error: 'No AI response content' });
          continue;
        }

        // Parse the JSON response - handle potential markdown wrapping
        let translated: TranslatedContent;
        try {
          let jsonContent = content.trim();
          // Remove markdown code block if present
          if (jsonContent.startsWith('```')) {
            jsonContent = jsonContent.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
          }
          translated = JSON.parse(jsonContent);
        } catch (parseError) {
          console.error(`JSON parse error for ${op.id}:`, parseError, 'Content:', content);
          results.push({ id: op.id, success: false, error: 'Failed to parse AI response' });
          continue;
        }

        // Update the database
        const updateData = target_language === 'en' 
          ? {
              description_en: translated.description || null,
              short_description_en: translated.short_description || null,
              highlights_en: translated.highlights?.length > 0 ? translated.highlights : null
            }
          : {
              description_ca: translated.description || null,
              short_description_ca: translated.short_description || null,
              highlights_ca: translated.highlights?.length > 0 ? translated.highlights : null
            };

        const { error: updateError } = await supabase
          .from('company_operations')
          .update(updateData)
          .eq('id', op.id);

        if (updateError) {
          console.error(`Update error for ${op.id}:`, updateError);
          results.push({ id: op.id, success: false, error: updateError.message });
          continue;
        }

        console.log(`Successfully translated operation ${op.id}`);
        results.push({ id: op.id, success: true });

        // Small delay to avoid rate limiting
        await new Promise(r => setTimeout(r, 500));

      } catch (opError) {
        console.error(`Error processing operation ${op.id}:`, opError);
        results.push({ id: op.id, success: false, error: String(opError) });
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failedCount = results.filter(r => !r.success).length;

    console.log(`Translation complete: ${successCount} success, ${failedCount} failed`);

    return new Response(JSON.stringify({
      success: true,
      message: `Translated ${successCount} operations`,
      translated: successCount,
      failed: failedCount,
      details: results
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Translation error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
