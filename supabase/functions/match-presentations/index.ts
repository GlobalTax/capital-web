import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { callAI, extractToolCallArgs, aiErrorResponse } from "../_shared/ai-helper.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { extractedName, companies } = await req.json();

    if (!extractedName || !companies?.length) {
      return new Response(JSON.stringify({ company_id: null, confidence: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const companiesList = companies
      .map((c: { id: string; name: string; cif: string }) => `- ID: ${c.id} | Nombre: ${c.name} | CIF: ${c.cif}`)
      .join("\n");

    let aiResponse;
    try {
      aiResponse = await callAI(
        [
          {
            role: "system",
            content: "You are a company name matcher. Given a filename-derived company name and a list of companies, find the best match. Consider abbreviations, word reordering, missing legal suffixes (SL, SA, SLU), underscores vs spaces, and partial matches. Use the match_company tool to return your answer.",
          },
          {
            role: "user",
            content: `Filename-derived name: "${extractedName}"\n\nCompanies:\n${companiesList}`,
          },
        ],
        {
          model: "google/gemini-3-flash-preview",
          functionName: "match-presentations",
          tools: [
            {
              type: "function",
              function: {
                name: "match_company",
                description: "Return the best matching company ID and confidence score",
                parameters: {
                  type: "object",
                  properties: {
                    company_id: { type: "string", description: "UUID of the matched company, or null if no match" },
                    confidence: { type: "number", description: "Confidence score between 0 and 1" },
                  },
                  required: ["company_id", "confidence"],
                  additionalProperties: false,
                },
              },
            },
          ],
          tool_choice: { type: "function", function: { name: "match_company" } },
        }
      );
    } catch (error) {
      return aiErrorResponse(error, corsHeaders);
    }

    const result = extractToolCallArgs<{ company_id: string | null; confidence: number }>(aiResponse);

    if (!result) {
      console.error("No tool call in response");
      return new Response(JSON.stringify({ company_id: null, confidence: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate company_id is in the provided list
    const validIds = new Set(companies.map((c: { id: string }) => c.id));
    if (result.company_id && !validIds.has(result.company_id)) {
      console.warn(`AI returned invalid company_id: ${result.company_id}`);
      result.company_id = null;
      result.confidence = 0;
    }

    return new Response(JSON.stringify({
      company_id: result.company_id || null,
      confidence: Math.round((result.confidence || 0) * 100) / 100,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("match-presentations error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
