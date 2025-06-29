
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ContentPerformance } from '@/types/marketingHub';
import { FileText, Download, Target, Eye, TrendingUp } from 'lucide-react';

interface ContentPerformanceTabProps {
  contentPerformance?: ContentPerformance[];
}

const ContentPerformanceTab = ({ contentPerformance }: ContentPerformanceTabProps) => {
  if (!contentPerformance) {
    return <div>Cargando datos de contenido...</div>;
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'blog': return '📝';
      case 'lead_magnet': return '🧲';
      case 'case_study': return '📋';
      case 'whitepaper': return '📄';
      default: return '📄';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'blog': return 'bg-blue-100 text-blue-800';
      case 'lead_magnet': return 'bg-green-100 text-green-800';
      case 'case_study': return 'bg-purple-100 text-purple-800';
      case 'whitepaper': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Agrupar métricas por tipo
  const metricsByType = contentPerformance.reduce((acc, content) => {
    if (!acc[content.type]) {
      acc[content.type] = {
        count: 0,
        totalViews: 0,
        totalDownloads: 0,
        totalLeads: 0
      };
    }
    acc[content.type].count++;
    acc[content.type].totalViews += content.views;
    acc[content.type].totalDownloads += content.downloads;
    acc[content.type].totalLeads += content.leads_generated;
    return acc;
  }, {} as Record<string, any>);

  return (
    <div className="space-y-6">
      {/* Resumen por tipo de contenido */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(metricsByType).map(([type, metrics]) => (
          <Card key={type}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <span>{getTypeIcon(type)}</span>
                {type.replace('_', ' ').toUpperCase()}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Contenidos:</span>
                  <span className="font-semibold">{metrics.count}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Vistas:</span>
                  <span className="font-semibold">{metrics.totalViews.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Leads:</span>
                  <span className="font-semibold text-green-600">{metrics.totalLeads}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Top Performing Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            Top Performing Content
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {contentPerformance.slice(0, 10).map((content, index) => (
              <div key={content.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex items-center gap-4 flex-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="w-8 h-8 rounded-full p-0 flex items-center justify-center text-xs">
                      {index + 1}
                    </Badge>
                    <span className="text-2xl">{getTypeIcon(content.type)}</span>
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm mb-1">{content.title}</h3>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <Badge className={getTypeColor(content.type)}>
                        {content.type.replace('_', ' ')}
                      </Badge>
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {content.views.toLocaleString()} vistas
                      </span>
                      {content.downloads > 0 && (
                        <span className="flex items-center gap-1">
                          <Download className="h-3 w-3" />
                          {content.downloads} descargas
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="flex items-center gap-2 mb-1">
                    <Target className="h-4 w-4 text-green-600" />
                    <span className="font-bold text-green-600">
                      {content.leads_generated} leads
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">
                    {content.conversion_rate.toFixed(1)}% conversión
                  </div>
                  <div className="mt-1">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full" 
                        style={{ width: `${Math.min(content.engagement_score, 100)}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-center mt-1">
                      {content.engagement_score}/100 engagement
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Insights y Recomendaciones */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>🎯 Content Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-3 bg-green-50 border-l-4 border-green-400">
                <p className="text-sm text-green-800">
                  <strong>Top Performer:</strong> Los lead magnets generan el {
                    metricsByType.lead_magnet ? 
                    ((metricsByType.lead_magnet.totalLeads / contentPerformance.reduce((sum, c) => sum + c.leads_generated, 0)) * 100).toFixed(0) 
                    : 0
                  }% de todos los leads.
                </p>
              </div>
              
              <div className="p-3 bg-blue-50 border-l-4 border-blue-400">
                <p className="text-sm text-blue-800">
                  <strong>Oportunidad:</strong> Los blogs tienen alto tráfico pero baja conversión. 
                  Considera añadir más CTAs y lead magnets relacionados.
                </p>
              </div>
              
              <div className="p-3 bg-orange-50 border-l-4 border-orange-400">
                <p className="text-sm text-orange-800">
                  <strong>Recomendación:</strong> Crea más contenido del tipo que mejor convierte 
                  en tu sector específico.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>📊 Content Metrics Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Total Content Pieces:</span>
                <span className="font-bold">{contentPerformance.length}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Total Views:</span>
                <span className="font-bold">
                  {contentPerformance.reduce((sum, c) => sum + c.views, 0).toLocaleString()}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Total Downloads:</span>
                <span className="font-bold text-blue-600">
                  {contentPerformance.reduce((sum, c) => sum + c.downloads, 0).toLocaleString()}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Total Leads Generated:</span>
                <span className="font-bold text-green-600">
                  {contentPerformance.reduce((sum, c) => sum + c.leads_generated, 0)}
                </span>
              </div>
              
              <div className="pt-4 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Avg. Conversion Rate:</span>
                  <span className="font-bold text-orange-600">
                    {(contentPerformance.reduce((sum, c) => sum + c.conversion_rate, 0) / contentPerformance.length).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ContentPerformanceTab;
