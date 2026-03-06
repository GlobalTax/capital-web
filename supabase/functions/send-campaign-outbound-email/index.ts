import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) throw new Error("RESEND_API_KEY not configured");

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const serviceClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    // Verify admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return jsonResponse({ error: "Unauthorized" }, 401);
    }
    const anonClient = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userError } = await anonClient.auth.getUser();
    if (userError || !userData?.user) {
      return jsonResponse({ error: "Unauthorized" }, 401);
    }
    const { data: adminUser } = await serviceClient
      .from("admin_users")
      .select("role")
      .eq("user_id", userData.user.id)
      .maybeSingle();
    if (!adminUser) {
      return jsonResponse({ error: "Forbidden – admin only" }, 403);
    }

    const { email_ids } = await req.json();
    if (!Array.isArray(email_ids) || email_ids.length === 0) {
      return jsonResponse({ error: "email_ids array required" }, 400);
    }

    // Fetch emails
    const { data: emailRows, error: fetchErr } = await serviceClient
      .from("campaign_emails")
      .select("*")
      .in("id", email_ids);
    if (fetchErr) throw fetchErr;
    if (!emailRows || emailRows.length === 0) {
      return jsonResponse({ error: "No emails found" }, 404);
    }

    // Get campaign config for CC recipients
    const campaignIds = [...new Set(emailRows.map((e: any) => e.campaign_id))];
    const { data: campaigns } = await serviceClient
      .from("valuation_campaigns")
      .select("id, email_recipients_config")
      .in("id", campaignIds);
    const campaignMap = new Map((campaigns || []).map((c: any) => [c.id, c]));

    // Get company data for attachments
    const companyIds = [...new Set(emailRows.map((e: any) => e.company_id))];
    const { data: companyRows } = await serviceClient
      .from("campaign_companies")
      .select("id, company_name, presentation_id")
      .in("id", companyIds);
    const companyMap = new Map((companyRows || []).map((c: any) => [c.id, c]));

    // Get presentations for PDF attachments
    const presentationIds = (companyRows || [])
      .map((c: any) => c.presentation_id)
      .filter(Boolean);
    let presentationMap = new Map();
    if (presentationIds.length > 0) {
      const { data: presentations } = await serviceClient
        .from("campaign_presentations")
        .select("id, valuation_pdf_path, study_pdf_path")
        .in("id", presentationIds);
      presentationMap = new Map((presentations || []).map((p: any) => [p.id, p]));
    }

    const results: { id: string; status: string; error?: string }[] = [];

    for (const email of emailRows) {
      try {
        const company = companyMap.get(email.company_id);
        const campaign = campaignMap.get(email.campaign_id);

        // Build CC list from campaign config
        const ccList: string[] = [];
        if (campaign?.email_recipients_config) {
          const config = typeof campaign.email_recipients_config === "string"
            ? JSON.parse(campaign.email_recipients_config)
            : campaign.email_recipients_config;
          if (Array.isArray(config)) {
            for (const r of config) {
              if (r.active && r.email) ccList.push(r.email);
            }
          }
        }

        // Get recipient email from campaign_companies
        const { data: companyFull } = await serviceClient
          .from("campaign_companies")
          .select("contact_email")
          .eq("id", email.company_id)
          .maybeSingle();

        const toEmail = companyFull?.contact_email;
        if (!toEmail) {
          throw new Error(`No contact_email for company ${email.company_id}`);
        }

        // Build attachments from PDFs
        const attachments: { filename: string; content: string }[] = [];
        if (company?.presentation_id) {
          const pres = presentationMap.get(company.presentation_id);
          if (pres?.valuation_pdf_path) {
            const att = await downloadPdfAsAttachment(serviceClient, pres.valuation_pdf_path, "Valoracion.pdf");
            if (att) attachments.push(att);
          }
          if (pres?.study_pdf_path) {
            const att = await downloadPdfAsAttachment(serviceClient, pres.study_pdf_path, "Estudio.pdf");
            if (att) attachments.push(att);
          }
        }

        // Convert body (which may have newlines) to simple HTML
        const htmlBody = `
          <div style="font-family: Arial, sans-serif; font-size: 14px; color: #333; line-height: 1.6;">
            ${email.body.replace(/\n/g, "<br/>")}
          </div>
        `;

        // Send via Resend
        const resendPayload: Record<string, unknown> = {
          from: "Samuel Navarro <samuel@capittal.es>",
          to: [toEmail],
          subject: email.subject,
          html: htmlBody,
          reply_to: "samuel@capittal.es",
        };
        if (ccList.length > 0) {
          resendPayload.cc = ccList;
        }
        if (attachments.length > 0) {
          resendPayload.attachments = attachments;
        }

        const resendRes = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(resendPayload),
        });

        if (!resendRes.ok) {
          const errBody = await resendRes.text();
          throw new Error(`Resend ${resendRes.status}: ${errBody}`);
        }

        const now = new Date().toISOString();
        await serviceClient
          .from("campaign_emails")
          .update({ status: "sent", sent_at: now, updated_at: now, error_message: null })
          .eq("id", email.id);

        results.push({ id: email.id, status: "sent" });
      } catch (sendErr: any) {
        const errMsg = sendErr?.message || "Unknown send error";
        console.error(`Failed to send email ${email.id}:`, errMsg);
        await serviceClient
          .from("campaign_emails")
          .update({ status: "error", error_message: errMsg, updated_at: new Date().toISOString() })
          .eq("id", email.id);
        results.push({ id: email.id, status: "error", error: errMsg });
      }
    }

    const sent = results.filter((r) => r.status === "sent").length;
    const failed = results.filter((r) => r.status === "error").length;

    return jsonResponse({ sent, failed, results });
  } catch (err: any) {
    console.error("send-campaign-outbound-email error:", err);
    return jsonResponse({ error: err.message || "Internal error" }, 500);
  }
});

async function downloadPdfAsAttachment(
  client: any,
  path: string,
  filename: string
): Promise<{ filename: string; content: string } | null> {
  try {
    // Clean path
    const cleanPath = path.split(".pdf")[0] + ".pdf";

    const { data: signedData, error: signErr } = await client.storage
      .from("campaign-presentations")
      .createSignedUrl(cleanPath, 300);

    if (signErr || !signedData?.signedUrl) {
      console.warn(`Could not sign ${cleanPath}:`, signErr?.message);
      return null;
    }

    const res = await fetch(signedData.signedUrl);
    if (!res.ok) {
      console.warn(`Could not download ${cleanPath}: ${res.status}`);
      return null;
    }

    const arrayBuffer = await res.arrayBuffer();
    const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));

    return { filename, content: base64 };
  } catch (e: any) {
    console.warn(`Attachment error for ${path}:`, e.message);
    return null;
  }
}
