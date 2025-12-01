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

export default function ValoracionProForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = !id || id === 'nueva';
  
  const { data: existingValuation, isLoading } = useProfessionalValuation(isNew ? undefined : id);
  const { createValuation, updateValuation, savePdfUrl, isCreating, isUpdating, setIsGeneratingPdf, isGeneratingPdf } = useProfessionalValuations();
  
  const [currentData, setCurrentData] = useState<Partial<ProfessionalValuationData> | null>(null);

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
    if (!data.clientCompany || !data.valuationCentral) {
      toast.error('Completa los datos básicos y calcula la valoración antes de generar el PDF');
      return;
    }

    setIsGeneratingPdf(true);
    
    try {
      // Generate PDF blob
      const pdfDocument = <ProfessionalValuationPDF data={data} />;
      const blob = await pdf(pdfDocument).toBlob();
      
      // Generate filename
      const timestamp = new Date().toISOString().split('T')[0];
      const sanitizedCompany = data.clientCompany.replace(/[^a-zA-Z0-9]/g, '_');
      const filename = `valoracion_${sanitizedCompany}_${timestamp}.pdf`;
      
      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('valuations')
        .upload(`professional/${filename}`, blob, {
          contentType: 'application/pdf',
          upsert: true,
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('valuations')
        .getPublicUrl(`professional/${filename}`);

      const pdfUrl = urlData.publicUrl;

      // Save PDF URL to database
      if (id && !isNew) {
        await savePdfUrl(id, pdfUrl);
      }

      // Download for user
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

      toast.success('PDF generado correctamente');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Error al generar el PDF');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleSendEmail = async (data: ProfessionalValuationData, email: string) => {
    toast.info('Funcionalidad de envío por email próximamente disponible');
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
          isLoading={isCreating || isUpdating || isGeneratingPdf}
        />
      )}
    </div>
  );
}
