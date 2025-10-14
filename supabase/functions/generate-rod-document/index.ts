import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';
import { Resend } from "npm:resend@4.0.0";

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
  gdpr_consent: boolean;
  marketing_consent?: boolean;
  referrer?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
}

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
      timestamp: new Date().toISOString()
    });

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

    // ===== 2. Obtener ROD activa de la base de datos =====
    const { data: activeROD, error: rodError } = await supabase
      .from('rod_documents')
      .select('*')
      .eq('is_active', true)
      .eq('is_deleted', false)
      .single();

    if (rodError || !activeROD) {
      console.error('❌ No active ROD document found:', rodError);
      throw new Error('No hay documento ROD activo disponible. Por favor contacte al administrador.');
    }

    console.log('✅ Using active ROD:', {
      id: activeROD.id,
      version: activeROD.version,
      title: activeROD.title
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
        rod_document_id: activeROD.id,
        gdpr_consent: requestData.gdpr_consent,
        marketing_consent: requestData.marketing_consent || false,
        referrer: requestData.referrer,
        utm_source: requestData.utm_source,
        utm_medium: requestData.utm_medium,
        utm_campaign: requestData.utm_campaign,
        utm_term: requestData.utm_term,
        utm_content: requestData.utm_content,
        ip_address: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip'),
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
    const { error: updateError } = await supabase
      .from('rod_documents')
      .update({ total_downloads: (activeROD.total_downloads || 0) + 1 })
      .eq('id', activeROD.id);

    if (updateError) {
      console.warn('⚠️ Error updating download count (non-critical):', updateError);
    }

    // ===== 5. Enviar email con Resend =====
    if (resendApiKey) {
      try {
        const resend = new Resend(resendApiKey);
        
        const { data: emailData, error: emailError } = await resend.emails.send({
          from: 'Capittal <oportunidades@capittal.es>',
          to: [requestData.email],
          subject: 'Tu Relación de Open Deals (ROD) - Capittal',
          html: generateEmailHTML(requestData.full_name, activeROD.file_url, operations?.length || 0)
        });

        if (emailError) {
          console.error('❌ Error sending email:', emailError);
        } else {
          console.log('✅ Email sent successfully:', emailData?.id);
          
          // Actualizar registro con email_message_id
          await supabase
            .from('investor_leads')
            .update({
              email_sent: true,
              email_sent_at: new Date().toISOString(),
              email_message_id: emailData?.id
            })
            .eq('id', leadData.id);
        }
      } catch (emailError) {
        console.error('❌ Email sending failed:', emailError);
      }
    }

    // ===== 6. Responder con éxito =====
    return new Response(
      JSON.stringify({
        success: true,
        download_url: activeROD.file_url,
        lead_id: leadData.id,
        operations_count: operations?.length || 0,
        rod_version: activeROD.version,
        message: 'ROD enviada exitosamente'
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

function generateDocumentContent(operations: any[], format: 'pdf' | 'excel'): Uint8Array {
  // Por ahora generamos un simple texto plano que será un CSV para Excel
  // o un documento de texto para PDF. En producción, usar librerías específicas.
  
  const header = `RELACIÓN DE OPEN DEALS (ROD)\nCapittal - ${new Date().toLocaleDateString('es-ES')}\n\n`;
  
  let content = header;
  content += `Total de Operaciones: ${operations.length}\n\n`;
  
  operations.forEach((op, index) => {
    content += `\n--- OPERACIÓN ${index + 1} ---\n`;
    content += `Empresa: ${op.company_name}\n`;
    content += `Sector: ${op.sector}\n`;
    content += `Valoración: ${op.valuation_currency}${op.valuation_amount?.toLocaleString('es-ES') || 'Confidencial'}\n`;
    content += `Año: ${op.year}\n`;
    content += `Estado: ${op.status}\n`;
    content += `Descripción: ${op.description}\n`;
    
    if (op.revenue_amount) {
      content += `Facturación: ${op.valuation_currency}${op.revenue_amount.toLocaleString('es-ES')}\n`;
    }
    if (op.ebitda_amount) {
      content += `EBITDA: ${op.valuation_currency}${op.ebitda_amount.toLocaleString('es-ES')}\n`;
    }
    if (op.ebitda_multiple) {
      content += `Múltiplo EBITDA: ${op.ebitda_multiple}x\n`;
    }
    
    content += '\n';
  });
  
  // Convertir a bytes
  return new TextEncoder().encode(content);
}

function generateEmailHTML(name: string, downloadUrl: string, operationsCount: number): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
          .button { display: inline-block; background: #1e40af; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .stats { background: #f3f4f6; padding: 15px; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>¡Gracias por tu interés, ${name}!</h1>
            <p>Tu Relación de Open Deals está lista</p>
          </div>
          
          <div class="content">
            <p>Hola ${name},</p>
            
            <p>Gracias por tu interés en nuestras oportunidades de inversión. Hemos preparado tu Relación de Open Deals (ROD) personalizada con información detallada sobre nuestras operaciones activas.</p>
            
            <div class="stats">
              <strong>📊 Tu ROD incluye:</strong>
              <ul>
                <li>${operationsCount} operaciones activas</li>
                <li>Información detallada de valoración</li>
                <li>Datos financieros clave</li>
                <li>Sectores y ubicaciones</li>
              </ul>
            </div>
            
            <div style="text-align: center;">
              <a href="${downloadUrl}" class="button">
                📥 Descargar ROD
              </a>
            </div>
            
            <p><strong>Próximos pasos:</strong></p>
            <ol>
              <li>Revisa las operaciones que más se ajusten a tu perfil</li>
              <li>Nuestro equipo te contactará en las próximas 24-48 horas</li>
              <li>Agenda una reunión para discutir oportunidades específicas</li>
            </ol>
            
            <p>Si tienes alguna pregunta o necesitas información adicional, no dudes en contactarnos.</p>
            
            <p>Saludos cordiales,<br>
            <strong>Equipo Capittal</strong><br>
            oportunidades@capittal.es</p>
          </div>
          
          <div class="footer">
            <p>© ${new Date().getFullYear()} Capittal. Todos los derechos reservados.</p>
            <p>Este email contiene información confidencial. Si lo has recibido por error, por favor elimínalo.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}
