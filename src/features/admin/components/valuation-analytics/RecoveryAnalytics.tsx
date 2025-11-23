import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, XCircle, Eye } from 'lucide-react';

interface RecoveryAnalyticsProps {
  recovery: {
    modalsShown: number;
    accepted: number;
    rejected: number;
    acceptanceRate: number;
  };
}

export const RecoveryAnalytics: React.FC<RecoveryAnalyticsProps> = ({ recovery }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Analíticas de Recuperación</CardTitle>
        <CardDescription>Efectividad del sistema de recuperación de sesiones</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Eye className="h-4 w-4" />
              Modales Mostrados
            </div>
            <div className="text-2xl font-bold">{recovery.modalsShown}</div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Aceptados
            </div>
            <div className="text-2xl font-bold text-green-600">{recovery.accepted}</div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <XCircle className="h-4 w-4 text-red-500" />
              Rechazados
            </div>
            <div className="text-2xl font-bold text-red-600">{recovery.rejected}</div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Tasa de Aceptación</span>
            <span className="text-2xl font-bold">{recovery.acceptanceRate.toFixed(1)}%</span>
          </div>
          <Progress value={recovery.acceptanceRate} className="h-3" />
          <p className="text-xs text-muted-foreground">
            {recovery.acceptanceRate > 60 ? 'Excelente rendimiento' : recovery.acceptanceRate > 40 ? 'Buen rendimiento' : 'Se puede mejorar'}
          </p>
        </div>

        <div className="rounded-lg bg-muted p-4">
          <h4 className="text-sm font-medium mb-2">Insights</h4>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li>• El sistema ha recuperado {recovery.accepted} sesiones abandonadas</li>
            <li>• Esto representa {((recovery.accepted / (recovery.modalsShown || 1)) * 100).toFixed(0)}% de conversiones recuperadas</li>
            <li>• {recovery.rejected} usuarios prefirieron empezar de nuevo</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
