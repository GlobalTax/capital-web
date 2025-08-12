
import React, { useState, useEffect } from 'react';
import { TrendingUp, Download, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useHubSpotIntegration } from '@/hooks/useHubSpotIntegration';
import { useSupabaseValuation } from '@/hooks/useSupabaseValuation';
import TaxSimulator from './TaxSimulator';
import { formatCurrency } from '@/shared/utils/format';

interface Step4Props {
  result: any;
  companyData: any;
  isCalculating: boolean;
  resetCalculator: () => void;
}

const Step4Results: React.FC<Step4Props> = ({ result, companyData, isCalculating, resetCalculator }) => {
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
        <p className="text-gray-600">Análisis completo de valoración empresarial</p>
      </div>

      {/* Tarjeta principal de valoración */}
      <Card className="text-center">
        <CardHeader>
          <TrendingUp className="h-12 w-12 text-blue-500 mx-auto mb-4" />
          <CardTitle className="text-2xl">Valoración Estimada</CardTitle>
          <CardDescription>Basada en múltiplos de mercado de tu sector</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-bold text-gray-900 mb-4">
            {formatCurrency(result.finalValuation)}
          </p>
          <p className="text-lg text-gray-600 mb-6">
            Rango: {formatCurrency(result.valuationRange.min)} - {formatCurrency(result.valuationRange.max)}
          </p>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold mb-2">Múltiplo Aplicado</h3>
            <p className="text-2xl font-bold text-blue-600">{result.multiples.ebitdaMultipleUsed}x EBITDA</p>
            <p className="text-sm text-gray-500 mt-2">
              {formatCurrency(companyData.ebitda)} × {result.multiples.ebitdaMultipleUsed} = {formatCurrency(result.finalValuation)}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Información del sector */}
      <Card>
        <CardHeader>
          <CardTitle>Información del Análisis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-600">Sector</p>
              <p className="font-semibold capitalize">{companyData.industry}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Empleados</p>
              <p className="font-semibold">{companyData.employeeRange}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">EBITDA</p>
              <p className="font-semibold">{formatCurrency(companyData.ebitda)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Ubicación</p>
              <p className="font-semibold">{companyData.location}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Simulador fiscal */}
      <TaxSimulator 
        companyValuation={result.finalValuation}
        companyName={companyData.companyName}
      />

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
          onClick={() => {/* Generar PDF */}}
          className="flex items-center"
        >
          <Download className="h-4 w-4 mr-2" />
          Descargar Informe
        </Button>
      </div>

      {/* Aviso legal */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-blue-800 mb-2">
          Aviso Importante
        </h3>
        <p className="text-sm text-blue-700">
          Esta valoración es una estimación basada en múltiplos de mercado y datos proporcionados. 
          Los valores reales pueden diferir según factores específicos del mercado, condiciones 
          de la transacción y análisis detallado de due diligence. Se recomienda consultar con 
          profesionales especializados para valoraciones definitivas.
        </p>
      </div>
    </div>
  );
};

export default Step4Results;
