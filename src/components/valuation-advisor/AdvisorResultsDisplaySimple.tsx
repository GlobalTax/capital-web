import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, TrendingUp } from 'lucide-react';
import { useI18n } from '@/shared/i18n/I18nProvider';
import { AdvisorFormData, AdvisorValuationSimpleResult } from '@/types/advisor';

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

  const formatCurrency = (value: number): string => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(2)}M €`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(0)}K €`;
    }
    return `${value.toFixed(0)} €`;
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
