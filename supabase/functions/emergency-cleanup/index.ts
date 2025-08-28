import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CleanupResult {
  success: boolean;
  deletedRecords: number;
  freedSpaceGB: number;
  message: string;
  timestamp: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('🧹 Iniciando cleanup de emergencia...');

    // Ejecutar función de cleanup
    const { data: cleanupResult, error: cleanupError } = await supabase
      .rpc('emergency_cleanup_daily');

    if (cleanupError) {
      throw new Error(`Error en cleanup: ${cleanupError.message}`);
    }

    // Verificar tamaños de tablas después del cleanup
    const { data: tableSizes, error: sizeError } = await supabase
      .from('pg_tables')
      .select('tablename')
      .eq('schemaname', 'public')
      .limit(5);

    if (sizeError) {
      console.warn('No se pudieron obtener tamaños de tabla:', sizeError);
    }

    // Marcar valoraciones abandonadas sin disparar alerts
    const { data: abandonmentResult, error: abandonmentError } = await supabase
      .rpc('detect_abandoned_valuations_emergency');

    if (abandonmentError) {
      console.warn('Error en detección de abandono:', abandonmentError);
    }

    const result: CleanupResult = {
      success: true,
      deletedRecords: cleanupResult || 0,
      freedSpaceGB: Math.round((cleanupResult || 0) * 0.001), // Estimación
      message: `Cleanup completado. ${cleanupResult || 0} registros eliminados.`,
      timestamp: new Date().toISOString()
    };

    console.log('✅ Cleanup de emergencia completado:', result);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('❌ Error en cleanup de emergencia:', error);

    const errorResult: CleanupResult = {
      success: false,
      deletedRecords: 0,
      freedSpaceGB: 0,
      message: `Error: ${error.message}`,
      timestamp: new Date().toISOString()
    };

    return new Response(JSON.stringify(errorResult), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});