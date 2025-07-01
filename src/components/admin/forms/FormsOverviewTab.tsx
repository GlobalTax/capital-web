
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';
import { FormAnalytics } from '@/hooks/useFormTracking';

interface FormsOverviewTabProps {
  analytics: FormAnalytics[];
}

const FormsOverviewTab: React.FC<FormsOverviewTabProps> = ({ analytics }) => {
  const sortedByConversion = [...analytics].sort((a, b) => b.conversion_rate - a.conversion_rate);
  const sortedByVolume = [...analytics].sort((a, b) => b.total_starts - a.total_starts);
  
  const highPerformers = analytics.filter(form => form.conversion_rate > 60);
  const needsAttention = analytics.filter(form => form.conversion_rate < 30 || form.abandonment_rate > 70);

  return (
    <div className="space-y-6">
      {/* Alertas y Recomendaciones */}
      {needsAttention.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-700">
              <AlertTriangle className="h-5 w-5" />
              Formularios que Necesitan Atención
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {needsAttention.map((form) => (
                <div key={form.form_type} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                  <div>
                    <div className="font-semibold capitalize">{form.form_type.replace('_', ' ')}</div>
                    <div className="text-sm text-gray-600">
                      {form.conversion_rate < 30 && `Conversión baja: ${form.conversion_rate.toFixed(1)}%`}
                      {form.abandonment_rate > 70 && ` • Abandono alto: ${form.abandonment_rate.toFixed(1)}%`}
                    </div>
                  </div>
                  <Badge variant="destructive">Revisar</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* High Performers */}
      {highPerformers.length > 0 && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700">
              <TrendingUp className="h-5 w-5" />
              Formularios de Alto Rendimiento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {highPerformers.map((form) => (
                <div key={form.form_type} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                  <div>
                    <div className="font-semibold capitalize">{form.form_type.replace('_', ' ')}</div>
                    <div className="text-sm text-gray-600">
                      Conversión: {form.conversion_rate.toFixed(1)}% • {form.total_completions} completados
                    </div>
                  </div>
                  <Badge variant="default" className="bg-green-600">Excelente</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top por Conversión */}
        <Card>
          <CardHeader>
            <CardTitle>🏆 Mejores por Conversión</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {sortedByConversion.slice(0, 5).map((form, index) => (
                <div key={form.form_type} className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-sm font-bold text-blue-600">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium capitalize">{form.form_type.replace('_', ' ')}</div>
                    <Progress value={form.conversion_rate} className="mt-1 h-2" />
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-green-600">{form.conversion_rate.toFixed(1)}%</div>
                    <div className="text-xs text-gray-500">{form.total_completions} conv.</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top por Volumen */}
        <Card>
          <CardHeader>
            <CardTitle>📈 Más Utilizados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {sortedByVolume.slice(0, 5).map((form, index) => (
                <div key={form.form_type} className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-sm font-bold text-purple-600">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium capitalize">{form.form_type.replace('_', ' ')}</div>
                    <div className="text-sm text-gray-500">
                      {form.total_starts} inicios • {form.conversion_rate.toFixed(1)}% conversión
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-purple-600">{form.total_starts}</div>
                    <div className="text-xs text-gray-500">usos</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Resumen Ejecutivo */}
      <Card>
        <CardHeader>
          <CardTitle>📋 Resumen Ejecutivo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {analytics.reduce((sum, f) => sum + f.total_starts, 0).toLocaleString()}
              </div>
              <div className="text-sm text-blue-700">Total Interacciones</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {analytics.reduce((sum, f) => sum + f.total_completions, 0).toLocaleString()}
              </div>
              <div className="text-sm text-green-700">Conversiones Logradas</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {(analytics.reduce((sum, f) => sum + f.conversion_rate, 0) / Math.max(analytics.length, 1)).toFixed(1)}%
              </div>
              <div className="text-sm text-orange-700">Conversión Promedio</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FormsOverviewTab;
