import React, { useState, useEffect } from 'react';
import { TrendingUp, Download, RefreshCw, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { generateValuationPDFWithReactPDF } from '@/utils/reactPdfGenerator';
import { useToast } from '@/hooks/use-toast';
import { useOptimizedSupabaseValuation } from '@/hooks/useOptimizedSupabaseValuation';
import ReferralPrompt from './ReferralPrompt';
import { supabase } from '@/integrations/supabase/client';
import { getPreferredLang } from '@/shared/i18n/locale';
import { useI18n } from '@/shared/i18n/I18nProvider';
import { formatCurrency } from '@/shared/utils/format';
interface Step4Props {
  result: any;
  companyData: any;
  isCalculating: boolean;
  resetCalculator: () => void;
  uniqueToken?: string;
}

const Step4Results: React.FC<Step4Props> = ({ result, companyData, isCalculating, resetCalculator, uniqueToken }) => {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [dataSaved, setDataSaved] = useState(false);
  const { toast } = useToast();
  const { saveValuation } = useOptimizedSupabaseValuation();
  const { t } = useI18n();

  // Guardar datos cuando se muestran los resultados - FIX: Agregar más dependencias específicas
  useEffect(() => {
    if (result && companyData && result.finalValuation && companyData.companyName && !dataSaved) {
      console.log('Ejecutando saveData - solo una vez');
      
      const saveData = async () => {
        try {
          console.log('🚀 Iniciando proceso de guardado de datos...');
          console.log('Datos de empresa recibidos:', companyData);
          console.log('Resultado de valoración recibido:', result);
          
          // PASO 1: Guardar SIEMPRE en Supabase primero
          try {
            console.log('📊 Guardando en Supabase...');
            await saveValuation(companyData, result, uniqueToken);
            console.log('✅ Datos guardados correctamente en Supabase');
            
            toast({
              title: t('toast.saved.title'),
              description: t('toast.saved.desc'),
              variant: "default",
            });
          } catch (supabaseError) {
            console.error('❌ Error crítico guardando en Supabase:', supabaseError);
            toast({
              title: t('toast.critical.title'),
              description: t('toast.critical.desc'),
              variant: "destructive",
            });
            return; // No continuar si Supabase falla
          }
          
          setDataSaved(true);
          console.log('🎉 Proceso de guardado completado exitosamente');
          
        } catch (error) {
          console.error('💥 Error general en saveData:', error);
        }
      };

      saveData();
    }
  }, [result?.finalValuation, companyData?.companyName, dataSaved]); // FIX: Dependencias más específicas

  const getEmployeeRangeLabel = (range: string) => {
  const ranges: { [key: string]: string } = {
    '1-10': t('employees.1_10'),
    '11-50': t('employees.11_50'),
    '51-200': '51-200',
    '201-500': '201-500',
    '500+': t('employees.501_plus')
  };
    return ranges[range] || range;
  };

  const getOwnershipLabel = (participation: string) => {
  const labels: { [key: string]: string } = {
    'alta': t('ownership.high'),
    'media': t('ownership.medium'),
    'baja': t('ownership.low')
  };
  return labels[participation] || participation;
  };

  const isFiscalES = typeof window !== 'undefined' && window.location.pathname.includes('calculadora-fiscal');
  const handleDownloadPDF = async () => {
    if (!result || !companyData) {
      toast({
        title: t('error.noData.title'),
        description: t('error.noData.desc'),
        variant: "destructive",
      });
      return;
    }

    setIsGeneratingPDF(true);
    
    try {
      const lang = getPreferredLang();
      const pdfBlob = await generateValuationPDFWithReactPDF(companyData, result, lang);
      
      // Crear enlace de descarga
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Valoracion_${companyData.companyName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
      
      // Ejecutar descarga
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Limpiar URL
      URL.revokeObjectURL(url);
      
      toast({
        title: t('toast.pdf.title'),
        description: t('toast.pdf.desc'),
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      try {
        const lang = getPreferredLang();
        const { data, error: fnError } = await supabase.functions.invoke('send-valuation-email', {
          body: {
            pdfOnly: true,
            companyData,
            result,
            lang
          }
        });

        if (fnError || !data?.pdfUrl) {
          throw fnError || new Error('Sin URL de PDF');
        }

        const a = document.createElement('a');
        a.href = data.pdfUrl as string;
        a.download = `Valoracion_${companyData.companyName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        toast({
          title: t('toast.pdfFallback.title'),
          description: t('toast.pdfFallback.desc')
        });
      } catch (fallbackErr) {
        console.error('Fallback PDF failed:', fallbackErr);
        toast({
          title: t('toast.pdfFail.title'),
          description: t('toast.pdfFail.desc'),
          variant: 'destructive',
        });
      }
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  if (isCalculating) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('calc.loading.title')}</h2>
        <p className="text-gray-600">{t('calc.loading.subtitle')}</p>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-semibold text-gray-600 mb-2">
          {t('calc.no_results.title')}
        </h3>
        <p className="text-gray-500">
          {t('calc.no_results.subtitle')}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {t('calc.results.title', { company: companyData.companyName })}
        </h2>
        <p className="text-gray-600">{t('calc.results.subtitle')}</p>
      </div>

      {/* Resumen de datos de la empresa */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {t('summary.title')}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Información básica */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3">{t('summary.basic')}</h4>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-gray-600">{t('fields.company')}:</span>
                <span className="ml-2 font-medium">{companyData.companyName}</span>
              </div>
              <div>
                <span className="text-gray-600">{t('fields.cif')}:</span>
                <span className="ml-2 font-medium">{companyData.cif}</span>
              </div>
              <div>
                <span className="text-gray-600">{t('fields.contact')}:</span>
                <span className="ml-2 font-medium">{companyData.contactName}</span>
              </div>
              <div>
                <span className="text-gray-600">{t('fields.sector')}:</span>
                <span className="ml-2 font-medium capitalize">{companyData.industry}</span>
              </div>
              <div>
                <span className="text-gray-600">{t('fields.activity')}:</span>
                <span className="ml-2 font-medium">{companyData.activityDescription}</span>
              </div>
              <div>
                <span className="text-gray-600">{t('fields.employees')}:</span>
                <span className="ml-2 font-medium">{getEmployeeRangeLabel(companyData.employeeRange)}</span>
              </div>
              <div>
                <span className="text-gray-600">{t('fields.location')}:</span>
                <span className="ml-2 font-medium">{companyData.location}</span>
              </div>
            </div>
          </div>

          {/* Datos financieros */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3">{t('summary.financial')}</h4>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-gray-600">{t('fields.annual_revenue')}:</span>
                <span className="ml-2 font-medium">{formatCurrency(companyData.revenue)}</span>
              </div>
              <div>
                <span className="text-gray-600">{t('fields.ebitda')}:</span>
                <span className="ml-2 font-medium">{formatCurrency(companyData.ebitda)}</span>
              </div>
              {companyData.hasAdjustments && companyData.adjustmentAmount !== 0 && (
                <div>
                  <span className="text-gray-600">{t('fields.ebitda_adjustments')}:</span>
                  <span className="ml-2 font-medium">{formatCurrency(companyData.adjustmentAmount)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Características adicionales */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3">{t('summary.features')}</h4>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-gray-600">{t('fields.ownership')}:</span>
                <span className="ml-2 font-medium">{getOwnershipLabel(companyData.ownershipParticipation)}</span>
              </div>
              <div>
                <span className="text-gray-600 block mb-1">{t('fields.competitive_advantage')}:</span>
                <span className="text-gray-800 text-xs bg-white p-2 rounded border block">
                  {companyData.competitiveAdvantage}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Valoración principal - sin colores ni íconos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-300 rounded-lg p-6 text-center">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">{t('valuation.estimated')}</h3>
          <p className="text-3xl font-bold text-gray-900 mb-2">
            {formatCurrency(result.finalValuation)}
          </p>
          <p className="text-sm text-gray-600">
            {t('valuation.range')}: {formatCurrency(result.valuationRange.min)} - {formatCurrency(result.valuationRange.max)}
          </p>
        </div>

        <div className="bg-white border border-gray-300 rounded-lg p-6 text-center">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">{t('valuation.multiple')}</h3>
          <p className="text-3xl font-bold text-gray-900 mb-2">
            {result.multiples.ebitdaMultipleUsed}x
          </p>
          <p className="text-sm text-gray-600">
            {t('valuation.applied_over', { amount: formatCurrency(companyData.ebitda) })}
          </p>
        </div>
      </div>

      {/* Información de múltiplos aplicados */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('sector.multiple.title')}</h3>
        <div className="text-center">
          <p className="text-sm text-gray-600">{t('sector.multiple.label')}</p>
          <p className="text-2xl font-bold text-gray-900">{result.multiples.ebitdaMultipleUsed}x</p>
          <p className="text-sm text-gray-500 mt-2">
            {t('sector.valuation_formula', { ebitda: formatCurrency(companyData.ebitda), multiple: result.multiples.ebitdaMultipleUsed, valuation: formatCurrency(result.finalValuation) })}
          </p>
        </div>
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600 text-center">
            {t('sector.sector')}: <span className="font-semibold capitalize">{companyData.industry}</span> • 
            <span className="ml-2">{t('sector.employees')}: {getEmployeeRangeLabel(companyData.employeeRange)}</span>
          </p>
        </div>
      </div>

      {/* Acciones */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button
          onClick={resetCalculator}
          variant="outline"
          className="flex items-center"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          {t('actions.new')}
        </Button>
        <Button 
          onClick={handleDownloadPDF}
          disabled={isGeneratingPDF}
          className="flex items-center"
        >
          <Download className="h-4 w-4 mr-2" />
          {isGeneratingPDF ? t('actions.generating') : t('actions.download')}
        </Button>
        <Button 
          onClick={() => window.open('https://capittal.es', '_blank')}
          variant="secondary"
          className="flex items-center"
        >
          <ExternalLink className="h-4 w-4 mr-2" />
          {t('actions.goto_website')}
        </Button>
      </div>

      {/* Escenario Fiscal España (solo en calculadora fiscal) */}
      {isFiscalES && (
        <div className="bg-white border border-gray-300 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('fiscal.title')}</h3>
          <p className="text-sm text-gray-600 mb-3">
            {t('fiscal.description')}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded border border-gray-200">
              <p className="text-xs text-gray-500">{t('fiscal.gain')}</p>
              <p className="text-sm text-gray-800">{t('fiscal.need_cost')}</p>
            </div>
            <div className="p-4 rounded border border-gray-200">
              <p className="text-xs text-gray-500">{t('fiscal.rate')}</p>
              <p className="text-sm text-gray-800">{t('fiscal.rate_detail')}</p>
            </div>
            <div className="p-4 rounded border border-gray-200">
              <p className="text-xs text-gray-500">{t('fiscal.withholding')}</p>
              <p className="text-sm text-gray-800">{t('fiscal.withholding_detail')}</p>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-3">
            {t('fiscal.note')}
          </p>
          <div className="mt-4">
            <a href="/contacto" className="underline text-gray-900">{t('fiscal.contact_link')}</a>
          </div>
        </div>
      )}

      {/* Recomendar a un tercero */}
      <ReferralPrompt companyData={companyData} />

      {/* Aviso legal */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-yellow-800 mb-2">
          {t('legal.notice.title')}
        </h3>
        <p className="text-sm text-yellow-700">
          {t('legal.notice.text')}
        </p>
      </div>
    </div>
  );
};

export default Step4Results;
