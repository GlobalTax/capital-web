import React, { useState } from 'react';
import { CompanyDataV4 } from '@/types/valuationV4';
import { useValuationCalculatorV4 } from '@/hooks/useValuationCalculatorV4';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';
import { 
  Download, Share2, RotateCcw, TrendingUp, Calculator, BarChart3, 
  Settings, FileText, Building2, Euro, Target, HelpCircle,
  CheckCircle, AlertTriangle, Info, ArrowRight, Zap
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import { generateValuationPDFWithReactPDF } from '@/utils/reactPdfGenerator';

interface StandaloneCalculatorProps {
  companyData: CompanyDataV4;
  onReset: () => void;
}

const StandaloneCalculator = ({ companyData, onReset }: StandaloneCalculatorProps) => {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [activeTab, setActiveTab] = useState('results');
  
  const {
    scenarioResults,
    bestScenario,
    distributionData,
    taxData,
    acquisitionValue,
    customMultiplier,
    updateAcquisitionValue,
    updateCustomMultiplier,
    updateTaxpayerType,
    updateSalePercentage,
    toggleReinvestment,
    toggleVitalicia
  } = useValuationCalculatorV4(companyData);

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleGeneratePDF = async () => {
    if (!bestScenario) {
      toast({
        title: "Error",
        description: "No hay resultados para generar el PDF",
        variant: "destructive",
      });
      return;
    }

    setIsGeneratingPDF(true);
    try {
      const pdfCompanyData = {
        contactName: companyData.contactName,
        companyName: companyData.companyName,
        cif: 'N/A',
        email: companyData.email,
        phone: companyData.phone,
        industry: companyData.industry,
        yearsOfOperation: 5,
        employeeRange: '11-50',
        revenue: companyData.revenue,
        ebitda: companyData.ebitda,
        netProfitMargin: 15,
        growthRate: 10,
        location: 'España',
        ownershipParticipation: 'alta',
        competitiveAdvantage: 'Posición sólida en el mercado'
      };

      const pdfResult = {
        ebitdaMultiple: bestScenario.multiplier,
        finalValuation: bestScenario.valuation,
        valuationRange: {
          min: Math.round(bestScenario.valuation * 0.8),
          max: Math.round(bestScenario.valuation * 1.2)
        },
        multiples: {
          ebitdaMultipleUsed: bestScenario.multiplier
        }
      };

      const pdfBlob = await generateValuationPDFWithReactPDF(pdfCompanyData, pdfResult);
      const url = URL.createObjectURL(pdfBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `valoracion-${companyData.companyName.replace(/\s+/g, '-').toLowerCase()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "PDF generado",
        description: "El informe se ha descargado correctamente",
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "Error",
        description: "No se pudo generar el PDF",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleAcquisitionValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    updateAcquisitionValue(value);
  };

  const handleCustomMultiplierChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    updateCustomMultiplier(value);
  };

  const handleTaxpayerTypeChange = (value: string) => {
    updateTaxpayerType(value as 'individual' | 'company');
  };

  const handleSalePercentageChange = (value: number) => {
    updateSalePercentage(value);
  };

  const handleReinvestmentPlanToggle = (checked: boolean) => {
    toggleReinvestment(checked);
  };

  const handleVitaliciaPlanToggle = (checked: boolean) => {
    toggleVitalicia(checked);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Enhanced Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Zap className="h-4 w-4" />
            Calculadora Avanzada V4
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Valoración Empresarial Completa
          </h1>
          <p className="text-xl text-muted-foreground mb-1">
            {companyData.companyName}
          </p>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="results" className="flex items-center gap-2">
              <Calculator className="h-4 w-4" />
              Resultados
            </TabsTrigger>
            <TabsTrigger value="comparison" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Comparación
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Configuración
            </TabsTrigger>
            <TabsTrigger value="export" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Exportar
            </TabsTrigger>
          </TabsList>

          <TabsContent value="results" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {scenarioResults.map((result, index) => (
                <Card 
                  key={result.id} 
                  className={`transition-all duration-500 hover:shadow-xl ${
                    result.id === bestScenario?.id 
                      ? 'ring-2 ring-primary ring-offset-2 bg-gradient-to-br from-primary/10 to-primary/5' 
                      : ''
                  }`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{result.name}</CardTitle>
                      {result.id === bestScenario?.id && (
                        <Badge className="bg-primary text-primary-foreground">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          Óptimo
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-primary mb-2">
                      {formatCurrency(result.valuation)}
                    </div>
                    <div className="text-green-600 font-semibold">
                      {formatCurrency(result.netReturn)}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {bestScenario && (
              <Card className="bg-gradient-to-r from-primary/10 to-transparent">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-primary">
                    <Target className="h-6 w-6" />
                    Escenario Recomendado: {bestScenario.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-primary">
                        {formatCurrency(bestScenario.valuation)}
                      </div>
                      <div className="text-sm text-muted-foreground">Valoración Total</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600">
                        {formatCurrency(bestScenario.netReturn)}
                      </div>
                      <div className="text-sm text-muted-foreground">Retorno Neto</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600">
                        {bestScenario.roi.toFixed(1)}%
                      </div>
                      <div className="text-sm text-muted-foreground">ROI</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="export" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Exportar Resultados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button 
                    onClick={handleGeneratePDF}
                    disabled={isGeneratingPDF}
                    className="h-20 flex flex-col items-center gap-2"
                  >
                    <Download className="h-6 w-6" />
                    {isGeneratingPDF ? 'Generando...' : 'Informe PDF'}
                  </Button>
                  
                  <Button 
                    onClick={() => toast({ title: "Compartido", description: "Resultados compartidos" })}
                    variant="outline"
                    className="h-20 flex flex-col items-center gap-2"
                  >
                    <Share2 className="h-6 w-6" />
                    Compartir
                  </Button>
                  
                  <Button 
                    onClick={onReset}
                    variant="outline"
                    className="h-20 flex flex-col items-center gap-2"
                  >
                    <RotateCcw className="h-6 w-6" />
                    Nueva Simulación
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="comparison" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Comparación de Escenarios
                </CardTitle>
                <CardDescription>Visualización comparativa de los diferentes escenarios de valoración.</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={scenarioResults}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={(value) => formatCurrency(value as number)} />
                    <Tooltip formatter={(value) => formatCurrency(value as number)} />
                    <Legend />
                    <Bar dataKey="valuation" fill="#8884d8" />
                    <Bar dataKey="netReturn" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Configuración de la Simulación
                </CardTitle>
                <CardDescription>Ajusta los parámetros para personalizar la valoración.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-6">
                <div className="space-y-2">
                  <Label htmlFor="acquisitionValue">Valor de Adquisición (€)</Label>
                  <Input
                    type="number"
                    id="acquisitionValue"
                    value={acquisitionValue}
                    onChange={handleAcquisitionValueChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customMultiplier">Multiplicador Personalizado</Label>
                  <Input
                    type="number"
                    id="customMultiplier"
                    value={customMultiplier}
                    onChange={handleCustomMultiplierChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="taxpayerType">Tipo de Contribuyente</Label>
                  <Select onValueChange={handleTaxpayerTypeChange}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Selecciona" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="individual">Individual</SelectItem>
                      <SelectItem value="company">Empresa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Porcentaje de Venta (%)</Label>
                  <Slider
                    defaultValue={[taxData.salePercentage]}
                    max={100}
                    step={1}
                    onValueChange={(value) => handleSalePercentageChange(value[0])}
                  />
                  <Progress value={taxData.salePercentage} />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <Label htmlFor="reinvestmentPlan">Plan de Reinversión</Label>
                  <Switch
                    id="reinvestmentPlan"
                    checked={taxData.reinvestmentPlan}
                    onCheckedChange={handleReinvestmentPlanToggle}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="vitaliciaPlan">Plan de Renta Vitalicia</Label>
                  <Switch
                    id="vitaliciaPlan"
                    checked={taxData.vitaliciaPlan}
                    onCheckedChange={handleVitaliciaPlanToggle}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Disclaimer */}
        <div className="mt-12 p-6 bg-muted/30 rounded-xl border">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-6 w-6 text-warning flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold mb-2">Aviso Legal Importante</h3>
              <p className="text-sm text-muted-foreground">
                Esta herramienta proporciona estimaciones orientativas. Para asesoramiento definitivo, 
                consulte con especialistas de <span className="font-semibold text-primary">CAPITTAL</span>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StandaloneCalculator;
