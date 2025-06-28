
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, FileText, Download, Eye, Trash2, Wand2, LayoutGrid, History } from 'lucide-react';
import SectorReportForm from './sector-reports/SectorReportForm';
import SectorReportPreview from './sector-reports/SectorReportPreview';
import ReportWizard from './sector-reports/wizard/ReportWizard';
import ReportsDashboardStats from './sector-reports/dashboard/ReportsDashboardStats';
import QuickTemplates from './sector-reports/dashboard/QuickTemplates';
import RecentActivity from './sector-reports/dashboard/RecentActivity';
import { useSectorReportGenerator } from '@/hooks/useSectorReportGenerator';
import { SectorReportRequest, SectorReportResult } from '@/types/sectorReports';
import { downloadSectorReportPDF } from '@/utils/sectorReportPdfGenerator';
import { useToast } from '@/hooks/use-toast';

type ViewMode = 'dashboard' | 'wizard' | 'form' | 'history';

const SectorReportsGenerator = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('dashboard');
  const [selectedReport, setSelectedReport] = useState<SectorReportResult | null>(null);
  const [initialFormData, setInitialFormData] = useState<Partial<SectorReportRequest> | null>(null);
  const { isGenerating, generatedReports, generateSectorReport, clearReports } = useSectorReportGenerator();
  const { toast } = useToast();

  const handleGenerateReport = async (request: SectorReportRequest) => {
    try {
      const result = await generateSectorReport(request);
      setSelectedReport(result);
      setViewMode('history');
    } catch (error) {
      console.error('Error generating report:', error);
    }
  };

  const handleSelectTemplate = (template: Partial<SectorReportRequest>) => {
    setInitialFormData(template);
    setViewMode('wizard');
  };

  const handlePreviewReport = (report: SectorReportResult) => {
    setSelectedReport(report);
  };

  const handleDownloadReport = async (report: SectorReportResult) => {
    try {
      await downloadSectorReportPDF(report);
      toast({
        title: "PDF descargado",
        description: "El reporte ha sido descargado como PDF",
      });
    } catch (error) {
      toast({
        title: "Error al descargar PDF",
        description: "No se pudo generar el PDF. Inténtalo de nuevo.",
        variant: "destructive",
      });
    }
  };

  const renderContent = () => {
    switch (viewMode) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            <ReportsDashboardStats reports={generatedReports} />
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <QuickTemplates onSelectTemplate={handleSelectTemplate} />
              <RecentActivity 
                reports={generatedReports}
                onViewReport={handlePreviewReport}
                onDownloadReport={handleDownloadReport}
              />
            </div>

            <div className="flex justify-center gap-4">
              <Button
                onClick={() => setViewMode('wizard')}
                className="bg-blue-600 hover:bg-blue-700"
                size="lg"
              >
                <Wand2 className="h-5 w-5 mr-2" />
                Asistente Guiado
              </Button>
              <Button
                variant="outline"
                onClick={() => setViewMode('form')}
                size="lg"
              >
                <FileText className="h-5 w-5 mr-2" />
                Modo Avanzado
              </Button>
            </div>
          </div>
        );

      case 'wizard':
        return (
          <ReportWizard
            onGenerate={handleGenerateReport}
            isGenerating={isGenerating}
            onClose={() => setViewMode('dashboard')}
          />
        );

      case 'form':
        return (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Configuración Avanzada
                  </CardTitle>
                  <CardDescription>
                    Control total sobre todos los parámetros del reporte
                  </CardDescription>
                </div>
                <Button variant="ghost" onClick={() => setViewMode('dashboard')}>
                  ← Volver al Dashboard
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <SectorReportForm
                onGenerate={handleGenerateReport}
                isGenerating={isGenerating}
              />
            </CardContent>
          </Card>
        );

      case 'history':
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-medium">Historial de Reportes</h3>
                <p className="text-sm text-gray-600">
                  {generatedReports.length} reportes generados
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setViewMode('dashboard')}
                >
                  ← Dashboard
                </Button>
                {generatedReports.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearReports}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Limpiar Historial
                  </Button>
                )}
              </div>
            </div>

            {generatedReports.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-gray-500">
                  <FileText className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <h4 className="text-lg font-medium mb-2">No hay reportes generados</h4>
                  <p className="text-sm mb-4">Crea tu primer reporte para verlo aquí</p>
                  <Button onClick={() => setViewMode('dashboard')}>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Crear Reporte
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {generatedReports.map((report) => (
                  <Card key={report.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-base truncate mb-2">
                            {report.sector}
                          </CardTitle>
                          <div className="flex flex-wrap gap-1 mb-2">
                            <Badge variant="secondary" className="text-xs">
                              {report.reportType === 'market-analysis' ? 'Mercado' :
                               report.reportType === 'ma-trends' ? 'M&A' :
                               report.reportType === 'valuation-multiples' ? 'Múltiplos' : 'Due Diligence'}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {report.metadata.depth}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                          <div>📊 {report.wordCount.toLocaleString()} palabras</div>
                          <div>📅 {report.generatedAt.toLocaleDateString('es-ES')}</div>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => handlePreviewReport(report)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Ver
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => handleDownloadReport(report)}
                          >
                            <Download className="h-4 w-4 mr-1" />
                            PDF
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-6">
        <h1 className="text-3xl font-light text-gray-900 mb-2 flex items-center gap-2">
          <Sparkles className="h-8 w-8 text-blue-500" />
          Reports Sectoriales IA
        </h1>
        <p className="text-gray-600 font-light">
          Genera reportes profesionales específicos por sector usando IA avanzada
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-4 border-b border-gray-200">
        <button
          onClick={() => setViewMode('dashboard')}
          className={`pb-3 px-1 font-medium text-sm transition-colors ${
            viewMode === 'dashboard'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <LayoutGrid className="h-4 w-4 inline mr-1" />
          Dashboard
        </button>
        <button
          onClick={() => setViewMode('history')}
          className={`pb-3 px-1 font-medium text-sm transition-colors ${
            viewMode === 'history'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <History className="h-4 w-4 inline mr-1" />
          Historial ({generatedReports.length})
        </button>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Main Content */}
        <div className="xl:col-span-3">
          {renderContent()}
        </div>

        {/* Sidebar Preview */}
        <div className="xl:col-span-1">
          {selectedReport && (
            <div className="sticky top-6">
              <SectorReportPreview
                report={selectedReport}
                onClose={() => setSelectedReport(null)}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SectorReportsGenerator;
