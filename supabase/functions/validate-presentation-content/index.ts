import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface SlideContent {
  slide_index: number;
  slide_type: string;
  layout: string;
  headline: string;
  subline?: string;
  bullets?: string[];
  stats?: Array<{ label: string; value: string }>;
}

interface SlideIssue {
  slide_index: number;
  issue_type: 'constraint_violation' | 'risky_claim' | 'terminology' | 'text_density' | 'invented_data';
  severity: 'low' | 'medium' | 'high';
  description: string;
  field: string;
  current_value?: string;
}

interface ValidationReport {
  overall_quality_score: number;
  issues_per_slide: Record<number, SlideIssue[]>;
  suggested_fixes: Array<{
    slide_index: number;
    field: string;
    original: string;
    suggested: string;
  }>;
  risk_flags: Array<{
    slide_index: number;
    risk_type: string;
    description: string;
    recommendation: string;
  }>;
  summary: {
    total_issues: number;
    high_severity: number;
    medium_severity: number;
    low_severity: number;
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    let body;
    try {
      body = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid JSON body' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { slides, inputs } = body;

    if (!slides || !Array.isArray(slides)) {
      return new Response(
        JSON.stringify({ success: false, error: 'slides array is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const systemPrompt = `You are a senior M&A compliance officer validating confidential investment banking presentations.

Your task is to audit presentation slides for quality, accuracy, and regulatory compliance.

VALIDATION CRITERIA:

1. COPY CONSTRAINTS:
   - Headlines must be ≤10 words
   - Bullets must be ≤12 words each
   - Maximum 5 bullets per slide
   - No marketing superlatives ("best", "leading", "exceptional", "unique")

2. RISKY CLAIMS:
   - Forward-looking statements without qualifiers
   - Revenue/growth projections presented as facts
   - Comparative claims without substantiation
   - Guarantees or promises of performance

3. TERMINOLOGY CONSISTENCY:
   - Same concepts should use identical terms throughout
   - Financial metrics should be labeled consistently
   - Company name variations should be avoided

4. TEXT DENSITY:
   - Slides with >5 bullets are too dense
   - Individual bullets with complex nested ideas
   - Paragraphs disguised as bullets

5. INVENTED/IMPLIED DATA:
   - Statistics not present in provided inputs
   - Specific percentages without source
   - Client names or logos not provided
   - Market size claims without substantiation

SCORING GUIDE:
- 10: Perfect compliance, no issues
- 8-9: Minor issues, easily fixable
- 6-7: Several issues requiring attention
- 4-5: Significant problems, needs rework
- 1-3: Major compliance failures

You MUST return valid JSON only matching the exact schema provided.`;

    const userPrompt = `Validate these M&A presentation slides:

SLIDES:
${JSON.stringify(slides, null, 2)}

ORIGINAL INPUTS (source of truth):
${JSON.stringify(inputs || {}, null, 2)}

Return a JSON validation report with this EXACT structure:
{
  "overall_quality_score": <number 1-10>,
  "issues_per_slide": {
    "<slide_index>": [
      {
        "slide_index": <number>,
        "issue_type": "<constraint_violation|risky_claim|terminology|text_density|invented_data>",
        "severity": "<low|medium|high>",
        "description": "<specific issue description>",
        "field": "<headline|subline|bullets|stats>",
        "current_value": "<the problematic text>"
      }
    ]
  },
  "suggested_fixes": [
    {
      "slide_index": <number>,
      "field": "<field name>",
      "original": "<original text>",
      "suggested": "<improved text>"
    }
  ],
  "risk_flags": [
    {
      "slide_index": <number>,
      "risk_type": "<legal|regulatory|reputational|factual>",
      "description": "<risk description>",
      "recommendation": "<mitigation action>"
    }
  ],
  "summary": {
    "total_issues": <number>,
    "high_severity": <number>,
    "medium_severity": <number>,
    "low_severity": <number>
  }
}

Return JSON only, no markdown, no explanation.`;

    console.log('Validating presentation content with Lovable AI...');

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.2,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Lovable AI error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ success: false, error: 'Rate limit exceeded. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ success: false, error: 'AI service quota exceeded.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      throw new Error(`AI service error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No content received from AI');
    }

    // Parse the JSON response
    let validationReport: ValidationReport;
    try {
      const cleanedContent = content
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      
      validationReport = JSON.parse(cleanedContent);
    } catch (parseError) {
      console.error('Failed to parse AI response:', content);
      throw new Error('Failed to parse validation report');
    }

    // Ensure required fields exist
    validationReport = {
      overall_quality_score: validationReport.overall_quality_score ?? 5,
      issues_per_slide: validationReport.issues_per_slide ?? {},
      suggested_fixes: validationReport.suggested_fixes ?? [],
      risk_flags: validationReport.risk_flags ?? [],
      summary: validationReport.summary ?? {
        total_issues: 0,
        high_severity: 0,
        medium_severity: 0,
        low_severity: 0
      }
    };

    console.log(`Validation complete. Score: ${validationReport.overall_quality_score}/10, Issues: ${validationReport.summary.total_issues}`);

    return new Response(
      JSON.stringify({ 
        success: true,
        report: validationReport 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error validating presentation:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error instanceof Error ? error.message : 'Failed to validate presentation content' 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
