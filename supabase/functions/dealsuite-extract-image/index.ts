import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { callAI, extractToolCallArgs, aiErrorResponse } from "../_shared/ai-helper.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { image_base64 } = await req.json().catch(() => { throw new Error("Invalid JSON body"); });

    if (!image_base64) {
      return new Response(
        JSON.stringify({ error: "image_base64 is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Upload image to storage
    const imageId = crypto.randomUUID();
    const imageBytes = Uint8Array.from(atob(image_base64.replace(/^data:image\/\w+;base64,/, "")), (c) => c.charCodeAt(0));
    const ext = image_base64.startsWith("data:image/png") ? "png" : "jpg";
    const imagePath = `deals/${imageId}.${ext}`;

    await supabase.storage.from("dealsuite-images").upload(imagePath, imageBytes, { contentType: `image/${ext}`, upsert: true });

    const { data: publicUrlData } = supabase.storage.from("dealsuite-images").getPublicUrl(imagePath);
    const imageUrl = publicUrlData?.publicUrl || null;

    // Call AI with vision + tool calling
    const response = await callAI(
      [
        {
          role: "system",
          content: `You are a data extraction specialist. Extract structured deal information from Dealsuite marketplace screenshots. Extract ALL visible fields. For financial values, extract only numbers (no currency symbols). If a field is not visible, set it to null.`,
        },
        {
          role: "user",
          content: [
            { type: "text", text: "Extract all deal information from this Dealsuite screenshot." },
            { type: "image_url", image_url: { url: `data:image/${ext};base64,${image_base64.replace(/^data:image\/\w+;base64,/, "")}` } },
          ],
        },
      ],
      {
        functionName: 'dealsuite-extract-image',
        tools: [{
          type: "function",
          function: {
            name: "extract_deal",
            description: "Extract structured deal data from a Dealsuite screenshot",
            parameters: {
              type: "object",
              properties: {
                title: { type: "string" }, deal_type: { type: "string" }, sector: { type: "string" },
                country: { type: "string" }, location: { type: "string" }, description: { type: "string" },
                revenue_min: { type: "number" }, revenue_max: { type: "number" },
                ebitda_min: { type: "number" }, ebitda_max: { type: "number" },
                stake_offered: { type: "string" }, customer_types: { type: "string" },
                reference: { type: "string" }, advisor: { type: "string" },
                contact_name: { type: "string" }, contact_email: { type: "string" },
                contact_company: { type: "string" }, published_at: { type: "string" },
              },
              required: ["title"], additionalProperties: false,
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "extract_deal" } },
      }
    );

    const extracted = extractToolCallArgs<Record<string, unknown>>(response);
    if (!extracted) throw new Error("AI did not return structured data");

    extracted.image_url = imageUrl;

    return new Response(
      JSON.stringify({ success: true, data: extracted }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("dealsuite-extract-image error:", e);
    return aiErrorResponse(e, corsHeaders);
  }
});
