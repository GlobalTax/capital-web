
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface PDFGenerationRequest {
  valuationId: string;
  pdfType?: 'simple' | 'detailed';
  includeCharts?: boolean;
  language?: 'es' | 'en';
}

interface CompanyValuation {
  id: string;
  company_name: string;
  contact_name: string;
  email: string;
  industry: string;
  employee_range: string;
  revenue: number;
  ebitda: number;
  final_valuation: number;
  valuation_range_min: number;
  valuation_range_max: number;
  ebitda_multiple_used: number;
  competitive_advantage: string;
  location: string;
  created_at: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      valuationId,
      pdfType = 'simple',
      includeCharts = false,
      language = 'es'
    }: PDFGenerationRequest = await req.json();

    // Inicializar cliente Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Obtener datos de la valoración
    const { data: valuation, error: valuationError } = await supabase
      .from('company_valuations')
      .select('*')
      .eq('id', valuationId)
      .single();

    if (valuationError || !valuation) {
      throw new Error('Valoración no encontrada');
    }

    // Generar HTML del PDF según el tipo
    const htmlContent = generatePDFHTML(valuation, pdfType, language);

    // Log del evento (opcional)
    const startTime = Date.now();
    
    try {
      // Por ahora retornamos el HTML - en producción aquí se usaría Puppeteer
      // para generar PDF real desde HTML
      const generationTime = Date.now() - startTime;
      
      // Log opcional del evento de generación
      if (valuation.user_id) {
        await supabase.from('pdf_download_logs').insert({
          user_id: valuation.user_id,
          valuation_id: valuationId,
          pdf_type: 'edge_function',
          generation_time_ms: generationTime,
          user_agent: req.headers.get('user-agent') || null
        });
      }

      // Respuesta exitosa
      const response = {
        success: true,
        html: htmlContent,
        message: "PDF generado exitosamente",
        generationTime: generationTime,
        // En el futuro aquí iría la URL del PDF generado
        // pdfUrl: "URL_DEL_PDF_REAL"
      };

      return new Response(
        JSON.stringify(response),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    } catch (pdfError) {
      console.error('Error generando PDF:', pdfError);
      
      // Log del error
      if (valuation.user_id) {
        await supabase.from('pdf_download_logs').insert({
          user_id: valuation.user_id,
          valuation_id: valuationId,
          pdf_type: 'edge_function',
          download_status: 'error',
          generation_time_ms: Date.now() - startTime,
          user_agent: req.headers.get('user-agent') || null
        });
      }
      
      throw pdfError;
    }

  } catch (error) {
    console.error('Error en generate-pdf-report:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Error interno del servidor'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
})

