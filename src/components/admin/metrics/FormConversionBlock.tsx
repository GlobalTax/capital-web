// ============= FORM CONVERSION BLOCK =============
// Heatmap table + comparative bars by lead form

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FileText, BarChart3 } from 'lucide-react';
import { FormConversionData } from './types';
import { Skeleton } from '@/components/ui/skeleton';

interface Props {
  data: FormConversionData[];
  isLoading: boolean;
}

const getHeatColor = (rate: number): string => {
  if (rate >= 30) return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
  if (rate >= 15) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
  if (rate >= 5) return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
  if (rate > 0) return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
  return 'text-muted-foreground';
};

export const FormConversionBlock: React.FC<Props> = ({ data, isLoading }) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-6 w-64" />
        <Skeleton className="h-48" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (!data.length) return null;

  const barData = data.map(f => ({
    name: f.formName,
    'Contactado': Math.round(f.contactedRate * 10) / 10,
    'Cualificado': Math.round(f.qualifiedRate * 10) / 10,
    'Avanzado': Math.round(f.advancedRate * 10) / 10,
  }));

  return (
    <div className="space-y-4">
      <h4 className="text-base font-semibold flex items-center gap-2">
        <FileText className="h-4 w-4" />
        Conversión por Formulario
      </h4>

      {/* Heatmap Table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Detalle por formulario y etapa</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 pr-4 font-medium text-muted-foreground">Formulario</th>
                  <th className="text-center py-2 px-2 font-medium text-muted-foreground">Total</th>
                  <th className="text-center py-2 px-2 font-medium text-muted-foreground">Contactado</th>
                  <th className="text-center py-2 px-2 font-medium text-muted-foreground">Cualificado</th>
                  <th className="text-center py-2 px-2 font-medium text-muted-foreground">Avanzado</th>
                  <th className="text-center py-2 px-2 font-medium text-muted-foreground">Ganado</th>
                  <th className="text-center py-2 px-2 font-medium text-muted-foreground">Perdido</th>
                </tr>
              </thead>
              <tbody>
                {data.map(f => (
                  <tr key={f.formName} className="border-b last:border-0 hover:bg-muted/50">
                    <td className="py-2 pr-4 font-medium">
                      {f.formName}
                      {f.formName === 'Sin formulario' && (
                        <span className="ml-1 text-[10px] text-amber-600">⚠</span>
                      )}
                    </td>
                    <td className="text-center py-2 px-2 font-semibold">{f.totalLeads}</td>
                    <td className="text-center py-2 px-1">
                      <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-medium ${getHeatColor(f.contactedRate)}`}>
                        {f.contactedCount} ({f.contactedRate.toFixed(0)}%)
                      </span>
                    </td>
                    <td className="text-center py-2 px-1">
                      <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-medium ${getHeatColor(f.qualifiedRate)}`}>
                        {f.qualifiedCount} ({f.qualifiedRate.toFixed(0)}%)
                      </span>
                    </td>
                    <td className="text-center py-2 px-1">
                      <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-medium ${getHeatColor(f.advancedRate)}`}>
                        {f.advancedCount} ({f.advancedRate.toFixed(0)}%)
                      </span>
                    </td>
                    <td className="text-center py-2 px-1">
                      <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-medium ${getHeatColor(f.wonRate)}`}>
                        {f.wonCount} ({f.wonRate.toFixed(0)}%)
                      </span>
                    </td>
                    <td className="text-center py-2 px-2 text-muted-foreground">
                      {f.lostCount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Comparative Bar Chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Tasas de conversión por formulario (%)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={barData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} unit="%" />
              <Tooltip
                formatter={(value: number) => [`${value}%`]}
                contentStyle={{ fontSize: 12, borderRadius: 8 }}
              />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="Contactado" fill="hsl(220, 70%, 60%)" radius={[3, 3, 0, 0]} />
              <Bar dataKey="Cualificado" fill="hsl(142, 60%, 50%)" radius={[3, 3, 0, 0]} />
              <Bar dataKey="Avanzado" fill="hsl(38, 90%, 55%)" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};
