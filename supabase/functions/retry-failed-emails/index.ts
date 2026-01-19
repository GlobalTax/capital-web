import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const supabaseUrl = Deno.env.get('SUPABASE_URL') as string;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// =====================================================
// STRUCTURED LOGGING
// =====================================================
const log = (level: 'info' | 'warn' | 'error', event: string, data: object = {}) => {
  const logEntry = {
    timestamp: new Date().toISOString(),
    function: 'retry-failed-emails',
    level,
    event,
    ...data
  };
  if (level === 'error') {
    console.error(JSON.stringify(logEntry));
  } else if (level === 'warn') {
    console.warn(JSON.stringify(logEntry));
  } else {
    console.log(JSON.stringify(logEntry));
  }
};

interface EmailOutboxEntry {
  id: string;
  valuation_id: string | null;
  valuation_type: 'standard' | 'professional';
  recipient_email: string;
  recipient_name?: string;
  email_type: string;
  subject?: string;
  status: string;
  attempts: number;
  max_attempts: number;
  metadata?: Record<string, any>;
  next_retry_at?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  log('info', 'RETRY_JOB_STARTED');

  try {
    // Find emails that need retry (including false positives)
    const now = new Date().toISOString();
    
    // First, find pending/retrying emails
    const { data: pendingEmails, error: fetchError } = await supabase
      .from('email_outbox')
      .select('*')
      .in('status', ['pending', 'retrying'])
      .or(`next_retry_at.is.null,next_retry_at.lt.${now}`)
      .lt('attempts', 3)
      .order('created_at', { ascending: true })
      .limit(10);

    if (fetchError) {
      log('error', 'FETCH_PENDING_FAILED', { error: fetchError.message });
      return new Response(
        JSON.stringify({ success: false, error: fetchError.message }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Also find false positives: marked as 'sent' but without provider_message_id
    const { data: falsePositives, error: fpError } = await supabase
      .from('email_outbox')
      .select('*')
      .eq('status', 'sent')
      .is('provider_message_id', null)
      .lt('attempts', 3)
      .order('created_at', { ascending: true })
      .limit(5);

    if (fpError) {
      log('warn', 'FETCH_FALSE_POSITIVES_FAILED', { error: fpError.message });
    }

    // Combine and dedupe
    const allEmails = [...(pendingEmails || []), ...(falsePositives || [])];
    const uniqueEmails = allEmails.filter((email, index, self) => 
      index === self.findIndex(e => e.id === email.id)
    );

    if (uniqueEmails.length === 0) {
      log('info', 'NO_PENDING_EMAILS');
      return new Response(
        JSON.stringify({ success: true, processed: 0, message: 'No pending emails to retry' }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    log('info', 'FOUND_EMAILS_TO_PROCESS', { 
      pending: pendingEmails?.length || 0, 
      falsePositives: falsePositives?.length || 0,
      total: uniqueEmails.length 
    });

    const results: { id: string; success: boolean; error?: string; wasFalsePositive?: boolean }[] = [];

    for (const email of uniqueEmails as EmailOutboxEntry[]) {
      const wasFalsePositive = email.status === 'sent' && !email.provider_message_id;
      
      try {
        log('info', 'RETRYING_EMAIL', { 
          outbox_id: email.id, 
          valuation_type: email.valuation_type,
          attempt: email.attempts + 1,
          wasFalsePositive
        });

        // Mark as retrying
        await supabase
          .from('email_outbox')
          .update({ 
            status: 'retrying',
            attempts: email.attempts + 1,
            last_attempt_at: new Date().toISOString()
          })
          .eq('id', email.id);

        // Determine which function to call based on valuation type
        const functionName = email.valuation_type === 'professional' 
          ? 'send-professional-valuation-email'
          : 'send-valuation-email';

        // Build payload for retry
        const retryPayload: Record<string, any> = {
          isRetry: true,
          outboxId: email.id,
          valuationId: email.valuation_id
        };

        // Add metadata back to payload
        if (email.metadata) {
          if (email.valuation_type === 'professional') {
            retryPayload.recipientEmail = email.recipient_email;
            retryPayload.recipientName = email.recipient_name;
            retryPayload.valuationData = {
              clientCompany: email.metadata.clientCompany || 'Unknown',
              sector: email.metadata.sector || 'General',
              valuationCentral: email.metadata.valuationCentral || 0,
              valuationLow: email.metadata.valuationLow || 0,
              valuationHigh: email.metadata.valuationHigh || 0
            };
            retryPayload.advisorName = email.metadata.advisorName;
          } else {
            retryPayload.companyData = {
              email: email.recipient_email,
              contactName: email.recipient_name,
              companyName: email.metadata.companyName || 'Unknown'
            };
            retryPayload.result = email.metadata.result || {};
            retryPayload.sourceProject = email.metadata.source;
            retryPayload.leadSource = email.metadata.leadSource;
          }
        }

        // Invoke the email function
        const { data: invokeData, error: invokeError } = await supabase.functions.invoke(functionName, {
          body: retryPayload
        });

        if (invokeError) {
          log('error', 'RETRY_INVOKE_FAILED', { 
            outbox_id: email.id, 
            error: invokeError.message 
          });
          
          // Mark as failed if max attempts reached
          const newStatus = email.attempts + 1 >= email.max_attempts ? 'failed' : 'retrying';
          const delayMs = Math.pow(2, email.attempts) * 60000;
          
          await supabase
            .from('email_outbox')
            .update({ 
              status: newStatus,
              last_error: invokeError.message,
              next_retry_at: newStatus === 'retrying' 
                ? new Date(Date.now() + delayMs).toISOString() 
                : null
            })
            .eq('id', email.id);

          results.push({ id: email.id, success: false, error: invokeError.message });
        } else {
          log('info', 'RETRY_SUCCESS', { outbox_id: email.id, result: invokeData });
          results.push({ id: email.id, success: true });
        }
      } catch (emailError: any) {
        log('error', 'RETRY_EXCEPTION', { 
          outbox_id: email.id, 
          error: emailError?.message 
        });
        
        results.push({ id: email.id, success: false, error: emailError?.message });
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;

    log('info', 'RETRY_JOB_COMPLETED', { 
      total: results.length,
      success: successCount,
      failed: failCount
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        processed: results.length,
        successCount,
        failCount,
        results 
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error: any) {
    log('error', 'RETRY_JOB_FAILED', { error: error?.message, stack: error?.stack });
    
    return new Response(
      JSON.stringify({ success: false, error: error?.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
