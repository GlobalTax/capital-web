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
    const { send_id, test_mode, test_email } = await req.json();

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

    // Fetch attachments if any
    const attachments: { filename: string; content: string }[] = [];
    if (send.attachment_ids?.length) {
      const { data: docs } = await supabase
        .from("rod_documents")
        .select("title, file_url, file_type")
        .in("id", send.attachment_ids);

      if (docs) {
        for (const doc of docs) {
          try {
            // file_url is the public URL - download it
            const response = await fetch(doc.file_url);
            if (response.ok) {
              const buffer = await response.arrayBuffer();
              const base64 = btoa(
                String.fromCharCode(...new Uint8Array(buffer))
              );
              const ext = doc.file_type === "excel" ? "xlsx" : "pdf";
              attachments.push({
                filename: `${doc.title}.${ext}`,
                content: base64,
              });
            }
          } catch (e) {
            console.error(`Failed to download attachment ${doc.title}:`, e);
          }
        }
      }
    }

    // Determine recipients
    let recipients: { email: string; full_name: string; company: string | null }[] = [];

    if (test_mode && test_email) {
      // Test mode: send to single email
      recipients = [{ email: test_email, full_name: "Prueba", company: "Test" }];
    } else {
      // Bulk mode: get from rod_list_members
      const langs = send.target_language === "both" ? ["es", "en"] : [send.target_language];
      
      for (const lang of langs) {
        const { data: members } = await supabase
          .from("rod_list_members")
          .select("email, full_name, company")
          .eq("language", lang)
          .not("email", "is", null);

        if (members) {
          recipients.push(...members.filter((m: any) => m.email));
        }
      }

      // Deduplicate by email
      const seen = new Set<string>();
      recipients = recipients.filter((r) => {
        const key = r.email.toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

      // Update total_recipients
      await supabase
        .from("rod_sends")
        .update({ total_recipients: recipients.length, status: "sending" })
        .eq("id", send_id);
    }

    // Send emails
    let sentCount = 0;
    let failedCount = 0;

    for (const recipient of recipients) {
      try {
        // Personalize content
        const personalizedHtml = (send.body_html || "")
          .replace(/\{\{nombre\}\}/g, recipient.full_name || "")
          .replace(/\{\{empresa\}\}/g, recipient.company || "");

        const personalizedText = (send.body_text || "")
          .replace(/\{\{nombre\}\}/g, recipient.full_name || "")
          .replace(/\{\{empresa\}\}/g, recipient.company || "");

        // Build Resend payload
        const emailPayload: any = {
          from: FROM_EMAIL,
          to: [recipient.email],
          subject: send.subject,
          html: personalizedHtml,
          text: personalizedText,
        };

        if (attachments.length > 0) {
          emailPayload.attachments = attachments;
        }

        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(emailPayload),
        });

        if (res.ok) {
          sentCount++;
          // Record recipient (skip for test mode)
          if (!test_mode) {
            await supabase.from("rod_send_recipients").insert({
              send_id,
              email: recipient.email,
              full_name: recipient.full_name,
              company: recipient.company,
              status: "sent",
              sent_at: new Date().toISOString(),
            });
          }
        } else {
          const errBody = await res.text();
          console.error(`Failed to send to ${recipient.email}:`, errBody);
          failedCount++;
          if (!test_mode) {
            await supabase.from("rod_send_recipients").insert({
              send_id,
              email: recipient.email,
              full_name: recipient.full_name,
              company: recipient.company,
              status: "failed",
              error_message: errBody.slice(0, 500),
            });
          }
        }

        // Rate limiting: ~100ms between sends
        if (recipients.length > 1) {
          await new Promise((r) => setTimeout(r, 100));
        }
      } catch (e: any) {
        console.error(`Error sending to ${recipient.email}:`, e);
        failedCount++;
      }
    }

    // Update send record (skip for test mode)
    if (!test_mode) {
      await supabase
        .from("rod_sends")
        .update({
          status: failedCount === recipients.length ? "failed" : "sent",
          sent_count: sentCount,
          failed_count: failedCount,
          sent_at: new Date().toISOString(),
        })
        .eq("id", send_id);
    }

    return new Response(
      JSON.stringify({
        success: true,
        sent: sentCount,
        failed: failedCount,
        test_mode: !!test_mode,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (e: any) {
    console.error("send-rod-email error:", e);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
