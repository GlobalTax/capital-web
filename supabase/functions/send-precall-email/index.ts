/**
 * Send Pre-Call Email Edge Function
 * Sends a personalized email before calling the lead
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

interface SendPrecallEmailRequest {
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
    const payload: SendPrecallEmailRequest = await req.json();
    const { leadId, contactName, companyName, email, senderName = "Samuel Navarro", senderTitle = "M&A Advisor" } = payload;

    console.log(`[send-precall-email] Processing lead: ${leadId}, email: ${email}`);

    if (!leadId || !email) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing required fields: leadId and email" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Check if precall email was already sent
    const { data: lead, error: leadError } = await supabase
      .from('company_valuations')
      .select('precall_email_sent')
      .eq('id', leadId)
      .single();

    if (leadError) {
      console.error('[send-precall-email] Error fetching lead:', leadError);
      return new Response(
        JSON.stringify({ success: false, error: "Lead not found" }),
        { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (lead?.precall_email_sent) {
      return new Response(
        JSON.stringify({ success: false, error: "Pre-call email already sent" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const subject = `Capittal - Comentamos la valoración de ${companyName}`;
    const saludo = contactName ? `Hola ${contactName},` : 'Hola,';

    const htmlEmail = `
      <div style="font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background:#f8fafc;">
        <div style="background:#ffffff; border:1px solid #e5e7eb; border-radius:10px; padding:32px; color:#111827;">
          <p style="margin:0 0 16px; font-size:16px;">${saludo}</p>
          
          <p style="margin:0 0 16px; line-height:1.6;">
            Me pongo en contacto contigo porque recientemente completaste la valoración de <strong>${companyName}</strong> en nuestra calculadora.
          </p>
          
          <p style="margin:0 0 16px; line-height:1.6;">
            Me gustaría comentar los resultados contigo y resolver cualquier duda que puedas tener sobre el informe que recibiste.
          </p>
          
          <p style="margin:0 0 16px; line-height:1.6;">
            <strong>¿Te viene bien que te llame esta tarde o mañana por la mañana?</strong> Si prefieres otro momento, respóndeme con un par de opciones de horario.
          </p>
          
          <p style="margin:0 0 16px; line-height:1.6;">
            La llamada sería breve (10-15 minutos) y sin ningún compromiso.
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
      `Me pongo en contacto contigo porque recientemente completaste la valoración de ${companyName} en nuestra calculadora.\n\n` +
      `Me gustaría comentar los resultados contigo y resolver cualquier duda que puedas tener sobre el informe que recibiste.\n\n` +
      `¿Te viene bien que te llame esta tarde o mañana por la mañana? Si prefieres otro momento, respóndeme con un par de opciones de horario.\n\n` +
      `La llamada sería breve (10-15 minutos) y sin ningún compromiso.\n\n` +
      `Un saludo,\n${senderName}\n${senderTitle} · Capittal`;

    // Generate unique message ID for tracking
    const messageId = `precall_${leadId}_${Date.now()}`;

    // Create tracking pixel URL
    const trackingPixelUrl = `https://fwhqtzkkvnjkazhaficj.supabase.co/functions/v1/email-open?mid=${messageId}`;

    // Add tracking pixel to HTML
    const htmlWithTracking = htmlEmail.replace(
      '</div></div>',
      `<img src="${trackingPixelUrl}" width="1" height="1" style="display:none" alt="" /></div></div>`
    );

    // Send email
    const emailResponse = await resend.emails.send({
      from: "Capittal <s.navarro@capittal.es>",
      to: [email],
      subject,
      html: htmlWithTracking,
      text: textEmail,
      reply_to: "s.navarro@capittal.es",
      headers: {
        "List-Unsubscribe": "<mailto:s.navarro@capittal.es?subject=unsubscribe>",
      },
    });

    console.log('[send-precall-email] Email sent:', emailResponse);

    // Update lead record
    const { error: updateError } = await supabase
      .from('company_valuations')
      .update({
        precall_email_sent: true,
        precall_email_sent_at: new Date().toISOString(),
        email_message_id: messageId,
      })
      .eq('id', leadId);

    if (updateError) {
      console.error('[send-precall-email] Error updating lead:', updateError);
    }

    // Add activity log
    await supabase.from('lead_activities').insert({
      lead_id: leadId,
      lead_type: 'valuation',
      activity_type: 'email_precall_sent',
      description: `Email pre-llamada enviado a ${email}`,
      metadata: {
        email_id: emailResponse?.data?.id,
        message_id: messageId,
        subject,
      },
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        emailId: emailResponse?.data?.id,
        messageId 
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("[send-precall-email] Error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error?.message || "Unknown error" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
