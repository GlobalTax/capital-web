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

    // Fetch email records from campaign_emails
    const { data: emailRows, error: fetchErr } = await serviceClient
      .from("campaign_emails")
      .select("*")
      .in("id", email_ids);
    if (fetchErr) throw fetchErr;
    if (!emailRows || emailRows.length === 0) {
      return jsonResponse({ error: "No emails found" }, 404);
    }

    // Get company data from valuation_campaign_companies (correct table)
    const companyIds = [...new Set(emailRows.map((e: any) => e.company_id))];
    const { data: companyRows } = await serviceClient
      .from("valuation_campaign_companies")
      .select("id, client_company, client_name, client_email, pdf_url, campaign_id")
      .in("id", companyIds);
    const companyMap = new Map((companyRows || []).map((c: any) => [c.id, c]));

    // Get study/presentation PDFs from campaign_presentations (by campaign_id + company_id, status = 'assigned')
    const campaignIds = [...new Set(emailRows.map((e: any) => e.campaign_id))];
    const { data: presentations } = await serviceClient
      .from("campaign_presentations")
      .select("id, campaign_id, company_id, storage_path, file_name, status")
      .in("campaign_id", campaignIds)
      .in("company_id", companyIds)
      .eq("status", "assigned");
    // Map by company_id for quick lookup
    const presentationMap = new Map(
      (presentations || []).map((p: any) => [p.company_id, p])
    );

    // Get CC recipients from email_recipients_config (active + default copy)
    const { data: ccRecipients } = await serviceClient
      .from("email_recipients_config")
      .select("email")
      .eq("is_active", true)
      .eq("is_default_copy", true);
    const ccList = (ccRecipients || []).map((r: any) => r.email).filter(Boolean);

    // Fetch sender's email signature
    const { data: signatureRow } = await serviceClient
      .from("email_signatures")
      .select("html_preview")
      .eq("user_id", userData.user.id)
      .maybeSingle();
    const signatureHtml = signatureRow?.html_preview || null;

    const results: { id: string; status: string; error?: string }[] = [];

    for (const email of emailRows) {
      try {
        const company = companyMap.get(email.company_id);

        // Get recipient email from valuation_campaign_companies.client_email
        const toEmail = company?.client_email;
        if (!toEmail) {
          throw new Error(`No client_email for company ${email.company_id}`);
        }

        // Build attachments
        const attachments: { filename: string; content: string }[] = [];

        // 1. Valuation PDF from valuation_campaign_companies.pdf_url (public URL in 'valuations' bucket)
        if (company?.pdf_url) {
          const att = await downloadPdfFromUrl(company.pdf_url, `Valoracion_${company.client_company || "empresa"}.pdf`);
          if (att) attachments.push(att);
        }

        // 2. Study/Presentation PDF from campaign_presentations.storage_path (private bucket)
        const pres = presentationMap.get(email.company_id);
        if (pres?.storage_path) {
          const att = await downloadPdfFromStorage(serviceClient, pres.storage_path, pres.file_name || "Estudio.pdf");
          if (att) attachments.push(att);
        }

        // Convert body to HTML and append signature
        let htmlBody = `
          <div style="font-family: Arial, sans-serif; font-size: 14px; color: #333; line-height: 1.6;">
            ${email.body.replace(/\n/g, "<br/>")}
          </div>
        `;

        // Append email signature if available
        if (signatureHtml) {
          htmlBody += `<hr style="border:none;border-top:1px solid #ddd;margin:20px 0">${signatureHtml}`;
        }

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

        console.log(`Sending email ${email.id} to ${toEmail} with ${attachments.length} attachment(s)`);

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

/**
 * Convert Uint8Array to base64 safely using chunked processing
 * Avoids call stack overflow with large files (>100KB)
 */
function uint8ArrayToBase64(bytes: Uint8Array): string {
  const CHUNK_SIZE = 0x8000; // 32KB chunks
  let result = '';
  for (let i = 0; i < bytes.length; i += CHUNK_SIZE) {
    const chunk = bytes.subarray(i, Math.min(i + CHUNK_SIZE, bytes.length));
    result += String.fromCharCode.apply(null, chunk as unknown as number[]);
  }
  return btoa(result);
}

/**
 * Download PDF from a public URL (e.g. valuation PDF stored in public 'valuations' bucket)
 */
async function downloadPdfFromUrl(
  url: string,
  filename: string
): Promise<{ filename: string; content: string } | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.warn(`[ATTACHMENT] Could not download PDF from ${url}: ${res.status}`);
      return null;
    }
    const arrayBuffer = await res.arrayBuffer();
    console.log(`[ATTACHMENT] Downloaded valuation PDF: ${arrayBuffer.byteLength} bytes`);
    const base64 = uint8ArrayToBase64(new Uint8Array(arrayBuffer));
    console.log(`[ATTACHMENT] Base64 encoded valuation PDF: ${base64.length} chars`);
    const safeName = filename.replace(/[^a-zA-Z0-9_.\-áéíóúñÁÉÍÓÚÑ ]/g, "_");
    return { filename: safeName, content: base64 };
  } catch (e: any) {
    console.error(`[ATTACHMENT] Failed to process valuation PDF from ${url}:`, e.message);
    return null;
  }
}

/**
 * Download PDF from private Supabase Storage using signed URL (campaign-presentations bucket)
 */
async function downloadPdfFromStorage(
  client: any,
  storagePath: string,
  filename: string
): Promise<{ filename: string; content: string } | null> {
  try {
    // Clean path: truncate at .pdf to remove any metadata
    const cleanPath = storagePath.split(".pdf")[0] + ".pdf";

    const { data: signedData, error: signErr } = await client.storage
      .from("campaign-presentations")
      .createSignedUrl(cleanPath, 300);

    if (signErr || !signedData?.signedUrl) {
      console.warn(`[ATTACHMENT] Could not sign presentation ${cleanPath}:`, signErr?.message);
      return null;
    }

    const res = await fetch(signedData.signedUrl);
    if (!res.ok) {
      console.warn(`[ATTACHMENT] Could not download presentation ${cleanPath}: ${res.status}`);
      return null;
    }

    const arrayBuffer = await res.arrayBuffer();
    console.log(`[ATTACHMENT] Downloaded presentation PDF: ${arrayBuffer.byteLength} bytes from ${cleanPath}`);
    const base64 = uint8ArrayToBase64(new Uint8Array(arrayBuffer));
    console.log(`[ATTACHMENT] Base64 encoded presentation PDF: ${base64.length} chars`);
    const safeName = filename.replace(/[^a-zA-Z0-9_.\-áéíóúñÁÉÍÓÚÑ ]/g, "_");
    return { filename: safeName, content: base64 };
  } catch (e: any) {
    console.error(`[ATTACHMENT] Failed to process presentation PDF from ${storagePath}:`, e.message);
    return null;
  }
}
