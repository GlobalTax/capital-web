import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle } from 'lucide-react';

interface FieldInteraction {
  fieldName: string;
  touches: number;
  avgTimeSpent: number;
  abandonRate: number;
}

interface FieldHeatmapProps {
  fieldInteractions: FieldInteraction[];
}

export const FieldHeatmap: React.FC<FieldHeatmapProps> = ({ fieldInteractions }) => {
  const getFieldLabel = (fieldName: string): string => {
    const labels: Record<string, string> = {
      email: 'Email',
      companyName: 'Nombre Empresa',
      revenue: 'Facturación',
      ebitda: 'EBITDA',
      industry: 'Sector',
      phone: 'Teléfono',
      location: 'Ubicación',
    };
    return labels[fieldName] || fieldName;
  };

  const getHeatmapColor = (abandonRate: number): string => {
    if (abandonRate < 15) return 'bg-green-500';
    if (abandonRate < 30) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mapa de Calor de Campos</CardTitle>
        <CardDescription>Análisis de fricción por campo del formulario</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {fieldInteractions
          .sort((a, b) => b.abandonRate - a.abandonRate)
          .map((field) => (
            <div key={field.fieldName} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{getFieldLabel(field.fieldName)}</span>
                  {field.abandonRate > 25 && (
                    <AlertTriangle className="h-4 w-4 text-destructive" />
                  )}
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>{field.touches} interacciones</span>
                  <span>{field.avgTimeSpent}s promedio</span>
                  <span className="font-medium">{field.abandonRate}% abandono</span>
                </div>
              </div>
              <div className="flex gap-2 items-center">
                <Progress 
                  value={100 - field.abandonRate} 
                  className="h-2 flex-1" 
                />
                <div 
                  className={`h-2 w-2 rounded-full ${getHeatmapColor(field.abandonRate)}`}
                  title={`Tasa de abandono: ${field.abandonRate}%`}
                />
              </div>
            </div>
          ))}

        <div className="rounded-lg bg-muted p-4 mt-4">
          <h4 className="text-sm font-medium mb-2">Leyenda</h4>
          <div className="flex gap-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              <span>Bajo (&lt;15%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-yellow-500" />
              <span>Medio (15-30%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-red-500" />
              <span>Alto (&gt;30%)</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
