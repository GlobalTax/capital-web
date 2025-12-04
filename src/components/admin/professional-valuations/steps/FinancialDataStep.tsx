// =============================================
// PASO 2: Datos Financieros
// =============================================

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FinancialYear } from '@/types/professionalValuation';
import { formatCurrencyEUR, calculateEbitdaMargin, calculateCAGR } from '@/utils/professionalValuationCalculation';
import { TrendingUp, TrendingDown, Minus, Euro, Percent } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FinancialDataStepProps {
  financialYears: FinancialYear[];
  updateFinancialYear: (index: number, updates: Partial<FinancialYear>) => void;
}

export function FinancialDataStep({ financialYears, updateFinancialYear }: FinancialDataStepProps) {
  // Calcular tendencias
  const revenueCAGR = calculateCAGR(financialYears, 'revenue');
  const ebitdaCAGR = calculateCAGR(financialYears, 'ebitda');
  
  // Último año con datos
  const latestYear = [...financialYears].sort((a, b) => b.year - a.year)[0];
  const ebitdaMargin = latestYear ? calculateEbitdaMargin(latestYear.ebitda, latestYear.revenue) : 0;

  const TrendIcon = ({ value }: { value: number | null }) => {
    if (value === null) return <Minus className="w-4 h-4 text-muted-foreground" />;
    if (value > 0) return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (value < 0) return <TrendingDown className="w-4 h-4 text-red-500" />;
    return <Minus className="w-4 h-4 text-muted-foreground" />;
  };

  const formatPercent = (value: number | null): string => {
    if (value === null) return '-';
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  return (
    <div className="space-y-6">
      {/* KPIs calculados */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">CAGR Facturación</p>
                <p className={cn(
                  'text-2xl font-bold',
                  revenueCAGR !== null && revenueCAGR > 0 && 'text-green-600',
                  revenueCAGR !== null && revenueCAGR < 0 && 'text-red-600'
                )}>
                  {formatPercent(revenueCAGR)}
                </p>
              </div>
              <TrendIcon value={revenueCAGR} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">CAGR EBITDA</p>
                <p className={cn(
                  'text-2xl font-bold',
                  ebitdaCAGR !== null && ebitdaCAGR > 0 && 'text-green-600',
                  ebitdaCAGR !== null && ebitdaCAGR < 0 && 'text-red-600'
                )}>
                  {formatPercent(ebitdaCAGR)}
                </p>
              </div>
              <TrendIcon value={ebitdaCAGR} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Margen EBITDA</p>
                <p className="text-2xl font-bold">
                  {ebitdaMargin > 0 ? `${ebitdaMargin.toFixed(1)}%` : '-'}
                </p>
              </div>
              <Percent className="w-4 h-4 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabla de datos financieros */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Evolución financiera (3 años)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-2 text-sm font-medium text-muted-foreground">
                    Concepto
                  </th>
                  {financialYears
                    .sort((a, b) => a.year - b.year)
                    .map((fy, index) => (
                      <th key={fy.year} className="text-center py-2 px-2 min-w-[140px]">
                        <Input
                          type="number"
                          value={fy.year}
                          onChange={(e) => updateFinancialYear(index, { year: parseInt(e.target.value) || 0 })}
                          className="w-24 mx-auto text-center font-semibold"
                        />
                      </th>
                    ))}
                </tr>
              </thead>
              <tbody>
                {/* Facturación */}
                <tr className="border-b">
                  <td className="py-3 px-2">
                    <div className="flex items-center gap-2">
                      <Euro className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">Facturación</span>
                    </div>
                  </td>
                  {financialYears
                    .sort((a, b) => a.year - b.year)
                    .map((fy, index) => (
                      <td key={`revenue-${fy.year}`} className="py-3 px-2">
                        <Input
                          type="number"
                          value={fy.revenue || ''}
                          onChange={(e) => updateFinancialYear(
                            financialYears.findIndex(f => f.year === fy.year),
                            { revenue: parseFloat(e.target.value) || 0 }
                          )}
                          placeholder="0"
                          className="text-right"
                        />
                        {fy.revenue > 0 && (
                          <p className="text-xs text-muted-foreground text-right mt-1">
                            {formatCurrencyEUR(fy.revenue)}
                          </p>
                        )}
                      </td>
                    ))}
                </tr>

                {/* EBITDA */}
                <tr className="border-b bg-primary/5">
                  <td className="py-3 px-2">
                    <div className="flex items-center gap-2">
                      <Euro className="w-4 h-4 text-primary" />
                      <span className="font-bold text-primary">EBITDA *</span>
                    </div>
                  </td>
                  {financialYears
                    .sort((a, b) => a.year - b.year)
                    .map((fy, index) => (
                      <td key={`ebitda-${fy.year}`} className="py-3 px-2">
                        <Input
                          type="number"
                          value={fy.ebitda || ''}
                          onChange={(e) => updateFinancialYear(
                            financialYears.findIndex(f => f.year === fy.year),
                            { ebitda: parseFloat(e.target.value) || 0 }
                          )}
                          placeholder="0"
                          className="text-right border-primary/50"
                        />
                        {fy.ebitda > 0 && (
                          <p className="text-xs text-primary text-right mt-1 font-medium">
                            {formatCurrencyEUR(fy.ebitda)}
                          </p>
                        )}
                      </td>
                    ))}
                </tr>


                {/* Margen EBITDA calculado */}
                <tr className="bg-muted/30">
                  <td className="py-3 px-2">
                    <span className="text-sm text-muted-foreground">Margen EBITDA</span>
                  </td>
                  {financialYears
                    .sort((a, b) => a.year - b.year)
                    .map((fy) => {
                      const margin = calculateEbitdaMargin(fy.ebitda, fy.revenue);
                      return (
                        <td key={`margin-${fy.year}`} className="py-3 px-2 text-center">
                          <span className={cn(
                            'text-sm font-medium',
                            margin > 15 && 'text-green-600',
                            margin > 0 && margin <= 15 && 'text-amber-600',
                            margin <= 0 && 'text-red-600'
                          )}>
                            {fy.revenue > 0 ? `${margin.toFixed(1)}%` : '-'}
                          </span>
                        </td>
                      );
                    })}
                </tr>
              </tbody>
            </table>
          </div>

          <p className="text-xs text-muted-foreground mt-4">
            * El EBITDA del último año será la base para la valoración
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
