import { supabase } from '@/integrations/supabase/client';
import { generateValuationPDFWithReactPDF } from '@/utils/reactPdfGenerator';
import { getPreferredLang } from '@/shared/i18n/locale';

interface CompanyData {
  contactName: string;
  companyName: string;
  cif: string;
  email: string;
  phone: string;
  industry: string;
  yearsOfOperation: number;
  employeeRange: string;
  revenue: number;
  ebitda: number;
  netProfitMargin: number;
  growthRate: number;
  location: string;
  ownershipParticipation: string;
  competitiveAdvantage: string;
}

interface ValuationResult {
  ebitdaMultiple: number;
  finalValuation: number;
  valuationRange: {
    min: number;
    max: number;
  };
  multiples: {
    ebitdaMultipleUsed: number;
  };
}

export const useSupabaseValuation = () => {

  const saveValuation = async (companyData: CompanyData, result: ValuationResult) => {
    try {
      console.log('=== INICIANDO GUARDADO EN SUPABASE ===');
      console.log('Datos de empresa:', companyData);
      console.log('Resultado de valoración:', result);
      
      // Obtener información del cliente
      let userAgent = '';
      let ipAddress = '';
      
      try {
        userAgent = navigator.userAgent;
        const ipResponse = await fetch('https://api.ipify.org?format=json');
        const ipData = await ipResponse.json();
        ipAddress = ipData.ip;
      } catch (error) {
        console.warn('No se pudo obtener IP o user agent:', error);
      }

      // Preparar datos para insertar - usando nombres exactos de columnas de la base de datos
      const insertData = {
        contact_name: companyData.contactName || '',
        company_name: companyData.companyName || '',
        cif: companyData.cif || null,
        email: companyData.email || '',
        phone: companyData.phone || null,
        industry: companyData.industry || '',
        years_of_operation: companyData.yearsOfOperation || null,
        employee_range: companyData.employeeRange || '',
        revenue: companyData.revenue || null,
        ebitda: companyData.ebitda || null,
        net_profit_margin: companyData.netProfitMargin || null,
        growth_rate: companyData.growthRate || null,
        location: companyData.location || null,
        ownership_participation: companyData.ownershipParticipation || null,
        competitive_advantage: companyData.competitiveAdvantage || null,
        final_valuation: result.finalValuation || null,
        ebitda_multiple_used: result.multiples.ebitdaMultipleUsed || null,
        valuation_range_min: result.valuationRange.min || null,
        valuation_range_max: result.valuationRange.max || null,
        ip_address: ipAddress,
        user_agent: userAgent,
        email_sent: false,
        whatsapp_sent: false,
        hubspot_sent: false
      };

      console.log('Datos preparados para insertar:', insertData);

      const { error } = await supabase
        .from('company_valuations')
        .insert(insertData);

      const data = null;

      if (error) {
        console.error('❌ Error de Supabase:', error);
        console.error('Detalles del error:', error.message);
        console.error('Hint:', error.hint);
        console.error('Details:', error.details);
        throw new Error(`Error de Supabase: ${error.message}`);
      }

      console.log('✅ Valoración guardada exitosamente en Supabase:', data);
      
      // Enviar a segunda base de datos (herramienta externa)
      try {
        const { data: syncResult, error: syncError } = await supabase.functions.invoke('sync-leads', {
          body: {
            type: 'company_valuation',
            data: insertData
          }
        });

        if (syncError) {
          console.error('Error sincronizando valoración con segunda DB:', syncError);
        } else {
          console.log('Valoración sincronizada exitosamente:', syncResult);
        }
      } catch (secondaryDbError) {
        console.error('Error enviando valoración a segunda DB:', secondaryDbError);
      }

      // Enviar email con los datos + adjuntar el MISMO PDF del frontend
      try {
        const lang = getPreferredLang();
        // Generar PDF (React-PDF) y convertir a Base64
        const blob = await generateValuationPDFWithReactPDF(companyData, result, lang);
        const pdfBase64: string = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const dataUrl = reader.result as string;
            resolve((dataUrl.split(',')[1]) || '');
          };
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
        const pdfFilename = `Capittal-Valoracion-${(companyData.companyName || 'empresa').replace(/\s+/g, '-')}.pdf`;

        const { data: emailResp, error: emailError } = await supabase.functions.invoke('send-valuation-email', {
          body: {
            recipientEmail: 'samuel@capittal.es',
            companyData: companyData,
            result: result,
            pdfBase64,
            pdfFilename,
            agendaUrl: `${window.location.origin}/contacto`,
            enlaces: {
              // pdfUrl: opcional si se sube a un storage público
              escenariosUrl: `${window.location.origin}/lp/calculadora`,
              calculadoraFiscalUrl: `${window.location.origin}/lp/calculadora-fiscal`
            },
            sender: {
              nombre: 'Equipo Capittal',
              cargo: 'M&A',
              firma: 'Capittal · Carrer Ausias March, 36 Principal · P.º de la Castellana, 11, B - A, Chamberí, 28046 Madrid'
            },
            subjectOverride: 'Valoración · PDF, escenarios y calculadora fiscal',
            lang
          }
        });

        if (emailError || emailResp?.success === false) {
          console.error('Error enviando email de valoración:', emailError || emailResp);
        } else {
          console.log('Email de valoración enviado correctamente:', emailResp);
          // Replicar metadatos (incluyendo URL del PDF) a la segunda base/CRM
          try {
            const pdfUrl = emailResp?.pdfUrl;
            if (pdfUrl) {
              const { data: syncResp, error: syncErr } = await supabase.functions.invoke('sync-leads', {
                body: {
                  type: 'valuation_pdf',
                  data: {
                    pdf_url: pdfUrl,
                    company: companyData,
                    result,
                    source: 'web-app',
                    timestamp: new Date().toISOString()
                  }
                }
              });
              if (syncErr) {
                console.error('Error reenviando PDF a sync-leads:', syncErr);
              } else {
                console.log('sync-leads (PDF) OK:', syncResp);
              }
            }
          } catch (e) {
            console.error('Excepción al reenviar a sync-leads:', e);
          }
        }
      } catch (emailException) {
        console.error('Excepción al generar/adjuntar PDF o enviar el email de valoración:', emailException);
      }
      
      // Toast de éxito oculto intencionalmente
      return data;
    } catch (error) {
      // Toast de error oculto intencionalmente
      throw error;
    }
  };

  const saveToolRating = async (ratingData: any) => {
    try {
      console.log('Guardando valoración de herramienta en Supabase...');
      
      // Obtener información del cliente
      const userAgent = navigator.userAgent;
      const ipResponse = await fetch('https://api.ipify.org?format=json');
      const ipData = await ipResponse.json();
      
      const { data, error } = await supabase
        .from('tool_ratings')
        .insert({
          ease_of_use: ratingData.ease_of_use,
          result_accuracy: ratingData.result_accuracy,
          recommendation: ratingData.recommendation,
          feedback_comment: ratingData.feedback_comment,
          user_email: ratingData.user_email,
          company_sector: ratingData.company_sector,
          company_size: ratingData.company_size,
          ip_address: ipData.ip,
          user_agent: userAgent
        });

      if (error) {
        console.error('Error guardando valoración de herramienta en Supabase:', error);
        throw error;
      }

      console.log('Valoración de herramienta guardada correctamente en Supabase:', data);
      return data;
    } catch (error) {
      console.error('Error en saveToolRating:', error);
      throw error;
    }
  };

  return {
    saveValuation,
    saveToolRating
  };
};
