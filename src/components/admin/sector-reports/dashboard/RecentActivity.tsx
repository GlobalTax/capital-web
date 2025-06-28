
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Download, Clock } from 'lucide-react';
import { SectorReportResult } from '@/types/sectorReports';

interface RecentActivityProps {
  reports: SectorReportResult[];
  onViewReport: (report: SectorReportResult) => void;
  onDownloadReport: (report: SectorReportResult) => void;
}

const RecentActivity: React.FC<RecentActivityProps> = ({ 
  reports, 
  onViewReport, 
  onDownloadReport 
}) => {
  const recentReports = reports
    .sort((a, b) => b.generatedAt.getTime() - a.generatedAt.getTime())
    .slice(0, 5);

  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      return `hace ${diffInMinutes}m`;
    } else if (diffInHours < 24) {
      return `hace ${diffInHours}h`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `hace ${diffInDays}d`;
    }
  };

  const getReportTypeLabel = (type: string) => {
    const labels = {
      'market-analysis': 'Análisis de Mercado',
      'ma-trends': 'Tendencias M&A',
      'valuation-multiples': 'Múltiplos',
      'due-diligence': 'Due Diligence'
    };
    return labels[type as keyof typeof labels] || type;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Actividad Reciente
        </CardTitle>
        <CardDescription>
          Tus últimos reportes generados
        </CardDescription>
      </CardHeader>
      <CardContent>
        {recentReports.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No hay reportes recientes</p>
            <p className="text-sm">Genera tu primer reporte para ver la actividad aquí</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentReports.map((report) => (
              <div
                key={report.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-sm truncate max-w-48">
                      {report.sector}
                    </h4>
                    <Badge variant="secondary" className="text-xs">
                      {getReportTypeLabel(report.reportType)}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>{report.wordCount.toLocaleString()} palabras</span>
                    <span>•</span>
                    <span>{getTimeAgo(report.generatedAt)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onViewReport(report)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDownloadReport(report)}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentActivity;
