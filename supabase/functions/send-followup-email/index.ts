/**
 * Send Follow-up Email Edge Function
 * Sends a follow-up email after failed call attempts
 */

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY") as string);

const supabaseUrl = Deno.env.get('SUPABASE_URL') as string;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SendFollowupEmailRequest {
  leadId: string;
  contactName: string;
  companyName: string;
  email: string;
  senderName?: string;
  senderTitle?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload: SendFollowupEmailRequest = await req.json();
    const { leadId, contactName, companyName, email, senderName = "Samuel Navarro", senderTitle = "M&A Advisor" } = payload;

    console.log(`[send-followup-email] Processing lead: ${leadId}, email: ${email}`);

    if (!leadId || !email) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing required fields: leadId and email" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Check current followup count
    const { data: lead, error: leadError } = await supabase
      .from('company_valuations')
      .select('followup_count, call_attempts_count')
      .eq('id', leadId)
      .single();

    if (leadError) {
      console.error('[send-followup-email] Error fetching lead:', leadError);
      return new Response(
        JSON.stringify({ success: false, error: "Lead not found" }),
        { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const currentFollowupCount = lead?.followup_count || 0;
    const callAttempts = lead?.call_attempts_count || 0;

    // Limit to 2 follow-up emails
    if (currentFollowupCount >= 2) {
      return new Response(
        JSON.stringify({ success: false, error: "Maximum follow-up emails reached (2)" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const subject = `Capittal - ¿Cuándo te viene mejor?`;
    const saludo = contactName ? `Hola ${contactName},` : 'Hola,';

    const htmlEmail = `
      <div style="font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background:#f8fafc;">
        <div style="background:#ffffff; border:1px solid #e5e7eb; border-radius:10px; padding:32px; color:#111827;">
          <p style="margin:0 0 16px; font-size:16px;">${saludo}</p>
          
          <p style="margin:0 0 16px; line-height:1.6;">
            Hemos intentado contactarte${callAttempts > 1 ? ` en ${callAttempts} ocasiones` : ''} para comentar la valoración de <strong>${companyName}</strong>, pero no hemos podido localizarte.
          </p>
          
          <p style="margin:0 0 16px; line-height:1.6;">
            Entendemos que tienes una agenda ocupada. <strong>¿Cuándo te vendría mejor que te llamásemos?</strong>
          </p>
          
          <p style="margin:0 0 16px; line-height:1.6;">
            También puedes responder a este email con cualquier pregunta que tengas sobre el informe.
          </p>
          
          <div style="border-top:1px solid #e5e7eb; padding-top:20px; margin-top:24px;">
            <p style="margin:0 0 8px; font-size:16px;">Un saludo,</p>
            <p style="margin:0 0 4px; font-weight:600; color:#1f2937;">${senderName}</p>
            <p style="margin:0 0 20px; font-size:14px; color:#6b7280;">${senderTitle} · Capittal</p>
          </div>
          
          <div style="background:#f3f4f6; border-radius:6px; padding:12px; margin-top:16px;">
            <p style="margin:0; font-size:12px; color:#6b7280;">
              📞 +34 93 123 45 67 · 📧 info@capittal.es · 🌐 capittal.es
            </p>
          </div>
        </div>
      </div>
    `;

    const textEmail = `${saludo}\n\n` +
      `Hemos intentado contactarte${callAttempts > 1 ? ` en ${callAttempts} ocasiones` : ''} para comentar la valoración de ${companyName}, pero no hemos podido localizarte.\n\n` +
      `Entendemos que tienes una agenda ocupada. ¿Cuándo te vendría mejor que te llamásemos?\n\n` +
      `También puedes responder a este email con cualquier pregunta que tengas sobre el informe.\n\n` +
      `Un saludo,\n${senderName}\n${senderTitle} · Capittal`;

    // Generate unique message ID for tracking
    const messageId = `followup_${leadId}_${currentFollowupCount + 1}_${Date.now()}`;

    // Create tracking pixel URL
    const trackingPixelUrl = `https://fwhqtzkkvnjkazhaficj.supabase.co/functions/v1/email-open?mid=${messageId}`;

    // Add tracking pixel to HTML
    const htmlWithTracking = htmlEmail.replace(
      '</div></div>',
      `<img src="${trackingPixelUrl}" width="1" height="1" style="display:none" alt="" /></div></div>`
    );

    // Send email
    const emailResponse = await resend.emails.send({
      from: "Capittal <samuel@capittal.es>",
      to: [email],
      subject,
      html: htmlWithTracking,
      text: textEmail,
      reply_to: "samuel@capittal.es",
      headers: {
        "List-Unsubscribe": "<mailto:samuel@capittal.es?subject=unsubscribe>",
      },
    });

    console.log('[send-followup-email] Email sent:', emailResponse);

    // Update lead record
    const { error: updateError } = await supabase
      .from('company_valuations')
      .update({
        followup_count: currentFollowupCount + 1,
        email_message_id: messageId,
      })
      .eq('id', leadId);

    if (updateError) {
      console.error('[send-followup-email] Error updating lead:', updateError);
    }

    // Add activity log
    await supabase.from('lead_activities').insert({
      lead_id: leadId,
      lead_type: 'valuation',
      activity_type: 'email_followup_sent',
      description: `Email de seguimiento ${currentFollowupCount + 1} enviado a ${email}`,
      metadata: {
        email_id: emailResponse?.data?.id,
        message_id: messageId,
        followup_number: currentFollowupCount + 1,
        subject,
      },
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        emailId: emailResponse?.data?.id,
        messageId,
        followupNumber: currentFollowupCount + 1
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("[send-followup-email] Error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error?.message || "Unknown error" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
