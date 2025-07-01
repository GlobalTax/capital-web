
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BarChart3, PieChart, TrendingDown } from 'lucide-react';
import { FormAnalytics } from '@/hooks/useFormTracking';

interface FormAnalyticsTabProps {
  analytics: FormAnalytics[];
}

const FormAnalyticsTab: React.FC<FormAnalyticsTabProps> = ({ analytics }) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Análisis de Abandono */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-red-500" />
              Análisis de Abandono
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics
                .filter(form => form.abandonment_rate > 0)
                .sort((a, b) => b.abandonment_rate - a.abandonment_rate)
                .map((form) => (
                  <div key={form.form_type} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium capitalize">{form.form_type.replace('_', ' ')}</span>
                      <Badge variant={form.abandonment_rate > 70 ? "destructive" : form.abandonment_rate > 50 ? "secondary" : "outline"}>
                        {form.abandonment_rate.toFixed(1)}%
                      </Badge>
                    </div>
                    <Progress value={form.abandonment_rate} className="h-2" />
                    {form.most_abandoned_field && (
                      <div className="text-xs text-gray-500">
                        Campo problemático: <span className="font-medium">{form.most_abandoned_field}</span>
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        {/* Funnel de Conversión */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-500" />
              Funnel de Conversión
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {analytics.map((form) => (
                <div key={form.form_type} className="space-y-3">
                  <div className="font-medium capitalize">{form.form_type.replace('_', ' ')}</div>
                  
                  {/* Visualización del funnel */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Inicios</span>
                      <span className="font-medium">{form.total_starts}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div className="bg-blue-500 h-3 rounded-full" style={{ width: '100%' }}></div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Completados</span>
                      <span className="font-medium text-green-600">{form.total_completions}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-green-500 h-3 rounded-full" 
                        style={{ width: `${form.conversion_rate}%` }}
                      ></div>
                    </div>
                    
                    <div className="text-center text-sm">
                      <Badge variant="outline">
                        {form.conversion_rate.toFixed(1)}% conversión final
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabla Detallada */}
      <Card>
        <CardHeader>
          <CardTitle>📊 Métricas Detalladas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-medium">Formulario</th>
                  <th className="text-right p-3 font-medium">Inicios</th>
                  <th className="text-right p-3 font-medium">Completados</th>
                  <th className="text-right p-3 font-medium">Conversión</th>
                  <th className="text-right p-3 font-medium">Abandono</th>
                  <th className="text-left p-3 font-medium">Campo Problemático</th>
                </tr>
              </thead>
              <tbody>
                {analytics.map((form) => (
                  <tr key={form.form_type} className="border-b hover:bg-gray-50">
                    <td className="p-3 font-medium capitalize">{form.form_type.replace('_', ' ')}</td>
                    <td className="p-3 text-right">{form.total_starts.toLocaleString()}</td>
                    <td className="p-3 text-right text-green-600 font-medium">{form.total_completions.toLocaleString()}</td>
                    <td className="p-3 text-right">
                      <Badge variant={form.conversion_rate > 50 ? "default" : form.conversion_rate > 25 ? "secondary" : "destructive"}>
                        {form.conversion_rate.toFixed(1)}%
                      </Badge>
                    </td>
                    <td className="p-3 text-right">
                      <span className={form.abandonment_rate > 70 ? "text-red-600 font-medium" : "text-gray-600"}>
                        {form.abandonment_rate.toFixed(1)}%
                      </span>
                    </td>
                    <td className="p-3 text-left">
                      {form.most_abandoned_field ? (
                        <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
                          {form.most_abandoned_field}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FormAnalyticsTab;
