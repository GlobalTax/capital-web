
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, TrendingUp, Clock, Target } from 'lucide-react';
import { SectorReportResult } from '@/types/sectorReports';

interface ReportsDashboardStatsProps {
  reports: SectorReportResult[];
}

const ReportsDashboardStats: React.FC<ReportsDashboardStatsProps> = ({ reports }) => {
  const today = new Date();
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const todayReports = reports.filter(r => 
    r.generatedAt.toDateString() === today.toDateString()
  ).length;

  const weekReports = reports.filter(r => 
    r.generatedAt >= weekAgo
  ).length;

  const totalWords = reports.reduce((sum, r) => sum + r.wordCount, 0);

  const topSector = reports.reduce((acc, report) => {
    acc[report.sector] = (acc[report.sector] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const mostPopularSector = Object.entries(topSector)
    .sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A';

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Hoy</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{todayReports}</div>
          <p className="text-xs text-muted-foreground">reportes generados</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Esta Semana</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{weekReports}</div>
          <p className="text-xs text-muted-foreground">reportes esta semana</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Palabras</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalWords.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">palabras generadas</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Sector Popular</CardTitle>
          <Target className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-lg font-bold truncate">{mostPopularSector}</div>
          <p className="text-xs text-muted-foreground">más analizado</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportsDashboardStats;
