import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Sparkles, FileText, Download, Eye, Trash2, Wand2, LayoutGrid, 
  History, Layout, Palette, Share2, BarChart3, Crown
} from 'lucide-react';
import SectorReportForm from './sector-reports/SectorReportForm';
import SectorReportPreview from './sector-reports/SectorReportPreview';
import ReportWizard from './sector-reports/wizard/ReportWizard';
import ReportsDashboardStats from './sector-reports/dashboard/ReportsDashboardStats';
import QuickTemplates from './sector-reports/dashboard/QuickTemplates';
import RecentActivity from './sector-reports/dashboard/RecentActivity';
import SmartTemplateSelector from './sector-reports/templates/SmartTemplateSelector';
import EnhancedReportPreview from './sector-reports/preview/EnhancedReportPreview';
import AutoVisualizationGenerator from './sector-reports/visualizations/AutoVisualizationGenerator';
import AdvancedExportManager from './sector-reports/export/AdvancedExportManager';
import { useSectorReportGenerator } from '@/hooks/useSectorReportGenerator';
import { SectorReportRequest, SectorReportResult, ExportOptions } from '@/types/sectorReports';
import { downloadSectorReportPDF } from '@/utils/sectorReportPdfGenerator';
import { useToast } from '@/hooks/use-toast';

type ViewMode = 'dashboard' | 'wizard' | 'form' | 'history' | 'templates' | 'visualizations' | 'export';

