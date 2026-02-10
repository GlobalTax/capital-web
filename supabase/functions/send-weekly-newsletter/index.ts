import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

interface Operation {
  id: string;
  company_name: string;
  sector: string;
  geographic_location: string;
  revenue_amount: number | null;
  ebitda_amount: number | null;
  valuation_amount: number;
  description: string;
  short_description: string | null;
  highlights: string[] | null;
  project_status: string;
  expected_market_text: string | null;
}

interface Subscriber {
  id: string;
  email: string;
  name: string | null;
  unsubscribe_token: string;
}

interface NewsletterRequest {
  subject: string;
  preview_text?: string;
  intro_text?: string;
  operation_ids: string[];
  sent_by?: string;
}

function formatCurrency(amount: number | null): string {
  if (!amount) return "Consultar";
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function getStatusBadge(status: string, expectedText?: string | null): string {
  const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
    active: { label: "Activo", color: "#166534", bg: "#dcfce7" },
    upcoming: { label: expectedText || "Próximamente", color: "#92400e", bg: "#fef3c7" },
    exclusive: { label: "Exclusivo", color: "#7c3aed", bg: "#ede9fe" },
  };
  const config = statusConfig[status] || statusConfig.active;
  return `<span style="display: inline-block; padding: 4px 10px; border-radius: 9999px; font-size: 11px; font-weight: 600; background: ${config.bg}; color: ${config.color};">${config.label}</span>`;
}

function generateOperationCard(op: Operation, baseUrl: string): string {
  const highlights = op.highlights?.slice(0, 3) || [];
  const highlightTags = highlights.map(h => 
    `<span style="display: inline-block; padding: 3px 8px; margin-right: 6px; margin-bottom: 4px; border-radius: 4px; font-size: 11px; background: #f1f5f9; color: #475569;">${h}</span>`
  ).join("");

  return `
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
      <tr>
        <td style="padding: 24px;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td>
                <h3 style="margin: 0 0 8px 0; font-size: 18px; font-weight: 700; color: #0f172a;">
                  🏢 ${op.company_name}
                </h3>
              </td>
              <td align="right">
                ${getStatusBadge(op.project_status, op.expected_market_text)}
              </td>
            </tr>
          </table>
          
          <table width="100%" cellpadding="0" cellspacing="0" style="margin: 16px 0;">
            <tr>
              <td style="font-size: 13px; color: #64748b; padding: 4px 0;">
                📍 <strong>Sector:</strong> ${op.sector}
              </td>
            </tr>
            <tr>
              <td style="font-size: 13px; color: #64748b; padding: 4px 0;">
                📍 <strong>Ubicación:</strong> ${op.geographic_location || "España"}
              </td>
            </tr>
            <tr>
              <td style="font-size: 13px; color: #64748b; padding: 4px 0;">
                💰 <strong>Facturación:</strong> ${formatCurrency(op.revenue_amount)}
              </td>
            </tr>
            <tr>
              <td style="font-size: 13px; color: #64748b; padding: 4px 0;">
                📊 <strong>EBITDA:</strong> ${formatCurrency(op.ebitda_amount)}
              </td>
            </tr>
          </table>
          
          <p style="margin: 16px 0; font-size: 14px; color: #334155; line-height: 1.6;">
            ${op.short_description || op.description.substring(0, 200)}...
          </p>
          
          ${highlightTags ? `<div style="margin: 12px 0;">${highlightTags}</div>` : ""}
          
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 16px;">
            <tr>
              <td align="center">
                <a href="${baseUrl}/oportunidades?op=${op.id}" 
                   style="display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-size: 14px; font-weight: 600;">
                  📩 Solicitar Información
                </a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  `;
}

