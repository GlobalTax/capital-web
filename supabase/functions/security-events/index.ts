// ============= SECURITY EVENTS EDGE FUNCTION =============
// Función para recibir y procesar eventos de seguridad

import { serve } from "https://deno.land/std@0.208.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SecurityEvent {
  type: 'AUTH_ATTEMPT' | 'XSS_ATTEMPT' | 'CSRF_ATTEMPT' | 'RATE_LIMIT' | 'SUSPICIOUS_ACTIVITY';
  severity: 'low' | 'medium' | 'high' | 'critical';
  details: Record<string, any>;
  timestamp: string;
  userAgent?: string;
  ipAddress?: string;
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

    const { event } = await req.json() as { event: SecurityEvent };

    if (!event || !event.type || !event.severity) {
      return new Response(
        JSON.stringify({ error: 'Invalid security event data' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Security event received:', {
      type: event.type,
      severity: event.severity,
      timestamp: event.timestamp
    });

    // Procesar según la severidad
    if (event.severity === 'critical' || event.severity === 'high') {
      console.warn('HIGH SEVERITY SECURITY EVENT:', event);
      
      // En una implementación real, aquí podrías:
      // 1. Enviar alertas por email/SMS
      // 2. Bloquear IPs sospechosas
      // 3. Activar medidas de seguridad adicionales
      // 4. Generar reportes automáticos
    }

    // Guardar en logs (opcional - en una implementación real usarías una tabla de logs)
    console.log('Security event logged:', {
      type: event.type,
      severity: event.severity,
      details: JSON.stringify(event.details),
      userAgent: event.userAgent,
      timestamp: event.timestamp
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Security event processed',
        eventId: crypto.randomUUID()
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error processing security event:', error);
    
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});