const SectorReportsGenerator = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('dashboard');
  const [selectedReport, setSelectedReport] = useState<SectorReportResult | null>(null);
  const [initialFormData, setInitialFormData] = useState<Partial<SectorReportRequest> | null>(null);
  const [useEnhancedPreview, setUseEnhancedPreview] = useState(false);
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
    setUseEnhancedPreview(true);
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

  const handleAdvancedExport = async (report: SectorReportResult, options: ExportOptions) => {
    // Aquí implementarías la lógica de exportación avanzada
    console.log('Exporting report with options:', options);
    toast({
      title: "Exportando reporte",
      description: `Preparando exportación en formato ${options.format.toUpperCase()}`,
    });
  };

  const handleSaveReportEdit = (reportId: string, updatedContent: string) => {
    // Aquí implementarías la lógica para guardar cambios en el reporte
    console.log('Saving report edit:', reportId, updatedContent.length);
    toast({
      title: "Cambios guardados",
      description: "El contenido del reporte ha sido actualizado",
    });
  };

  const handleAddComment = (reportId: string, section: string, comment: string) => {
    // Aquí implementarías la lógica para agregar comentarios
    console.log('Adding comment:', reportId, section, comment);
    toast({
      title: "Comentario agregado",
      description: "Tu comentario ha sido añadido al reporte",
    });
  };

  const handleVisualizationsGenerated = (reportId: string, visualizations: any) => {
    // Aquí implementarías la lógica para guardar las visualizaciones generadas
    console.log('Visualizations generated for report:', reportId, visualizations);
    toast({
      title: "Visualizaciones generadas",
      description: "Se han creado gráficos automáticos para tu reporte",
    });
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

            <div className="text-center space-y-4">
              <div className="flex justify-center gap-4">
                <Button
                  onClick={() => setViewMode('wizard')}
                  className="bg-blue-600 hover:bg-blue-700"
                  size="lg"
                >
                  <Wand2 className="h-5 w-5 mr-2" />
                  <span className="button-label">Asistente Guiado</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setViewMode('templates')}
                  size="lg"
                >
                  <Layout className="h-5 w-5 mr-2" />
                  <span className="button-label">Templates IA</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setViewMode('form')}
                  size="lg"
                >
                  <FileText className="h-5 w-5 mr-2" />
                  <span className="button-label">Modo Avanzado</span>
                </Button>
              </div>
              
              <div className="flex justify-center gap-2">
                <Button
                  variant="ghost"
                  onClick={() => setViewMode('visualizations')}
                  size="sm"
                >
                  <BarChart3 className="h-4 w-4 mr-1" />
                  <span className="button-label-sm">Visualizaciones</span>
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setViewMode('export')}
                  size="sm"
                >
                  <Palette className="h-4 w-4 mr-1" />
                  <span className="button-label-sm">Exportación</span>
                </Button>
              </div>
            </div>
          </div>
        );

      case 'templates':
        return (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="card-title flex items-center gap-2">
                    <Layout className="h-5 w-5" />
                    Templates Inteligentes
                  </CardTitle>
                  <CardDescription className="card-description">
                    Plantillas optimizadas con IA para diferentes sectores y audiencias
                  </CardDescription>
                </div>
                <Button variant="ghost" onClick={() => setViewMode('dashboard')}>
                  ← Volver al Dashboard
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <SmartTemplateSelector onSelectTemplate={handleSelectTemplate} />
            </CardContent>
          </Card>
        );

      case 'visualizations':
        return (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="card-title flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Visualizaciones Automáticas
                  </CardTitle>
                  <CardDescription className="card-description">
                    Gráficos e infografías generadas automáticamente por IA
                  </CardDescription>
                </div>
                <Button variant="ghost" onClick={() => setViewMode('dashboard')}>
                  ← Volver al Dashboard
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {selectedReport ? (
                <AutoVisualizationGenerator 
                  report={selectedReport}
                  onVisualizationsGenerated={(viz) => handleVisualizationsGenerated(selectedReport.id, viz)}
                />
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p className="content-text">Selecciona un reporte para generar visualizaciones</p>
                  <Button 
                    variant="outline" 
                    onClick={() => setViewMode('history')} 
                    className="mt-2"
                  >
                    Ver Reportes
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        );

      case 'export':
        return (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="card-title flex items-center gap-2">
                    <Palette className="h-5 w-5" />
                    Exportación Avanzada
                  </CardTitle>
                  <CardDescription className="card-description">
                    Exporta reportes en múltiples formatos con estilos personalizados
                  </CardDescription>
                </div>
                <Button variant="ghost" onClick={() => setViewMode('dashboard')}>
                  ← Volver al Dashboard
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {selectedReport ? (
                <AdvancedExportManager 
                  report={selectedReport}
                  onExport={(options) => handleAdvancedExport(selectedReport, options)}
                />
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Download className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p className="content-text">Selecciona un reporte para configurar la exportación</p>
                  <Button 
                    variant="outline" 
                    onClick={() => setViewMode('history')} 
                    className="mt-2"
                  >
                    Ver Reportes
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        );

      case 'wizard':
        return (
          <ReportWizard
            onGenerate={handleGenerateReport}
            isGenerating={isGenerating}
            onClose={() => setViewMode('dashboard')}
            initialData={initialFormData}
          />
        );

      case 'form':
        return (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="card-title flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Configuración Avanzada
                  </CardTitle>
                  <CardDescription className="card-description">
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
                <h3 className="section-title">Historial de Reportes</h3>
                <p className="section-subtitle">
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
                    <span className="button-label-sm">Limpiar Historial</span>
                  </Button>
                )}
              </div>
            </div>

            {generatedReports.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-gray-500">
                  <FileText className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <h4 className="card-title mb-2">No hay reportes generados</h4>
                  <p className="card-description mb-4">Crea tu primer reporte para verlo aquí</p>
                  <Button onClick={() => setViewMode('dashboard')}>
                    <Sparkles className="h-4 w-4 mr-2" />
                    <span className="button-label">Crear Reporte</span>
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
                          <CardTitle className="report-title truncate mb-2">
                            {report.sector}
                          </CardTitle>
                          <div className="flex flex-wrap gap-1 mb-2">
                            <Badge variant="secondary" className="badge-text">
                              {report.reportType === 'market-analysis' ? 'Mercado' :
                               report.reportType === 'ma-trends' ? 'M&A' :
                               report.reportType === 'valuation-multiples' ? 'Múltiplos' : 
                               report.reportType === 'esg-sustainability' ? 'ESG' :
                               report.reportType === 'tech-disruption' ? 'Tech' :
                               report.reportType === 'geographic-comparison' ? 'Geo' : 'Due Diligence'}
                            </Badge>
                            <Badge variant="outline" className="badge-text">
                              {report.metadata.depth}
                            </Badge>
                            {report.visualizations && (
                              <Badge variant="outline" className="badge-text text-purple-600">
                                <BarChart3 className="h-3 w-3 mr-1" />
                                Viz
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-2 report-meta">
                          <div>📊 {report.wordCount.toLocaleString()} palabras</div>
                          <div>📅 {report.generatedAt.toLocaleDateString('es-ES')}</div>
                          {report.metadata.confidence && (
                            <div>🎯 {Math.round(report.metadata.confidence * 100)}% confianza</div>
                          )}
                          {report.collaboration?.comments.length && (
                            <div>💬 {report.collaboration.comments.length} comentarios</div>
                          )}
                        </div>
                        
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => handlePreviewReport(report)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            <span className="button-label-sm">Ver</span>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => handleDownloadReport(report)}
                          >
                            <Download className="h-4 w-4 mr-1" />
                            <span className="button-label-sm">PDF</span>
                          </Button>
                        </div>
                        
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="flex-1"
                            onClick={() => {
                              setSelectedReport(report);
                              setViewMode('visualizations');
                            }}
                          >
                            <BarChart3 className="h-3 w-3 mr-1" />
                            <span className="help-text">Gráficos</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="flex-1"
                            onClick={() => {
                              setSelectedReport(report);
                              setViewMode('export');
                            }}
                          >
                            <Share2 className="h-3 w-3 mr-1" />
                            <span className="help-text">Exportar</span>
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
        <h1 className="page-title flex items-center gap-2">
          <Sparkles className="h-8 w-8 text-blue-500" />
          Reports Sectoriales IA
          <Badge variant="outline" className="badge-text ml-2">
            <Crown className="h-3 w-3 mr-1" />
            Pro
          </Badge>
        </h1>
        <p className="page-subtitle">
          Sistema avanzado de generación de reportes con IA, visualizaciones automáticas y exportación multi-formato
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-4 border-b border-gray-200 overflow-x-auto">
        <button
          onClick={() => setViewMode('dashboard')}
          className={`pb-3 px-1 nav-item transition-colors whitespace-nowrap ${
            viewMode === 'dashboard'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <LayoutGrid className="h-4 w-4 inline mr-1" />
          Dashboard
        </button>
        <button
          onClick={() => setViewMode('templates')}
          className={`pb-3 px-1 nav-item transition-colors whitespace-nowrap ${
            viewMode === 'templates'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Layout className="h-4 w-4 inline mr-1" />
          Templates IA
        </button>
        <button
          onClick={() => setViewMode('visualizations')}
          className={`pb-3 px-1 nav-item transition-colors whitespace-nowrap ${
            viewMode === 'visualizations'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <BarChart3 className="h-4 w-4 inline mr-1" />
          Visualizaciones
        </button>
        <button
          onClick={() => setViewMode('export')}
          className={`pb-3 px-1 nav-item transition-colors whitespace-nowrap ${
            viewMode === 'export'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Palette className="h-4 w-4 inline mr-1" />
          Export Pro
        </button>
        <button
          onClick={() => setViewMode('history')}
          className={`pb-3 px-1 nav-item transition-colors whitespace-nowrap ${
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
              {useEnhancedPreview ? (
                <EnhancedReportPreview
                  report={selectedReport}
                  onClose={() => {
                    setSelectedReport(null);
                    setUseEnhancedPreview(false);
                  }}
                  onSave={(content) => handleSaveReportEdit(selectedReport.id, content)}
                  onAddComment={(section, comment) => handleAddComment(selectedReport.id, section, comment)}
                />
              ) : (
                <SectorReportPreview
                  report={selectedReport}
                  onClose={() => setSelectedReport(null)}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SectorReportsGenerator;
