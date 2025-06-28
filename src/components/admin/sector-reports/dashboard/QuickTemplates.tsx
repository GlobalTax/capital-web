
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, TrendingUp, BarChart3, FileSearch, Leaf } from 'lucide-react';
import { SectorReportRequest } from '@/types/sectorReports';

interface QuickTemplatesProps {
  onSelectTemplate: (template: Partial<SectorReportRequest>) => void;
}

const QuickTemplates: React.FC<QuickTemplatesProps> = ({ onSelectTemplate }) => {
  const templates = [
    {
      id: 'quick-analysis',
      title: 'Análisis Rápido',
      description: 'Análisis de mercado básico para presentaciones',
      icon: TrendingUp,
      color: 'bg-blue-500',
      config: {
        reportType: 'market-analysis' as const,
        depth: 'basic' as const,
        period: 'year' as const,
        targetAudience: 'executives' as const,
        includeData: { 
          multiples: true, 
          caseStudies: false, 
          statistics: true, 
          visualizations: false, 
          infographics: false, 
          heatmaps: false 
        }
      }
    },
    {
      id: 'investor-deep',
      title: 'Análisis para Inversores',
      description: 'Reporte completo con múltiplos y casos de éxito',
      icon: BarChart3,
      color: 'bg-green-500',
      config: {
        reportType: 'valuation-multiples' as const,
        depth: 'advanced' as const,
        period: '3-years' as const,
        targetAudience: 'investors' as const,
        includeData: { 
          multiples: true, 
          caseStudies: true, 
          statistics: true, 
          visualizations: true, 
          infographics: false, 
          heatmaps: false 
        }
      }
    },
    {
      id: 'ma-trends',
      title: 'Tendencias M&A',
      description: 'Análisis de fusiones y adquisiciones sectoriales',
      icon: FileSearch,
      color: 'bg-purple-500',
      config: {
        reportType: 'ma-trends' as const,
        depth: 'intermediate' as const,
        period: 'year' as const,
        targetAudience: 'advisors' as const,
        includeData: { 
          multiples: false, 
          caseStudies: true, 
          statistics: true, 
          visualizations: true, 
          infographics: false, 
          heatmaps: true 
        }
      }
    },
    {
      id: 'esg-analysis',
      title: 'Análisis ESG',
      description: 'Sostenibilidad y gobierno corporativo',
      icon: Leaf,
      color: 'bg-emerald-500',
      config: {
        reportType: 'market-analysis' as const,
        depth: 'intermediate' as const,
        period: 'year' as const,
        targetAudience: 'investors' as const,
        customFocus: 'Enfoque especial en criterios ESG, sostenibilidad ambiental, gobierno corporativo y responsabilidad social',
        includeData: { 
          multiples: false, 
          caseStudies: true, 
          statistics: true, 
          visualizations: false, 
          infographics: true, 
          heatmaps: false 
        }
      }
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          Templates Rápidos
        </CardTitle>
        <CardDescription>
          Genera reportes instantáneamente con configuraciones predefinidas
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {templates.map((template) => (
            <div
              key={template.id}
              className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => onSelectTemplate(template.config)}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${template.color}`}>
                  <template.icon className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium mb-1">{template.title}</h4>
                  <p className="text-sm text-gray-600 mb-2">{template.description}</p>
                  <div className="flex gap-1">
                    <Badge variant="outline" className="text-xs">
                      {template.config.depth}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {template.config.targetAudience}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickTemplates;
