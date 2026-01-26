// =============================================
// GENERATE CORPORATE EMAIL WITH AI
// Generates personalized M&A outreach emails
// =============================================

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface GenerateEmailRequest {
  buyer_id: string;
  contact_id?: string;
  operation_id?: string;
  tone?: 'formal' | 'professional' | 'friendly';
  purpose?: 'introduction' | 'opportunity' | 'followup';
  custom_context?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { 
      buyer_id, 
      contact_id, 
      operation_id,
      tone = 'professional',
      purpose = 'introduction',
      custom_context
    }: GenerateEmailRequest = await req.json();

    if (!buyer_id) {
      return new Response(
        JSON.stringify({ error: "buyer_id is required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Fetch buyer data
    const { data: buyer, error: buyerError } = await supabase
      .from("corporate_buyers")
      .select("*")
      .eq("id", buyer_id)
      .single();

    if (buyerError || !buyer) {
      return new Response(
        JSON.stringify({ error: "Buyer not found" }),
        { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Fetch contact if specified
    let contact = null;
    if (contact_id) {
      const { data } = await supabase
        .from("corporate_contacts")
        .select("*")
        .eq("id", contact_id)
        .single();
      contact = data;
    }

    // Fetch operation if specified
    let operation = null;
    if (operation_id) {
      const { data } = await supabase
        .from("company_operations")
        .select("*")
        .eq("id", operation_id)
        .single();
      operation = data;
    }

    // Build AI prompt
    const systemPrompt = `Eres un especialista senior en M&A redactando emails de outreach para Capittal, una boutique de asesoramiento financiero.

ESTILO:
- Tono: ${tone === 'formal' ? 'Muy formal y corporativo' : tone === 'friendly' ? 'Cercano pero profesional' : 'Profesional y directo'}
- Objetivo: ${purpose === 'introduction' ? 'Presentar a Capittal y explorar sinergias' : purpose === 'opportunity' ? 'Presentar una oportunidad de inversión específica' : 'Dar seguimiento a una conversación previa'}
- Longitud: 150-250 palabras máximo
- Incluir un CTA claro al final
- NO incluir líneas de asunto, solo el cuerpo del email
- Usa el nombre del contacto para personalizar

FIRMA (incluirla siempre al final):
Samuel Navarro
Managing Partner
Capittal · M&A Advisory
+34 695 717 490`;

    const userPrompt = `Genera un email para:

COMPRADOR: ${buyer.name}
${buyer.buyer_type ? `TIPO: ${buyer.buyer_type}` : ''}
${buyer.description ? `DESCRIPCIÓN: ${buyer.description.substring(0, 500)}` : ''}
${buyer.sector_focus?.length ? `SECTORES DE INTERÉS: ${buyer.sector_focus.join(', ')}` : ''}
${buyer.geography_focus?.length ? `GEOGRAFÍA: ${buyer.geography_focus.join(', ')}` : ''}
${buyer.investment_thesis ? `TESIS DE INVERSIÓN: ${buyer.investment_thesis.substring(0, 300)}` : ''}

${contact ? `
CONTACTO: ${contact.full_name}
${contact.title ? `CARGO: ${contact.title}` : ''}
${contact.role ? `ROL: ${contact.role}` : ''}
` : ''}

${operation ? `
OPORTUNIDAD A PRESENTAR:
- Nombre: ${operation.name}
- Sector: ${operation.sector}
- Descripción: ${operation.description?.substring(0, 300) || 'N/A'}
${operation.valuation_amount ? `- Valoración: €${(operation.valuation_amount / 1000000).toFixed(1)}M` : ''}
` : ''}

${custom_context ? `CONTEXTO ADICIONAL: ${custom_context}` : ''}

Genera un email personalizado y convincente.`;

    // Call AI
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${lovableApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!aiResponse.ok) {
      const error = await aiResponse.text();
      console.error("AI API error:", error);
      throw new Error("Failed to generate email");
    }

    const aiData = await aiResponse.json();
    const generatedBody = aiData.choices?.[0]?.message?.content || "";

    // Generate subject based on purpose
    let suggestedSubject = "";
    if (purpose === 'introduction') {
      suggestedSubject = `Explorar sinergias con ${buyer.name}`;
    } else if (purpose === 'opportunity' && operation) {
      suggestedSubject = `Oportunidad de inversión - ${operation.sector}`;
    } else {
      suggestedSubject = `Seguimiento - ${buyer.name}`;
    }

    return new Response(
      JSON.stringify({
        success: true,
        subject: suggestedSubject,
        body: generatedBody.trim(),
        buyer_name: buyer.name,
        contact_name: contact?.full_name || null,
        operation_name: operation?.name || null,
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error: any) {
    console.error("Error in generate-corporate-email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
