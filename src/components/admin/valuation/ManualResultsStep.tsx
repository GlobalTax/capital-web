// ============= MANUAL RESULTS STEP =============
// Component for manual calculator with separate Save/Send actions

import React, { useState } from 'react';
import { Save, Send, CheckCircle, AlertCircle, RefreshCw, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useOptimizedSupabaseValuation } from '@/hooks/useOptimizedSupabaseValuation';
import { formatCurrency } from '@/shared/utils/format';
import { generateValuationPDFWithReactPDF } from '@/utils/reactPdfGenerator';
import { getPreferredLang } from '@/shared/i18n/locale';
import { CompanyData, ValuationResult } from '@/types/valuation';

interface ManualResultsStepProps {
  companyData: CompanyData;
  result: ValuationResult;
  extraMetadata?: {
    leadSource?: string;
    leadSourceDetail?: string;
  };
  sourceProject?: string;
  onReset: () => void;
}

export const ManualResultsStep: React.FC<ManualResultsStepProps> = ({ 
  companyData, 
  result, 
  extraMetadata,
  sourceProject,
  onReset 
}) => {
  const { toast } = useToast();
  const { saveValuationOnly, sendValuationEmail, isProcessing } = useOptimizedSupabaseValuation();
  
  const [isSaving, setIsSaving] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [savedValuationId, setSavedValuationId] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);

  const handleSaveOnly = async () => {
    setIsSaving(true);
    try {
      const saveResult = await saveValuationOnly(companyData, result, undefined, {
        sourceProject: sourceProject || 'manual-admin-entry',
        leadSource: extraMetadata?.leadSource,
        leadSourceDetail: extraMetadata?.leadSourceDetail
      });
      
      if (saveResult.success && saveResult.valuationId) {
        setSavedValuationId(saveResult.valuationId);
        toast({
          title: "Valoración guardada",
          description: "La valoración se ha guardado en contactos correctamente.",
        });
      } else {
        throw new Error(saveResult.error || 'Error al guardar');
      }
    } catch (error: any) {
      console.error('Error saving valuation:', error);
      toast({
        title: "Error al guardar",
        description: error.message || "No se pudo guardar la valoración. Inténtalo de nuevo.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSendEmail = async () => {
    // Validar email
    if (!companyData.email) {
      toast({
        title: "Email requerido",
        description: "El contacto no tiene email. Puedes guardar la valoración sin enviar.",
        variant: "destructive"
      });
      return;
    }

    setIsSending(true);
    try {
      // Guardar primero si no guardada
      let valuationId = savedValuationId;
      if (!valuationId) {
        const saveResult = await saveValuationOnly(companyData, result, undefined, {
          sourceProject: sourceProject || 'manual-admin-entry',
          leadSource: extraMetadata?.leadSource,
          leadSourceDetail: extraMetadata?.leadSourceDetail
        });
        if (!saveResult.success || !saveResult.valuationId) {
          throw new Error(saveResult.error || 'Error al guardar valoración');
        }
        valuationId = saveResult.valuationId;
        setSavedValuationId(valuationId);
      }

      // Enviar email
      const emailResult = await sendValuationEmail(companyData, result, valuationId, {
        sourceProject: sourceProject || 'manual-admin-entry',
        leadSource: extraMetadata?.leadSource,
        leadSourceDetail: extraMetadata?.leadSourceDetail
      });
      
      if (emailResult.success) {
        setEmailSent(true);
        toast({
          title: "Email enviado",
          description: `Email enviado a ${companyData.email} y copia al equipo interno.`,
        });
      } else {
        throw new Error(emailResult.error || 'Error al enviar email');
      }
    } catch (error: any) {
      console.error('Error sending email:', error);
      toast({
        title: "Error al enviar email",
        description: error.message || "No se pudo enviar el email. Inténtalo de nuevo.",
        variant: "destructive"
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleDownloadPDF = async () => {
    setIsGeneratingPDF(true);
    try {
      const lang = getPreferredLang();
      // Prepare data with required fields for PDF generator
      const pdfCompanyData = {
        contactName: companyData.contactName || '',
        companyName: companyData.companyName || '',
        cif: companyData.cif || '',
        email: companyData.email || '',
        phone: companyData.phone || '',
        industry: companyData.industry || '',
        yearsOfOperation: 5,
        employeeRange: companyData.employeeRange || '',
        revenue: companyData.revenue || 0,
        ebitda: companyData.ebitda || 0,
        netProfitMargin: 10,
        growthRate: 5,
        location: companyData.location || '',
        ownershipParticipation: companyData.ownershipParticipation || '',
        competitiveAdvantage: companyData.competitiveAdvantage || ''
      };
      const pdfBlob = await generateValuationPDFWithReactPDF(pdfCompanyData, result, lang);
      
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Valoracion_${(companyData.companyName || 'empresa').replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast({
        title: "PDF descargado",
        description: "El PDF se ha generado correctamente.",
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "Error al generar PDF",
        description: "No se pudo generar el PDF. Inténtalo de nuevo.",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const getEmployeeRangeLabel = (range: string) => {
    const ranges: { [key: string]: string } = {
      '1-10': '1-10 empleados',
      '11-50': '11-50 empleados',
      '51-200': '51-200 empleados',
      '201-500': '201-500 empleados',
      '500+': 'Más de 500 empleados'
    };
    return ranges[range] || range;
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2">
          Resultado de Valoración
        </h2>
        <p className="text-sm text-muted-foreground">
          {companyData.companyName}
        </p>
      </div>

      {/* Estado de guardado */}
      {savedValuationId && (
        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
          <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
          <span className="text-green-800 text-sm">
            Valoración guardada en contactos (ID: {savedValuationId.slice(0, 8)}...)
          </span>
        </div>
      )}

      {/* Email enviado */}
      {emailSent && (
        <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <CheckCircle className="h-5 w-5 text-blue-600 flex-shrink-0" />
          <span className="text-blue-800 text-sm">
            Email enviado a {companyData.email} y copia al equipo
          </span>
        </div>
      )}

      {/* Resumen de datos */}
      <div className="bg-muted/30 border rounded-lg p-4 sm:p-6">
        <h3 className="text-base font-semibold text-foreground mb-4">Resumen de la empresa</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Empresa:</span>
            <span className="ml-2 font-medium">{companyData.companyName}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Contacto:</span>
            <span className="ml-2 font-medium">{companyData.contactName}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Email:</span>
            <span className="ml-2 font-medium">{companyData.email || '—'}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Sector:</span>
            <span className="ml-2 font-medium capitalize">{companyData.industry}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Empleados:</span>
            <span className="ml-2 font-medium">{getEmployeeRangeLabel(companyData.employeeRange)}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Facturación:</span>
            <span className="ml-2 font-medium">{formatCurrency(companyData.revenue)}</span>
          </div>
          <div>
            <span className="text-muted-foreground">EBITDA:</span>
            <span className="ml-2 font-medium">{formatCurrency(companyData.ebitda)}</span>
          </div>
          {extraMetadata?.leadSource && (
            <div>
              <span className="text-muted-foreground">Origen:</span>
              <span className="ml-2 font-medium">{extraMetadata.leadSource}</span>
            </div>
          )}
        </div>
      </div>

      {/* Valoración principal */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-background border rounded-lg p-4 sm:p-6 text-center">
          <h3 className="text-sm font-semibold text-muted-foreground mb-2">Valoración Estimada</h3>
          <p className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
            {formatCurrency(result.finalValuation)}
          </p>
          <p className="text-xs text-muted-foreground">
            Rango: {formatCurrency(result.valuationRange.min)} - {formatCurrency(result.valuationRange.max)}
          </p>
        </div>

        <div className="bg-background border rounded-lg p-4 sm:p-6 text-center">
          <h3 className="text-sm font-semibold text-muted-foreground mb-2">Múltiplo Aplicado</h3>
          <p className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
            {result.multiples.ebitdaMultipleUsed}x
          </p>
          <p className="text-xs text-muted-foreground">
            Sobre EBITDA de {formatCurrency(companyData.ebitda)}
          </p>
        </div>
      </div>

      {/* Advertencia si no tiene email */}
      {!companyData.email && (
        <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0" />
          <span className="text-amber-800 text-sm">
            Sin email de contacto. Puedes guardar la valoración pero no enviar por email.
          </span>
        </div>
      )}

      {/* Botones de acción principales */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4 border-t">
        <Button
          variant="outline"
          onClick={handleSaveOnly}
          disabled={isSaving || isSending || savedValuationId !== null}
          className="w-full sm:w-auto"
        >
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? 'Guardando...' : savedValuationId ? 'Guardada ✓' : 'Guardar valoración'}
        </Button>

        <Button
          onClick={handleSendEmail}
          disabled={isSaving || isSending || emailSent || !companyData.email}
          className="w-full sm:w-auto"
        >
          <Send className="h-4 w-4 mr-2" />
          {isSending ? 'Enviando...' : emailSent ? 'Email enviado ✓' : 'Enviar por email'}
        </Button>
      </div>

      {/* Acciones secundarias */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button
          variant="ghost"
          onClick={handleDownloadPDF}
          disabled={isGeneratingPDF}
          className="w-full sm:w-auto"
        >
          <Download className="h-4 w-4 mr-2" />
          {isGeneratingPDF ? 'Generando...' : 'Descargar PDF'}
        </Button>

        <Button
          variant="ghost"
          onClick={onReset}
          className="w-full sm:w-auto"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Nueva valoración
        </Button>
      </div>
    </div>
  );
};

export default ManualResultsStep;
