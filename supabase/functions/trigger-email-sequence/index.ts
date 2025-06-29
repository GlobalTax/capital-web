
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface EmailSequenceRequest {
  sequenceId: string;
  leadScoreId: string;
  recipientEmail: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
    
    const { sequenceId, leadScoreId, recipientEmail }: EmailSequenceRequest = await req.json();

    // Obtener pasos de la secuencia
    const { data: steps, error: stepsError } = await supabaseClient
      .from('email_sequence_steps')
      .select('*')
      .eq('sequence_id', sequenceId)
      .eq('is_active', true)
      .order('step_order', { ascending: true });

    if (stepsError) {
      throw new Error(`Error fetching sequence steps: ${stepsError.message}`);
    }

    if (!steps || steps.length === 0) {
      throw new Error('No active steps found for this sequence');
    }

    // Programar cada email de la secuencia
    const scheduledEmails = [];
    const baseTime = new Date();

    for (const step of steps) {
      const scheduledFor = new Date(baseTime.getTime() + (step.delay_hours * 60 * 60 * 1000));
      
      const { data: scheduledEmail, error: scheduleError } = await supabaseClient
        .from('scheduled_emails')
        .insert({
          lead_score_id: leadScoreId,
          sequence_id: sequenceId,
          step_id: step.id,
          recipient_email: recipientEmail,
          scheduled_for: scheduledFor.toISOString(),
          status: 'pending'
        })
        .select()
        .single();

      if (scheduleError) {
        console.error('Error scheduling email:', scheduleError);
        continue;
      }

      scheduledEmails.push(scheduledEmail);

      // Si es el primer email (delay = 0), enviarlo inmediatamente
      if (step.delay_hours === 0) {
        try {
          const emailContent = generateEmailContent(step);
          
          const emailResponse = await resend.emails.send({
            from: "Capittal <info@capittal.com>",
            to: [recipientEmail],
            subject: step.subject,
            html: emailContent,
          });

          // Actualizar estado del email
          await supabaseClient
            .from('scheduled_emails')
            .update({ 
              status: 'sent', 
              sent_at: new Date().toISOString() 
            })
            .eq('id', scheduledEmail.id);

          console.log('Immediate email sent:', emailResponse);
        } catch (emailError) {
          console.error('Error sending immediate email:', emailError);
          
          await supabaseClient
            .from('scheduled_emails')
            .update({ 
              status: 'failed', 
              error_message: emailError.message 
            })
            .eq('id', scheduledEmail.id);
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Email sequence triggered with ${scheduledEmails.length} emails scheduled`,
        scheduledEmails 
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error("Error in trigger-email-sequence function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

function generateEmailContent(step: any): string {
  const baseTemplate = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>${step.subject}</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; margin-bottom: 30px;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Capittal</h1>
            <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Especialistas en M&A</p>
        </div>
        
        <div style="padding: 0 20px;">
            <h2 style="color: #333; margin-bottom: 20px;">${step.subject.replace(/📊|💡|🎯|📧|✅/g, '').trim()}</h2>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
                ${step.content.replace(/\n/g, '<br>')}
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="https://capittal.com/contacto" 
                   style="background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                    Hablar con un Experto
                </a>
            </div>
            
            <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px; text-align: center; color: #666; font-size: 14px;">
                <p>
                    <strong>Capittal</strong><br>
                    Carrer Ausias March número 36 principal<br>
                    P.º de la Castellana, 11, B - A, Chamberí, 28046 Madrid<br>
                    <a href="https://capittal.com" style="color: #667eea;">www.capittal.com</a>
                </p>
                
                <p style="margin-top: 20px;">
                    <a href="#" style="color: #999; text-decoration: none; font-size: 12px;">
                        Cancelar suscripción
                    </a>
                </p>
            </div>
        </div>
    </body>
    </html>
  `;
  
  return baseTemplate;
}

serve(handler);
