
import React, { useState, useEffect } from 'react';
import { TrendingUp, Download, RefreshCw, Calculator, Euro, Percent } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { generateValuationPDFWithReactPDF } from '@/utils/reactPdfGenerator';
import { useToast } from '@/hooks/use-toast';
import { useHubSpotIntegration } from '@/hooks/useHubSpotIntegration';
import { useSupabaseValuation } from '@/hooks/useSupabaseValuation';

interface Step5Props {
  result: any;
  companyData: any;
  isCalculating: boolean;
  resetCalculator: () => void;
}

const Step5Results: React.FC<Step5Props> = ({ result, companyData, isCalculating, resetCalculator }) => {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [dataSaved, setDataSaved] = useState(false);
  const { toast } = useToast();
  const { createCompanyValuation } = useHubSpotIntegration();
  const { saveValuation } = useSupabaseValuation();

  // Guardar datos cuando se muestran los resultados
  useEffect(() => {
    if (result && companyData && result.finalValuation && companyData.companyName && !dataSaved) {
      const saveData = async () => {
        try {
          await saveValuation(companyData, result);
          
          try {
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
          } catch (hubspotError) {
            console.warn('Error enviando a HubSpot:', hubspotError);
          }
          
          setDataSaved(true);
        } catch (error) {
          console.error('Error guardando datos:', error);
        }
      };

      saveData();
    }
  }, [result?.finalValuation, companyData?.companyName, dataSaved]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (isCalculating) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Calculando Valoración e Impacto Fiscal</h2>
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

  const taxImpact = result.taxImpact;

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Valoración e Impacto Fiscal - {companyData.companyName}
        </h2>
        <p className="text-gray-600">Análisis completo de valoración e impacto fiscal de la venta</p>
      </div>

      {/* Tarjetas principales de valoración */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="text-center">
            <TrendingUp className="h-8 w-8 text-blue-500 mx-auto" />
            <CardTitle>Valoración Total</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-3xl font-bold text-gray-900">
              {formatCurrency(result.finalValuation)}
            </p>
            <p className="text-sm text-gray-600 mt-2">
              Rango: {formatCurrency(result.valuationRange.min)} - {formatCurrency(result.valuationRange.max)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="text-center">
            <Euro className="h-8 w-8 text-green-500 mx-auto" />
            <CardTitle>Precio de Venta</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-3xl font-bold text-gray-900">
              {formatCurrency(taxImpact.salePrice)}
            </p>
            <p className="text-sm text-gray-600 mt-2">
              {companyData.salePercentage}% de la empresa
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="text-center">
            <Calculator className="h-8 w-8 text-purple-500 mx-auto" />
            <CardTitle>Neto después de Impuestos</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-3xl font-bold text-green-600">
              {formatCurrency(taxImpact.netAfterTax)}
            </p>
            <p className="text-sm text-gray-600 mt-2">
              Efectivo disponible
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Análisis fiscal detallado */}
      <Card>
        <CardHeader>
          <CardTitle>Análisis Fiscal Detallado</CardTitle>
          <CardDescription>Desglose completo del impacto fiscal de la venta</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Precio de Venta:</span>
                <span className="font-semibold">{formatCurrency(taxImpact.salePrice)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Coste de Adquisición:</span>
                <span className="font-semibold">-{formatCurrency(taxImpact.acquisitionCost)}</span>
              </div>
              <div className="border-t pt-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Plusvalía Bruta:</span>
                  <span className="font-semibold text-blue-600">{formatCurrency(taxImpact.capitalGain)}</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Plusvalía Gravable:</span>
                <span className="font-semibold">{formatCurrency(taxImpact.taxableGain)}</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Tipo Impositivo:</span>
                <span className="font-semibold">{(taxImpact.taxRate * 100).toFixed(1)}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Impuestos a Pagar:</span>
                <span className="font-semibold text-red-600">-{formatCurrency(taxImpact.totalTax)}</span>
              </div>
              {taxImpact.reinvestmentBenefit > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Beneficio Reinversión:</span>
                  <span className="font-semibold text-green-600">+{formatCurrency(taxImpact.reinvestmentBenefit)}</span>
                </div>
              )}
              <div className="border-t pt-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Tipo Efectivo:</span>
                  <span className="font-semibold">{(taxImpact.effectiveTaxRate * 100).toFixed(1)}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Barra de progreso visual */}
          <div className="mt-6">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Distribución del Precio de Venta</span>
              <span>Total: {formatCurrency(taxImpact.salePrice)}</span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center">
                <div className="w-full bg-gray-200 rounded-full h-4 mr-3">
                  <div 
                    className="bg-green-500 h-4 rounded-full" 
                    style={{ width: `${(taxImpact.netAfterTax / taxImpact.salePrice) * 100}%` }}
                  ></div>
                </div>
                <span className="text-sm text-green-600 font-medium min-w-0">
                  Neto: {formatCurrency(taxImpact.netAfterTax)}
                </span>
              </div>
              <div className="flex items-center">
                <div className="w-full bg-gray-200 rounded-full h-2 mr-3">
                  <div 
                    className="bg-red-500 h-2 rounded-full" 
                    style={{ width: `${(taxImpact.totalTax / taxImpact.salePrice) * 100}%` }}
                  ></div>
                </div>
                <span className="text-sm text-red-600 min-w-0">
                  Impuestos: {formatCurrency(taxImpact.totalTax)}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Información del múltiplo aplicado */}
      <Card>
        <CardHeader>
          <CardTitle>Múltiplo de Valoración Aplicado</CardTitle>
        </CardHeader>
        <CardContent>
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
              <span className="ml-2">Empleados: {companyData.employeeRange}</span>
            </p>
          </div>
        </CardContent>
      </Card>

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
          onClick={() => {/* PDF con datos fiscal */}}
          disabled={isGeneratingPDF}
          className="flex items-center"
        >
          <Download className="h-4 w-4 mr-2" />
          {isGeneratingPDF ? 'Generando PDF...' : 'Descargar Informe Completo'}
        </Button>
      </div>

      {/* Aviso legal */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-yellow-800 mb-2">
          Aviso Importante sobre Impacto Fiscal
        </h3>
        <p className="text-sm text-yellow-700">
          Los cálculos fiscales mostrados son estimaciones basadas en tipos generales y pueden variar según 
          circunstancias específicas, deducciones adicionales, o cambios normativos. Para asesoramiento fiscal 
          preciso, consulte con un asesor fiscal profesional. Esta herramienta no sustituye el consejo profesional.
        </p>
      </div>
    </div>
  );
};

export default Step5Results;