function generateNewsletterHtml(
  operations: Operation[],
  subscriber: Subscriber,
  subject: string,
  introText: string,
  baseUrl: string
): string {
  const operationCards = operations.map(op => generateOperationCard(op, baseUrl)).join("");
  const currentDate = new Date().toLocaleDateString("es-ES", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 32px 40px; text-align: center;">
              <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: #ffffff; letter-spacing: -0.5px;">
                CAPITTAL
              </h1>
              <p style="margin: 8px 0 0 0; font-size: 14px; color: #94a3b8;">
                Oportunidades de la Semana
              </p>
            </td>
          </tr>
          
          <!-- Date -->
          <tr>
            <td style="padding: 24px 40px 0 40px; text-align: center;">
              <p style="margin: 0; font-size: 13px; color: #64748b;">
                📅 ${currentDate}
              </p>
            </td>
          </tr>
          
          <!-- Intro -->
          <tr>
            <td style="padding: 24px 40px;">
              <p style="margin: 0; font-size: 15px; color: #334155; line-height: 1.7;">
                Hola${subscriber.name ? ` <strong>${subscriber.name}</strong>` : ""},
              </p>
              <p style="margin: 16px 0 0 0; font-size: 15px; color: #334155; line-height: 1.7;">
                ${introText || "Te compartimos las últimas oportunidades de inversión disponibles en nuestro Marketplace. Como suscriptor, tienes acceso prioritario a estas operaciones."}
              </p>
            </td>
          </tr>
          
          <!-- Value Proposition -->
          <tr>
            <td style="padding: 0 40px 24px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background: #f8fafc; border-radius: 12px; padding: 20px;">
                <tr>
                  <td style="padding: 20px;">
                    <p style="margin: 0 0 12px 0; font-size: 14px; font-weight: 600; color: #0f172a;">
                      ¿Por qué usar nuestro Marketplace?
                    </p>
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 4px 0; font-size: 13px; color: #475569;">✓ Acceso a la red más amplia de asesores M&A en España</td>
                      </tr>
                      <tr>
                        <td style="padding: 4px 0; font-size: 13px; color: #475569;">✓ Todas las operaciones con mandato directo</td>
                      </tr>
                      <tr>
                        <td style="padding: 4px 0; font-size: 13px; color: #475569;">✓ Due diligence verificado</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Divider -->
          <tr>
            <td style="padding: 0 40px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="border-top: 2px solid #e2e8f0;"></td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Section Title -->
          <tr>
            <td style="padding: 24px 40px;">
              <h2 style="margin: 0; font-size: 20px; font-weight: 700; color: #0f172a; text-align: center;">
                🏆 OPORTUNIDADES DE LA SEMANA
              </h2>
            </td>
          </tr>
          
          <!-- Operations -->
          <tr>
            <td style="padding: 0 40px 24px 40px;">
              ${operationCards}
            </td>
          </tr>
          
          <!-- CTA -->
          <tr>
            <td style="padding: 0 40px 32px 40px; text-align: center;">
              <a href="${baseUrl}/oportunidades" 
                 style="display: inline-block; padding: 16px 32px; background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-size: 15px; font-weight: 600;">
                🔍 Ver Todas las Oportunidades
              </a>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background: #f8fafc; padding: 32px 40px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600; color: #0f172a;">
                CAPITTAL · Especialistas en M&A
              </p>
              <p style="margin: 0 0 16px 0; font-size: 13px; color: #64748b;">
                info@capittal.es · capittal.es
              </p>
              <p style="margin: 0; font-size: 12px; color: #94a3b8;">
                <a href="${baseUrl}/recursos/newsletter/unsubscribe?token=${subscriber.unsubscribe_token}" 
                   style="color: #94a3b8; text-decoration: underline;">
                  Darse de baja
                </a>
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
}

function generatePlainText(operations: Operation[], subscriber: Subscriber, subject: string, introText: string): string {
  const opList = operations.map(op => `
• ${op.company_name}
  Sector: ${op.sector}
  Facturación: ${formatCurrency(op.revenue_amount)}
  EBITDA: ${formatCurrency(op.ebitda_amount)}
  ${op.short_description || op.description.substring(0, 150)}...
  `).join("\n");

  return `
${subject}

Hola${subscriber.name ? ` ${subscriber.name}` : ""},

${introText || "Te compartimos las últimas oportunidades de inversión disponibles en nuestro Marketplace."}

OPORTUNIDADES DE LA SEMANA
${opList}

Ver todas las oportunidades: https://capittal.es/oportunidades

---
CAPITTAL · Especialistas en M&A
info@capittal.es · capittal.es
  `.trim();
}

const handler = async (req: Request): Promise<Response> => {
  console.log("📧 send-weekly-newsletter: Starting");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const body: NewsletterRequest = await req.json();
    
    const { subject, preview_text, intro_text, operation_ids, sent_by } = body;

    if (!subject || !operation_ids || operation_ids.length === 0) {
      return new Response(
        JSON.stringify({ error: "Subject and at least one operation_id are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`📧 Fetching ${operation_ids.length} operations...`);

    // Fetch operations
    const { data: operations, error: opsError } = await supabase
      .from("company_operations")
      .select("id, company_name, sector, geographic_location, revenue_amount, ebitda_amount, valuation_amount, description, short_description, highlights, project_status, expected_market_text")
      .in("id", operation_ids)
      .eq("is_active", true)
      .eq("is_deleted", false);

    if (opsError) {
      console.error("Error fetching operations:", opsError);
      throw new Error(`Failed to fetch operations: ${opsError.message}`);
    }

    console.log(`📧 Found ${operations?.length || 0} operations`);

    // Fetch active subscribers
    const { data: subscribers, error: subsError } = await supabase
      .from("newsletter_subscribers")
      .select("id, email, name, unsubscribe_token")
      .eq("status", "active");

    if (subsError) {
      console.error("Error fetching subscribers:", subsError);
      throw new Error(`Failed to fetch subscribers: ${subsError.message}`);
    }

    console.log(`📧 Found ${subscribers?.length || 0} active subscribers`);

    if (!subscribers || subscribers.length === 0) {
      return new Response(
        JSON.stringify({ error: "No active subscribers found" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create campaign record
    const { data: campaign, error: campaignError } = await supabase
      .from("newsletter_campaigns")
      .insert({
        subject,
        preview_text,
        intro_text,
        operations_included: operation_ids,
        recipients_count: subscribers.length,
        status: "sending",
        sent_by,
      })
      .select()
      .single();

    if (campaignError) {
      console.error("Error creating campaign:", campaignError);
      throw new Error(`Failed to create campaign: ${campaignError.message}`);
    }

    console.log(`📧 Campaign created: ${campaign.id}`);

    const baseUrl = "https://capittal.es";
    let successCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    // Send to each subscriber
    for (const subscriber of subscribers) {
      try {
        const htmlContent = generateNewsletterHtml(
          operations as Operation[],
          subscriber as Subscriber,
          subject,
          intro_text || "",
          baseUrl
        );

        const textContent = generatePlainText(
          operations as Operation[],
          subscriber as Subscriber,
          subject,
          intro_text || ""
        );

        await resend.emails.send({
          from: "Capittal Marketplace <marketplace@capittal.es>",
          to: [subscriber.email],
          subject,
          html: htmlContent,
          text: textContent,
        });

        successCount++;
        console.log(`✅ Email sent to ${subscriber.email}`);

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 200));
      } catch (emailError) {
        errorCount++;
        const errorMsg = emailError instanceof Error ? emailError.message : "Unknown error";
        errors.push(`${subscriber.email}: ${errorMsg}`);
        console.error(`❌ Failed to send to ${subscriber.email}:`, emailError);
      }
    }

    // Update campaign status
    const finalStatus = errorCount === 0 ? "sent" : (successCount > 0 ? "sent" : "failed");
    await supabase
      .from("newsletter_campaigns")
      .update({
        status: finalStatus,
        sent_at: new Date().toISOString(),
        error_message: errors.length > 0 ? errors.slice(0, 5).join("; ") : null,
      })
      .eq("id", campaign.id);

    console.log(`📧 Newsletter complete: ${successCount} sent, ${errorCount} failed`);

    return new Response(
      JSON.stringify({
        success: true,
        campaign_id: campaign.id,
        sent: successCount,
        failed: errorCount,
        total_subscribers: subscribers.length,
        errors: errors.slice(0, 5),
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("📧 Newsletter error:", error);
    return new Response(
      JSON.stringify({ error: 'Error interno del servidor.' }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
