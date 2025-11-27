import React, { Suspense, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, TrendingUp, BarChart3, Download, Loader2 } from 'lucide-react';
import { useI18n } from '@/shared/i18n/I18nProvider';
import { AdvisorFormData, AdvisorValuationSimpleResult } from '@/types/advisor';
import { useAdvisorValuationPDF } from '@/components/shared/LazyAdvisorValuationPDF';
import { useToast } from '@/hooks/use-toast';
import { validateDataForPDF } from '@/utils/pdfValidation';
import { sanitizeFileName } from '@/utils/pdfSanitization';
import { supabase } from '@/integrations/supabase/client';
import { blobToBase64 } from '@/utils/blobToBase64';
import { 
  LazyResponsiveContainer, 
  LazyBarChart, 
  LazyBar, 
  LazyXAxis, 
  LazyYAxis, 
  LazyCartesianGrid, 
  LazyTooltip,
  LazyCell 
} from '@/components/shared/LazyChart';

interface AdvisorResultsDisplaySimpleProps {
  result: AdvisorValuationSimpleResult;
  formData: AdvisorFormData;
  valuationId?: string | null;
  onBack: () => void;
}

export const AdvisorResultsDisplaySimple: React.FC<AdvisorResultsDisplaySimpleProps> = ({
  result,
  formData,
  valuationId,
  onBack,
}) => {
  const { t } = useI18n();
  const { toast } = useToast();

  // Rate limiting state
  const [lastDownloadTime, setLastDownloadTime] = useState<number>(0);
  const DOWNLOAD_COOLDOWN = 3000; // 3 segundos
  
  // Estado para reenvío de email
  const [isResendingEmail, setIsResendingEmail] = useState(false);
  const [emailSendFailed, setEmailSendFailed] = useState(false);
  const [lastPdfBlob, setLastPdfBlob] = useState<Blob | null>(null);

  // Hook para generación de PDF
  const { generatePDF, isGenerating, error: pdfError } = useAdvisorValuationPDF(
    formData,
    result,
    'es' // TODO: Usar idioma del contexto i18n cuando esté disponible
  );

  // Función de retry con exponential backoff
  const retryWithBackoff = async <T,>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000
  ): Promise<T> => {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await fn();
      } catch (err) {
        if (attempt === maxRetries - 1) {
          throw err; // Último intento falló
        }
        const delay = baseDelay * Math.pow(2, attempt);
        console.log(`⏳ [RETRY] Intento ${attempt + 1} falló, reintentando en ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    throw new Error('Retry logic failed unexpectedly');
  };

  // Función para enviar email con PDF
  const handleSendEmail = async (pdfBlob?: Blob): Promise<void> => {
    // Detectar WebKit (Safari/Edge iOS) para fallback sin Base64
    const isWebKit = /AppleWebKit/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
    const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
    const isEdge = /Edg\//.test(navigator.userAgent);
    
    console.log('🚀 [ADVISOR EMAIL] Iniciando envío de email para asesor:', formData.email);
    console.log('🌐 [ADVISOR EMAIL] Navegador:', { isWebKit, isSafari, isEdge });
    console.log('📊 [ADVISOR EMAIL] Datos del formulario:', { 
      companyName: formData.companyName, 
      email: formData.email,
      firmType: formData.firmType 
    });
    console.log('💰 [ADVISOR EMAIL] Resultados:', {
      ebitdaValuation: result.ebitdaValuation,
      revenueValuation: result.revenueValuation
    });
    
    try {
      // 1. Convertir PDF a Base64 SOLO si NO es WebKit
      // Para Safari/Edge, omitir conversión y dejar que el servidor genere el PDF
      let pdfBase64: string | null = null;
      
      if (isWebKit || !pdfBlob) {
        console.log('⚠️ [ADVISOR EMAIL] WebKit detectado o sin blob - usando generación de PDF en servidor');
        pdfBase64 = null; // Servidor generará el PDF
      } else {
        console.log('📦 [ADVISOR EMAIL] Blob recibido, tamaño:', pdfBlob.size, 'bytes');
        pdfBase64 = await blobToBase64(pdfBlob);
      }

      const pdfFilename = `Capittal-Valoracion-Asesores-${sanitizeFileName(formData.companyName)}.pdf`;
      if (pdfBase64) {
        console.log('📄 [ADVISOR EMAIL] Base64 generado, longitud:', pdfBase64.length, 'caracteres');
      } else {
        console.log('📄 [ADVISOR EMAIL] Sin Base64, servidor generará PDF');
      }
      console.log('📧 [ADVISOR EMAIL] Invocando edge function send-valuation-email...');

      // 2. Llamar a edge function send-valuation-email con retry logic
      const { data, error } = await retryWithBackoff(() => 
        supabase.functions.invoke('send-valuation-email', {
        body: {
          recipientEmail: formData.email,
          companyData: {
            contactName: formData.contactName,
            companyName: formData.companyName,
            cif: formData.cif,
            email: formData.email,
            phone: formData.phone,
            industry: formData.firmType,
            employeeRange: formData.employeeRange,
            revenue: formData.revenue,
            ebitda: formData.ebitda,
          },
          result: {
            ebitdaMultiple: result.ebitdaMultiple,
            finalValuation: result.ebitdaValuation,
            valuationRange: result.ebitdaRange,
            multiples: {
              ebitdaMultipleUsed: result.ebitdaMultiple,
              revenueMultipleUsed: result.revenueMultiple,
            },
            // Campos adicionales para asesores
            revenueValuation: result.revenueValuation,
            revenueRange: result.revenueRange,
          },
          pdfBase64,
          pdfFilename,
          enlaces: {
            escenariosUrl: `${window.location.origin}/lp/calculadora`,
            calculadoraFiscalUrl: `${window.location.origin}/lp/calculadora-fiscal`,
          },
          lang: 'es',
          source: 'advisor', // Indicador para edge function
        },
        })
      );

      if (error) {
        console.error('❌ [ADVISOR EMAIL] Error sending email:', error);
        console.error('❌ [ADVISOR EMAIL] Error details:', JSON.stringify(error, null, 2));
        throw error;
      }

      console.log('✅ [ADVISOR EMAIL] Email sent successfully:', data);
      console.log('✅ [ADVISOR EMAIL] Response data:', JSON.stringify(data, null, 2));
      
      // 3. 🆕 ACTUALIZAR registro existente en lugar de insertar
      if (valuationId) {
        console.log('💾 [ADVISOR EMAIL] Actualizando registro en base de datos...');
        const { error: updateError } = await supabase
          .from('advisor_valuations')
          .update({
            email_sent: true,
            email_sent_at: new Date().toISOString(),
            pdf_url: data?.pdfUrl || null,
          })
          .eq('id', valuationId);
        
        if (updateError) {
          console.error('⚠️ [ADVISOR EMAIL] Error updating valuation (email was sent):', updateError);
        } else {
          console.log('✅ [ADVISOR EMAIL] Valuation updated in database');
        }
      } else {
        console.warn('⚠️ [ADVISOR EMAIL] No valuationId provided, cannot update record');
      }

      setEmailSendFailed(false); // Reset error state en éxito
      toast({
        title: t('advisor.toast.email_sent_title'),
        description: t('advisor.toast.email_sent_description'),
      });
    } catch (err) {
      console.error('❌ [ADVISOR EMAIL] Error in handleSendEmail:', err);
      console.error('❌ [ADVISOR EMAIL] Error stack:', err instanceof Error ? err.stack : 'No stack trace');
      
      // Marcar que el envío falló
      setEmailSendFailed(true);
      
      // Mensaje específico según el navegador
      let errorMessage = t('advisor.toast.email_error_description');
      let errorTitle = t('advisor.toast.email_error_title');
      
      if (isWebKit || isSafari || isEdge) {
        errorTitle = 'Error de envío de email';
        errorMessage = 'No se pudo enviar el email. El PDF se descargó correctamente. Usa el botón "Reenviar email" para intentar de nuevo.';
      }
      
      toast({
        title: errorTitle,
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    }
  };

  // Función de descarga de PDF con validación, seguridad y envío de email
  const handleDownloadPDF = async () => {
    console.log('🔵 [ADVISOR] handleDownloadPDF INICIADO');
    console.log('🔵 [ADVISOR] formData:', formData);
    console.log('🔵 [ADVISOR] result:', result);
    
    // Rate limiting: prevenir spam
    const now = Date.now();
    if (now - lastDownloadTime < DOWNLOAD_COOLDOWN) {
      toast({
        title: t('advisor.toast.wait_title'),
        description: t('advisor.toast.wait_description'),
      });
      return;
    }

    // Prevenir múltiples clicks simultáneos
    if (isGenerating) return;

    let blobUrl: string | null = null;

    try {
      // 1. VALIDAR DATOS antes de generar
      const validation = validateDataForPDF(formData, result);
      if (!validation.isValid) {
        const errorMessages = validation.errors.map(e => e.message).join(', ');
        toast({
          title: t('advisor.toast.invalid_data_title'),
          description: errorMessages,
          variant: "destructive",
        });
        return;
      }

      // 2. GENERAR PDF
      const blob = await generatePDF();

      // 3. VALIDAR BLOB
      if (!blob || blob.size === 0) {
        throw new Error('PDF generado está vacío');
      }
      
      // Guardar blob para posible reenvío de email
      setLastPdfBlob(blob);

      // 4. CREAR DESCARGA con nombre sanitizado
      const fileName = `valoracion-${sanitizeFileName(formData.companyName)}-${new Date().toISOString().split('T')[0]}.pdf`;
      blobUrl = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Actualizar timestamp de último download
      setLastDownloadTime(now);

      toast({
        title: t('advisor.toast.pdf_downloaded_title'),
        description: t('advisor.toast.pdf_downloaded_description'),
      });

      // 5. VERIFICAR SI YA SE ENVIÓ EMAIL Y ENVIAR SOLO SI NO SE ENVIÓ
      console.log('📧 [ADVISOR] Verificando estado de envío de email...');
      
      // Verificar si el email ya fue enviado automáticamente
      let emailAlreadySent = false;
      if (valuationId) {
        try {
          const { data: valuation, error: fetchError } = await supabase
            .from('advisor_valuations')
            .select('email_sent, email_sent_at')
            .eq('id', valuationId)
            .single();
          
          if (!fetchError && valuation) {
            emailAlreadySent = valuation.email_sent === true;
            console.log(`📧 [ADVISOR] Email ya enviado: ${emailAlreadySent}`, valuation);
          }
        } catch (err) {
          console.warn('⚠️ [ADVISOR] No se pudo verificar estado email_sent:', err);
        }
      }
      
      // Solo enviar email si no se envió automáticamente
      if (!emailAlreadySent) {
        console.log('📧 [ADVISOR] Email no enviado aún, iniciando envío...');
        try {
          await handleSendEmail(blob);
          console.log('✅ [ADVISOR] Email enviado exitosamente en descarga PDF');
          
          // Actualizar BD si hay valuationId
          if (valuationId) {
            await supabase
              .from('advisor_valuations')
              .update({
                email_sent: true,
                email_sent_at: new Date().toISOString(),
              })
              .eq('id', valuationId);
          }
        } catch (emailErr) {
          console.error('❌ [ADVISOR] Email sending failed, but PDF was downloaded:', emailErr);
          console.error('❌ [ADVISOR] Email error stack:', emailErr instanceof Error ? emailErr.stack : 'No stack trace');
          // El error ya se muestra en handleSendEmail
        }
      } else {
        console.log('✅ [ADVISOR] Email ya fue enviado automáticamente, omitiendo reenvío');
      }
    } catch (err) {
      // Manejo específico por tipo de error
      let errorMessage = "No se pudo descargar el PDF. Inténtalo de nuevo.";

      if (err instanceof Error) {
        if (err.message.includes('Memory') || err.message.includes('memory')) {
          errorMessage = "Error de memoria. Intenta cerrar otras pestañas.";
        } else if (err.message.includes('Network') || err.message.includes('network')) {
          errorMessage = "Error de red. Verifica tu conexión.";
        } else if (err.message.includes('vacío')) {
          errorMessage = "Error al generar el PDF. Los datos pueden estar incompletos.";
        }
      }

      console.error('Error downloading PDF:', err);
        toast({
          title: t('advisor.toast.error_title'),
          description: errorMessage,
          variant: "destructive",
        });
    } finally {
      // CLEANUP GARANTIZADO: liberar memoria
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }
    }
  };

  // Función para reenviar email manualmente
  const handleResendEmail = async () => {
    if (!lastPdfBlob) {
      toast({
        title: 'Error',
        description: 'No hay PDF disponible. Descarga el PDF primero.',
        variant: "destructive",
      });
      return;
    }
    
    setIsResendingEmail(true);
    try {
      await handleSendEmail(lastPdfBlob);
      toast({
        title: 'Email reenviado',
        description: 'El email se ha reenviado correctamente.',
      });
    } catch (err) {
      console.error('Error reenviando email:', err);
    } finally {
      setIsResendingEmail(false);
    }
  };

  const formatCurrency = (value: number): string => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(2)}M €`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(0)}K €`;
    }
    return `${value.toFixed(0)} €`;
  };

  // Datos para el gráfico comparativo
  const chartData = [
    {
      name: 'EBITDA',
      valoracion: result.ebitdaValuation,
      min: result.ebitdaRange.min,
      max: result.ebitdaRange.max,
      color: '#2563eb',
      bgColor: '#dbeafe',
    },
    {
      name: 'Facturación',
      valoracion: result.revenueValuation,
      min: result.revenueRange.min,
      max: result.revenueRange.max,
      color: '#16a34a',
      bgColor: '#dcfce7',
    },
  ];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <Card className="p-3 shadow-lg border-2" style={{ borderColor: data.color }}>
          <p className="font-semibold text-sm mb-2">{data.name}</p>
          <div className="space-y-1 text-xs">
            <p className="font-bold" style={{ color: data.color }}>
              {t('advisor.results.valuation')}: {formatCurrency(data.valoracion)}
            </p>
            <p className="text-muted-foreground">
              {t('advisor.results.range')}: {formatCurrency(data.min)} - {formatCurrency(data.max)}
            </p>
          </div>
        </Card>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header informativo */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
        <CardHeader>
          <div className="flex items-center justify-between mb-2">
            <Badge variant="secondary" className="bg-primary/10 text-primary">
              {t('advisor.results.estimated_valuation')}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {t(`firm_types.${formData.firmType}`)}
            </Badge>
          </div>
          <CardTitle className="text-2xl font-bold text-primary">
            {formData.companyName}
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-2">
            {t('advisor.results.two_methods')}
          </p>
        </CardHeader>
      </Card>

      {/* GRÁFICO COMPARATIVO */}
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            {t('advisor.results.comparison_title')}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {t('advisor.results.comparison_subtitle')}
          </p>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<div className="h-80 flex items-center justify-center text-muted-foreground">{t('advisor.results.loading_chart')}</div>}>
            <LazyResponsiveContainer height={320}>
              <LazyBarChart 
                data={chartData} 
                margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
              >
                <LazyCartesianGrid 
                  strokeDasharray="3 3" 
                  stroke="hsl(var(--border))" 
                  opacity={0.3}
                />
                <LazyXAxis 
                  dataKey="name" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={13}
                  fontWeight={500}
                />
                <LazyYAxis 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickFormatter={(value) => formatCurrency(value)}
                  width={80}
                />
                <LazyTooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted))', opacity: 0.1 }} />
                <LazyBar 
                  dataKey="valoracion" 
                  name="Valoración" 
                  radius={[8, 8, 0, 0]}
                  maxBarSize={120}
                >
                  {chartData.map((entry, index) => (
                    <LazyCell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </LazyBar>
              </LazyBarChart>
            </LazyResponsiveContainer>
          </Suspense>
          
          <div className="flex items-center justify-center gap-6 mt-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-blue-600" />
              <span className="text-muted-foreground">{t('advisor.results.legend_ebitda')}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-green-600" />
              <span className="text-muted-foreground">{t('advisor.results.legend_revenue')}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* DOS VALORACIONES LADO A LADO */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* VALORACIÓN POR EBITDA */}
        <Card className="border-blue-200 bg-blue-50/50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              {t('advisor.results.ebitda_valuation_title')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center py-4 bg-white rounded-lg border border-blue-200">
              <p className="text-sm text-muted-foreground mb-1">Valoración estimada</p>
              <p className="text-3xl font-bold text-blue-600">
                {formatCurrency(result.ebitdaValuation)}
              </p>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('advisor.metrics.ebitda')}:</span>
                <span className="font-medium">{formatCurrency(formData.ebitda)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('advisor.metrics.multiple')}:</span>
                <span className="font-medium">{result.ebitdaMultiple.toFixed(2)}x</span>
              </div>
            </div>

            <div className="pt-2 border-t">
              <p className="text-xs font-semibold text-muted-foreground mb-2">{t('advisor.results.valuation_range')}:</p>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t('advisor.results.minimum')}:</span>
                <span className="font-medium">{formatCurrency(result.ebitdaRange.min)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t('advisor.results.maximum')}:</span>
                <span className="font-medium">{formatCurrency(result.ebitdaRange.max)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* VALORACIÓN POR FACTURACIÓN */}
        <Card className="border-green-200 bg-green-50/50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              {t('advisor.results.revenue_valuation_title')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center py-4 bg-white rounded-lg border border-green-200">
              <p className="text-sm text-muted-foreground mb-1">Valoración estimada</p>
              <p className="text-3xl font-bold text-green-600">
                {formatCurrency(result.revenueValuation)}
              </p>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('advisor.metrics.revenue')}:</span>
                <span className="font-medium">{formatCurrency(formData.revenue)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('advisor.metrics.multiple')}:</span>
                <span className="font-medium">{result.revenueMultiple.toFixed(2)}x</span>
              </div>
            </div>

            <div className="pt-2 border-t">
              <p className="text-xs font-semibold text-muted-foreground mb-2">{t('advisor.results.valuation_range')}:</p>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t('advisor.results.minimum')}:</span>
                <span className="font-medium">{formatCurrency(result.revenueRange.min)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t('advisor.results.maximum')}:</span>
                <span className="font-medium">{formatCurrency(result.revenueRange.max)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>

      {/* Información adicional */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t('advisor.results.next_steps')}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {t('advisor.results.next_steps_text')}
          </p>
        </CardContent>
      </Card>

      {/* Botón de descarga de PDF */}
      <Card className="border-primary/20">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center gap-4">
            <div className="text-center">
              <h3 className="font-semibold text-lg mb-2">
                {t('advisor.results.download_report')}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t('advisor.results.pdf_subtitle')}
              </p>
            </div>
            <Button
              onClick={handleDownloadPDF}
              disabled={isGenerating}
              size="lg"
              className="gap-2 min-w-[200px]"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  {t('calc.loading.title')}...
                </>
              ) : (
                <>
                  <Download className="h-5 w-5" />
                  {t('advisor.results.download_pdf')}
                </>
              )}
            </Button>
            {pdfError && (
              <p className="text-sm text-destructive">
                {t('advisor.results.pdf_error')}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Botón de reenvío de email si falló */}
      {emailSendFailed && (
        <Card className="border-yellow-200 bg-yellow-50/50">
          <CardContent className="pt-4 pb-4">
            <div className="flex flex-col sm:flex-row items-start gap-3">
              <div className="flex-1">
                <p className="text-sm font-medium text-yellow-800 mb-1">
                  El email no se pudo enviar automáticamente
                </p>
                <p className="text-xs text-yellow-700">
                  El PDF se descargó correctamente. Puedes intentar reenviar el email manualmente.
                </p>
              </div>
              <Button
                onClick={handleResendEmail}
                disabled={isResendingEmail}
                size="sm"
                variant="outline"
                className="border-yellow-400 text-yellow-700 hover:bg-yellow-100 whitespace-nowrap"
              >
                {isResendingEmail ? (
                  <>
                    <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  'Reenviar email'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Botón volver */}
      <div className="flex justify-center pt-4">
        <Button
          onClick={onBack}
          variant="outline"
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('advisor.results.new_valuation')}
        </Button>
      </div>
    </div>
  );
};
