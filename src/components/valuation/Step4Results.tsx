import React, { useState, useEffect } from 'react';
import { TrendingUp, Download, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { generateValuationPDFWithReactPDF } from '@/utils/reactPdfGenerator';
import { useToast } from '@/hooks/use-toast';
import { useHubSpotIntegration } from '@/hooks/useHubSpotIntegration';
import { useSupabaseValuation } from '@/hooks/useSupabaseValuation';
import ToolRating from './ToolRating';

interface Step4Props {
  result: any;
  companyData: any;
  isCalculating: boolean;
  resetCalculator: () => void;
}

const Step4Results: React.FC<Step4Props> = ({ result, companyData, isCalculating, resetCalculator }) => {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [dataSaved, setDataSaved] = useState(false);
  const { toast } = useToast();
  const { createCompanyValuation } = useHubSpotIntegration();
  const { saveValuation } = useSupabaseValuation();

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
            await saveValuation(companyData, result);
            console.log('✅ Datos guardados correctamente en Supabase');
            
            toast({
              title: "✅ Valoración guardada",
              description: "Los datos se han guardado correctamente en la base de datos.",
              variant: "default",
            });
          } catch (supabaseError) {
            console.error('❌ Error crítico guardando en Supabase:', supabaseError);
            toast({
              title: "❌ Error crítico",
              description: "No se pudieron guardar los datos en la base de datos. Por favor, inténtalo de nuevo.",
              variant: "destructive",
            });
            return; // No continuar si Supabase falla
          }
          
          // PASO 2: Intentar HubSpot (opcional)
          try {
            console.log('📧 Intentando enviar a HubSpot...');
            await createCompanyValuation({
              companyName: companyData.companyName,
              cif: companyData.cif,
              contactName: companyData.contactName,
              email: companyData.email,
              phone: companyData.phone,
              industry: companyData.industry,
              revenue: companyData.revenue,
              ebitda: companyData.ebitda,
              finalValuation: result.finalValuation,
              employeeRange: companyData.employeeRange,
              location: companyData.location
            });
            console.log('✅ Datos enviados correctamente a HubSpot');
          } catch (hubspotError) {
            console.warn('⚠️ Error enviando a HubSpot (no crítico):', hubspotError);
            // No mostramos error al usuario porque los datos sí se guardaron en Supabase
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
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

  const getOwnershipLabel = (participation: string) => {
    const labels: { [key: string]: string } = {
      'alta': 'Alta (>75%)',
      'media': 'Media (25-75%)',
      'baja': 'Baja (<25%)'
    };
    return labels[participation] || participation;
  };

  const handleDownloadPDF = async () => {
    if (!result || !companyData) {
      toast({
        title: "Error",
        description: "No hay datos suficientes para generar el PDF",
        variant: "destructive",
      });
      return;
    }

    setIsGeneratingPDF(true);
    
    try {
      const pdfBlob = await generateValuationPDFWithReactPDF(companyData, result);
      
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
        title: "PDF generado",
        description: "El informe de valoración se ha descargado correctamente",
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "Error al generar PDF",
        description: "Ha ocurrido un error al generar el informe. Inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  if (isCalculating) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Calculando Valoración</h2>
        <p className="text-gray-600">Analizando los datos de tu empresa...</p>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-semibold text-gray-600 mb-2">
          Sin resultados aún
        </h3>
        <p className="text-gray-500">
          Completa todos los pasos para obtener la valoración de tu empresa.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Valoración de {companyData.companyName}
        </h2>
        <p className="text-gray-600">Resultados basados en múltiplos EBITDA por sector</p>
      </div>

      {/* Resumen de datos de la empresa */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Resumen de Datos de la Empresa
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Información básica */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Información Básica</h4>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-gray-600">Empresa:</span>
                <span className="ml-2 font-medium">{companyData.companyName}</span>
              </div>
              <div>
                <span className="text-gray-600">CIF:</span>
                <span className="ml-2 font-medium">{companyData.cif}</span>
              </div>
              <div>
                <span className="text-gray-600">Contacto:</span>
                <span className="ml-2 font-medium">{companyData.contactName}</span>
              </div>
              <div>
                <span className="text-gray-600">Sector:</span>
                <span className="ml-2 font-medium capitalize">{companyData.industry}</span>
              </div>
              <div>
                <span className="text-gray-600">Años operando:</span>
                <span className="ml-2 font-medium">{companyData.yearsOfOperation} años</span>
              </div>
              <div>
                <span className="text-gray-600">Empleados:</span>
                <span className="ml-2 font-medium">{getEmployeeRangeLabel(companyData.employeeRange)}</span>
              </div>
              <div>
                <span className="text-gray-600">Ubicación:</span>
                <span className="ml-2 font-medium">{companyData.location}</span>
              </div>
            </div>
          </div>

          {/* Datos financieros */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Datos Financieros</h4>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-gray-600">Ingresos anuales:</span>
                <span className="ml-2 font-medium">{formatCurrency(companyData.revenue)}</span>
              </div>
              <div>
                <span className="text-gray-600">EBITDA:</span>
                <span className="ml-2 font-medium">{formatCurrency(companyData.ebitda)}</span>
              </div>
              <div>
                <span className="text-gray-600">Margen beneficio neto:</span>
                <span className="ml-2 font-medium">{companyData.netProfitMargin}%</span>
              </div>
              {companyData.growthRate > 0 && (
                <div>
                  <span className="text-gray-600">Tasa crecimiento:</span>
                  <span className="ml-2 font-medium">{companyData.growthRate}%</span>
                </div>
              )}
            </div>
          </div>

          {/* Características adicionales */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Características</h4>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-gray-600">Participación:</span>
                <span className="ml-2 font-medium">{getOwnershipLabel(companyData.ownershipParticipation)}</span>
              </div>
              <div>
                <span className="text-gray-600 block mb-1">Ventaja competitiva:</span>
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
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Valoración Estimada</h3>
          <p className="text-3xl font-bold text-gray-900 mb-2">
            {formatCurrency(result.finalValuation)}
          </p>
          <p className="text-sm text-gray-600">
            Rango: {formatCurrency(result.valuationRange.min)} - {formatCurrency(result.valuationRange.max)}
          </p>
        </div>

        <div className="bg-white border border-gray-300 rounded-lg p-6 text-center">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Múltiplo EBITDA</h3>
          <p className="text-3xl font-bold text-gray-900 mb-2">
            {result.multiples.ebitdaMultipleUsed}x
          </p>
          <p className="text-sm text-gray-600">
            Aplicado sobre EBITDA de {formatCurrency(companyData.ebitda)}
          </p>
        </div>
      </div>

      {/* Información de múltiplos aplicados */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Múltiplo Aplicado por Sector</h3>
        <div className="text-center">
          <p className="text-sm text-gray-600">Múltiplo EBITDA</p>
          <p className="text-2xl font-bold text-gray-900">{result.multiples.ebitdaMultipleUsed}x</p>
          <p className="text-sm text-gray-500 mt-2">
            Valoración: {formatCurrency(companyData.ebitda)} × {result.multiples.ebitdaMultipleUsed} = {formatCurrency(result.finalValuation)}
          </p>
        </div>
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600 text-center">
            Sector: <span className="font-semibold capitalize">{companyData.industry}</span> • 
            <span className="ml-2">Empleados: {getEmployeeRangeLabel(companyData.employeeRange)}</span>
          </p>
        </div>
      </div>

      {/* Acciones */}
      <div className="flex gap-4 justify-center">
        <Button
          onClick={resetCalculator}
          variant="outline"
          className="flex items-center"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Nueva Valoración
        </Button>
        <Button 
          onClick={handleDownloadPDF}
          disabled={isGeneratingPDF}
          className="flex items-center"
        >
          <Download className="h-4 w-4 mr-2" />
          {isGeneratingPDF ? 'Generando PDF...' : 'Descargar Informe PDF'}
        </Button>
      </div>

      {/* Sistema de valoración de la herramienta */}
      <ToolRating companyData={companyData} />

      {/* Aviso legal */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-yellow-800 mb-2">
          Aviso Importante
        </h3>
        <p className="text-sm text-yellow-700">
          Esta valoración es una estimación basada en múltiplos EBITDA por sector y no debe considerarse 
          como asesoramiento financiero profesional. Para valoraciones empresariales precisas, consulte con 
          un asesor financiero cualificado o un experto en valoración empresarial.
        </p>
      </div>
    </div>
  );
};

export default Step4Results;
