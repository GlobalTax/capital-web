import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { callAI, parseAIJson, aiErrorResponse } from "../_shared/ai-helper.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    let body;
    try { body = await req.json(); } catch {
      return new Response(JSON.stringify({ success: false, error: 'Invalid JSON body' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const { slides, inputs } = body;
    if (!slides || !Array.isArray(slides)) {
      return new Response(JSON.stringify({ success: false, error: 'slides array is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const systemPrompt = `You are a senior M&A compliance officer validating confidential investment banking presentations.

Your task is to audit presentation slides for quality, accuracy, and regulatory compliance.

VALIDATION CRITERIA:
1. COPY CONSTRAINTS: Headlines ≤10 words, Bullets ≤12 words each, Max 5 bullets, No marketing superlatives
2. RISKY CLAIMS: Forward-looking statements without qualifiers, Revenue projections as facts, Comparative claims without substantiation
3. TERMINOLOGY CONSISTENCY: Same concepts use identical terms throughout
4. TEXT DENSITY: Slides with >5 bullets, complex nested ideas
5. INVENTED/IMPLIED DATA: Statistics not in inputs, percentages without source

SCORING: 10=Perfect, 8-9=Minor, 6-7=Several issues, 4-5=Significant, 1-3=Major failures

Return valid JSON only.`;

    const userPrompt = `Validate these M&A presentation slides:

SLIDES:
${JSON.stringify(slides, null, 2)}

ORIGINAL INPUTS (source of truth):
${JSON.stringify(inputs || {}, null, 2)}

Return JSON: { "overall_quality_score": number, "issues_per_slide": {}, "suggested_fixes": [], "risk_flags": [], "summary": { "total_issues": number, "high_severity": number, "medium_severity": number, "low_severity": number } }`;

    console.log('Validating presentation content...');

    let aiResponse;
    try {
      aiResponse = await callAI(
        [{ role: 'system', content: systemPrompt }, { role: 'user', content: userPrompt }],
        { model: 'google/gemini-2.5-flash', temperature: 0.2, maxTokens: 4000, functionName: 'validate-presentation-content' }
      );
    } catch (error) {
      return aiErrorResponse(error, corsHeaders);
    }

    let validationReport;
    try {
      validationReport = parseAIJson(aiResponse.content);
    } catch {
      throw new Error('Failed to parse validation report');
    }

    validationReport = {
      overall_quality_score: validationReport.overall_quality_score ?? 5,
      issues_per_slide: validationReport.issues_per_slide ?? {},
      suggested_fixes: validationReport.suggested_fixes ?? [],
      risk_flags: validationReport.risk_flags ?? [],
      summary: validationReport.summary ?? { total_issues: 0, high_severity: 0, medium_severity: 0, low_severity: 0 }
    };

    console.log(`Validation complete. Score: ${validationReport.overall_quality_score}/10`);

    return new Response(
      JSON.stringify({ success: true, report: validationReport }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error validating presentation:', error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Failed to validate' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
