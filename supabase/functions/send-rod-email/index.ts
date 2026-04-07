import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const FROM_EMAIL = "Capittal <rod@capittal.es>";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { send_id, test_mode, test_email, use_generated_emails, email_ids } = await req.json();

    if (!send_id) {
      return new Response(JSON.stringify({ error: "send_id required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch send record
    const { data: send, error: sendErr } = await supabase
      .from("rod_sends")
      .select("*")
      .eq("id", send_id)
      .single();

    if (sendErr || !send) {
      return new Response(JSON.stringify({ error: "Send not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

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
              attachments.push({ filename: `${doc.title}.${ext}`, content: base64 });
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

    // Get signature HTML
    const signatureHtml = send.signature_html || "";

    let sentCount = 0;
    let failedCount = 0;

    // ── TEST MODE ──
    if (test_mode && test_email) {
      const personalizedHtml = (send.body_html || "")
        .replace(/\{\{nombre\}\}/g, "Prueba")
        .replace(/\{\{empresa\}\}/g, "Test");

      const fullHtml = signatureHtml
        ? `${personalizedHtml}<hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0;">${signatureHtml}`
        : personalizedHtml;

      const emailPayload: any = {
        from: FROM_EMAIL,
        to: [test_email],
        subject: send.subject,
        html: fullHtml,
        text: (send.body_text || "").replace(/\{\{nombre\}\}/g, "Prueba").replace(/\{\{empresa\}\}/g, "Test"),
      };
      if (attachments.length > 0) emailPayload.attachments = attachments;
      if (ccEmails.length > 0) emailPayload.cc = ccEmails;

      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify(emailPayload),
      });

      if (res.ok) sentCount++;
      else {
        const errBody = await res.text();
        console.error("Test send failed:", errBody);
        failedCount++;
      }

      return new Response(
        JSON.stringify({ success: true, sent: sentCount, failed: failedCount, test_mode: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── GENERATED EMAILS MODE (from rod_send_emails table) ──
    if (use_generated_emails) {
      let query = supabase
        .from("rod_send_emails")
        .select("*")
        .eq("send_id", send_id);

      if (email_ids?.length) {
        query = query.in("id", email_ids);
      } else {
        query = query.eq("status", "pending");
      }

      const { data: emailRows, error: emailErr } = await query;
      if (emailErr) throw emailErr;

      // Update send status
      await supabase
        .from("rod_sends")
        .update({ status: "sending", total_recipients: emailRows?.length || 0 })
        .eq("id", send_id);

      for (const row of emailRows || []) {
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

          if ((emailRows?.length || 0) > 1) {
            await new Promise((r) => setTimeout(r, 100));
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

      // Update send record
      await supabase
        .from("rod_sends")
        .update({
          status: failedCount === (emailRows?.length || 0) ? "failed" : "sent",
          sent_count: sentCount,
          failed_count: failedCount,
          sent_at: new Date().toISOString(),
        })
        .eq("id", send_id);

      return new Response(
        JSON.stringify({ success: true, sent: sentCount, failed: failedCount }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── LEGACY BULK MODE (from rod_list_members directly) ──
    const langs = send.target_language === "both" ? ["es", "en"] : [send.target_language];
    let recipients: { email: string; full_name: string; company: string | null }[] = [];

    for (const lang of langs) {
      const { data: members } = await supabase
        .from("rod_list_members")
        .select("email, full_name, company")
        .eq("language", lang)
        .not("email", "is", null);
      if (members) recipients.push(...members.filter((m: any) => m.email));
    }

    const seen = new Set<string>();
    recipients = recipients.filter((r) => {
      const key = r.email.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    await supabase
      .from("rod_sends")
      .update({ total_recipients: recipients.length, status: "sending" })
      .eq("id", send_id);

    for (const recipient of recipients) {
      try {
        const personalizedHtml = (send.body_html || "")
          .replace(/\{\{nombre\}\}/g, recipient.full_name || "")
          .replace(/\{\{empresa\}\}/g, recipient.company || "");

        const fullHtml = signatureHtml
          ? `${personalizedHtml}<hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0;">${signatureHtml}`
          : personalizedHtml;

        const personalizedText = (send.body_text || "")
          .replace(/\{\{nombre\}\}/g, recipient.full_name || "")
          .replace(/\{\{empresa\}\}/g, recipient.company || "");

        const emailPayload: any = {
          from: FROM_EMAIL,
          to: [recipient.email],
          subject: send.subject,
          html: fullHtml,
          text: personalizedText,
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
          await supabase.from("rod_send_recipients").insert({
            send_id,
            email: recipient.email,
            full_name: recipient.full_name,
            company: recipient.company,
            status: "sent",
            sent_at: new Date().toISOString(),
          });
        } else {
          const errBody = await res.text();
          failedCount++;
          await supabase.from("rod_send_recipients").insert({
            send_id,
            email: recipient.email,
            full_name: recipient.full_name,
            company: recipient.company,
            status: "failed",
            error_message: errBody.slice(0, 500),
          });
        }

        if (recipients.length > 1) {
          await new Promise((r) => setTimeout(r, 100));
        }
      } catch (e: any) {
        console.error(`Error sending to ${recipient.email}:`, e);
        failedCount++;
      }
    }

    await supabase
      .from("rod_sends")
      .update({
        status: failedCount === recipients.length ? "failed" : "sent",
        sent_count: sentCount,
        failed_count: failedCount,
        sent_at: new Date().toISOString(),
      })
      .eq("id", send_id);

    return new Response(
      JSON.stringify({ success: true, sent: sentCount, failed: failedCount }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e: any) {
    console.error("send-rod-email error:", e);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
