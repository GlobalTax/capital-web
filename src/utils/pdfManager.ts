import { supabase } from '@/integrations/supabase/client';
import { CompanyData, ValuationResult } from '@/types/valuation';
import { logger } from './conditionalLogger';

interface PDFDownloadOptions {
  valuationId: string;
  pdfType?: 'react_pdf' | 'edge_function' | 'simple_report' | 'auto';
  userId?: string;
  language?: 'es' | 'ca' | 'en';
}

// Interfaz local para React-PDF que incluye todos los campos necesarios
interface ReactPDFCompanyData {
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

// Mapeo de datos de valoración a tipos requeridos
function mapValuationToPDFData(valuation: any): { companyData: ReactPDFCompanyData; result: ValuationResult } {
  const companyData: ReactPDFCompanyData = {
    contactName: valuation.contact_name || '',
    companyName: valuation.company_name || '',
    cif: valuation.cif || '',
    email: valuation.email || '',
    phone: valuation.phone || '',
    industry: valuation.industry || '',
    yearsOfOperation: valuation.years_of_operation || 0,
    employeeRange: valuation.employee_range || '',
    revenue: valuation.revenue || 0,
    ebitda: valuation.ebitda || 0,
    netProfitMargin: valuation.net_profit_margin || 0,
    growthRate: valuation.growth_rate || 0,
    location: valuation.location || '',
    ownershipParticipation: valuation.ownership_participation || '',
    competitiveAdvantage: valuation.competitive_advantage || '',
  };

  const result: ValuationResult = {
    ebitdaMultiple: valuation.ebitda_multiple_used || 0,
    finalValuation: valuation.final_valuation || 0,
    valuationRange: {
      min: valuation.valuation_range_min || 0,
      max: valuation.valuation_range_max || 0,
    },
    multiples: {
      ebitdaMultipleUsed: valuation.ebitda_multiple_used || 0,
    },
  };

  return { companyData, result };
}

// Función para loggear descargas de PDF
async function logPDFDownload(
  userId: string | undefined,
  valuationId: string,
  pdfType: string,
  status: 'success' | 'error' = 'success',
  fileSize?: number,
  generationTime?: number
) {
  if (!userId) return;

  try {
    await supabase.from('pdf_download_logs').insert({
      user_id: userId,
      valuation_id: valuationId,
      pdf_type: pdfType,
      download_status: status,
      file_size_bytes: fileSize,
      generation_time_ms: generationTime,
      user_agent: navigator.userAgent,
    });
  } catch (error) {
    console.warn('No se pudo registrar el log de descarga PDF:', error);
  }
}

// Función principal para descargar PDFs
export async function downloadValuationPDF(options: PDFDownloadOptions): Promise<void> {
  const { valuationId, pdfType = 'auto', userId, language = 'es' } = options;
  const startTime = Date.now();

  try {
    // Obtener datos de la valoración
    const { data: valuation, error } = await supabase
      .from('company_valuations')
      .select('*')
      .eq('id', valuationId)
      .single();

    if (error || !valuation) {
      throw new Error('No se pudo cargar la valoración');
    }

    // Decidir qué tipo de PDF generar
    let finalPdfType = pdfType;
    if (pdfType === 'auto') {
      // Si la valoración está completa, usar React-PDF para mayor calidad
      // Si no, usar Edge Function para reportes simples
      finalPdfType = valuation.final_valuation ? 'react_pdf' : 'edge_function';
    }

    let blob: Blob;
    let filename: string;

    if (finalPdfType === 'react_pdf' && valuation.final_valuation) {
      // Usar lazy loading para React-PDF para evitar errores de inicialización
      logger.info('Using lazy React-PDF generation');
      const { companyData, result } = mapValuationToPDFData(valuation);
      
      try {
        // Import dinámico para evitar errores de inicialización
        const { generateValuationPDFWithReactPDF } = await import('./reactPdfGenerator');
        
        blob = await generateValuationPDFWithReactPDF(companyData, result, language);
        filename = `valoracion-${valuation.company_name}-${new Date().toISOString().split('T')[0]}.pdf`;
      } catch (pdfError) {
        logger.error('React-PDF generation failed, falling back to edge function:', pdfError);
        finalPdfType = 'edge_function'; // Fallback
      }
    }
    
    if (finalPdfType === 'edge_function') {
      // Usar Edge Function para reportes simples
      logger.info('Using edge function for PDF generation');
      const { data, error: pdfError } = await supabase.functions.invoke('generate-pdf-report', {
        body: {
          valuationId,
          pdfType: 'simple',
          includeCharts: false,
          language,
        },
      });

      if (pdfError || !data?.success) {
        throw new Error(data?.error || 'Error generando PDF en el servidor');
      }

      // Por ahora, crear un blob simple con el HTML
      // En el futuro aquí recibiremos directamente el PDF del servidor
      blob = new Blob([data.html], { type: 'text/html' });
      filename = `reporte-${valuation.company_name}-${new Date().toISOString().split('T')[0]}.html`;
    }

    // Descargar el archivo
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    // Log del evento exitoso
    const generationTime = Date.now() - startTime;
    await logPDFDownload(
      userId,
      valuationId,
      finalPdfType as string,
      'success',
      blob.size,
      generationTime
    );

  } catch (error) {
    console.error('Error descargando PDF:', error);
    
    // Log del error
    const generationTime = Date.now() - startTime;
    await logPDFDownload(
      userId,
      valuationId,
      pdfType as string,
      'error',
      undefined,
      generationTime
    );

    throw error;
  }
}

// Función auxiliar para determinar el mejor tipo de PDF
export function getBestPDFType(valuation: any): 'react_pdf' | 'edge_function' {
  // Si la valoración está completa, usar React-PDF para mayor calidad
  if (valuation.final_valuation && valuation.ebitda && valuation.revenue) {
    return 'react_pdf';
  }
  
  // Para valoraciones incompletas o reportes simples, usar Edge Function
  return 'edge_function';
}

// Función para obtener estadísticas de descargas (para admins)
export async function getPDFDownloadStats(days: number = 30) {
  const { data, error } = await supabase
    .from('pdf_download_logs')
    .select('*')
    .gte('created_at', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error obteniendo estadísticas PDF:', error);
    return null;
  }

  return {
    totalDownloads: data.length,
    successfulDownloads: data.filter(log => log.download_status === 'success').length,
    errorDownloads: data.filter(log => log.download_status === 'error').length,
    averageGenerationTime: data.reduce((acc, log) => acc + (log.generation_time_ms || 0), 0) / data.length,
    downloadsByType: data.reduce((acc, log) => {
      acc[log.pdf_type] = (acc[log.pdf_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
  };
}