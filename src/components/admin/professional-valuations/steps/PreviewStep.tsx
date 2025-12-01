// =============================================
// PASO 5: Vista Previa y Resumen
// =============================================

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ProfessionalValuationData, ValuationCalculationResult } from '@/types/professionalValuation';
import { formatCurrencyEUR, formatNumber, calculateEbitdaMargin } from '@/utils/professionalValuationCalculation';
import { 
  Building2, 
  User, 
  Mail, 
  Phone, 
  FileText, 
  TrendingUp, 
  TrendingDown,
  BarChart3,
  CheckCircle2,
  AlertCircle,
  Lightbulb
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface PreviewStepProps {
  data: ProfessionalValuationData;
  calculatedValues: ValuationCalculationResult | null;
  updateField: <K extends keyof ProfessionalValuationData>(
    field: K,
    value: ProfessionalValuationData[K]
  ) => void;
}

export function PreviewStep({ data, calculatedValues, updateField }: PreviewStepProps) {
  const latestYear = data.financialYears?.length 
    ? [...data.financialYears].sort((a, b) => b.year - a.year)[0] 
    : null;

  return (
    <div className="space-y-6">
      {/* Resumen de cliente */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            Datos del Cliente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-muted-foreground" />
              <span>{data.clientName || '-'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium">{data.clientCompany || '-'}</span>
            </div>
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-muted-foreground" />
              <span>{data.clientCif || '-'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-muted-foreground" />
              <span>{data.clientEmail || '-'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-muted-foreground" />
              <span>{data.clientPhone || '-'}</span>
            </div>
            <div>
              <Badge variant="outline">{data.sector}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resumen financiero */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Resumen Financiero
          </CardTitle>
        </CardHeader>
        <CardContent>
          {latestYear && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <p className="text-xs text-muted-foreground">Facturación {latestYear.year}</p>
                <p className="text-lg font-bold">{formatCurrencyEUR(latestYear.revenue)}</p>
              </div>
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <p className="text-xs text-muted-foreground">EBITDA Reportado</p>
                <p className="text-lg font-bold">{formatCurrencyEUR(latestYear.ebitda)}</p>
              </div>
              <div className="text-center p-3 bg-primary/10 rounded-lg">
                <p className="text-xs text-muted-foreground">EBITDA Normalizado</p>
                <p className="text-lg font-bold text-primary">
                  {formatCurrencyEUR(calculatedValues?.normalizedEbitda || 0)}
                </p>
              </div>
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <p className="text-xs text-muted-foreground">Margen EBITDA</p>
                <p className="text-lg font-bold">
                  {latestYear.revenue > 0 
                    ? `${calculateEbitdaMargin(latestYear.ebitda, latestYear.revenue).toFixed(1)}%`
                    : '-'
                  }
                </p>
              </div>
            </div>
          )}

          {/* Ajustes aplicados */}
          {data.normalizationAdjustments && data.normalizationAdjustments.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-medium mb-2">Ajustes de normalización aplicados:</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                {data.normalizationAdjustments.map((adj) => (
                  <li key={adj.id} className="flex items-center gap-2">
                    {adj.type === 'add' ? (
                      <TrendingUp className="w-3 h-3 text-green-500" />
                    ) : (
                      <TrendingDown className="w-3 h-3 text-red-500" />
                    )}
                    <span>{adj.concept}: </span>
                    <span className={cn(
                      'font-medium',
                      adj.type === 'add' ? 'text-green-600' : 'text-red-600'
                    )}>
                      {adj.type === 'add' ? '+' : '-'}{formatCurrencyEUR(adj.amount)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resultado de valoración */}
      {calculatedValues && (
        <Card className="border-2 border-primary">
          <CardHeader className="bg-primary/5">
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-primary" />
              Valoración Estimada
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="text-center mb-6">
              <p className="text-sm text-muted-foreground mb-1">Rango de Valoración</p>
              <p className="text-4xl font-bold text-primary">
                {formatCurrencyEUR(calculatedValues.valuationLow)} - {formatCurrencyEUR(calculatedValues.valuationHigh)}
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Múltiplo aplicado: {formatNumber(data.ebitdaMultipleUsed || calculatedValues.multipleUsed, 1)}x EBITDA
              </p>
            </div>

            <Separator className="my-4" />

            {/* Matriz de sensibilidad resumida */}
            {calculatedValues.sensitivityMatrix && (
              <div>
                <p className="text-sm font-medium mb-3">Análisis de Sensibilidad</p>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">EBITDA</th>
                        {calculatedValues.sensitivityMatrix.multiples.map((m) => (
                          <th key={m} className="text-center p-2">{formatNumber(m, 1)}x</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {calculatedValues.sensitivityMatrix.rows.map((row) => (
                        <tr key={row.label} className={cn(
                          'border-b',
                          row.label === 'Base' && 'bg-primary/5 font-medium'
                        )}>
                          <td className="p-2">{row.label}</td>
                          {row.cells.map((cell, i) => (
                            <td 
                              key={i} 
                              className={cn(
                                'text-center p-2',
                                row.label === 'Base' && i === 2 && 'bg-primary/10 font-bold text-primary'
                              )}
                            >
                              {formatCurrencyEUR(cell.valuation)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Fortalezas y debilidades */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2 text-green-600">
              <TrendingUp className="w-4 h-4" />
              Fortalezas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={data.strengths || ''}
              onChange={(e) => updateField('strengths', e.target.value)}
              placeholder="Factores que aumentan el valor: crecimiento, posición de mercado, equipo..."
              rows={4}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2 text-amber-600">
              <AlertCircle className="w-4 h-4" />
              Debilidades / Riesgos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={data.weaknesses || ''}
              onChange={(e) => updateField('weaknesses', e.target.value)}
              placeholder="Factores que reducen el valor: dependencia propietario, concentración clientes..."
              rows={4}
            />
          </CardContent>
        </Card>
      </div>

      {/* Notas internas */}
      <Card className="bg-amber-50 border-amber-200">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-amber-600" />
            Notas Internas (no se incluyen en el PDF)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={data.internalNotes || ''}
            onChange={(e) => updateField('internalNotes', e.target.value)}
            placeholder="Notas privadas para el equipo interno..."
            rows={3}
            className="bg-white"
          />
        </CardContent>
      </Card>
    </div>
  );
}
