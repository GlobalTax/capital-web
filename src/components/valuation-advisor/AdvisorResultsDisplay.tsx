import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, TrendingUp, DollarSign, PieChart, AlertTriangle, CheckCircle, AlertCircle } from 'lucide-react';
import { AdvisorValuationResult } from '@/utils/advisorValuationCalculation';
import { formatCurrency } from '@/shared/utils/format';
import { useI18n } from '@/shared/i18n/I18nProvider';

interface FormData {
  sector: string;
  revenue: number;
  ebitda: number;
  netProfit: number;
}

interface AdvisorResultsDisplayProps {
  result: AdvisorValuationResult;
  formData: FormData;
  onBack: () => void;
}

export const AdvisorResultsDisplay: React.FC<AdvisorResultsDisplayProps> = ({ result, formData, onBack }) => {
  const { t } = useI18n();

  const confidenceColors = {
    high: 'bg-green-100 text-green-800 border-green-300',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    low: 'bg-red-100 text-red-800 border-red-300'
  };

  const confidenceLabels = {
    high: t('advisor.results.confidence.high'),
    medium: t('advisor.results.confidence.medium'),
    low: t('advisor.results.confidence.low')
  };

  const formatCompactCurrency = (value: number) => {
    if (value >= 1_000_000) {
      return `${(value / 1_000_000).toFixed(1)}M€`;
    }
    if (value >= 1_000) {
      return `${(value / 1_000).toFixed(0)}K€`;
    }
    return formatCurrency(value);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fadeIn">
      {/* 1. Header con valoración promedio ponderada */}
      <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-2 border-primary/20">
        <CardContent className="pt-6">
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground font-medium">
              {t('advisor.results.weightedAverage')}
            </p>
            <h2 className="text-4xl font-bold text-primary">
              {formatCurrency(result.weightedAverage)}
            </h2>
            <Badge className={`${confidenceColors[result.confidence]} text-sm border`}>
              {t('advisor.results.confidence.label')}: {confidenceLabels[result.confidence]}
            </Badge>
            <p className="text-xs text-muted-foreground mt-2">
              EBITDA: 50% | Facturación: 25% | Resultado Neto: 25%
            </p>
          </div>
        </CardContent>
      </Card>
      
      {/* 2. Warnings (si existen) */}
      {result.warnings.length > 0 && (
        <Alert variant="destructive" className="border-yellow-500 bg-yellow-50">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Atención</AlertTitle>
          <AlertDescription>
            <ul className="list-disc pl-4 space-y-1">
              {result.warnings.map((warning, idx) => (
                <li key={idx}>{warning}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}
      
      {/* 3. Grid de tarjetas por métrica */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Tarjeta Facturación */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              {t('advisor.metrics.revenue')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-2xl font-bold text-primary">
                {formatCurrency(result.revenueValuation.median)}
              </p>
              <p className="text-xs text-muted-foreground">{t('advisor.metrics.median')}</p>
            </div>
            
            <Separator />
            
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('advisor.metrics.range')}:</span>
                <span className="font-medium">
                  {formatCompactCurrency(result.revenueValuation.range.min)} - {formatCompactCurrency(result.revenueValuation.range.max)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('advisor.metrics.multiple')}:</span>
                <span className="font-medium">{result.revenueValuation.multiple.toFixed(2)}x</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('advisor.metrics.base')}:</span>
                <span className="font-medium">{formatCompactCurrency(result.revenueValuation.metricValue)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Tarjeta EBITDA (destacada con borde) */}
        <Card className="border-2 border-green-300 hover:shadow-xl transition-shadow">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <DollarSign className="h-5 w-5 text-green-600" />
                {t('advisor.metrics.ebitda')}
              </CardTitle>
              <Badge variant="secondary" className="text-xs">
                {t('advisor.metrics.weight')}: 50%
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-2xl font-bold text-green-700">
                {formatCurrency(result.ebitdaValuation.median)}
              </p>
              <p className="text-xs text-muted-foreground">{t('advisor.metrics.median')}</p>
            </div>
            
            <Separator />
            
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('advisor.metrics.range')}:</span>
                <span className="font-medium">
                  {formatCompactCurrency(result.ebitdaValuation.range.min)} - {formatCompactCurrency(result.ebitdaValuation.range.max)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('advisor.metrics.multiple')}:</span>
                <span className="font-medium">{result.ebitdaValuation.multiple.toFixed(2)}x</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('advisor.metrics.base')}:</span>
                <span className="font-medium">{formatCompactCurrency(result.ebitdaValuation.metricValue)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Tarjeta Resultado Neto */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <PieChart className="h-5 w-5 text-purple-600" />
              {t('advisor.metrics.netProfit')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-2xl font-bold text-primary">
                {formatCurrency(result.netProfitValuation.median)}
              </p>
              <p className="text-xs text-muted-foreground">{t('advisor.metrics.median')}</p>
            </div>
            
            <Separator />
            
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('advisor.metrics.range')}:</span>
                <span className="font-medium">
                  {formatCompactCurrency(result.netProfitValuation.range.min)} - {formatCompactCurrency(result.netProfitValuation.range.max)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('advisor.metrics.multiple')}:</span>
                <span className="font-medium">{result.netProfitValuation.multiple.toFixed(2)}x</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('advisor.metrics.base')}:</span>
                <span className="font-medium">{formatCompactCurrency(result.netProfitValuation.metricValue)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* 4. Rango recomendado y análisis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {result.confidence === 'high' ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : (
              <AlertCircle className="h-5 w-5 text-yellow-600" />
            )}
            {t('advisor.results.analysisTitle')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-foreground leading-relaxed">
              {result.recommendation}
            </p>
          </div>
          
          <Separator />
          
          <div className="bg-muted p-4 rounded-lg space-y-2">
            <p className="text-sm font-medium text-foreground">
              {t('advisor.results.recommendedRange')}:
            </p>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 bg-gradient-to-r from-blue-200 via-green-300 to-blue-200 rounded-full" />
            </div>
            <p className="text-2xl font-bold text-center">
              {formatCurrency(result.recommendedRange.min)} - {formatCurrency(result.recommendedRange.max)}
            </p>
            <p className="text-xs text-muted-foreground text-center">
              Confianza del análisis: {result.confidenceScore}%
            </p>
          </div>
        </CardContent>
      </Card>
      
      {/* 5. Acciones */}
      <div className="flex gap-4">
        <Button onClick={onBack} variant="outline" className="flex-1">
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t('advisor.results.newValuation')}
        </Button>
      </div>
    </div>
  );
};
