import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

/**
 * Edge Function: cleanup-expired-tokens
 * 
 * Limpieza automática diaria de datos antiguos:
 * 1. Elimina valoraciones incompletas > 7 días
 * 2. Anonimiza valoraciones completadas > 90 días (GDPR compliant)
 * 
 * Programar con cron job:
 * - Ejecutar todos los días a las 2 AM
 * - Ver supabase/config.toml para configuración
 */

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CleanupResult {
  success: boolean;
  deleted: number;
  anonymized: number;
  error?: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase credentials');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('🧹 Starting cleanup job...');

    // 1. Eliminar valoraciones incompletas > 7 días
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    
    const { data: deleted, error: deleteError } = await supabase
      .from('company_valuations')
      .update({ 
        is_deleted: true, 
        deleted_at: new Date().toISOString() 
      })
      .eq('valuation_status', 'started')
      .lt('created_at', sevenDaysAgo)
      .is('is_deleted', false)
      .select('id');

    if (deleteError) {
      console.error('❌ Error deleting incomplete valuations:', deleteError);
      throw deleteError;
    }

    console.log(`🗑️  Deleted ${deleted?.length || 0} incomplete valuations`);

    // 2. Anonimizar valoraciones completadas > 90 días
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();
    
    const { data: anonymized, error: anonError } = await supabase
      .from('company_valuations')
      .update({
        email: 'anonymized@capittal.es',
        phone: null,
        phone_e164: null,
        contact_name: 'ANONYMIZED',
        ip_address: null,
        user_agent: null,
      })
      .eq('valuation_status', 'completed')
      .lt('created_at', ninetyDaysAgo)
      .neq('email', 'anonymized@capittal.es') // Solo si no ha sido anonimizado antes
      .select('id');

    if (anonError) {
      console.error('❌ Error anonymizing completed valuations:', anonError);
      throw anonError;
    }

    console.log(`🔒 Anonymized ${anonymized?.length || 0} completed valuations`);

    const result: CleanupResult = {
      success: true,
      deleted: deleted?.length || 0,
      anonymized: anonymized?.length || 0,
    };

    console.log('✅ Cleanup job completed successfully:', result);

    return new Response(
      JSON.stringify(result),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('❌ Cleanup job failed:', error);
    
    const errorResult: CleanupResult = {
      success: false,
      deleted: 0,
      anonymized: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    };

    return new Response(
      JSON.stringify(errorResult),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
