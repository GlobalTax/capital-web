import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

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
    const { image_base64 } = await req.json().catch(() => {
      throw new Error("Invalid JSON body");
    });

    if (!image_base64) {
      return new Response(
        JSON.stringify({ error: "image_base64 is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 1. Upload image to storage
    const imageId = crypto.randomUUID();
    const imageBytes = Uint8Array.from(atob(image_base64.replace(/^data:image\/\w+;base64,/, "")), (c) => c.charCodeAt(0));
    const ext = image_base64.startsWith("data:image/png") ? "png" : "jpg";
    const imagePath = `deals/${imageId}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("dealsuite-images")
      .upload(imagePath, imageBytes, { contentType: `image/${ext}`, upsert: true });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      // Continue anyway - extraction is more important than storage
    }

    const { data: publicUrlData } = supabase.storage
      .from("dealsuite-images")
      .getPublicUrl(imagePath);

    const imageUrl = publicUrlData?.publicUrl || null;

    // 2. Call Lovable AI with vision to extract deal data
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are a data extraction specialist. Extract structured deal information from Dealsuite marketplace screenshots. 
Extract ALL visible fields. For financial values, extract only numbers (no currency symbols). 
If a field is not visible, set it to null. Be precise with names, emails, and references.
The deals are typically "Wanted" listings - companies looking to acquire businesses.`,
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Extract all deal information from this Dealsuite screenshot. Use the extract_deal tool to return the structured data.",
              },
              {
                type: "image_url",
                image_url: { url: `data:image/${ext};base64,${image_base64.replace(/^data:image\/\w+;base64,/, "")}` },
              },
            ],
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "extract_deal",
              description: "Extract structured deal data from a Dealsuite screenshot",
              parameters: {
                type: "object",
                properties: {
                  title: { type: "string", description: "Deal title" },
                  deal_type: { type: "string", description: "Type of deal (e.g. Complete Sale, Majority Stake)" },
                  sector: { type: "string", description: "Business sector(s), comma separated" },
                  country: { type: "string", description: "Country or region" },
                  location: { type: "string", description: "Specific location or regions mentioned" },
                  description: { type: "string", description: "Full deal description text" },
                  revenue_min: { type: "number", description: "Minimum revenue in euros" },
                  revenue_max: { type: "number", description: "Maximum revenue in euros" },
                  ebitda_min: { type: "number", description: "Minimum EBITDA in euros" },
                  ebitda_max: { type: "number", description: "Maximum EBITDA in euros" },
                  stake_offered: { type: "string", description: "Stake percentage offered" },
                  customer_types: { type: "string", description: "Customer types (B2B, B2C, etc.)" },
                  reference: { type: "string", description: "Deal reference code" },
                  advisor: { type: "string", description: "Advisor name and company" },
                  contact_name: { type: "string", description: "Contact person name" },
                  contact_email: { type: "string", description: "Contact email address" },
                  contact_company: { type: "string", description: "Contact company name" },
                  published_at: { type: "string", description: "Publication date (ISO format if possible, e.g. 2026-02-06)" },
                },
                required: ["title"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "extract_deal" } },
      }),
    });

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      console.error("AI error:", aiResponse.status, errText);

      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Try again in a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Add credits in workspace settings." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI gateway error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];

    if (!toolCall?.function?.arguments) {
      throw new Error("AI did not return structured data");
    }

    const extracted = JSON.parse(toolCall.function.arguments);

    // Add image_url to extracted data
    extracted.image_url = imageUrl;

    return new Response(
      JSON.stringify({ success: true, data: extracted }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("dealsuite-extract-image error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
