import React from 'react';
import { useValuationCalculatorV3 } from '@/hooks/useValuationCalculatorV3';
import { CompanyDataV3 } from '@/types/valuationV3';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ScenarioCard from '@/components/valuation-v3/ScenarioCard';
import TaxConfigPanel from '@/components/valuation-v3/TaxConfigPanel';
import ComparisonDashboard from '@/components/valuation-v3/ComparisonDashboard';
import { Building2, Calculator, BarChart3, Settings } from 'lucide-react';

interface ValuationCalculatorV3Props {
  companyData: CompanyDataV3;
}

const ValuationCalculatorV3 = ({ companyData }: ValuationCalculatorV3Props) => {
  const {
    taxData,
    scenarios,
    customValue,
    scenarioResults,
    comparison,
    isCalculating,
    updateTaxData,
    updateCustomValue
  } = useValuationCalculatorV3(companyData);

  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('es-ES', { 
      style: 'currency', 
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-4">
            Simulador de Venta - {companyData.companyName}
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Explora diferentes escenarios de venta y analiza el impacto fiscal de cada opción
          </p>
        </div>

        {/* Información de la empresa */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Datos de la Empresa
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <div className="text-sm text-muted-foreground">Sector</div>
                <div className="font-semibold">{companyData.industry}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Facturación</div>
                <div className="font-semibold">{formatCurrency(companyData.revenue)}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">EBITDA</div>
                <div className="font-semibold">{formatCurrency(companyData.ebitda)}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Valoración Base</div>
                <div className="font-semibold text-primary">{formatCurrency(companyData.baseValuation)}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contenido principal */}
        <Tabs defaultValue="scenarios" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="scenarios" className="flex items-center gap-2">
              <Calculator className="h-4 w-4" />
              Escenarios
            </TabsTrigger>
            <TabsTrigger value="comparison" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Comparación
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Configuración
            </TabsTrigger>
          </TabsList>

          {/* Tab: Escenarios */}
          <TabsContent value="scenarios" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
              {scenarioResults.map((result) => (
                <ScenarioCard
                  key={result.scenario.id}
                  result={result}
                  isCustom={result.scenario.type === 'custom'}
                  customValue={customValue}
                  onCustomValueChange={updateCustomValue}
                  className={result.scenario.id === comparison.bestScenario?.scenario?.id 
                    ? 'ring-2 ring-primary ring-offset-2' 
                    : ''
                  }
                />
              ))}
            </div>

            {/* Indicador de mejor escenario */}
            {comparison.bestScenario?.scenario && (
              <Card className="border-primary/50 bg-primary/5">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-primary text-primary-foreground">
                        Recomendado
                      </Badge>
                      <span className="font-medium">
                        El escenario {comparison.bestScenario.scenario.name} ofrece el mejor retorno neto
                      </span>
                    </div>
                    <div className="text-lg font-bold text-primary">
                      {formatCurrency(comparison.bestScenario.netReturn)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Tab: Comparación */}
          <TabsContent value="comparison" className="mt-6">
            <ComparisonDashboard comparison={comparison} />
          </TabsContent>

          {/* Tab: Configuración */}
          <TabsContent value="settings" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <TaxConfigPanel 
                  taxData={taxData}
                  onTaxDataChange={updateTaxData}
                />
              </div>
              
              {/* Panel de ayuda */}
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Cómo usar la herramienta</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div>
                      <strong>1. Configura tus datos fiscales</strong>
                      <p className="text-muted-foreground mt-1">
                        Introduce el valor de adquisición y otros datos relevantes
                      </p>
                    </div>
                    <div>
                      <strong>2. Explora escenarios</strong>
                      <p className="text-muted-foreground mt-1">
                        Compara diferentes valoraciones y su impacto fiscal
                      </p>
                    </div>
                    <div>
                      <strong>3. Personaliza valores</strong>
                      <p className="text-muted-foreground mt-1">
                        Usa el escenario personalizado para probar valores específicos
                      </p>
                    </div>
                    <div>
                      <strong>4. Analiza resultados</strong>
                      <p className="text-muted-foreground mt-1">
                        Revisa la comparación y recomendaciones
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Contacto</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm">
                    <p className="text-muted-foreground mb-3">
                      ¿Necesitas asesoramiento personalizado?
                    </p>
                    <div className="space-y-2">
                      <div>{companyData.contactName}</div>
                      <div className="text-muted-foreground">{companyData.email}</div>
                      <div className="text-muted-foreground">{companyData.phone}</div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ValuationCalculatorV3;