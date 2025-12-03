import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { pdf } from '@react-pdf/renderer';
import { useProfessionalValuation, useProfessionalValuations } from '@/hooks/useProfessionalValuations';
import { ProfessionalValuationForm } from '@/components/admin/professional-valuations/ProfessionalValuationForm';
import ProfessionalValuationPDF from '@/components/pdf/ProfessionalValuationPDF';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ProfessionalValuationData } from '@/types/professionalValuation';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { usePdfSignatureConfig } from '@/hooks/usePdfSignatureConfig';

export default function ValoracionProForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = !id || id === 'nueva';
  
  const { data: existingValuation, isLoading } = useProfessionalValuation(isNew ? undefined : id);
  const { createValuation, updateValuation, savePdfUrl, markAsSent, isCreating, isUpdating, setIsGeneratingPdf, isGeneratingPdf } = useProfessionalValuations();
  const { data: signatureConfig } = usePdfSignatureConfig();
  
  const [currentData, setCurrentData] = useState<Partial<ProfessionalValuationData> | null>(null);

  // Función para obtener advisorInfo según datos de la valoración
  const getAdvisorInfo = (data: ProfessionalValuationData) => {
    // Si usa asesor personalizado y tiene nombre, usar datos personalizados
    if (data.useCustomAdvisor && data.advisorName) {
      return {
        name: data.advisorName,
        role: data.advisorRole || 'Consultor de M&A',
        email: data.advisorEmail || 'info@capittal.es',
        phone: data.advisorPhone || signatureConfig?.phone || '',
        website: signatureConfig?.website || 'www.capittal.es',
      };
    }
    // Si no, usar configuración global
    return signatureConfig ? {
      name: signatureConfig.name,
      role: signatureConfig.role,
      email: signatureConfig.email,
      phone: signatureConfig.phone,
      website: signatureConfig.website,
    } : undefined;
  };

  // advisorInfo por defecto para preview (usando configuración global)
  const defaultAdvisorInfo = signatureConfig ? {
    name: signatureConfig.name,
    role: signatureConfig.role,
    email: signatureConfig.email,
    phone: signatureConfig.phone,
    website: signatureConfig.website,
  } : undefined;

  useEffect(() => {
    if (existingValuation) {
      setCurrentData(existingValuation);
    } else if (isNew && !currentData) {
      setCurrentData({
        status: 'draft',
        financialYears: [
          { year: new Date().getFullYear() - 2, revenue: 0, ebitda: 0, netProfit: 0 },
          { year: new Date().getFullYear() - 1, revenue: 0, ebitda: 0, netProfit: 0 },
          { year: new Date().getFullYear(), revenue: 0, ebitda: 0, netProfit: 0 },
        ],
        normalizationAdjustments: [],
      });
    }
  }, [existingValuation, isNew, currentData]);

  const handleSave = async (data: ProfessionalValuationData, isDraft: boolean = true) => {
    console.log('[ValoracionProForm] Guardando:', { isNew, isDraft, dataKeys: Object.keys(data) });
    try {
      if (isNew) {
        const newValuation = await createValuation(data);
        console.log('[ValoracionProForm] Creada:', newValuation);
        if (newValuation?.id) {
          toast.success('Valoración creada correctamente');
          navigate(`/admin/valoraciones-pro/${newValuation.id}`, { replace: true });
        } else {
          toast.error('Error: No se recibió ID de la nueva valoración');
        }
      } else if (id) {
        await updateValuation({ id, data });
        toast.success('Valoración actualizada correctamente');
        console.log('[ValoracionProForm] Actualizada:', id);
      }
    } catch (error) {
      console.error('[ValoracionProForm] Error al guardar:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      toast.error(`Error al guardar: ${errorMessage}`);
    }
  };

  const handleGeneratePdf = async (data: ProfessionalValuationData) => {
    console.log('[ValoracionProForm] handleGeneratePdf iniciado');
    console.log('[ValoracionProForm] Datos:', {
      clientCompany: data.clientCompany,
      valuationCentral: data.valuationCentral,
      sector: data.sector,
    });

    if (!data.clientCompany || !data.valuationCentral) {
      toast.error('Completa los datos básicos y calcula la valoración antes de generar el PDF');
      return;
    }

    setIsGeneratingPdf(true);
    let uploadSuccessful = false;
    
    try {
      // Generate PDF blob con advisorInfo dinámico
      console.log('[ValoracionProForm] Generando PDF blob...');
      const advisorInfo = getAdvisorInfo(data);
      const pdfDocument = <ProfessionalValuationPDF data={data} advisorInfo={advisorInfo} />;
      const blob = await pdf(pdfDocument).toBlob();
      console.log('[ValoracionProForm] PDF blob generado, tamaño:', blob.size);
      
      // Generate filename
      const timestamp = new Date().toISOString().split('T')[0];
      const sanitizedCompany = data.clientCompany.replace(/[^a-zA-Z0-9]/g, '_');
      const filename = `valoracion_${sanitizedCompany}_${timestamp}.pdf`;
      
      // Upload to Supabase Storage
      console.log('[ValoracionProForm] Subiendo a Storage...');
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('valuations')
        .upload(`professional/${filename}`, blob, {
          contentType: 'application/pdf',
          upsert: true,
        });

      if (uploadError) {
        console.error('[ValoracionProForm] Error de upload:', uploadError);
        toast.warning('El PDF se descargará localmente pero no se pudo guardar en el servidor');
      } else {
        console.log('[ValoracionProForm] Upload exitoso:', uploadData);
        uploadSuccessful = true;

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('valuations')
          .getPublicUrl(`professional/${filename}`);

        const pdfUrl = urlData.publicUrl;
        console.log('[ValoracionProForm] URL pública:', pdfUrl);

        // Save PDF URL to database
        if (id && !isNew) {
          console.log('[ValoracionProForm] Guardando URL en base de datos...');
          await savePdfUrl(id, pdfUrl);
          console.log('[ValoracionProForm] URL guardada correctamente');
        }
      }

      // Download for user (siempre funciona)
      console.log('[ValoracionProForm] Iniciando descarga local...');
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

      if (uploadSuccessful) {
        toast.success('PDF generado y guardado correctamente');
      } else {
        toast.info('PDF descargado localmente');
      }
    } catch (error) {
      console.error('[ValoracionProForm] Error generando PDF:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      toast.error(`Error al generar el PDF: ${errorMessage}`);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);
  
  const handleSendEmail = async (data: ProfessionalValuationData, email: string) => {
    console.log('[ValoracionProForm] handleSendEmail iniciado');
    
    if (!email || !email.includes('@')) {
      toast.error('Por favor, introduce un email válido');
      return;
    }

    if (!data.valuationCentral || !data.clientCompany) {
      toast.error('Calcula la valoración antes de enviar el email');
      return;
    }

    setIsSendingEmail(true);
    
    try {
      // Generar PDF en base64 para adjuntar al email
      let pdfBase64: string | undefined;
      
      try {
        console.log('[ValoracionProForm] Generando PDF para adjuntar...');
        const advisorInfo = getAdvisorInfo(data);
        const pdfDocument = <ProfessionalValuationPDF data={data} advisorInfo={advisorInfo} />;
        const blob = await pdf(pdfDocument).toBlob();
        
        // Convertir blob a base64
        const reader = new FileReader();
        pdfBase64 = await new Promise<string>((resolve, reject) => {
          reader.onloadend = () => {
            const base64 = reader.result as string;
            // Extraer solo la parte base64 (sin el prefijo data:...)
            const base64Data = base64.split(',')[1];
            resolve(base64Data);
          };
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
        console.log('[ValoracionProForm] PDF generado, tamaño base64:', pdfBase64?.length);
      } catch (pdfError) {
        console.warn('[ValoracionProForm] No se pudo generar PDF para adjuntar:', pdfError);
      }

      // Preparar datos para la edge function
      const requestBody = {
        recipientEmail: email,
        recipientName: data.clientName,
        valuationData: {
          clientCompany: data.clientCompany,
          clientName: data.clientName,
          clientCif: data.clientCif,
          valuationCentral: data.valuationCentral,
          valuationLow: data.valuationLow,
          valuationHigh: data.valuationHigh,
          sector: data.sector,
          normalizedEbitda: data.normalizedEbitda,
          ebitdaMultipleUsed: data.ebitdaMultipleUsed,
          financialYears: data.financialYears,
          normalizationAdjustments: data.normalizationAdjustments,
        },
        pdfBase64,
        pdfUrl: data.pdfUrl,
        advisorName: data.advisorName,
        advisorEmail: data.advisorEmail,
        // Enviar destinatarios seleccionados (o vacío para usar los de la BD)
        selectedRecipients: selectedRecipients.length > 0 ? selectedRecipients : undefined,
      };

      console.log('[ValoracionProForm] Llamando a edge function con:', {
        recipientEmail: email,
        clientCompany: data.clientCompany,
        hasPdfBase64: !!pdfBase64,
        hasPdfUrl: !!data.pdfUrl,
        hasFinancialYears: !!data.financialYears?.length,
        hasAdjustments: !!data.normalizationAdjustments?.length,
      });

      const { data: result, error } = await supabase.functions.invoke(
        'send-professional-valuation-email',
        { body: requestBody }
      );

      if (error) {
        console.error('[ValoracionProForm] Error de edge function:', error);
        throw new Error(error.message || 'Error al enviar el email');
      }

      console.log('[ValoracionProForm] Email enviado:', result);

      // Actualizar estado en base de datos
      if (id && !isNew) {
        await markAsSent(id, email);
      }

      const teamCount = result?.teamNotified || 0;
      toast.success(`Email enviado a ${email} y ${teamCount} personas del equipo`);
    } catch (error) {
      console.error('[ValoracionProForm] Error enviando email:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      toast.error(`Error al enviar el email: ${errorMessage}`);
    } finally {
      setIsSendingEmail(false);
    }
  };

  // Loading state
  if (!isNew && isLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-[600px] w-full" />
      </div>
    );
  }

  // Edit mode but valuation not found
  if (!isNew && !isLoading && !existingValuation) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/admin/valoraciones-pro')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-destructive">
              Valoración no encontrada
            </h1>
            <p className="text-muted-foreground">
              La valoración solicitada no existe o no tienes permisos para verla.
            </p>
          </div>
        </div>
        <Button onClick={() => navigate('/admin/valoraciones-pro')}>
          Volver al listado
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/admin/valoraciones-pro')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {isNew ? 'Nueva Valoración' : 'Editar Valoración'}
            </h1>
            <p className="text-muted-foreground">
              {isNew 
                ? 'Crea una nueva valoración profesional' 
                : `Editando: ${currentData?.clientCompany || 'Cargando...'}`
              }
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      {currentData && (
        <ProfessionalValuationForm
          initialData={currentData}
          onSave={handleSave}
          onGeneratePdf={handleGeneratePdf}
          onSendEmail={handleSendEmail}
          isLoading={isCreating || isUpdating || isGeneratingPdf || isSendingEmail}
          selectedRecipients={selectedRecipients}
          onRecipientsChange={setSelectedRecipients}
        />
      )}
    </div>
  );
}
