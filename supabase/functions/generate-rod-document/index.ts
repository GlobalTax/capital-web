import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';
import { Resend } from "https://esm.sh/resend@4.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RODRequest {
  full_name: string;
  email: string;
  phone?: string;
  company?: string;
  investor_type?: string;
  investment_range?: string;
  sectors_of_interest?: string;
  preferred_location?: string;
  document_format: 'pdf' | 'excel';
  language?: 'es' | 'en';
  gdpr_consent: boolean;
  marketing_consent?: boolean;
  referrer?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
}

// Email interno para el equipo Capittal
const INTERNAL_EMAIL_RECIPIENTS = [
  'samuel@capittal.es',
  'marcc@capittal.es',
  'oriol@capittal.es'
];

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase configuration');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const requestData: RODRequest = await req.json();

    console.log('📋 ROD Document Request:', {
      email: requestData.email,
      format: requestData.document_format,
      language: requestData.language,
      timestamp: new Date().toISOString()
    });

    // ===== Extraer y validar IP del cliente (IPv4/IPv6) =====
    const rawIpHeader = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip');
    const clientIp = rawIpHeader ? rawIpHeader.split(',')[0].trim() : null;
    
    const isValidIpv4 = clientIp && /^(\d{1,3}\.){3}\d{1,3}$/.test(clientIp);
    const isValidIpv6 = clientIp && /^([0-9a-fA-F]{0,4}:){2,7}[0-9a-fA-F]{0,4}$/.test(clientIp);
    const isValidIp = isValidIpv4 || isValidIpv6;

    // ===== 1. Obtener operaciones activas =====
    const { data: operations, error: opsError } = await supabase
      .from('company_operations')
      .select('*')
      .eq('is_active', true)
      .eq('status', 'available')
      .order('year', { ascending: false })
      .order('valuation_amount', { ascending: false });

    if (opsError) {
      console.error('❌ Error fetching operations:', opsError);
      throw new Error('Failed to fetch operations');
    }

    console.log(`✅ Fetched ${operations?.length || 0} active operations`);

    // ===== 2. Obtener RODs activas (multi-idioma) con fallback mejorado =====
    const requestedLang = requestData.language || 'es';
    
    const { data: activeRODs, error: rodError } = await supabase
      .from('rod_documents')
      .select('*')
      .eq('is_active', true)
      .eq('is_deleted', false);

    if (rodError || !activeRODs?.length) {
      console.error('❌ No active ROD documents found:', rodError);
      throw new Error('No hay documento ROD activo disponible. Por favor contacte al administrador.');
    }

    // Determinar qué ROD servir según idioma solicitado (fallback mejorado)
    let selectedROD = activeRODs.find(r => r.language === requestedLang);
    let languageFallbackUsed = false;
    
    if (!selectedROD) {
      // FALLBACK: Buscar primero ES, luego cualquiera
      selectedROD = activeRODs.find(r => r.language === 'es') || activeRODs[0];
      languageFallbackUsed = true;
      console.log(`⚠️ FALLBACK: Language ${requestedLang} not available, serving ${selectedROD.language}`);
    }
    
    const availableLanguages = [...new Set(activeRODs.map(r => r.language))];

    console.log('📊 ROD Selection:', {
      requested: requestedLang,
      served: selectedROD.language,
      fallback_used: languageFallbackUsed,
      available: availableLanguages
    });

    // ===== 3. Crear lead de inversor con referencia a ROD =====
    const { data: leadData, error: leadError } = await supabase
      .from('investor_leads')
      .insert({
        full_name: requestData.full_name,
        email: requestData.email,
        phone: requestData.phone,
        company: requestData.company,
        investor_type: requestData.investor_type,
        investment_range: requestData.investment_range,
        sectors_of_interest: requestData.sectors_of_interest,
        preferred_location: requestData.preferred_location,
        document_format: requestData.document_format,
        rod_document_id: selectedROD.id,
        gdpr_consent: requestData.gdpr_consent,
        marketing_consent: requestData.marketing_consent || false,
        referrer: requestData.referrer,
        utm_source: requestData.utm_source,
        utm_medium: requestData.utm_medium,
        utm_campaign: requestData.utm_campaign,
        utm_term: requestData.utm_term,
        utm_content: requestData.utm_content,
        ip_address: isValidIp ? clientIp : null,
        user_agent: req.headers.get('user-agent'),
        status: 'new'
      })
      .select()
      .single();

    if (leadError) {
      console.error('❌ Error creating investor lead:', leadError);
      throw new Error('Failed to create investor lead');
    }

    console.log('✅ Investor lead created:', leadData.id);

    // ===== 4. Incrementar contador de descargas en ROD =====
    await supabase
      .from('rod_documents')
      .update({ total_downloads: (selectedROD.total_downloads || 0) + 1 })
      .eq('id', selectedROD.id);

    // ===== 5. UPSERT en buyer_contacts (deduplicación por email) =====
    try {
      const nameParts = requestData.full_name.trim().split(' ');
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(' ') || null;

      const { data: existingContact } = await supabase
        .from('buyer_contacts')
        .select('id, rod_downloads_count, first_seen_at')
        .eq('email', requestData.email)
        .maybeSingle();

      if (existingContact) {
        // UPDATE: Contacto existente → actualizar campos + incrementar descargas
        const { error: updateError } = await supabase
          .from('buyer_contacts')
          .update({
            phone: requestData.phone || undefined,
            company: requestData.company || undefined,
            investor_type: requestData.investor_type,
            investment_range: requestData.investment_range,
            sectors_of_interest: requestData.sectors_of_interest,
            preferred_location: requestData.preferred_location,
            preferred_language: selectedROD.language,
            last_activity_at: new Date().toISOString(),
            rod_downloads_count: (existingContact.rod_downloads_count || 0) + 1,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingContact.id);
        
        if (updateError) {
          console.error('❌ Error updating buyer contact:', updateError);
        } else {
          console.log(`✅ Buyer contact UPDATED: ${existingContact.id}`);
        }
      } else {
        // INSERT: Nuevo contacto (sin 'origin' para usar default 'campana_compras')
        const { error: insertError } = await supabase
          .from('buyer_contacts')
          .insert({
            first_name: firstName,
            last_name: lastName,
            // full_name es columna generada, no se puede insertar
            email: requestData.email,
            phone: requestData.phone,
            company: requestData.company,
            campaign_name: 'ROD LinkedIn',
            investor_type: requestData.investor_type,
            investment_range: requestData.investment_range,
            sectors_of_interest: requestData.sectors_of_interest,
            preferred_location: requestData.preferred_location,
            preferred_language: selectedROD.language,
            source: 'ROD Download – LinkedIn',
            first_seen_at: new Date().toISOString(),
            last_activity_at: new Date().toISOString(),
            rod_downloads_count: 1,
            status: 'nuevo'
          });
        
        if (insertError) {
          console.error('❌ Error creating buyer contact:', insertError);
        } else {
          console.log(`✅ Buyer contact CREATED for: ${requestData.email}`);
        }
      }
    } catch (buyerError) {
      // Non-critical: log but don't fail the request
      console.error('⚠️ Error upserting buyer contact (non-critical):', buyerError);
    }

    // ===== 6. Enviar emails con Resend =====
    if (resendApiKey) {
      const resend = new Resend(resendApiKey);
      const timestamp = new Date().toISOString();
      
      try {
        // 6a. Email al usuario
        const emailSubject = selectedROD.language === 'en' 
          ? 'Your Open Deals Report (ROD) - Capittal'
          : 'Tu Relación de Open Deals (ROD) - Capittal';
          
        const { data: emailData, error: emailError } = await resend.emails.send({
          from: 'Capittal <oportunidades@capittal.es>',
          to: [requestData.email],
          subject: emailSubject,
          html: generateEmailHTML(requestData.full_name, selectedROD.file_url, operations?.length || 0, selectedROD.language),
          attachments: [
            {
              path: 'https://webcapittal.lovable.app/logotipo-white.png',
              filename: 'logotipo-white.png',
              content_id: 'capittal-logo',
            }
          ]
        });

        if (emailError) {
          console.error('❌ Error sending user email:', emailError);
        } else {
          console.log('✅ User email sent:', emailData?.id);
          
          await supabase
            .from('investor_leads')
            .update({
              email_sent: true,
              email_sent_at: timestamp,
              email_message_id: emailData?.id
            })
            .eq('id', leadData.id);
        }

        // 6b. Email INTERNO al equipo Capittal
        const internalEmailHtml = generateInternalLeadEmailHTML({
          full_name: requestData.full_name,
          email: requestData.email,
          phone: requestData.phone || '-',
          company: requestData.company || '-',
          investor_type: requestData.investor_type || '-',
          investment_range: requestData.investment_range || '-',
          sectors_of_interest: requestData.sectors_of_interest || '-',
          preferred_location: requestData.preferred_location || '-',
          document_language: selectedROD.language === 'en' ? 'Inglés (EN)' : 'Español (ES)',
          document_format: requestData.document_format.toUpperCase(),
          timestamp,
          fallback_used: languageFallbackUsed
        });

        const { error: internalEmailError } = await resend.emails.send({
          from: 'Capittal System <no-reply@capittal.es>',
          to: INTERNAL_EMAIL_RECIPIENTS,
          subject: `Nueva descarga de la ROD | Lead captado - ${requestData.full_name}`,
          html: internalEmailHtml
        });

        if (internalEmailError) {
          console.error('❌ Error sending internal email:', internalEmailError);
        } else {
          console.log('✅ Internal notification email sent to team');
        }

      } catch (emailError) {
        console.error('❌ Email sending failed:', emailError);
      }
    }

    // ===== 7. Responder con éxito =====
    return new Response(
      JSON.stringify({
        success: true,
        download_url: selectedROD.file_url,
        lead_id: leadData.id,
        operations_count: operations?.length || 0,
        rod_version: selectedROD.version,
        served_language: selectedROD.language,
        requested_language: requestedLang,
        fallback_used: languageFallbackUsed,
        available_languages: availableLanguages,
        message: selectedROD.language === 'en' ? 'ROD sent successfully' : 'ROD enviada exitosamente'
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('❌ CRITICAL ERROR in generate-rod-document:', {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: error.message
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

// ===== Funciones auxiliares =====

interface InternalEmailData {
  full_name: string;
  email: string;
  phone: string;
  company: string;
  investor_type: string;
  investment_range: string;
  sectors_of_interest: string;
  preferred_location: string;
  document_language: string;
  document_format: string;
  timestamp: string;
  fallback_used: boolean;
}

function generateInternalLeadEmailHTML(data: InternalEmailData): string {
  const formattedDate = new Date(data.timestamp).toLocaleString('es-ES', {
    dateStyle: 'full',
    timeStyle: 'short'
  });

  const fallbackWarning = data.fallback_used 
    ? `<div style="background: #fef3c7; border: 1px solid #f59e0b; padding: 10px; border-radius: 6px; margin-bottom: 20px;">
        ⚠️ <strong>Nota:</strong> Se aplicó fallback de idioma. El usuario solicitó un idioma no disponible.
       </div>`
    : '';

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background: #f9fafb; margin: 0; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); color: white; padding: 25px; text-align: center; }
          .header h1 { margin: 0; font-size: 22px; }
          .content { padding: 25px; }
          .section { margin-bottom: 20px; }
          .section-title { font-size: 14px; font-weight: 600; color: #6b7280; margin-bottom: 10px; display: flex; align-items: center; gap: 6px; }
          .field { display: flex; margin-bottom: 8px; }
          .field-label { font-weight: 500; color: #374151; min-width: 160px; }
          .field-value { color: #111827; }
          .divider { border-top: 1px solid #e5e7eb; margin: 20px 0; }
          .cta { background: #f3f4f6; padding: 15px; border-radius: 6px; text-align: center; }
          .cta p { margin: 0; color: #374151; }
          .footer { text-align: center; padding: 15px; color: #9ca3af; font-size: 12px; background: #f9fafb; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📥 Nueva descarga de la ROD</h1>
            <p style="margin: 5px 0 0; opacity: 0.9;">Lead captado desde LinkedIn</p>
          </div>
          
          <div class="content">
            ${fallbackWarning}
            
            <div class="section">
              <div class="section-title">👤 Datos del contacto</div>
              <div class="field">
                <span class="field-label">Nombre completo:</span>
                <span class="field-value">${data.full_name}</span>
              </div>
              <div class="field">
                <span class="field-label">Email:</span>
                <span class="field-value"><a href="mailto:${data.email}">${data.email}</a></span>
              </div>
              <div class="field">
                <span class="field-label">Teléfono:</span>
                <span class="field-value">${data.phone}</span>
              </div>
              <div class="field">
                <span class="field-label">Empresa / Fondo:</span>
                <span class="field-value">${data.company}</span>
              </div>
            </div>
            
            <div class="divider"></div>
            
            <div class="section">
              <div class="section-title">💼 Perfil del inversor</div>
              <div class="field">
                <span class="field-label">Tipo de inversor:</span>
                <span class="field-value">${data.investor_type}</span>
              </div>
              <div class="field">
                <span class="field-label">Rango de inversión:</span>
                <span class="field-value">${data.investment_range}</span>
              </div>
            </div>
            
            <div class="divider"></div>
            
            <div class="section">
              <div class="section-title">🎯 Preferencias de inversión</div>
              <div class="field">
                <span class="field-label">Sectores de interés:</span>
                <span class="field-value">${data.sectors_of_interest}</span>
              </div>
              <div class="field">
                <span class="field-label">Ubicación preferida:</span>
                <span class="field-value">${data.preferred_location}</span>
              </div>
            </div>
            
            <div class="divider"></div>
            
            <div class="section">
              <div class="section-title">📄 Documento descargado</div>
              <div class="field">
                <span class="field-label">Idioma del documento:</span>
                <span class="field-value">${data.document_language}</span>
              </div>
              <div class="field">
                <span class="field-label">Formato:</span>
                <span class="field-value">${data.document_format}</span>
              </div>
            </div>
            
            <div class="divider"></div>
            
            <div class="section">
              <div class="section-title">🕒 Información del evento</div>
              <div class="field">
                <span class="field-label">Fecha y hora:</span>
                <span class="field-value">${formattedDate}</span>
              </div>
              <div class="field">
                <span class="field-label">Origen:</span>
                <span class="field-value">Landing ROD – LinkedIn</span>
              </div>
            </div>
            
            <div class="cta">
              <p>🚀 <strong>Acción recomendada:</strong> Este lead ha mostrado interés explícito descargando la ROD. Se recomienda contactar para seguimiento comercial.</p>
            </div>
          </div>
          
          <div class="footer">
            Este es un mensaje automático generado por Capittal System.
          </div>
        </div>
      </body>
    </html>
  `;
}

function generateEmailHTML(name: string, downloadUrl: string, operationsCount: number, language: string = 'es'): string {
  const isEnglish = language === 'en';
  const year = new Date().getFullYear();
  

  const t = isEnglish ? {
    preheader: 'Your Open Deals Report is ready',
    greeting: `Dear ${name},`,
    intro: 'Thank you for your interest in our investment opportunities. Your personalised Open Deals Report (ROD) is ready for download.',
    cardLabel: 'Your report includes',
    cardOps: `${operationsCount} active operations`,
    cardDetail: 'Valuations, financials, sectors & locations',
    cta: 'Download ROD',
    stepsTitle: 'Next steps',
    step1: 'Review the operations that best match your investment profile.',
    step2: 'Our team will contact you within 24–48 hours.',
    step3: 'Schedule a call to discuss specific opportunities.',
    closing: 'If you have any questions, feel free to reach out.',
    signoff: 'Best regards,',
    team: 'Capittal Team',
    legal: `© ${year} Capittal. All rights reserved. This email contains confidential information intended solely for its recipient.`,
  } : {
    preheader: 'Tu Relación de Open Deals está lista',
    greeting: `Hola ${name},`,
    intro: 'Gracias por tu interés en nuestras oportunidades de inversión. Tu Relación de Open Deals (ROD) personalizada ya está disponible para descarga.',
    cardLabel: 'Tu informe incluye',
    cardOps: `${operationsCount} operaciones activas`,
    cardDetail: 'Valoraciones, datos financieros, sectores y ubicaciones',
    cta: 'Descargar ROD',
    stepsTitle: 'Próximos pasos',
    step1: 'Revisa las operaciones que mejor encajen con tu perfil inversor.',
    step2: 'Nuestro equipo te contactará en las próximas 24–48 horas.',
    step3: 'Agenda una llamada para comentar oportunidades específicas.',
    closing: 'Si tienes alguna pregunta, no dudes en contactarnos.',
    signoff: 'Un cordial saludo,',
    team: 'Equipo Capittal',
    legal: `© ${year} Capittal. Todos los derechos reservados. Este email contiene información confidencial destinada únicamente a su destinatario.`,
  };

  return `<!DOCTYPE html>
<html lang="${isEnglish ? 'en' : 'es'}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${t.preheader}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
    body, table, td, p, a, li { font-family: 'Plus Jakarta Sans', Arial, Helvetica, sans-serif; }
  </style>
</head>
<body style="margin:0;padding:0;background-color:#f8f9fa;">
  <!-- Preheader -->
  <div style="display:none;max-height:0;overflow:hidden;">${t.preheader}</div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8f9fa;">
    <tr><td style="padding:24px 16px;">

      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="margin:0 auto;max-width:600px;">
        
        <!-- Header -->
        <tr>
          <td style="background-color:#1a1f2e;padding:32px 40px;text-align:center;border-radius:12px 12px 0 0;">
            <img src="cid:capittal-logo" alt="Capittal" width="160" style="display:inline-block;max-width:160px;height:auto;" />
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="background-color:#ffffff;padding:40px;border-left:1px solid #e5e7eb;border-right:1px solid #e5e7eb;">
            
            <p style="margin:0 0 20px;font-size:16px;color:#1a1f2e;line-height:1.6;">${t.greeting}</p>
            <p style="margin:0 0 28px;font-size:15px;color:#4b5563;line-height:1.7;">${t.intro}</p>

            <!-- ROD Card -->
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 32px;border:1px solid #e5e7eb;border-radius:10px;overflow:hidden;">
              <tr>
                <td style="background-color:#f9fafb;padding:24px 28px;">
                  <p style="margin:0 0 8px;font-size:12px;color:#9ca3af;text-transform:uppercase;letter-spacing:1px;font-weight:600;">${t.cardLabel}</p>
                  <p style="margin:0 0 4px;font-size:18px;color:#1a1f2e;font-weight:700;">${t.cardOps}</p>
                  <p style="margin:0;font-size:14px;color:#6b7280;">${t.cardDetail}</p>
                </td>
              </tr>
              <tr>
                <td style="padding:20px 28px 24px;text-align:center;">
                  <a href="${downloadUrl}" style="display:inline-block;background-color:#4f46e5;color:#ffffff;padding:14px 36px;font-size:15px;font-weight:600;text-decoration:none;border-radius:8px;letter-spacing:0.3px;">${t.cta}</a>
                </td>
              </tr>
            </table>

            <!-- Steps -->
            <p style="margin:0 0 16px;font-size:15px;color:#1a1f2e;font-weight:600;">${t.stepsTitle}</p>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 28px;">
              <tr>
                <td style="padding:8px 0;vertical-align:top;width:28px;">
                  <span style="display:inline-block;width:22px;height:22px;background-color:#4f46e5;color:#fff;font-size:12px;font-weight:700;text-align:center;line-height:22px;border-radius:50%;">1</span>
                </td>
                <td style="padding:8px 0 8px 12px;font-size:14px;color:#4b5563;line-height:1.6;">${t.step1}</td>
              </tr>
              <tr>
                <td style="padding:8px 0;vertical-align:top;width:28px;">
                  <span style="display:inline-block;width:22px;height:22px;background-color:#4f46e5;color:#fff;font-size:12px;font-weight:700;text-align:center;line-height:22px;border-radius:50%;">2</span>
                </td>
                <td style="padding:8px 0 8px 12px;font-size:14px;color:#4b5563;line-height:1.6;">${t.step2}</td>
              </tr>
              <tr>
                <td style="padding:8px 0;vertical-align:top;width:28px;">
                  <span style="display:inline-block;width:22px;height:22px;background-color:#4f46e5;color:#fff;font-size:12px;font-weight:700;text-align:center;line-height:22px;border-radius:50%;">3</span>
                </td>
                <td style="padding:8px 0 8px 12px;font-size:14px;color:#4b5563;line-height:1.6;">${t.step3}</td>
              </tr>
            </table>

            <p style="margin:0 0 28px;font-size:14px;color:#6b7280;line-height:1.6;">${t.closing}</p>

            <!-- Signature -->
            <table role="presentation" cellpadding="0" cellspacing="0" style="border-top:1px solid #e5e7eb;padding-top:20px;">
              <tr>
                <td style="padding-top:20px;">
                  <p style="margin:0 0 4px;font-size:14px;color:#6b7280;">${t.signoff}</p>
                  <p style="margin:0 0 8px;font-size:15px;color:#1a1f2e;font-weight:700;">${t.team}</p>
                  <p style="margin:0;font-size:13px;color:#9ca3af;">
                    oportunidades@capittal.es &nbsp;|&nbsp; +34 695 717 490
                  </p>
                </td>
              </tr>
            </table>

          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background-color:#f9fafb;padding:24px 40px;text-align:center;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px;">
            <p style="margin:0 0 8px;font-size:12px;color:#9ca3af;">
              <a href="https://capittal.es" style="color:#4f46e5;text-decoration:none;font-weight:500;">capittal.es</a>
            </p>
            <p style="margin:0;font-size:11px;color:#c0c5ce;line-height:1.5;">${t.legal}</p>
          </td>
        </tr>

      </table>

    </td></tr>
  </table>
</body>
</html>`;
}
