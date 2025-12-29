import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * Brevo Track Event - Edge Function
 * 
 * Registra eventos críticos del backend en Brevo Events API para:
 * - Trigger de automatizaciones
 * - Lead scoring
 * - Personalización de comunicaciones
 * 
 * Eventos soportados:
 * - lead_status_changed: Cambio de estado del lead
 * - valuation_completed: Valoración completada con éxito
 * - meeting_scheduled: Reunión agendada
 * - document_viewed: Documento descargado/visto
 * - email_replied: Respuesta a email recibida
 * - company_linked: Empresa vinculada al lead
 * - task_completed: Tarea del lead completada
 * - note_added: Nota añadida al lead
 * - deal_stage_changed: Cambio de etapa en pipeline
 */

interface TrackEventRequest {
  email: string;
  event: string;
  eventdata?: Record<string, any>;
  properties?: Record<string, any>;
}

interface BrevoTrackEvent {
  email: string;
  event: string;
  eventdata?: Record<string, any>;
  properties?: Record<string, any>;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const BREVO_API_KEY = Deno.env.get('BREVO_API_KEY');
    if (!BREVO_API_KEY) {
      throw new Error('BREVO_API_KEY not configured');
    }

    // Initialize Supabase client for logging
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { email, event, eventdata, properties }: TrackEventRequest = await req.json();

    // Validación básica
    if (!email || !event) {
      return new Response(
        JSON.stringify({ error: 'email and event are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`📊 [brevo-track-event] Tracking event "${event}" for ${email}`);
    console.log('📋 Event data:', JSON.stringify(eventdata || {}));

    // Enriquecer eventdata con timestamp si no lo tiene
    const enrichedEventData = {
      ...eventdata,
      timestamp: eventdata?.timestamp || new Date().toISOString(),
      source: 'capittal_backend',
    };

    // Construir payload para Brevo Events API
    const brevoPayload: BrevoTrackEvent = {
      email,
      event,
      eventdata: enrichedEventData,
    };

    // Añadir properties si existen (para atributos de contacto a actualizar)
    if (properties && Object.keys(properties).length > 0) {
      brevoPayload.properties = properties;
    }

    // Llamar a Brevo Events API
    const brevoResponse = await fetch('https://api.brevo.com/v3/trackEvent', {
      method: 'POST',
      headers: {
        'api-key': BREVO_API_KEY,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(brevoPayload),
    });

    console.log(`📥 Brevo Events API response status: ${brevoResponse.status}`);

    // Parse response
    let brevoData = null;
    const responseText = await brevoResponse.text();
    if (responseText) {
      try {
        brevoData = JSON.parse(responseText);
      } catch {
        console.log('Response was not JSON:', responseText.substring(0, 200));
      }
    }

    // Log en brevo_sync_log
    const logEntry = {
      entity_id: eventdata?.lead_id || eventdata?.valuation_id || email,
      entity_type: 'event',
      sync_status: brevoResponse.ok ? 'success' : 'failed',
      brevo_id: null,
      sync_error: brevoResponse.ok ? null : (brevoData ? JSON.stringify(brevoData) : responseText),
      last_sync_at: new Date().toISOString(),
    };

    await supabase.from('brevo_sync_log').insert(logEntry);

    if (!brevoResponse.ok) {
      console.error('❌ Brevo Events API error:', brevoData || responseText);
      
      // Si el contacto no existe, no es error crítico (el evento se pierde pero no falla)
      if (brevoResponse.status === 404) {
        console.log('⚠️ Contact not found in Brevo, event not tracked');
        return new Response(
          JSON.stringify({ 
            success: false, 
            warning: 'Contact not found in Brevo',
            event,
            email 
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`Brevo Events API error: ${JSON.stringify(brevoData || responseText)}`);
    }

    console.log('✅ Event tracked successfully in Brevo');

    return new Response(
      JSON.stringify({ 
        success: true, 
        event,
        email,
        eventdata: enrichedEventData,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('❌ Error in brevo-track-event:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
