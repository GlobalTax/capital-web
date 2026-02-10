import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Hash function for PII data (SHA-256)
async function hashData(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data.toLowerCase().trim());
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Normalize phone to E.164 format
function normalizePhone(phone: string): string {
  // Remove all non-numeric characters except +
  let cleaned = phone.replace(/[^\\d+]/g, '');
  
  // If starts with +, keep it; otherwise assume Spanish number
  if (!cleaned.startsWith('+')) {
    if (cleaned.startsWith('34')) {
      cleaned = '+' + cleaned;
    } else {
      cleaned = '+34' + cleaned;
    }
  }
  
  return cleaned;
}

interface MetaEventData {
  event_name: string;
  event_time: number;
  action_source: 'website' | 'email' | 'app' | 'phone_call' | 'chat' | 'physical_store' | 'system_generated' | 'other';
  event_source_url?: string;
  user_data: {
    em?: string[]; // Hashed email
    ph?: string[]; // Hashed phone
    fn?: string[]; // Hashed first name
    ln?: string[]; // Hashed last name
    ct?: string[]; // Hashed city
    st?: string[]; // Hashed state
    zp?: string[]; // Hashed zip
    country?: string[]; // Hashed country
    external_id?: string[];
    client_ip_address?: string;
    client_user_agent?: string;
    fbc?: string; // Facebook click ID cookie
    fbp?: string; // Facebook browser ID cookie
  };
  custom_data?: {
    value?: number;
    currency?: string;
    content_name?: string;
    content_category?: string;
    content_ids?: string[];
    content_type?: string;
    predicted_ltv?: number;
    num_items?: number;
    status?: string;
    sector?: string;
    employee_range?: string;
    valuation_id?: string;
  };
  event_id?: string; // For deduplication with browser pixel
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders, status: 200 });
  }

  try {
    const META_PIXEL_ID = Deno.env.get('META_PIXEL_ID');
    const META_ACCESS_TOKEN = Deno.env.get('META_ACCESS_TOKEN');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!META_PIXEL_ID || !META_ACCESS_TOKEN) {
      console.error('Missing Meta API credentials');
      return new Response(
        JSON.stringify({ error: 'Meta API not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body = await req.json();
    const {
      event_name,
      email,
      phone,
      first_name,
      last_name,
      city,
      country = 'es',
      value,
      currency = 'EUR',
      content_name,
      content_category,
      sector,
      employee_range,
      valuation_id,
      event_id,
      fbc,
      fbp,
      client_ip_address,
      client_user_agent,
      external_id,
      action_source = 'website',
      event_source_url
    } = body;

    if (!event_name) {
      return new Response(
        JSON.stringify({ error: 'event_name is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build user_data with hashed PII
    const user_data: MetaEventData['user_data'] = {};

    if (email) {
      user_data.em = [await hashData(email)];
    }
    if (phone) {
      const normalizedPhone = normalizePhone(phone);
      user_data.ph = [await hashData(normalizedPhone)];
    }
    if (first_name) {
      user_data.fn = [await hashData(first_name)];
    }
    if (last_name) {
      user_data.ln = [await hashData(last_name)];
    }
    if (city) {
      user_data.ct = [await hashData(city)];
    }
    if (country) {
      user_data.country = [await hashData(country)];
    }
    if (external_id) {
      user_data.external_id = [external_id];
    }
    if (fbc) {
      user_data.fbc = fbc;
    }
    if (fbp) {
      user_data.fbp = fbp;
    }
    if (client_ip_address) {
      user_data.client_ip_address = client_ip_address;
    }
    if (client_user_agent) {
      user_data.client_user_agent = client_user_agent;
    }

    // Build custom_data
    const custom_data: MetaEventData['custom_data'] = {};
    
    if (value !== undefined) {
      custom_data.value = value;
      custom_data.currency = currency;
    }
    if (content_name) {
      custom_data.content_name = content_name;
    }
    if (content_category) {
      custom_data.content_category = content_category;
    }
    if (sector) {
      custom_data.sector = sector;
    }
    if (employee_range) {
      custom_data.employee_range = employee_range;
    }
    if (valuation_id) {
      custom_data.valuation_id = valuation_id;
      custom_data.content_ids = [valuation_id];
    }

    // Build event data
    const eventData: MetaEventData = {
      event_name,
      event_time: Math.floor(Date.now() / 1000),
      action_source,
      user_data,
      custom_data: Object.keys(custom_data).length > 0 ? custom_data : undefined
    };

    if (event_source_url) {
      eventData.event_source_url = event_source_url;
    }
    if (event_id) {
      eventData.event_id = event_id;
    }

    // Send to Meta Conversions API
    const metaUrl = `https://graph.facebook.com/v18.0/${META_PIXEL_ID}/events`;
    
    const metaPayload = {
      data: [eventData],
      test_event_code: Deno.env.get('META_TEST_EVENT_CODE') // For testing, remove in production
    };

    // Remove test_event_code if not set
    if (!metaPayload.test_event_code) {
      delete (metaPayload as any).test_event_code;
    }

    console.log('📤 Sending to Meta CAPI:', JSON.stringify({
      event_name,
      event_id,
      has_email: !!email,
      has_phone: !!phone,
      value,
      sector
    }));

    const metaResponse = await fetch(`${metaUrl}?access_token=${META_ACCESS_TOKEN}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(metaPayload)
    });

    const metaResult = await metaResponse.json();

    if (!metaResponse.ok) {
      console.error('❌ Meta CAPI error:', metaResult);
      
      // Log error to database for monitoring
      if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
        await supabase.from('ad_conversions').insert({
          conversion_type: event_name,
          visitor_id: external_id,
          utm_source: 'meta',
          conversion_value: value,
          company_domain: email?.split('@')[1]
        }).catch(console.error);
      }
      
      return new Response(
        JSON.stringify({ error: 'Meta API error', details: metaResult }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('✅ Meta CAPI success:', metaResult);

    // Log successful conversion
    if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
      await supabase.from('ad_conversions').insert({
        conversion_type: event_name,
        conversion_name: content_name || event_name,
        visitor_id: external_id,
        utm_source: 'meta',
        utm_medium: 'capi',
        conversion_value: value,
        company_domain: email?.split('@')[1]
      }).catch(console.error);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        events_received: metaResult.events_received,
        fbtrace_id: metaResult.fbtrace_id
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Meta CAPI function error:', error);
    return new Response(
      JSON.stringify({ error: 'Error interno del servidor.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
