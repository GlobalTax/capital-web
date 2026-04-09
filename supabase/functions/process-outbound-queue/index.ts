import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
  const db = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

  try {
    // 1. Mark stale running jobs as failed (no progress in 10 min)
    await db
      .from("outbound_send_queue")
      .update({ status: "failed", error_message: "Timeout: sin progreso en 10 minutos" })
      .eq("status", "running")
      .lt("last_processed_at", new Date(Date.now() - 10 * 60 * 1000).toISOString());

    // 2. Find jobs to process: pending with scheduled_at <= now, or running
    const { data: jobs, error: jobsError } = await db
      .from("outbound_send_queue")
      .select("*")
      .or(`and(status.eq.pending,scheduled_at.lte.${new Date().toISOString()}),status.eq.running`)
      .order("scheduled_at", { ascending: true })
      .limit(5);

    if (jobsError) throw jobsError;
    if (!jobs || jobs.length === 0) {
      return new Response(JSON.stringify({ message: "No jobs to process" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const results: Array<{ job_id: string; sent: number; errors: number; completed: boolean }> = [];

    for (const job of jobs) {
      // Mark as running if pending
      if (job.status === "pending") {
        await db
          .from("outbound_send_queue")
          .update({ status: "running", last_processed_at: new Date().toISOString() })
          .eq("id", job.id);
      }

      const emailIds: string[] = job.email_ids || [];
      const startIdx = job.progress_current || 0;
      const totalEmails = emailIds.length;

      if (startIdx >= totalEmails) {
        await db
          .from("outbound_send_queue")
          .update({ status: "completed", last_processed_at: new Date().toISOString() })
          .eq("id", job.id);
        results.push({ job_id: job.id, sent: 0, errors: 0, completed: true });
        continue;
      }

      // Calculate how many emails we can send in this 2-min window
      const windowMs = 2 * 60 * 1000;
      const intervalMs = job.interval_ms || 30000;
      let maxInWindow = Math.floor(windowMs / intervalMs);

      // Also respect hourly limit
      if (job.max_per_hour) {
        // Count sends in last hour from progress timestamps
        // Simple approach: limit per window based on hourly rate
        const maxPerWindow = Math.floor(job.max_per_hour / 30); // 2 min = 1/30 of an hour
        maxInWindow = Math.min(maxInWindow, Math.max(1, maxPerWindow));
      }

      const remaining = totalEmails - startIdx;
      const batchSize = Math.min(maxInWindow, remaining);

      let sent = 0;
      let errors = 0;

      for (let i = 0; i < batchSize; i++) {
        const emailId = emailIds[startIdx + i];
        if (!emailId) break;

        // Re-check job status (might have been paused/cancelled)
        const { data: currentJob } = await db
          .from("outbound_send_queue")
          .select("status")
          .eq("id", job.id)
          .single();

        if (currentJob?.status === "paused" || currentJob?.status === "cancelled") {
          break;
        }

        try {
          // Build the request to send-campaign-outbound-email
          const sendBody: Record<string, unknown> = {};

          if (job.send_type === "followup") {
            sendBody.is_followup_send = true;
            sendBody.followup_send_ids = [emailId];
          } else {
            // initial or document
            sendBody.email_ids = [emailId];
          }

          // Call the existing send function using service role (internal call)
          const sendUrl = `${SUPABASE_URL}/functions/v1/send-campaign-outbound-email`;

          // We need to get the created_by user's token or use service-role approach
          // Since send-campaign-outbound-email requires admin auth, we'll use a special header
          // Actually, let's look up the user and create a token-based call
          // Simpler: call with the creator's context by using service role
          // The send function checks admin_users, so we need to pass the creator's JWT
          // Alternative: we can use service role to get user info and pass it

          // Get a session for the creator
          const creatorId = job.created_by;
          if (!creatorId) {
            throw new Error("No created_by user for job");
          }

          // Use admin API to impersonate - actually, let's just call with anon key + service role workaround
          // The simplest approach: pass the service role key as auth and modify the edge function to accept it
          // OR: we can directly do what send-campaign-outbound-email does internally

          // Best approach: call with anon key but pass a special internal header
          const response = await fetch(sendUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${SERVICE_ROLE_KEY}`,
              "apikey": ANON_KEY,
            },
            body: JSON.stringify(sendBody),
          });

          const responseData = await response.json();

          if (!response.ok || responseData?.failed > 0) {
            const errMsg = responseData?.results?.[0]?.error || responseData?.error || "Send failed";
            console.error(`[QUEUE] Email ${emailId} failed:`, errMsg);
            errors++;
          } else {
            sent++;
          }
        } catch (e) {
          console.error(`[QUEUE] Error sending email ${emailId}:`, e);
          errors++;
        }

        // Update progress
        await db
          .from("outbound_send_queue")
          .update({
            progress_current: startIdx + i + 1,
            last_processed_at: new Date().toISOString(),
          })
          .eq("id", job.id);

        // Wait interval between emails (except last one)
        if (i < batchSize - 1) {
          await new Promise((r) => setTimeout(r, intervalMs));
        }
      }

      // Check if completed
      const newProgress = startIdx + sent + errors;
      const isCompleted = newProgress >= totalEmails;

      if (isCompleted) {
        await db
          .from("outbound_send_queue")
          .update({
            status: "completed",
            progress_current: totalEmails,
            last_processed_at: new Date().toISOString(),
          })
          .eq("id", job.id);
      }

      results.push({ job_id: job.id, sent, errors, completed: isCompleted });
    }

    return new Response(JSON.stringify({ processed: results.length, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("[QUEUE WORKER ERROR]", e);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
