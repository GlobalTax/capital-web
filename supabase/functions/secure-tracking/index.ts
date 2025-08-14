// ============= SECURE TRACKING EDGE FUNCTION =============
// Función para procesar eventos de tracking de forma segura con validación

import { serve } from "https://deno.land/std@0.208.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface TrackingEvent {
  visitor_id: string;
  session_id: string;
  event_type: string;
  page_path?: string;
  event_data?: Record<string, any>;
  company_domain?: string;
  referrer?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  rule_id?: string;
}

// Rate limiting: máximo 100 eventos por IP por minuto
const rateLimitMap = new Map<string, { count: number; lastReset: number }>();
const RATE_LIMIT_WINDOW = 60000; // 1 minuto
const RATE_LIMIT_MAX = 100;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const current = rateLimitMap.get(ip) || { count: 0, lastReset: now };
  
  // Reset contador si ha pasado la ventana de tiempo
  if (now - current.lastReset > RATE_LIMIT_WINDOW) {
    current.count = 0;
    current.lastReset = now;
  }
  
  current.count++;
  rateLimitMap.set(ip, current);
  
  return current.count <= RATE_LIMIT_MAX;
}

function validateTrackingEvent(event: TrackingEvent): string | null {
  // Validaciones básicas
  if (!event.visitor_id || typeof event.visitor_id !== 'string') {
    return 'visitor_id es requerido y debe ser string';
  }
  
  if (!event.session_id || typeof event.session_id !== 'string') {
    return 'session_id es requerido y debe ser string';
  }
  
  if (!event.event_type || typeof event.event_type !== 'string') {
    return 'event_type es requerido y debe ser string';
  }
  
  // Validar longitud de campos para prevenir ataques
  if (event.visitor_id.length > 100) return 'visitor_id demasiado largo';
  if (event.session_id.length > 100) return 'session_id demasiado largo';
  if (event.event_type.length > 50) return 'event_type demasiado largo';
  if (event.page_path && event.page_path.length > 500) return 'page_path demasiado largo';
  
  // Validar tipos de eventos permitidos
  const allowedEventTypes = [
    'page_view', 'calculator_usage', 'contact_interest', 'download',
    'scroll_depth', 'video_interaction', 'search', 'cta_interaction',
    'error', 'engagement_milestone', 'exit_intent', 'micro_conversion'
  ];
  
  if (!allowedEventTypes.includes(event.event_type)) {
    return `event_type no permitido: ${event.event_type}`;
  }
  
  return null;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { 
          status: 405, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Obtener IP del cliente para rate limiting
    const clientIP = req.headers.get('x-forwarded-for') || 
                     req.headers.get('x-real-ip') || 
                     'unknown';

    // Verificar rate limiting
    if (!checkRateLimit(clientIP)) {
      console.warn('Rate limit exceeded for IP:', clientIP);
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded' }),
        { 
          status: 429, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const { event } = await req.json() as { event: TrackingEvent };

    // Validar evento
    const validationError = validateTrackingEvent(event);
    if (validationError) {
      console.warn('Validation error:', validationError, { event });
      return new Response(
        JSON.stringify({ error: `Validation error: ${validationError}` }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Obtener información adicional del request
    const userAgent = req.headers.get('user-agent') || '';
    const ipAddress = clientIP !== 'unknown' ? clientIP : null;

    // Insertar evento en la base de datos usando service role
    const { error: insertError } = await supabaseClient
      .from('lead_behavior_events')
      .insert({
        visitor_id: event.visitor_id,
        session_id: event.session_id,
        event_type: event.event_type,
        page_path: event.page_path,
        event_data: event.event_data || {},
        company_domain: event.company_domain,
        referrer: event.referrer,
        utm_source: event.utm_source,
        utm_medium: event.utm_medium,
        utm_campaign: event.utm_campaign,
        rule_id: event.rule_id,
        user_agent: userAgent,
        ip_address: ipAddress,
        points_awarded: 0 // Se calculará con triggers
      });

    if (insertError) {
      console.error('Database insert error:', insertError);
      return new Response(
        JSON.stringify({ error: 'Database error' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Tracking event processed:', {
      visitor_id: event.visitor_id,
      event_type: event.event_type,
      ip: clientIP
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Tracking event processed successfully' 
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error processing tracking event:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: 'Failed to process tracking event' 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});