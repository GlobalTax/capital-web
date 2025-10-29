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
      {/* Header con valoración principal */}
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
          <CardTitle className="text-4xl font-bold text-primary">
            {formatCurrency(result.finalValuation)}
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-2">
            {t('advisor.results.company')}: {formData.companyName}
          </p>
        </CardHeader>
      </Card>

      {/* Detalles del cálculo */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              {t('advisor.results.calculation_method')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t('form.ebitda')}:</span>
              <span className="font-medium">{formatCurrency(formData.ebitda)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t('advisor.results.multiple')}:</span>
              <span className="font-medium">{result.ebitdaMultiple.toFixed(2)}x</span>
            </div>
            <div className="border-t pt-2 flex justify-between text-sm font-semibold">
              <span>{t('advisor.results.valuation')}:</span>
              <span className="text-primary">{formatCurrency(result.finalValuation)}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {t('advisor.results.valuation_range')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t('advisor.results.minimum')}:</span>
              <span className="font-medium">{formatCurrency(result.valuationRange.min)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t('advisor.results.maximum')}:</span>
              <span className="font-medium">{formatCurrency(result.valuationRange.max)}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {t('advisor.results.range_explanation')}
            </p>
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
