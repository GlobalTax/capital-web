import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Validation helpers
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
};

const sanitizeString = (str: string, maxLength: number): string => {
  return str.trim().slice(0, maxLength);
};

const hashIP = async (ip: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(ip + Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')?.slice(0, 16));
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 32);
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get real IP from headers
    const forwardedFor = req.headers.get('x-forwarded-for');
    const realIP = forwardedFor?.split(',')[0]?.trim() || 
                   req.headers.get('x-real-ip') || 
                   'unknown';
    
    const userAgent = req.headers.get('user-agent') || null;
    const referer = req.headers.get('referer') || null;

    // Parse and validate request body
    const body = await req.json();
    
    // Required fields validation
    const { full_name, company, email, phone, message, preferred_meeting_date, sectors_of_interest } = body;
    
    if (!full_name || typeof full_name !== 'string' || full_name.trim().length < 2) {
      return new Response(
        JSON.stringify({ error: 'invalid_name', message: 'Nombre inválido' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    if (!company || typeof company !== 'string' || company.trim().length < 2) {
      return new Response(
        JSON.stringify({ error: 'invalid_company', message: 'Empresa inválida' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    if (!email || !isValidEmail(email)) {
      return new Response(
        JSON.stringify({ error: 'invalid_email', message: 'Email inválido' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Anti-spam: Check for obvious spam patterns
    const emailLower = email.toLowerCase();
    const nameLower = full_name.toLowerCase();
    if (
      emailLower.includes('test@test') ||
      emailLower.includes('fake@') ||
      nameLower === 'test' ||
      nameLower === 'asdf'
    ) {
      console.log('Spam pattern detected:', { email, full_name });
      // Return success to not reveal detection
      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase admin client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Check rate limit
    const ipHash = await hashIP(realIP);
    const { data: canProceed } = await supabaseAdmin.rpc('check_lead_rate_limit', {
      p_ip_hash: ipHash,
      p_lead_type: 'accountex',
      p_max_requests: 5,
      p_window_hours: 24
    });

    if (!canProceed) {
      console.log('Rate limit exceeded for IP hash:', ipHash.slice(0, 8));
      return new Response(
        JSON.stringify({ 
          error: 'rate_limit', 
          message: 'Has alcanzado el límite de solicitudes. Inténtalo más tarde.' 
        }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Extract UTM params from referer if present
    let utmSource = null, utmMedium = null, utmCampaign = null;
    if (referer) {
      try {
        const url = new URL(referer);
        utmSource = url.searchParams.get('utm_source');
        utmMedium = url.searchParams.get('utm_medium');
        utmCampaign = url.searchParams.get('utm_campaign');
      } catch {
        // Invalid referer URL, ignore
      }
    }
    
    // Also check body for UTM params (sent from client)
    if (body.utm_source) utmSource = body.utm_source;
    if (body.utm_medium) utmMedium = body.utm_medium;
    if (body.utm_campaign) utmCampaign = body.utm_campaign;

    // Insert lead with sanitized data
    const { data, error } = await supabaseAdmin
      .from('accountex_leads')
      .insert({
        full_name: sanitizeString(full_name, 100),
        company: sanitizeString(company, 100),
        email: sanitizeString(email.toLowerCase(), 254),
        phone: phone ? sanitizeString(phone, 20) : null,
        message: message ? sanitizeString(message, 1000) : null,
        preferred_meeting_date: preferred_meeting_date ? sanitizeString(preferred_meeting_date, 100) : null,
        sectors_of_interest: sectors_of_interest ? sanitizeString(sectors_of_interest, 200) : null,
        ip_address: realIP,
        user_agent: userAgent?.slice(0, 500),
        referrer: referer?.slice(0, 500),
        utm_source: utmSource,
        utm_medium: utmMedium,
        utm_campaign: utmCampaign,
        status: 'pending',
      })
      .select('id')
      .single();

    if (error) {
      console.error('Error inserting accountex lead:', error);
      return new Response(
        JSON.stringify({ error: 'db_error', message: 'Error al procesar la solicitud' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Increment rate limit counter
    await supabaseAdmin.rpc('increment_lead_rate_limit', {
      p_ip_hash: ipHash,
      p_lead_type: 'accountex'
    });

    console.log('Accountex lead created successfully:', data.id);

    return new Response(
      JSON.stringify({ success: true, id: data.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in submit-accountex-lead:', error);
    return new Response(
      JSON.stringify({ error: 'server_error', message: 'Error interno del servidor' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
