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
  onBack: () => void;
}

export const AdvisorResultsDisplaySimple: React.FC<AdvisorResultsDisplaySimpleProps> = ({
  result,
  formData,
  onBack,
}) => {
  const { t } = useI18n();
  const { toast } = useToast();

  // Rate limiting state
  const [lastDownloadTime, setLastDownloadTime] = useState<number>(0);
  const DOWNLOAD_COOLDOWN = 3000; // 3 segundos

  // Hook para generación de PDF
  const { generatePDF, isGenerating, error: pdfError } = useAdvisorValuationPDF(
    formData,
    result,
    'es' // TODO: Usar idioma del contexto i18n cuando esté disponible
  );

  // Función de descarga de PDF con validación y seguridad
  const handleDownloadPDF = async () => {
    // Rate limiting: prevenir spam
    const now = Date.now();
    if (now - lastDownloadTime < DOWNLOAD_COOLDOWN) {
      toast({
        title: "Espera un momento",
        description: "Por favor, espera unos segundos antes de descargar de nuevo",
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
          title: "Datos inválidos",
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
        title: "PDF descargado",
        description: "El informe se ha descargado correctamente",
      });
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
        title: "Error",
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
      color: '#2563eb', // blue-600
      bgColor: '#dbeafe', // blue-100
    },
    {
      name: 'Facturación',
      valoracion: result.revenueValuation,
      min: result.revenueRange.min,
      max: result.revenueRange.max,
      color: '#16a34a', // green-600
      bgColor: '#dcfce7', // green-100
    },
  ];

  // Tooltip personalizado para el gráfico
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <Card className="p-3 shadow-lg border-2" style={{ borderColor: data.color }}>
          <p className="font-semibold text-sm mb-2">{data.name}</p>
          <div className="space-y-1 text-xs">
            <p className="font-bold" style={{ color: data.color }}>
              Valoración: {formatCurrency(data.valoracion)}
            </p>
            <p className="text-muted-foreground">
              Rango: {formatCurrency(data.min)} - {formatCurrency(data.max)}
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
            Dos métodos de valoración independientes
          </p>
        </CardHeader>
      </Card>

      {/* GRÁFICO COMPARATIVO */}
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Comparación de Métodos de Valoración
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Visualización de las dos metodologías aplicadas
          </p>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<div className="h-80 flex items-center justify-center text-muted-foreground">Cargando gráfico...</div>}>
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
          
          {/* Leyenda personalizada */}
          <div className="flex items-center justify-center gap-6 mt-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-blue-600" />
              <span className="text-muted-foreground">Valoración por EBITDA</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-green-600" />
              <span className="text-muted-foreground">Valoración por Facturación</span>
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
              Valoración por EBITDA
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Valoración principal EBITDA */}
            <div className="text-center py-4 bg-white rounded-lg border border-blue-200">
              <p className="text-sm text-muted-foreground mb-1">Valoración estimada</p>
              <p className="text-3xl font-bold text-blue-600">
                {formatCurrency(result.ebitdaValuation)}
              </p>
            </div>

            {/* Detalles del cálculo EBITDA */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">EBITDA:</span>
                <span className="font-medium">{formatCurrency(formData.ebitda)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Múltiplo:</span>
                <span className="font-medium">{result.ebitdaMultiple.toFixed(2)}x</span>
              </div>
            </div>

            {/* Rango EBITDA */}
            <div className="pt-2 border-t">
              <p className="text-xs font-semibold text-muted-foreground mb-2">Rango de valoración:</p>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Mínimo:</span>
                <span className="font-medium">{formatCurrency(result.ebitdaRange.min)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Máximo:</span>
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
              Valoración por Facturación
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Valoración principal Revenue */}
            <div className="text-center py-4 bg-white rounded-lg border border-green-200">
              <p className="text-sm text-muted-foreground mb-1">Valoración estimada</p>
              <p className="text-3xl font-bold text-green-600">
                {formatCurrency(result.revenueValuation)}
              </p>
            </div>

            {/* Detalles del cálculo Revenue */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Facturación:</span>
                <span className="font-medium">{formatCurrency(formData.revenue)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Múltiplo:</span>
                <span className="font-medium">{result.revenueMultiple.toFixed(2)}x</span>
              </div>
            </div>

            {/* Rango Revenue */}
            <div className="pt-2 border-t">
              <p className="text-xs font-semibold text-muted-foreground mb-2">Rango de valoración:</p>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Mínimo:</span>
                <span className="font-medium">{formatCurrency(result.revenueRange.min)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Máximo:</span>
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
                Descargar Informe Completo
              </h3>
              <p className="text-sm text-muted-foreground">
                Obtén un PDF profesional con el análisis detallado de ambos métodos de valoración
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
                  Generando PDF...
                </>
              ) : (
                <>
                  <Download className="h-5 w-5" />
                  Descargar PDF
                </>
              )}
            </Button>
            {pdfError && (
              <p className="text-sm text-destructive">
                Error al generar el PDF. Por favor, inténtalo de nuevo.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

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
