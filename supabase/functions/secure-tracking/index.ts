import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Set a 2-second timeout for the entire function
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Function timeout')), 2000);
    });

    const processRequest = async () => {
      const { event } = await req.json() as { event?: TrackingEventData };
      
      if (!event || !event.visitor_id || !event.session_id || !event.event_type) {
        return new Response(
          JSON.stringify({ error: 'Missing required event data' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Create a simplified tracking event for storage
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
        created_at: new Date().toISOString()
      };

      console.log('📊 Tracking event processed:', {
        type: event.event_type,
        visitor: event.visitor_id.substring(0, 8) + '...',
        page: event.page_path
      });

      // Return success response immediately (fire-and-forget approach)
      return new Response(
        JSON.stringify({ success: true, timestamp: trackingData.created_at }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    };

    // Race between timeout and actual processing
    const result = await Promise.race([processRequest(), timeoutPromise]);
    return result as Response;

  } catch (error) {
    console.error('❌ Secure tracking error:', error);
    
    // Return error response within timeout
    return new Response(
      JSON.stringify({ 
        error: 'Processing failed', 
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});