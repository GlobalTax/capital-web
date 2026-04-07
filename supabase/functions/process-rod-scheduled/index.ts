import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
const DEFAULT_FROM_EMAIL = "Samuel Navarro <samuel@capittal.es>";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Find batches that are due
    const now = new Date().toISOString();
    const { data: batches, error: batchErr } = await supabase
      .from("rod_scheduled_batches")
      .select("*")
      .eq("status", "pending")
      .lte("scheduled_at", now)
      .order("scheduled_at", { ascending: true })
      .limit(1);

    if (batchErr) throw batchErr;
    if (!batches || batches.length === 0) {
      return new Response(JSON.stringify({ message: "No batches due" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const batch = batches[0];

    // Mark as processing
    await supabase
      .from("rod_scheduled_batches")
      .update({ status: "processing", started_at: new Date().toISOString() })
      .eq("id", batch.id);

    // Fetch the send record
    const { data: send, error: sendErr } = await supabase
      .from("rod_sends")
      .select("*")
      .eq("id", batch.send_id)
      .single();

    if (sendErr || !send) {
      await supabase
        .from("rod_scheduled_batches")
        .update({ status: "failed", error_message: "Send record not found", completed_at: new Date().toISOString() })
        .eq("id", batch.id);
      return new Response(JSON.stringify({ error: "Send not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Determine sender
    const FROM_EMAIL = send.sender_email
      ? `${send.sender_name || 'Capittal'} <${send.sender_email}>`
      : DEFAULT_FROM_EMAIL;

    // Fetch attachments
    const attachments: { filename: string; content: string }[] = [];
    if (send.attachment_ids?.length) {
      const { data: docs } = await supabase
        .from("rod_documents")
        .select("title, file_url, file_type")
        .in("id", send.attachment_ids);

      if (docs) {
        for (const doc of docs) {
          try {
            const response = await fetch(doc.file_url);
            if (response.ok) {
              const buffer = await response.arrayBuffer();
              const bytes = new Uint8Array(buffer);
              let binary = "";
              const chunkSize = 32768;
              for (let i = 0; i < bytes.length; i += chunkSize) {
                const chunk = bytes.subarray(i, Math.min(i + chunkSize, bytes.length));
                binary += String.fromCharCode(...chunk);
              }
              const base64 = btoa(binary);
              const ext = doc.file_type === "excel" ? "xlsx" : "pdf";
              const cleanTitle = doc.title.replace(/[\u{1F1E0}-\u{1F1FF}]/gu, '').replace(/\s+/g, ' ').trim();
              attachments.push({ filename: `${cleanTitle}.${ext}`, content: base64 });
            }
          } catch (e) {
            console.error(`Failed to download attachment ${doc.title}:`, e);
          }
        }
      }
    }

    // Fetch CC recipients
    let ccEmails: string[] = [];
    if (send.cc_recipient_ids?.length) {
      const { data: ccRecipients } = await supabase
        .from("email_recipients_config")
        .select("email")
        .in("id", send.cc_recipient_ids)
        .eq("is_active", true);
      if (ccRecipients) {
        ccEmails = ccRecipients.map((r: any) => r.email).filter(Boolean);
      }
    }

    const signatureHtml = send.signature_html || "";

    // Get emails to send in this batch
    let query = supabase
      .from("rod_send_emails")
      .select("*")
      .eq("send_id", batch.send_id)
      .eq("status", "pending");

    if (batch.email_ids?.length) {
      query = query.in("id", batch.email_ids);
    }

    query = query.limit(batch.batch_size);

    const { data: emailRows, error: emailErr } = await query;
    if (emailErr) throw emailErr;

    // Update send status
    await supabase
      .from("rod_sends")
      .update({ status: "sending" })
      .eq("id", batch.send_id);

    let sentCount = 0;
    let failedCount = 0;
    const delayMs = (batch.delay_seconds || 30) * 1000;

    for (let i = 0; i < (emailRows || []).length; i++) {
      const row = emailRows![i];
      try {
        const bodyHtml = row.body_html || "";
        const fullHtml = signatureHtml
          ? `${bodyHtml}<hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0;">${signatureHtml}`
          : bodyHtml;

        const emailPayload: any = {
          from: FROM_EMAIL,
          to: [row.email],
          subject: row.subject,
          html: fullHtml,
          text: row.body_text || "",
        };
        if (attachments.length > 0) emailPayload.attachments = attachments;
        if (ccEmails.length > 0) emailPayload.cc = ccEmails;

        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
          body: JSON.stringify(emailPayload),
        });

        if (res.ok) {
          sentCount++;
          await supabase
            .from("rod_send_emails")
            .update({ status: "sent", sent_at: new Date().toISOString() })
            .eq("id", row.id);
        } else {
          const errBody = await res.text();
          console.error(`Failed to send to ${row.email}:`, errBody);
          failedCount++;
          await supabase
            .from("rod_send_emails")
            .update({ status: "failed", error_message: errBody.slice(0, 500) })
            .eq("id", row.id);
        }

        // Anti-spam delay between emails (skip after last)
        if (i < (emailRows || []).length - 1 && delayMs > 0) {
          await new Promise((r) => setTimeout(r, delayMs));
        }
      } catch (e: any) {
        console.error(`Error sending to ${row.email}:`, e);
        failedCount++;
        await supabase
          .from("rod_send_emails")
          .update({ status: "failed", error_message: e.message?.slice(0, 500) })
          .eq("id", row.id);
      }
    }

    // Update batch
    await supabase
      .from("rod_scheduled_batches")
      .update({
        status: "completed",
        sent_count: sentCount,
        failed_count: failedCount,
        completed_at: new Date().toISOString(),
      })
      .eq("id", batch.id);

    // Check if all emails are done for this send
    const { count: pendingLeft } = await supabase
      .from("rod_send_emails")
      .select("id", { count: "exact", head: true })
      .eq("send_id", batch.send_id)
      .eq("status", "pending");

    // Check if there are more pending batches for this send
    const { count: pendingBatches } = await supabase
      .from("rod_scheduled_batches")
      .select("id", { count: "exact", head: true })
      .eq("send_id", batch.send_id)
      .eq("status", "pending");

    if ((pendingLeft || 0) === 0 && (pendingBatches || 0) === 0) {
      // All done — update the send
      const { data: totals } = await supabase
        .from("rod_send_emails")
        .select("status")
        .eq("send_id", batch.send_id);

      const totalSent = (totals || []).filter(t => t.status === 'sent').length;
      const totalFailed = (totals || []).filter(t => t.status === 'failed').length;

      await supabase
        .from("rod_sends")
        .update({
          status: totalFailed === (totals || []).length ? "failed" : "sent",
          sent_count: totalSent,
          failed_count: totalFailed,
          sent_at: new Date().toISOString(),
        })
        .eq("id", batch.send_id);
    }

    return new Response(
      JSON.stringify({ success: true, batch_id: batch.id, sent: sentCount, failed: failedCount }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e: any) {
    console.error("process-rod-scheduled error:", e);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
