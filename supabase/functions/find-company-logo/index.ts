import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { companyName, cif } = await req.json();
    
    console.log('[find-company-logo] Buscando logo para:', { companyName, cif });

    if (!companyName && !cif) {
      return new Response(
        JSON.stringify({ error: 'Se requiere nombre de empresa o CIF' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Intentar extraer dominio del nombre de empresa
    const searchTerm = companyName || cif;
    let domain: string | null = null;
    
    // Limpiar nombre de empresa para buscar dominio
    const cleanName = (companyName || '')
      .toLowerCase()
      .replace(/[.,\-_]/g, '')
      .replace(/\s+(sl|sa|slu|sau|sll|scoop|sociedad\s+limitada|sociedad\s+anonima)$/i, '')
      .trim()
      .replace(/\s+/g, '');

    if (cleanName) {
      // Probar dominios comunes
      const possibleDomains = [
        `${cleanName}.es`,
        `${cleanName}.com`,
        `${cleanName}.eu`,
      ];
      
      // Verificar cuál existe usando Clearbit (no requiere API key)
      for (const testDomain of possibleDomains) {
        try {
          const testUrl = `https://logo.clearbit.com/${testDomain}`;
          const testResponse = await fetch(testUrl, { method: 'HEAD' });
          if (testResponse.ok) {
            domain = testDomain;
            break;
          }
        } catch {
          // Continuar con siguiente dominio
        }
      }
    }

    // Si encontramos dominio, usar Clearbit Logo API (gratuita)
    if (domain) {
      const logoUrl = `https://logo.clearbit.com/${domain}`;
      console.log('[find-company-logo] Logo encontrado via Clearbit:', logoUrl);
      
      return new Response(
        JSON.stringify({ 
          logoUrl,
          source: 'clearbit',
          domain 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fallback: Usar Google Favicon API para buscar con el nombre
    const googleQuery = encodeURIComponent(`${searchTerm} oficial`);
    // No hay logo directo, pero podemos intentar con favicon de google
    const fallbackUrl = `https://www.google.com/s2/favicons?domain=${cleanName}.com&sz=128`;
    
    // Verificar si existe
    try {
      const testResponse = await fetch(fallbackUrl, { method: 'HEAD' });
      if (testResponse.ok && testResponse.headers.get('content-length') !== '0') {
        console.log('[find-company-logo] Usando Google favicon como fallback');
        return new Response(
          JSON.stringify({ 
            logoUrl: fallbackUrl,
            source: 'google-favicon',
            message: 'Se encontró un favicon, pero puede que no sea el logo oficial' 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    } catch {
      // Ignorar error de fallback
    }

    // No se encontró nada
    console.log('[find-company-logo] No se encontró logo para:', searchTerm);
    return new Response(
      JSON.stringify({ 
        logoUrl: null,
        message: 'No se encontró logo automáticamente. Puedes subir uno manualmente.'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[find-company-logo] Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Error desconocido' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
