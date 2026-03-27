import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";
import { Resend } from "https://esm.sh/resend@4.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify caller
    const anonClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: claimsData, error: claimsError } = await anonClient.auth.getClaims(
      authHeader.replace("Bearer ", "")
    );
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const {
      lead_id,
      lead_name,
      company,
      phone,
      email: leadEmail,
      assigned_to_user_id,
      assigned_to_email,
      assigned_to_name,
      assigned_by_name,
    } = body;

    if (!lead_id || !assigned_to_user_id) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 1. Insert in-app notification
    const { error: notifError } = await supabase
      .from("admin_notifications")
      .insert({
        type: "lead_assignment",
        title: "Te han asignado un nuevo lead",
        message: `${lead_name || "Sin nombre"} — ${company || "Sin empresa"}`,
        metadata: {
          lead_id,
          lead_name,
          company,
          phone,
          email: leadEmail,
          assigned_by: assigned_by_name,
        },
        target_user_id: assigned_to_user_id,
        is_read: false,
      });

    if (notifError) {
      console.error("[notify-lead-assignment] DB insert error:", notifError);
    }

    // 2. Send email via Resend
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    let emailSent = false;

    if (resendApiKey && assigned_to_email) {
      try {
        const resend = new Resend(resendApiKey);
        const crmLink = `https://webcapittal.lovable.app/admin/leads-pipeline`;

        const htmlContent = `
          <div style="font-family: 'Plus Jakarta Sans', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
            <h2 style="color: #0f172a; margin-bottom: 16px;">📋 Nuevo lead asignado</h2>
            <p style="color: #475569; margin-bottom: 20px;">
              Hola <strong>${assigned_to_name || "equipo"}</strong>, se te ha asignado un nuevo lead${assigned_by_name ? ` por <strong>${assigned_by_name}</strong>` : ""}.
            </p>
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr><td style="padding: 6px 0; color: #64748b; font-size: 13px;">Nombre</td><td style="padding: 6px 0; font-weight: 600; color: #0f172a;">${lead_name || "—"}</td></tr>
                <tr><td style="padding: 6px 0; color: #64748b; font-size: 13px;">Empresa</td><td style="padding: 6px 0; font-weight: 600; color: #0f172a;">${company || "—"}</td></tr>
                ${phone ? `<tr><td style="padding: 6px 0; color: #64748b; font-size: 13px;">Teléfono</td><td style="padding: 6px 0; color: #0f172a;"><a href="tel:${phone}" style="color: #3b82f6;">${phone}</a></td></tr>` : ""}
                ${leadEmail ? `<tr><td style="padding: 6px 0; color: #64748b; font-size: 13px;">Email</td><td style="padding: 6px 0; color: #0f172a;"><a href="mailto:${leadEmail}" style="color: #3b82f6;">${leadEmail}</a></td></tr>` : ""}
              </table>
            </div>
            <a href="${crmLink}" style="display: inline-block; background: #0f172a; color: white; padding: 10px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 14px;">
              Ver en Pipeline →
            </a>
            <p style="color: #94a3b8; font-size: 12px; margin-top: 24px;">
              Este email fue enviado automáticamente por el sistema de Capittal.
            </p>
          </div>
        `;

        await resend.emails.send({
          from: "Capittal <samuel@capittal.es>",
          to: [assigned_to_email],
          replyTo: "samuel@capittal.es",
          subject: `📋 Nuevo lead asignado: ${lead_name || company || "Lead"}`,
          html: htmlContent,
        });

        emailSent = true;
        console.log(`[notify-lead-assignment] Email sent to ${assigned_to_email}`);
      } catch (emailError) {
        console.error("[notify-lead-assignment] Email error:", emailError);
      }
    } else {
      console.log("[notify-lead-assignment] Skipping email: no RESEND_API_KEY or no email");
    }

    return new Response(
      JSON.stringify({ success: true, notification_created: !notifError, email_sent: emailSent }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[notify-lead-assignment] Error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
