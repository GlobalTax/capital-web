import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Genera hash SHA-256 del token
async function hashToken(token: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(token);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const token = url.searchParams.get('token');
    
    if (!token) {
      return new Response(
        JSON.stringify({ error: 'Token requerido', code: 'MISSING_TOKEN' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validar longitud mínima del token
    if (token.length < 20) {
      return new Response(
        JSON.stringify({ error: 'Token inválido', code: 'INVALID_TOKEN' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, serviceRoleKey);
    
    // Obtener IP del cliente para rate limiting
    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
                     req.headers.get('x-real-ip') || 
                     '0.0.0.0';
    
    // Verificar rate limit
    const { data: rateLimitOk } = await supabase.rpc('check_token_rate_limit', {
      p_ip: clientIp,
      p_max_attempts: 10,
      p_window_minutes: 15
    });
    
    if (!rateLimitOk) {
      console.log(`⚠️ Rate limit exceeded for IP: ${clientIp.substring(0, 10)}...`);
      return new Response(
        JSON.stringify({ error: 'Demasiados intentos. Intenta más tarde.', code: 'RATE_LIMITED' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Hash del token para búsqueda segura
    const tokenHash = await hashToken(token);
    
    // Primero intentar con el nuevo sistema de tokens
    const { data: tokenValidation, error: validationError } = await supabase.rpc('validate_share_token', {
      p_token_hash: tokenHash,
      p_ip: clientIp
    });
    
    let valuationId: string | null = null;
    let useLegacyToken = false;
    
    if (tokenValidation && tokenValidation.length > 0 && tokenValidation[0].is_valid) {
      valuationId = tokenValidation[0].valuation_id;
      console.log(`✅ Token validated via new system for valuation: ${valuationId}`);
    } else if (tokenValidation && tokenValidation.length > 0 && !tokenValidation[0].is_valid) {
      // Token encontrado pero inválido
      const reason = tokenValidation[0].failure_reason;
      console.log(`❌ Token validation failed: ${reason}`);
      
      const errorMessages: Record<string, string> = {
        'TOKEN_REVOKED': 'Este enlace ha sido revocado',
        'TOKEN_EXPIRED': 'Este enlace ha expirado',
        'MAX_VIEWS_EXCEEDED': 'Este enlace ha alcanzado el límite de visualizaciones'
      };
      
      return new Response(
        JSON.stringify({ 
          error: errorMessages[reason] || 'Token inválido', 
          code: reason 
        }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      // Fallback: buscar en el sistema legacy (unique_token)
      console.log(`🔄 Trying legacy token system...`);
      useLegacyToken = true;
      
      const { data: legacyData, error: legacyError } = await supabase
        .from('company_valuations')
        .select('id, unique_token, token_used_at, token_expires_at, valuation_status, is_deleted')
        .eq('unique_token', token)
        .eq('is_deleted', false)
        .single();
      
      if (legacyError || !legacyData) {
        // Log failed attempt
        await supabase.from('token_access_log').insert({
          token_hash_prefix: tokenHash.substring(0, 8),
          access_ip: clientIp,
          user_agent: req.headers.get('user-agent'),
          success: false,
          failure_reason: 'TOKEN_NOT_FOUND'
        });
        
        return new Response(
          JSON.stringify({ error: 'Token no encontrado', code: 'TOKEN_NOT_FOUND' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      // Validar token legacy
      if (legacyData.valuation_status !== 'completed') {
        return new Response(
          JSON.stringify({ error: 'Valoración no disponible', code: 'NOT_COMPLETED' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (legacyData.token_expires_at && new Date(legacyData.token_expires_at) < new Date()) {
        return new Response(
          JSON.stringify({ error: 'Este enlace ha expirado', code: 'TOKEN_EXPIRED' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      // Marcar como usado si es primera vez
      if (!legacyData.token_used_at) {
        await supabase
          .from('company_valuations')
          .update({ token_used_at: new Date().toISOString() })
          .eq('id', legacyData.id);
      }
      
      valuationId = legacyData.id;
      console.log(`✅ Legacy token validated for valuation: ${valuationId}`);
    }

    if (!valuationId) {
      return new Response(
        JSON.stringify({ error: 'Token inválido', code: 'INVALID_TOKEN' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Obtener datos de la valoración (solo campos necesarios, NO PII sensible)
    const { data: valuation, error: valuationError } = await supabase
      .from('company_valuations')
      .select(`
        id,
        company_name,
        contact_name,
        email,
        industry,
        employee_range,
        revenue,
        ebitda,
        has_adjustments,
        adjustment_amount,
        final_valuation,
        valuation_range_min,
        valuation_range_max,
        ebitda_multiple,
        created_at,
        valuation_status
      `)
      .eq('id', valuationId)
      .single();

    if (valuationError || !valuation) {
      console.error('Error fetching valuation:', valuationError);
      return new Response(
        JSON.stringify({ error: 'Error al obtener valoración', code: 'FETCH_ERROR' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Log successful access
    if (!useLegacyToken) {
      // Ya se logueó en validate_share_token
    } else {
      await supabase.from('token_access_log').insert({
        valuation_id: valuationId,
        token_hash_prefix: token.substring(0, 8),
        access_ip: clientIp,
        user_agent: req.headers.get('user-agent'),
        success: true,
        failure_reason: null
      });
    }

    console.log(`📊 Returning sanitized valuation data for: ${valuation.company_name}`);

    // Devolver datos sanitizados
    return new Response(
      JSON.stringify({
        success: true,
        data: {
          id: valuation.id,
          companyName: valuation.company_name,
          contactName: valuation.contact_name,
          email: valuation.email,
          industry: valuation.industry,
          employeeRange: valuation.employee_range,
          revenue: valuation.revenue,
          ebitda: valuation.ebitda,
          hasAdjustments: valuation.has_adjustments,
          adjustmentAmount: valuation.adjustment_amount,
          finalValuation: valuation.final_valuation,
          valuationRangeMin: valuation.valuation_range_min,
          valuationRangeMax: valuation.valuation_range_max,
          ebitdaMultiple: valuation.ebitda_multiple,
          createdAt: valuation.created_at,
          status: valuation.valuation_status
        }
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Error in get-valuation-by-token:', error);
    return new Response(
      JSON.stringify({ error: 'Error interno del servidor', code: 'INTERNAL_ERROR' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
