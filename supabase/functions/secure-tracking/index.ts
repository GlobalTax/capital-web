import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400'
};

interface TrackingEventData {
  visitor_id: string;
  session_id: string;
  event_type: string;
  page_path: string;
  event_data?: Record<string, any>;
  company_domain?: string;
  referrer?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
}

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false }
});

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    const { event } = await req.json() as { event?: TrackingEventData };
    
    // Validate required fields
    if (!event || !event.visitor_id || !event.session_id || !event.event_type) {
      return new Response(
        JSON.stringify({ error: 'Missing required event data' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get client IP and user agent for enhanced tracking
    const clientIP = req.headers.get('x-forwarded-for') || 
                    req.headers.get('x-real-ip') || 
                    'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';

    // Prepare tracking data for database insertion
    const trackingData = {
      visitor_id: event.visitor_id,
      session_id: event.session_id,
      event_type: event.event_type,
      page_path: event.page_path || '/',
      event_data: event.event_data || {},
      company_domain: event.company_domain,
      referrer: event.referrer,
      utm_source: event.utm_source,
      utm_medium: event.utm_medium,
      utm_campaign: event.utm_campaign,
      utm_content: event.utm_content,
      utm_term: event.utm_term,
      ip_address: clientIP,
      user_agent: userAgent
    };

    // Store in database with background processing
    const storeData = async () => {
      try {
        const { error: dbError } = await supabase
          .from('tracking_events')
          .insert(trackingData);

        if (dbError) {
          console.error('❌ Database insert error:', dbError);
        } else {
          console.log('✅ Tracking event stored:', {
            type: event.event_type,
            visitor: event.visitor_id.substring(0, 8) + '...',
            page: event.page_path
          });
        }
      } catch (dbError) {
        console.error('❌ Database operation failed:', dbError);
      }
    };

    // Use background task for database operation
    EdgeRuntime.waitUntil(storeData());

    // Return immediate success response
    return new Response(
      JSON.stringify({ 
        success: true, 
        timestamp: new Date().toISOString() 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('❌ Secure tracking error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Processing failed', 
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});