// Función para generar HTML del PDF
function generatePDFHTML(valuation: CompanyValuation, pdfType: string, language: string): string {
  const formatCurrency = (amount: number | null) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 800px;
          margin: 0 auto;
          padding: 40px 20px;
        }
        .header {
          text-align: center;
          border-bottom: 3px solid #3b82f6;
          padding-bottom: 20px;
          margin-bottom: 40px;
        }
        .title {
          font-size: 2.5em;
          font-weight: bold;
          color: #1e40af;
          margin-bottom: 10px;
        }
        .subtitle {
          font-size: 1.2em;
          color: #6b7280;
          margin-bottom: 20px;
        }
        .content {
          text-align: justify;
        }
        .info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 30px;
          margin: 30px 0;
        }
        .info-section {
          background: #f8fafc;
          padding: 20px;
          border-radius: 8px;
          border-left: 4px solid #3b82f6;
        }
        .info-section h3 {
          margin: 0 0 15px 0;
          color: #1e40af;
          font-size: 16px;
        }
        .info-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px solid #e5e7eb;
        }
        .info-row:last-child {
          border-bottom: none;
        }
        .info-label {
          font-weight: 600;
          color: #374151;
        }
        .info-value {
          color: #6b7280;
        }
        .valuation-highlight {
          background: linear-gradient(135deg, #3b82f6, #1e40af);
          color: white;
          padding: 30px;
          border-radius: 12px;
          text-align: center;
          margin: 40px 0;
        }
        .valuation-amount {
          font-size: 3em;
          font-weight: bold;
          margin: 0;
        }
        .valuation-range {
          font-size: 1em;
          opacity: 0.9;
          margin-top: 10px;
        }
        .footer {
          margin-top: 60px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
          text-align: center;
          color: #6b7280;
          font-size: 0.9em;
        }
        .contact-info {
          background: #f0f9ff;
          border: 1px solid #bae6fd;
          padding: 20px;
          border-radius: 8px;
          margin-top: 30px;
        }
        .disclaimer {
          background: #fff3cd;
          border: 1px solid #ffeaa7;
          padding: 20px;
          border-radius: 8px;
          margin-top: 30px;
          font-size: 0.85em;
          color: #856404;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="title">CAPITTAL</div>
        <div class="subtitle">Informe de Valoración Empresarial</div>
        <h2 style="margin: 20px 0 0 0; color: #1e40af;">${valuation.company_name}</h2>
        <p style="margin: 10px 0 0 0; color: #6b7280;">${formatDate(valuation.created_at)}</p>
      </div>

      <div class="valuation-highlight">
        <h3 style="margin: 0 0 10px 0; font-size: 1.2em;">Valoración Estimada</h3>
        <div class="valuation-amount">${formatCurrency(valuation.final_valuation)}</div>
        <div class="valuation-range">
          Rango: ${formatCurrency(valuation.valuation_range_min)} - ${formatCurrency(valuation.valuation_range_max)}
        </div>
      </div>

      <div class="info-grid">
        <div class="info-section">
          <h3>Información de la Empresa</h3>
          <div class="info-row">
            <span class="info-label">Empresa:</span>
            <span class="info-value">${valuation.company_name}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Contacto:</span>
            <span class="info-value">${valuation.contact_name}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Sector:</span>
            <span class="info-value">${valuation.industry}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Empleados:</span>
            <span class="info-value">${valuation.employee_range}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Ubicación:</span>
            <span class="info-value">${valuation.location || 'N/A'}</span>
          </div>
        </div>

        <div class="info-section">
          <h3>Datos Financieros</h3>
          <div class="info-row">
            <span class="info-label">Facturación:</span>
            <span class="info-value">${formatCurrency(valuation.revenue)}</span>
          </div>
          <div class="info-row">
            <span class="info-label">EBITDA:</span>
            <span class="info-value">${formatCurrency(valuation.ebitda)}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Múltiplo usado:</span>
            <span class="info-value">${valuation.ebitda_multiple_used}x</span>
          </div>
          <div class="info-row">
            <span class="info-label">Margen EBITDA:</span>
            <span class="info-value">${((valuation.ebitda / valuation.revenue) * 100).toFixed(1)}%</span>
          </div>
        </div>
      </div>

      ${valuation.competitive_advantage ? `
        <div class="info-section" style="margin-top: 30px;">
          <h3>Ventaja Competitiva</h3>
          <p style="margin: 0; color: #374151; line-height: 1.6;">${valuation.competitive_advantage}</p>
        </div>
      ` : ''}

      <div class="contact-info">
        <h3 style="margin: 0 0 15px 0; color: #1e40af;">Contacta con Capittal</h3>
        <p style="margin: 0 0 10px 0;"><strong>Dirección:</strong> Carrer Ausias March, 36 Principal - P.º de la Castellana, 11, B-A, Chamberí, 28046 Madrid</p>
        <p style="margin: 0 0 10px 0;"><strong>Email:</strong> info@capittal.com</p>
        <p style="margin: 0 0 10px 0;"><strong>Web:</strong> www.capittal.com</p>
        <p style="margin: 0; font-style: italic;">Tu partner especializado en operaciones de M&A</p>
      </div>

      <div class="disclaimer">
        <h4 style="margin: 0 0 10px 0;">Aviso Legal</h4>
        <p style="margin: 0 0 10px 0;">Esta valoración es una estimación basada en múltiplos EBITDA por sector y no constituye asesoramiento financiero profesional.</p>
        <p style="margin: 0;">Para valoraciones definitivas se recomienda realizar un análisis detallado por parte de expertos.</p>
      </div>

      <div class="footer">
        <p>© ${new Date().getFullYear()} Capittal. Todos los derechos reservados.</p>
        <p>Este documento contiene información confidencial y propietaria.</p>
      </div>
    </body>
    </html>
  `;
}
