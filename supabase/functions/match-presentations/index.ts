import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "LOVABLE_API_KEY not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { extractedName, companies } = await req.json();

    if (!extractedName || !companies?.length) {
      return new Response(JSON.stringify({ company_id: null, confidence: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const companiesList = companies
      .map((c: { id: string; name: string; cif: string }) => `- ID: ${c.id} | Nombre: ${c.name} | CIF: ${c.cif}`)
      .join("\n");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content:
              "You are a company name matcher. Given a filename-derived company name and a list of companies, find the best match. Consider abbreviations, word reordering, missing legal suffixes (SL, SA, SLU), underscores vs spaces, and partial matches. Use the match_company tool to return your answer.",
          },
          {
            role: "user",
            content: `Filename-derived name: "${extractedName}"\n\nCompanies:\n${companiesList}`,
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "match_company",
              description: "Return the best matching company ID and confidence score",
              parameters: {
                type: "object",
                properties: {
                  company_id: {
                    type: "string",
                    description: "UUID of the matched company, or null if no match",
                    nullable: true,
                  },
                  confidence: {
                    type: "number",
                    description: "Confidence score between 0 and 1",
                  },
                },
                required: ["company_id", "confidence"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "match_company" } },
      }),
    });

    if (!response.ok) {
      const status = response.status;
      const body = await response.text();
      console.error(`AI gateway error [${status}]:`, body);

      if (status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (status === 402) {
        return new Response(JSON.stringify({ error: "Payment required" }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];

    if (!toolCall?.function?.arguments) {
      console.error("No tool call in response:", JSON.stringify(data));
      return new Response(JSON.stringify({ company_id: null, confidence: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let result;
    try {
      result = JSON.parse(toolCall.function.arguments);
    } catch {
      console.error("Failed to parse tool call arguments:", toolCall.function.arguments);
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
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
