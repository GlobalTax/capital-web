import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const transparentGifBase64 = "R0lGODlhAQABAPAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";

function base64ToU8(base64: string) {
  const bin = atob(base64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const messageId = url.searchParams.get("mid");

    // Always return the pixel, even if params are missing
    const pixelResponse = new Response(base64ToU8(transparentGifBase64), {
      headers: {
        "Content-Type": "image/gif",
        "Cache-Control": "no-store, max-age=0",
        ...corsHeaders,
      },
      status: 200,
    });

    if (!messageId) {
      console.warn("email-open: missing mid param");
      return pixelResponse;
    }

    // Validate message ID format to prevent enumeration attacks
    if (messageId.length > 200 || !/^[\w\-.<>@]+$/.test(messageId)) {
      console.warn("email-open: invalid mid format");
      return pixelResponse;
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL") as string;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string;
    const supabase = createClient(supabaseUrl, serviceKey);

    const tables = [
      "contact_leads",
      "company_valuations",
      "collaborator_applications",
    ];

    for (const table of tables) {
      const { error } = await supabase
        .from(table)
        .update({ email_opened: true, email_opened_at: new Date().toISOString() })
        .eq("email_message_id", messageId)
        .is("email_opened", false);
      if (error) console.error(`[email-open] update error on ${table}:`, error);
    }

    return pixelResponse;
  } catch (err) {
    console.error("email-open error:", err);
    return new Response(base64ToU8(transparentGifBase64), {
      headers: { "Content-Type": "image/gif", ...corsHeaders },
      status: 200,
    });
  }
});
