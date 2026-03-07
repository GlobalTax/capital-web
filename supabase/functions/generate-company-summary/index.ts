import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { callAI, aiErrorResponse } from "../_shared/ai-helper.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SYSTEM_PROMPT = `Actúa como analista empresarial senior especializado en investigación corporativa.

🔎 TAREA
Identifica la empresa correspondiente al input proporcionado.
Consulta y cruza únicamente información pública fiable, priorizando:
- Web corporativa oficial
- Aviso legal / "Sobre nosotros"
- Registros mercantiles
- Directorios empresariales (Empresite, Iberinform, etc.)

Si algún dato no está disponible públicamente, indícalo explícitamente.
No inventes información ni hagas suposiciones.
Resume la información de forma profesional, clara y neutral.

📄 OUTPUT – FORMATO OBLIGATORIO
Genera la información exactamente con esta estructura:

NOMBRE DE LA EMPRESA
• Nombre mercantil:
• NIF / CIF:
• Forma jurídica:
• Fecha de constitución:
• Comunidad Autónoma / Provincia:
• Domicilio fiscal:
• Teléfono:
• Correo electrónico:
• Web:
• CNAE principal:
• Actividad principal / Sector:

Descripción de la empresa
[Redacta un único párrafo profesional de 5–7 líneas que explique:
– A qué se dedica la empresa
– Qué productos o servicios ofrece
– A qué tipo de clientes se dirige
– En qué se diferencia o especializa
Lenguaje corporativo, claro y objetivo.]

Servicios / Actividades destacadas
•
•
•

Datos adicionales
• Número de empleados (estimado):
• Facturación estimada:
• Ámbito de actuación:
• Observaciones relevantes:

🛑 REGLAS IMPORTANTES
❌ No inventes datos
❌ No completes campos con suposiciones
✅ Si un dato no existe, escribe literalmente: "No disponible públicamente"
✅ Mantén tono profesional, neutro y corporativo
✅ No incluyas opiniones ni valoraciones personales`;

const getCIFPriorityInstructions = (cif: string | undefined) => {
  if (!cif) return '';
  return `

⚠️ PRIORIDAD ABSOLUTA - SE HA PROPORCIONADO CIF: ${cif}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DEBES priorizar OBLIGATORIAMENTE estas fuentes en este orden:
1. Registro Mercantil Central (BORME) - Buscar por CIF
2. Directorios empresariales españoles (Empresite, Infocif, Einforma, Axesor)
3. Base de datos de la AEAT / Hacienda
4. Listados de sociedades (eInforma, Expansión)

El CIF es el identificador fiscal OFICIAL. Úsalo para:
- Validar el nombre mercantil completo
- Confirmar domicilio fiscal registrado
- Verificar fecha de constitución
- Obtener datos registrales precisos

Si encuentras discrepancias entre la web y los registros oficiales,
PRIORIZA SIEMPRE la información del registro mercantil.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { company_name, website, email, phone, cif, country } = await req.json();

    if (!company_name && !website && !email) {
      return new Response(
        JSON.stringify({ error: 'Se requiere al menos nombre de empresa, web o email' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const inputData: string[] = [];
    if (company_name) inputData.push(`Nombre de empresa: ${company_name}`);
    if (website) inputData.push(`Web: ${website}`);
    if (email) inputData.push(`Email: ${email}`);
    if (phone) inputData.push(`Teléfono: ${phone}`);
    if (cif) inputData.push(`CIF: ${cif}`);
    if (country) inputData.push(`País: ${country}`);

    const dynamicSystemPrompt = SYSTEM_PROMPT + getCIFPriorityInstructions(cif);
    const userPrompt = `Analiza la siguiente empresa y genera el resumen estructurado:\n\n${inputData.join('\n')}`;

    // Use preferOpenAI for structured data extraction precision
    const response = await callAI(
      [
        { role: 'system', content: dynamicSystemPrompt },
        { role: 'user', content: userPrompt }
      ],
      {
        functionName: 'generate-company-summary',
        preferOpenAI: true,
        maxTokens: 2000,
        temperature: 0.3,
      }
    );

    console.log('Summary generated successfully using model:', response.model);

    return new Response(
      JSON.stringify({ 
        summary: response.content, 
        generated_at: new Date().toISOString(),
        model: response.model
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-company-summary:', error);
    return aiErrorResponse(error, corsHeaders);
  }
});
