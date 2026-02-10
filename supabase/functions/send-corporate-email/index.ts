// =============================================
// SEND CORPORATE EMAIL
// Sends emails to corporate buyer contacts
// =============================================

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const defaultSenderEmail = Deno.env.get('SENDER_EMAIL') || 'samuel@capittal.es';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  contact_ids?: string[];           // Specific contact IDs
  buyer_ids?: string[];             // Buyer IDs (will get their contacts)
  subject: string;
  body: string;
  mode: 'template' | 'custom' | 'ai_generated';
  operation_id?: string;            // For opportunity template
  include_teaser?: boolean;
}

interface ContactWithBuyer {
  id: string;
  full_name: string;
  email: string;
  title: string | null;
  role: string | null;
  buyer_id: string;
  buyer: {
    name: string;
    sector_focus: string[] | null;
    geography_focus: string[] | null;
  };
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get auth user
    const authHeader = req.headers.get("Authorization");
    let userId: string | null = null;
    let userEmail: string | null = null;

    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data: { user } } = await supabase.auth.getUser(token);
      userId = user?.id ?? null;
      userEmail = user?.email ?? null;
    }

    const { 
      contact_ids, 
      buyer_ids, 
      subject, 
      body, 
      mode,
      operation_id,
      include_teaser
    }: EmailRequest = await req.json();

    if ((!contact_ids?.length && !buyer_ids?.length) || !subject || !body) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: contact_ids or buyer_ids, subject, body" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`📧 Processing corporate email request - mode: ${mode}`);

    // Build query to get contacts
    let query = supabase
      .from("corporate_contacts")
      .select(`
        id,
        full_name,
        email,
        title,
        role,
        buyer_id,
        buyer:corporate_buyers(name, sector_focus, geography_focus)
      `)
      .eq("is_deleted", false)
      .not("email", "is", null);

    if (contact_ids?.length) {
      query = query.in("id", contact_ids);
    } else if (buyer_ids?.length) {
      query = query.in("buyer_id", buyer_ids);
    }

    const { data: contacts, error: fetchError } = await query;

    if (fetchError) {
      console.error("Error fetching contacts:", fetchError);
      throw fetchError;
    }

    if (!contacts?.length) {
      return new Response(
        JSON.stringify({ error: "No valid recipients found with email", sent: 0 }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`📧 Found ${contacts.length} valid contacts with email`);

    // Get operation data if needed
    let operationData: any = null;
    if (operation_id && include_teaser) {
      const { data: operation } = await supabase
        .from("company_operations")
        .select("*")
        .eq("id", operation_id)
        .single();
      operationData = operation;
    }

    let sentCount = 0;
    const errors: string[] = [];
    const sentDetails: { email: string; name: string; buyer: string }[] = [];

    for (const contact of contacts as unknown as ContactWithBuyer[]) {
      try {
        const buyerName = contact.buyer?.name || "N/A";
        
        // Replace template variables
        const personalizedSubject = subject
          .replace(/\{\{name\}\}/g, contact.full_name)
          .replace(/\{\{buyer_name\}\}/g, buyerName)
          .replace(/\{\{title\}\}/g, contact.title || '')
          .replace(/\{\{operation_name\}\}/g, operationData?.name || '');
        
        let personalizedBody = body
          .replace(/\{\{name\}\}/g, contact.full_name)
          .replace(/\{\{buyer_name\}\}/g, buyerName)
          .replace(/\{\{title\}\}/g, contact.title || '')
          .replace(/\{\{sectors\}\}/g, contact.buyer?.sector_focus?.join(', ') || 'N/A')
          .replace(/\{\{geography\}\}/g, contact.buyer?.geography_focus?.join(', ') || 'N/A')
          .replace(/\{\{operation_name\}\}/g, operationData?.name || '')
          .replace(/\{\{operation_sector\}\}/g, operationData?.sector || '')
          .replace(/\{\{operation_description\}\}/g, operationData?.description || '');

        // Build HTML email
        const htmlBody = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8f9fa;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8f9fa; padding: 40px 20px;">
              <tr>
                <td align="center">
                  <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
                    <!-- Header -->
                    <tr>
                      <td style="padding: 32px 40px 24px; border-bottom: 1px solid #eee;">
                        <img src="https://capittal.es/lovable-uploads/capittal-logo.png" alt="Capittal" style="height: 32px;">
                      </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                      <td style="padding: 32px 40px;">
                        ${personalizedBody.split('\n').map(line => 
                          `<p style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.6; color: #374151;">${line}</p>`
                        ).join('')}
                      </td>
                    </tr>
                    
                    ${operationData && include_teaser ? `
                    <!-- Operation Teaser -->
                    <tr>
                      <td style="padding: 0 40px 32px;">
                        <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); border-radius: 8px; border: 1px solid #e2e8f0;">
                          <tr>
                            <td style="padding: 24px;">
                              <p style="margin: 0 0 4px; font-size: 12px; text-transform: uppercase; color: #64748b; letter-spacing: 0.5px;">Oportunidad de Inversión</p>
                              <h3 style="margin: 0 0 12px; font-size: 18px; font-weight: 600; color: #0f172a;">${operationData.name}</h3>
                              <p style="margin: 0 0 16px; font-size: 14px; color: #475569;">${operationData.description?.substring(0, 200)}${operationData.description?.length > 200 ? '...' : ''}</p>
                              <table cellpadding="0" cellspacing="0">
                                <tr>
                                  <td style="padding-right: 24px;">
                                    <p style="margin: 0; font-size: 12px; color: #64748b;">Sector</p>
                                    <p style="margin: 4px 0 0; font-size: 14px; font-weight: 500; color: #0f172a;">${operationData.sector}</p>
                                  </td>
                                  ${operationData.valuation_amount ? `
                                  <td>
                                    <p style="margin: 0; font-size: 12px; color: #64748b;">Valoración</p>
                                    <p style="margin: 4px 0 0; font-size: 14px; font-weight: 500; color: #0f172a;">€${(operationData.valuation_amount / 1000000).toFixed(1)}M</p>
                                  </td>
                                  ` : ''}
                                </tr>
                              </table>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                    ` : ''}
                    
                    <!-- Footer -->
                    <tr>
                      <td style="padding: 24px 40px; background-color: #f8fafc; border-top: 1px solid #eee; border-radius: 0 0 8px 8px;">
                        <p style="margin: 0 0 8px; font-size: 13px; color: #64748b;">
                          Capittal · M&A Advisory
                        </p>
                        <p style="margin: 0; font-size: 12px; color: #94a3b8;">
                          <a href="https://capittal.es" style="color: #3b82f6; text-decoration: none;">capittal.es</a> · 
                          <a href="tel:+34695717490" style="color: #3b82f6; text-decoration: none;">+34 695 717 490</a>
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </body>
          </html>
        `;

        // Send email
        const emailResponse = await resend.emails.send({
          from: `Capittal <${defaultSenderEmail}>`,
          replyTo: defaultSenderEmail,
          to: [contact.email],
          subject: personalizedSubject,
          html: htmlBody,
        });

        console.log(`✅ Email sent to ${contact.email}:`, emailResponse);

        // Log outreach in corporate_outreach table
        await supabase.from("corporate_outreach").insert({
          contact_id: contact.id,
          buyer_id: contact.buyer_id,
          outreach_type: "email",
          channel: "email",
          status: "sent",
          subject: personalizedSubject,
          content: personalizedBody,
          email_mode: mode,
          operation_id: operation_id || null,
          sent_at: new Date().toISOString(),
          sent_by: userId,
          provider_message_id: emailResponse.id || null,
        });

        sentCount++;
        sentDetails.push({
          email: contact.email,
          name: contact.full_name,
          buyer: buyerName,
        });
      } catch (emailError: any) {
        console.error(`❌ Error sending to ${contact.email}:`, emailError);
        errors.push(`${contact.email}: ${emailError.message}`);

        // Log failed outreach
        await supabase.from("corporate_outreach").insert({
          contact_id: contact.id,
          buyer_id: contact.buyer_id,
          outreach_type: "email",
          channel: "email",
          status: "failed",
          subject: subject,
          content: body,
          email_mode: mode,
          operation_id: operation_id || null,
          error_message: emailError.message,
        });
      }
    }

    console.log(`📧 Bulk email complete: ${sentCount}/${contacts.length} sent`);

    return new Response(
      JSON.stringify({
        success: true,
        sent: sentCount,
        failed: errors.length,
        total: contacts.length,
        details: sentDetails,
        errors: errors.length > 0 ? errors : undefined,
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error: any) {
    console.error("Error in send-corporate-email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
