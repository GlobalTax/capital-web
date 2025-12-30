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
    
    console.log('[find-company-logo] Request recibido');
    console.log('[find-company-logo] Input:', { companyName, cif });

    if (!companyName && !cif) {
      return new Response(
        JSON.stringify({ error: 'Se requiere nombre de empresa o CIF' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const searchTerm = companyName || cif;
    let domain: string | null = null;
    let cleanName = '';

    // 1. Detectar si el input es una URL y extraer dominio directamente
    const urlMatch = (companyName || '').match(/^https?:\/\/(?:www\.)?([^\/\?\s]+)/i);
    if (urlMatch) {
      domain = urlMatch[1];
      console.log('[find-company-logo] URL detectada, dominio extraído:', domain);
    } else {
      // 2. Detectar si el input ya es un dominio (ej: empresa.es)
      const domainMatch = (companyName || '').match(/^(?:www\.)?([a-z0-9\-]+\.[a-z]{2,})$/i);
      if (domainMatch) {
        domain = domainMatch[1];
        console.log('[find-company-logo] Dominio directo detectado:', domain);
      } else {
        // 3. Limpiar nombre de empresa para buscar dominio
        cleanName = (companyName || '')
          .toLowerCase()
          .replace(/[.,\-_]/g, '')
          .replace(/\s+(sl|sa|slu|sau|sll|scoop|sociedad\s+limitada|sociedad\s+anonima)$/i, '')
          .trim()
          .replace(/\s+/g, '');
        console.log('[find-company-logo] Nombre limpio:', cleanName);
      }
    }

    // Si ya tenemos dominio (de URL o directo), verificar con Clearbit
    if (domain) {
      try {
        const testUrl = `https://logo.clearbit.com/${domain}`;
        console.log('[find-company-logo] Probando Clearbit:', testUrl);
        const testResponse = await fetch(testUrl, { method: 'HEAD' });
        if (testResponse.ok) {
          console.log('[find-company-logo] Logo encontrado via Clearbit');
          return new Response(
            JSON.stringify({ logoUrl: testUrl, source: 'clearbit', domain }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      } catch (e) {
        console.log('[find-company-logo] Error probando dominio:', e);
      }
    }

    // 4. Si no encontramos dominio directo, probar dominios comunes
    if (cleanName && !domain) {
      const possibleDomains = [
        `${cleanName}.es`,
        `${cleanName}.com`,
        `${cleanName}.eu`,
        `${cleanName}.net`,
      ];
      
      console.log('[find-company-logo] Probando dominios:', possibleDomains);
      
      for (const testDomain of possibleDomains) {
        try {
          const testUrl = `https://logo.clearbit.com/${testDomain}`;
          const testResponse = await fetch(testUrl, { method: 'HEAD' });
          if (testResponse.ok) {
            domain = testDomain;
            console.log('[find-company-logo] Logo encontrado en:', domain);
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
