import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function uint8ArrayToBase64(bytes: Uint8Array): string {
  const CHUNK_SIZE = 0x8000;
  let result = "";
  for (let i = 0; i < bytes.length; i += CHUNK_SIZE) {
    const chunk = bytes.subarray(i, Math.min(i + CHUNK_SIZE, bytes.length));
    result += String.fromCharCode.apply(null, chunk as unknown as number[]);
  }
  return btoa(result);
}

async function downloadFromUrl(url: string, filename: string): Promise<{ filename: string; content: string } | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const buf = await res.arrayBuffer();
    const base64 = uint8ArrayToBase64(new Uint8Array(buf));
    return { filename: filename.replace(/[^a-zA-Z0-9_.\-áéíóúñÁÉÍÓÚÑ ]/g, "_"), content: base64 };
  } catch {
    return null;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) throw new Error("RESEND_API_KEY not configured");

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const db = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    // Auth check
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) return jsonResponse({ error: "Unauthorized" }, 401);

    const anonClient = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userError } = await anonClient.auth.getUser();
    if (userError || !userData?.user) return jsonResponse({ error: "Unauthorized" }, 401);

    const { data: adminUser } = await db
      .from("admin_users")
      .select("role")
      .eq("user_id", userData.user.id)
      .maybeSingle();
    if (!adminUser) return jsonResponse({ error: "Forbidden" }, 403);

    const body = await req.json();
    const { send_id } = body;
    if (!send_id) return jsonResponse({ error: "send_id required" }, 400);

    // Fetch the send record
    const { data: sendRecord, error: sendErr } = await db
      .from("rod_sends")
      .select("*")
      .eq("id", send_id)
      .single();
    if (sendErr || !sendRecord) return jsonResponse({ error: "Send not found" }, 404);

    // Mark as sending
    await db.from("rod_sends").update({ status: "sending" }).eq("id", send_id);

    // Get recipients
    const { data: recipients } = await db
      .from("rod_send_recipients")
      .select("*")
      .eq("send_id", send_id)
      .eq("status", "pending");

    if (!recipients?.length) {
      await db.from("rod_sends").update({ status: "sent", sent_at: new Date().toISOString() }).eq("id", send_id);
      return jsonResponse({ sent: 0, failed: 0 });
    }

    // Download attachments
    const attachmentUrls: Array<{ url: string; filename: string }> = sendRecord.attachment_urls || [];
    const attachments: Array<{ filename: string; content: string }> = [];
    for (const att of attachmentUrls) {
      const downloaded = await downloadFromUrl(att.url, att.filename);
      if (downloaded) attachments.push(downloaded);
    }

    // Fetch sender signature
    const { data: signatureRow } = await db
      .from("email_signatures")
      .select("html_preview")
      .eq("user_id", userData.user.id)
      .maybeSingle();
    const signatureHtml = signatureRow?.html_preview || null;

    // Build HTML body
    let htmlBody = `
      <div style="font-family:'Plus Jakarta Sans',Arial,sans-serif;font-size:14px;color:#333;line-height:1.6;width:100%;max-width:600px;margin:0 auto;padding:0 12px;box-sizing:border-box;">
        ${sendRecord.body_html || sendRecord.body_text.replace(/\n/g, "<br/>")}
      </div>
    `;
    if (signatureHtml) {
      htmlBody += `<div style="width:100%;max-width:600px;margin:0 auto;padding:0 12px;box-sizing:border-box;"><hr style="border:none;border-top:1px solid #ddd;margin:20px 0">${signatureHtml}</div>`;
    }

    let sentCount = 0;
    let failedCount = 0;
    const BATCH_SIZE = 10;
    const DELAY_MS = 500;

    for (let i = 0; i < recipients.length; i += BATCH_SIZE) {
      const batch = recipients.slice(i, i + BATCH_SIZE);

      for (const recipient of batch) {
        try {
          // Personalize: replace {{nombre}} and {{empresa}}
          let personalizedHtml = htmlBody;
          if (recipient.full_name) {
            personalizedHtml = personalizedHtml.replace(/\{\{nombre\}\}/gi, recipient.full_name);
          }
          if (recipient.company) {
            personalizedHtml = personalizedHtml.replace(/\{\{empresa\}\}/gi, recipient.company);
          }

          const resendPayload: Record<string, unknown> = {
            from: "Samuel Navarro <samuel@capittal.es>",
            to: [recipient.email],
            subject: sendRecord.subject,
            html: personalizedHtml,
            reply_to: "samuel@capittal.es",
          };
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
            const errText = await resendRes.text();
            throw new Error(`Resend ${resendRes.status}: ${errText}`);
          }
          await resendRes.json();

          await db.from("rod_send_recipients").update({
            status: "sent",
            sent_at: new Date().toISOString(),
          }).eq("id", recipient.id);
          sentCount++;
        } catch (e: any) {
          await db.from("rod_send_recipients").update({
            status: "failed",
            error_message: e.message || "Unknown error",
          }).eq("id", recipient.id);
          failedCount++;
        }
      }

      // Update progress
      await db.from("rod_sends").update({
        sent_count: sentCount,
        failed_count: failedCount,
      }).eq("id", send_id);

      // Delay between batches
      if (i + BATCH_SIZE < recipients.length) {
        await new Promise(r => setTimeout(r, DELAY_MS));
      }
    }

    // Final update
    await db.from("rod_sends").update({
      status: failedCount === recipients.length ? "failed" : "sent",
      sent_at: new Date().toISOString(),
      sent_count: sentCount,
      failed_count: failedCount,
    }).eq("id", send_id);

    return jsonResponse({ sent: sentCount, failed: failedCount });
  } catch (err: any) {
    console.error("send-rod-email error:", err);
    return jsonResponse({ error: err.message || "Internal error" }, 500);
  }
});
