
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SectorReportRequest } from '@/types/sectorReports';
import { CheckCircle, FileText, Calendar, Users, Database, Target } from 'lucide-react';

interface WizardStep4PreviewProps {
  data: SectorReportRequest;
}

const WizardStep4Preview: React.FC<WizardStep4PreviewProps> = ({ data }) => {
  const getReportTypeLabel = (type: string) => {
    const labels = {
      'market-analysis': 'Análisis de Mercado',
      'ma-trends': 'Tendencias M&A',
      'valuation-multiples': 'Múltiplos de Valoración',
      'due-diligence': 'Due Diligence Sectorial'
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getPeriodLabel = (period: string) => {
    const labels = {
      'quarter': 'Último Trimestre',
      'year': 'Último Año',
      '3-years': 'Últimos 3 Años',
      'custom': 'Período Personalizado'
    };
    return labels[period as keyof typeof labels] || period;
  };

  const getAudienceLabel = (audience: string) => {
    const labels = {
      'investors': 'Inversores',
      'entrepreneurs': 'Empresarios',
      'advisors': 'Asesores',
      'executives': 'Directivos'
    };
    return labels[audience as keyof typeof labels] || audience;
  };

  const getDepthLabel = (depth: string) => {
    const labels = {
      'basic': 'Básico (1,500-2,000 palabras)',
      'intermediate': 'Intermedio (3,000-4,000 palabras)',
      'advanced': 'Avanzado (5,000-6,000 palabras)'
    };
    return labels[depth as keyof typeof labels] || depth;
  };

  const enabledDataSources = Object.entries(data.includeData || {})
    .filter(([_, enabled]) => enabled)
    .map(([key, _]) => {
      const labels = {
        multiples: 'Múltiplos de Valoración',
        caseStudies: 'Casos de Éxito',
        statistics: 'Estadísticas de Mercado'
      };
      return labels[key as keyof typeof labels] || key;
    });

  return (
    <div className="space-y-6">
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center gap-2 text-green-700 mb-2">
          <CheckCircle className="h-5 w-5" />
          <span className="font-medium">Configuración Lista</span>
        </div>
        <p className="text-sm text-green-600">
          Tu reporte está configurado y listo para generar. Revisa los detalles a continuación.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Información Básica
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label className="text-sm font-medium text-gray-600">Sector:</Label>
              <p className="font-medium">{data.sector}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-600">Tipo de Reporte:</Label>
              <Badge variant="secondary">{getReportTypeLabel(data.reportType)}</Badge>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-600">Profundidad:</Label>
              <p className="text-sm">{getDepthLabel(data.depth)}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Configuración Temporal
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label className="text-sm font-medium text-gray-600">Período:</Label>
              <p className="font-medium">{getPeriodLabel(data.period)}</p>
            </div>
            {data.period === 'custom' && data.customStartDate && data.customEndDate && (
              <div>
                <Label className="text-sm font-medium text-gray-600">Fechas:</Label>
                <p className="text-sm">
                  {new Date(data.customStartDate).toLocaleDateString('es-ES')} - 
                  {new Date(data.customEndDate).toLocaleDateString('es-ES')}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5" />
              Audiencia
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label className="text-sm font-medium text-gray-600">Dirigido a:</Label>
              <Badge variant="outline">{getAudienceLabel(data.targetAudience)}</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Database className="h-5 w-5" />
              Fuentes de Datos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {enabledDataSources.length > 0 ? (
                enabledDataSources.map((source) => (
                  <div key={source} className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">{source}</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">No se incluirán fuentes de datos adicionales</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {data.customFocus && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="h-5 w-5" />
              Enfoque Específico
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm">{data.customFocus}</p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">🎯 Lo que incluirá tu reporte:</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Resumen ejecutivo del sector {data.sector}</li>
          <li>• Análisis detallado según el tipo "{getReportTypeLabel(data.reportType)}"</li>
          <li>• Insights adaptados para {getAudienceLabel(data.targetAudience).toLowerCase()}</li>
          {enabledDataSources.length > 0 && (
            <li>• Datos específicos: {enabledDataSources.join(', ')}</li>
          )}
          {data.customFocus && (
            <li>• Enfoque especial en: {data.customFocus}</li>
          )}
          <li>• Conclusiones y recomendaciones accionables</li>
        </ul>
      </div>
    </div>
  );
};

export default WizardStep4Preview;
