import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface BulkEmailRequest {
  person_ids: string[];
  subject: string;
  body: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get auth user from request
    const authHeader = req.headers.get("Authorization");
    let userId: string | null = null;
    let userEmail: string | null = null;

    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data: { user } } = await supabase.auth.getUser(token);
      userId = user?.id ?? null;
      userEmail = user?.email ?? null;
    }

    const { person_ids, subject, body }: BulkEmailRequest = await req.json();

    if (!person_ids?.length || !subject || !body) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: person_ids, subject, body" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`Processing bulk email to ${person_ids.length} recipients`);

    // Fetch people with their fund info
    const { data: people, error: fetchError } = await supabase
      .from("sf_people")
      .select(`
        id,
        full_name,
        email,
        fund_id,
        fund:sf_funds(name)
      `)
      .in("id", person_ids)
      .not("email", "is", null);

    if (fetchError) {
      console.error("Error fetching people:", fetchError);
      throw fetchError;
    }

    if (!people?.length) {
      return new Response(
        JSON.stringify({ error: "No valid recipients found", sent: 0 }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`Found ${people.length} valid recipients with email`);

    let sentCount = 0;
    const errors: string[] = [];

    for (const person of people) {
      try {
        // Replace template variables
        const fundName = (person.fund as any)?.name || "N/A";
        const personalizedSubject = subject
          .replace(/\{\{name\}\}/g, person.full_name)
          .replace(/\{\{fund_name\}\}/g, fundName);
        
        const personalizedBody = body
          .replace(/\{\{name\}\}/g, person.full_name)
          .replace(/\{\{fund_name\}\}/g, fundName);

        // Send email
        const emailResponse = await resend.emails.send({
          from: "Capittal <info@capittal.es>",
          to: [person.email!],
          subject: personalizedSubject,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              ${personalizedBody.split('\n').map(line => `<p style="margin: 0 0 10px 0;">${line}</p>`).join('')}
            </div>
          `,
        });

        console.log(`Email sent to ${person.email}:`, emailResponse);

        // Log outreach
        await supabase.from("sf_outreach").insert({
          person_id: person.id,
          fund_id: person.fund_id,
          outreach_type: "email",
          channel: "email",
          status: "sent",
          subject: personalizedSubject,
          content: personalizedBody,
          sent_at: new Date().toISOString(),
          sent_by: userId,
        });

        sentCount++;
      } catch (emailError: any) {
        console.error(`Error sending to ${person.email}:`, emailError);
        errors.push(`${person.email}: ${emailError.message}`);

        // Log failed outreach
        await supabase.from("sf_outreach").insert({
          person_id: person.id,
          fund_id: person.fund_id,
          outreach_type: "email",
          channel: "email",
          status: "failed",
          subject: subject,
          content: body,
          notes: emailError.message,
        });
      }
    }

    console.log(`Bulk email complete: ${sentCount}/${people.length} sent`);

    return new Response(
      JSON.stringify({
        success: true,
        sent: sentCount,
        failed: errors.length,
        errors: errors.length > 0 ? errors : undefined,
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error: any) {
    console.error("Error in send-sf-bulk-email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
