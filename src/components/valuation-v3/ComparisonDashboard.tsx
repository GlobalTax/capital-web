import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { ScenarioComparison } from '@/types/valuationV3';
import { Trophy, TrendingUp, Target, AlertCircle } from 'lucide-react';

interface ComparisonDashboardProps {
  comparison: ScenarioComparison;
}

const ComparisonDashboard = ({ comparison }: ComparisonDashboardProps) => {
  const { scenarios, bestScenario, recommendations } = comparison;

  if (scenarios.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Sin datos para comparar</h3>
          <p className="text-muted-foreground">
            Configure los datos fiscales para ver la comparación de escenarios
          </p>
        </CardContent>
      </Card>
    );
  }

  // Preparar datos para el gráfico
  const chartData = scenarios.map(result => ({
    name: result.scenario.name,
    valuation: result.valuation,
    impuestos: result.taxCalculation.totalTax,
    neto: result.netReturn,
    color: result.scenario.color
  }));

  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('es-ES', { 
      style: 'currency', 
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
      notation: amount >= 1000000 ? 'compact' : 'standard'
    }).format(amount);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="font-semibold">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.dataKey === 'valuation' && `Valoración: ${formatCurrency(entry.value)}`}
              {entry.dataKey === 'impuestos' && `Impuestos: ${formatCurrency(entry.value)}`}
              {entry.dataKey === 'neto' && `Neto: ${formatCurrency(entry.value)}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Mejor escenario */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Mejor Escenario
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
            <div>
              <h3 className="text-lg font-semibold">{bestScenario.scenario?.name}</h3>
              <p className="text-sm text-muted-foreground">{bestScenario.scenario?.description}</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">
                {formatCurrency(bestScenario.netReturn)}
              </div>
              <div className="text-sm text-muted-foreground">
                ROI: {bestScenario.roi.toFixed(1)}%
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gráfico comparativo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart className="h-5 w-5" />
            Comparación de Escenarios
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="name" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickFormatter={(value) => formatCurrency(value)}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="valuation" name="Valoración" radius={4}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-valuation-${index}`} fill={entry.color} opacity={0.3} />
                  ))}
                </Bar>
                <Bar dataKey="neto" name="Neto" radius={4}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-neto-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Tabla detallada */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Detalle por Escenario
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-3">Escenario</th>
                  <th className="text-right p-3">Valoración</th>
                  <th className="text-right p-3">Impuestos</th>
                  <th className="text-right p-3">Neto</th>
                  <th className="text-right p-3">ROI</th>
                </tr>
              </thead>
              <tbody>
                {scenarios.map((result, index) => (
                  <tr key={result.scenario.id} className="border-b border-border/50">
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: result.scenario.color }}
                        />
                        <span className="font-medium">{result.scenario.name}</span>
                        {result.scenario.id === bestScenario.scenario?.id && (
                          <Badge variant="secondary" className="text-xs">
                            Mejor
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="text-right p-3 font-semibold">
                      {formatCurrency(result.valuation)}
                    </td>
                    <td className="text-right p-3 text-destructive">
                      {formatCurrency(result.taxCalculation.totalTax)}
                    </td>
                    <td className="text-right p-3 font-semibold text-primary">
                      {formatCurrency(result.netReturn)}
                    </td>
                    <td className="text-right p-3">
                      <span className={result.roi > 0 ? 'text-accent' : 'text-destructive'}>
                        {result.roi.toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Recomendaciones */}
      {recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Recomendaciones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {recommendations.map((recommendation, index) => (
                <li key={index} className="flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                  <span className="text-sm">{recommendation}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ComparisonDashboard;