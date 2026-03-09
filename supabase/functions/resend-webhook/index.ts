import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
    const body = await req.json();
    const { type, data } = body;

    if (!type || !data) {
      return new Response(JSON.stringify({ error: "Invalid webhook payload" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const emailId = data.email_id; // Resend message ID
    if (!emailId) {
      console.warn("[resend-webhook] No email_id in payload");
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    const now = new Date().toISOString();

    // Map Resend event types to our delivery_status
    const statusMap: Record<string, string> = {
      "email.delivered": "delivered",
      "email.opened": "opened",
      "email.bounced": "bounced",
      "email.complained": "complained",
      "email.delivery_delayed": "delayed",
    };

    const deliveryStatus = statusMap[type];
    if (!deliveryStatus) {
      console.log(`[resend-webhook] Ignoring event type: ${type}`);
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`[resend-webhook] Processing ${type} for ${emailId}`);

    const tables = ["campaign_emails", "campaign_followup_sends"];

    for (const table of tables) {
      const updateData: Record<string, any> = { delivery_status: deliveryStatus };

      // For open events, also set email_opened
      if (type === "email.opened") {
        updateData.email_opened = true;
        updateData.email_opened_at = now;
      }

      const { error } = await supabase
        .from(table)
        .update(updateData)
        .eq("email_message_id", emailId);

      if (error) {
        console.error(`[resend-webhook] Error updating ${table}:`, error);
      }
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("[resend-webhook] Error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
