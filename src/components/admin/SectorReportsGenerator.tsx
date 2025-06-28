
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, FileText, Download, Eye, Trash2 } from 'lucide-react';
import SectorReportForm from './sector-reports/SectorReportForm';
import SectorReportPreview from './sector-reports/SectorReportPreview';
import { useSectorReportGenerator } from '@/hooks/useSectorReportGenerator';
import { SectorReportRequest, SectorReportResult } from '@/types/sectorReports';
import { downloadSectorReportPDF } from '@/utils/sectorReportPdfGenerator';
import { useToast } from '@/hooks/use-toast';

const SectorReportsGenerator = () => {
  const [activeTab, setActiveTab] = useState<'generate' | 'history'>('generate');
  const [selectedReport, setSelectedReport] = useState<SectorReportResult | null>(null);
  const { isGenerating, generatedReports, generateSectorReport, clearReports } = useSectorReportGenerator();
  const { toast } = useToast();

  const handleGenerateReport = async (request: SectorReportRequest) => {
    try {
      const result = await generateSectorReport(request);
      setSelectedReport(result);
      setActiveTab('history');
    } catch (error) {
      console.error('Error generating report:', error);
    }
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-6">
        <h1 className="text-3xl font-light text-gray-900 mb-2 flex items-center gap-2">
          <Sparkles className="h-8 w-8 text-blue-500" />
          Reports Sectoriales IA
        </h1>
        <p className="text-gray-600 font-light">
          Genera reports profesionales específicos por sector usando IA avanzada
        </p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-4 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('generate')}
          className={`pb-3 px-1 font-medium text-sm transition-colors ${
            activeTab === 'generate'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Generar Reporte
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`pb-3 px-1 font-medium text-sm transition-colors ${
            activeTab === 'history'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Historial ({generatedReports.length})
        </button>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {activeTab === 'generate' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Configurar Reporte
                </CardTitle>
                <CardDescription>
                  Completa el formulario para generar un reporte sectorial personalizado
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SectorReportForm
                  onGenerate={handleGenerateReport}
                  isGenerating={isGenerating}
                />
              </CardContent>
            </Card>
          )}

          {activeTab === 'history' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Reportes Generados</h3>
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

              {generatedReports.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center text-gray-500">
                    <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No hay reportes generados aún</p>
                    <p className="text-sm">Genera tu primer reporte usando el formulario</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {generatedReports.map((report) => (
                    <Card key={report.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 mb-1">
                              {report.title}
                            </h4>
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="secondary">{report.sector}</Badge>
                              <Badge variant="outline">
                                {report.wordCount.toLocaleString()} palabras
                              </Badge>
                              <Badge variant="outline">
                                {report.metadata.depth}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-500">
                              Generado el {report.generatedAt.toLocaleDateString('es-ES')}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handlePreviewReport(report)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              Ver
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
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
          )}
        </div>

        {/* Sidebar Preview */}
        <div className="lg:col-span-1">
          {selectedReport && (
            <SectorReportPreview
              report={selectedReport}
              onClose={() => setSelectedReport(null)}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default SectorReportsGenerator;
