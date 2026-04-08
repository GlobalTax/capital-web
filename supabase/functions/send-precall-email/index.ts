/**
 * Send Pre-Call Email Edge Function
 * Sends a personalized email before calling the lead
 * Dynamic sender based on assigned user
 */

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY") as string);

const supabaseUrl = Deno.env.get('SUPABASE_URL') as string;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Default sender fallback
const DEFAULT_SENDER = {
  full_name: "Samuel Navarro",
  email: "samuel@capittal.es",
  phone: "+34 695 717 490",
};

interface SendPrecallEmailRequest {
  leadId: string;
  contactName: string;
  companyName: string;
  email: string;
  assignedTo?: string; // user_id of the assigned admin user
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // ========== AUTH: Validate JWT + Admin role ==========
    const { validateAdminRequest } = await import("../_shared/auth-guard.ts");
    const auth = await validateAdminRequest(req, corsHeaders);
    if (auth.error) return auth.error;
    console.log(`[send-precall-email] Authenticated admin: ${auth.userEmail} (role: ${auth.role})`);

    const payload: SendPrecallEmailRequest = await req.json();
    const { leadId, contactName, companyName, email, assignedTo } = payload;

    console.log(`[send-precall-email] Processing lead: ${leadId}, email: ${email}, assignedTo: ${assignedTo}`);

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

    // ========== Fetch sender info from admin_users ==========
    let sender = { ...DEFAULT_SENDER };
    
    if (assignedTo) {
      const { data: adminUser, error: adminError } = await supabase
        .from('admin_users')
        .select('full_name, email, phone')
        .eq('user_id', assignedTo)
        .single();

      if (!adminError && adminUser) {
        sender = {
          full_name: adminUser.full_name || DEFAULT_SENDER.full_name,
          email: adminUser.email || DEFAULT_SENDER.email,
          phone: adminUser.phone || DEFAULT_SENDER.phone,
        };
        console.log(`[send-precall-email] Using assigned sender: ${sender.full_name} <${sender.email}>`);
      } else {
        console.warn('[send-precall-email] Could not fetch assigned user, using default sender');
      }
    }

    // ========== Fetch CC recipients from email_recipients_config ==========
    const { data: ccRecipients } = await supabase
      .from('email_recipients_config')
      .select('email, name, is_bcc')
      .eq('is_active', true)
      .eq('is_default_copy', true)
      .order('name');

    // Separate CC and BCC, excluding the sender themselves
    const ccEmails = (ccRecipients || [])
      .filter(r => !r.is_bcc && r.email !== sender.email)
      .map(r => r.email);
    
    const bccEmails = (ccRecipients || [])
      .filter(r => r.is_bcc && r.email !== sender.email)
      .map(r => r.email);

    // Build the CC names list for the email body (only visible CC, not BCC)
    const ccNames = (ccRecipients || [])
      .filter(r => !r.is_bcc && r.email !== sender.email)
      .map(r => r.name?.split(' ')[0] || r.name) // First name only
      .filter(Boolean);

    const ccMention = ccNames.length > 0
      ? `Pongo en copia a mis compañeros ${ccNames.slice(0, -1).join(', ')}${ccNames.length > 1 ? ' y ' : ''}${ccNames[ccNames.length - 1]}.`
      : '';

    // Extract sender first name
    const senderFirstName = sender.full_name.split(' ')[0];
    const saludo = contactName ? `Apreciado ${contactName.split(' ')[0]},` : 'Apreciado/a,';

    const subject = `Capittal - Comentamos la valoración de ${companyName}`;

