
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface PDFGenerationRequest {
  content: string;
  title: string;
  subtitle?: string;
  branding?: string;
  watermark?: boolean;
  includeContactInfo?: boolean;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      content, 
      title, 
      subtitle, 
      branding = 'Capittal', 
      watermark = true,
      includeContactInfo = true 
    }: PDFGenerationRequest = await req.json();

    // Crear HTML completo para el PDF
    const htmlContent = `
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
            border-bottom: 2px solid #3b82f6;
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
          .branding {
            font-size: 1.1em;
            color: #3b82f6;
            font-weight: 600;
          }
          .content {
            text-align: justify;
            white-space: pre-line;
          }
          .content h1, .content h2, .content h3 {
            color: #1e40af;
            margin-top: 30px;
            margin-bottom: 15px;
          }
          .content h1 {
            font-size: 2em;
            border-bottom: 1px solid #e5e7eb;
            padding-bottom: 10px;
          }
          .content h2 {
            font-size: 1.5em;
          }
          .content h3 {
            font-size: 1.2em;
          }
          .content ul, .content ol {
            margin: 15px 0;
            padding-left: 30px;
          }
          .content li {
            margin-bottom: 8px;
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
            background: #f8fafc;
            padding: 20px;
            border-radius: 8px;
            margin-top: 30px;
          }
          .watermark {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-45deg);
            font-size: 100px;
            color: rgba(59, 130, 246, 0.1);
            z-index: -1;
            font-weight: bold;
          }
          @media print {
            body { margin: 0; }
            .page-break { page-break-before: always; }
          }
        </style>
      </head>
      <body>
        ${watermark ? `<div class="watermark">${branding}</div>` : ''}
        
        <div class="header">
          <div class="title">${title}</div>
          ${subtitle ? `<div class="subtitle">${subtitle}</div>` : ''}
          <div class="branding">${branding}</div>
        </div>

        <div class="content">
          ${content.replace(/\n\n/g, '</p><p>').replace(/^\s*/, '<p>').replace(/\s*$/, '</p>')}
        </div>

        ${includeContactInfo ? `
          <div class="contact-info">
            <h3>Contacta con Capittal</h3>
            <p><strong>Dirección:</strong> Carrer Ausias March, 36 Principal - P.º de la Castellana, 11, B-A, Chamberí, 28046 Madrid</p>
            <p><strong>Email:</strong> info@capittal.com</p>
            <p><strong>Web:</strong> www.capittal.com</p>
            <p><em>Tu partner especializado en operaciones de M&A</em></p>
          </div>
        ` : ''}

        <div class="footer">
          <p>© ${new Date().getFullYear()} ${branding}. Todos los derechos reservados.</p>
          <p>Este documento contiene información confidencial y propietaria.</p>
        </div>
      </body>
      </html>
    `;

    // Por ahora, devolvemos el HTML generado
    // En un entorno real, aquí usarías una librería como Puppeteer para generar el PDF
    const response = {
      success: true,
      html: htmlContent,
      message: "PDF HTML generado exitosamente",
      // url: "URL_DEL_PDF_GENERADO" // Se añadiría cuando se implemente la generación real
    };

    return new Response(
      JSON.stringify(response),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error generando PDF:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
})