    const htmlEmail = `
      <div style="font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background:#ffffff;">
        <div style="color:#111827; font-size:15px; line-height:1.7;">
          <p style="margin:0 0 18px;">${saludo}</p>
          
          <p style="margin:0 0 18px;">
            Soy ${senderFirstName}, del equipo de fusiones y adquisiciones de Capittal. Encantado de saludarte.${ccMention ? ` ${ccMention}` : ''}
          </p>
          
          <p style="margin:0 0 18px;">
            Me pongo en contacto contigo dado que hemos recibido tu respuesta a nuestro formulario web de valoración automática de empresas y, tras analizar vuestra actividad, así como la información disponible en el Registro Mercantil, nos ha parecido muy interesante conocer más acerca de vuestro proyecto y situación actual.
          </p>
          
          <p style="margin:0 0 18px;">
            Desconozco si estáis valorando una posible venta, si os ha contactado algún inversor, o simplemente queréis tener una referencia del valor de la empresa. En cualquier caso, me gustaría poder hablar contigo para entender mejor vuestra situación.
          </p>
          
          <p style="margin:0 0 18px;">
            Si te parece bien, intentaré llamarte a lo largo del día de mañana. Si prefieres, también podemos organizar una videollamada o indicarme el horario que mejor te encaje.
          </p>
          
          <p style="margin:0 0 18px;">
            Te dejo mi número: <strong>${sender.phone}</strong> por si prefieres llamarme tú directamente.
          </p>
          
          <p style="margin:0 0 8px;">Un cordial saludo,</p>
          <p style="margin:0 0 4px; font-weight:600; color:#1f2937;">${sender.full_name}</p>
          <p style="margin:0 0 4px; font-size:14px; color:#6b7280;">Fusiones y Adquisiciones · Capittal</p>
          <p style="margin:0; font-size:13px; color:#9ca3af;">📞 ${sender.phone} · 📧 ${sender.email}</p>
        </div>
      </div>
    `;

    const textEmail = `${saludo}\n\n` +
      `Soy ${senderFirstName}, del equipo de fusiones y adquisiciones de Capittal. Encantado de saludarte.${ccMention ? ` ${ccMention}` : ''}\n\n` +
      `Me pongo en contacto contigo dado que hemos recibido tu respuesta a nuestro formulario web de valoración automática de empresas y, tras analizar vuestra actividad, así como la información disponible en el Registro Mercantil, nos ha parecido muy interesante conocer más acerca de vuestro proyecto y situación actual.\n\n` +
      `Desconozco si estáis valorando una posible venta, si os ha contactado algún inversor, o simplemente queréis tener una referencia del valor de la empresa. En cualquier caso, me gustaría poder hablar contigo para entender mejor vuestra situación.\n\n` +
      `Si te parece bien, intentaré llamarte a lo largo del día de mañana. Si prefieres, también podemos organizar una videollamada o indicarme el horario que mejor te encaje.\n\n` +
      `Te dejo mi número: ${sender.phone} por si prefieres llamarme tú directamente.\n\n` +
      `Un cordial saludo,\n${sender.full_name}\nFusiones y Adquisiciones · Capittal`;

    // Generate unique message ID for tracking
    const messageId = `precall_${leadId}_${Date.now()}`;

    // Create tracking pixel URL
    const trackingPixelUrl = `https://fwhqtzkkvnjkazhaficj.supabase.co/functions/v1/email-open?mid=${messageId}`;

    // Add tracking pixel to HTML
    const htmlWithTracking = htmlEmail.replace(
      '</div></div>',
      `<img src="${trackingPixelUrl}" width="1" height="1" style="display:none" alt="" /></div></div>`
    );

    // Build email params
    const emailParams: any = {
      from: `${sender.full_name} <${sender.email}>`,
      to: [email],
      subject,
      html: htmlWithTracking,
      text: textEmail,
      reply_to: sender.email,
      headers: {
        "List-Unsubscribe": `<mailto:${sender.email}?subject=unsubscribe>`,
      },
    };

    // Add CC and BCC if available
    if (ccEmails.length > 0) {
      emailParams.cc = ccEmails;
    }
    if (bccEmails.length > 0) {
      emailParams.bcc = bccEmails;
    }

    console.log(`[send-precall-email] Sending from: ${sender.full_name} <${sender.email}>, CC: ${ccEmails.join(', ')}, BCC: ${bccEmails.join(', ')}`);

    // Send email
    const emailResponse = await resend.emails.send(emailParams);

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
      description: `Email pre-llamada enviado a ${email} desde ${sender.email}`,
      metadata: {
        email_id: emailResponse?.data?.id,
        message_id: messageId,
        subject,
        sender_name: sender.full_name,
        sender_email: sender.email,
        cc: ccEmails,
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
