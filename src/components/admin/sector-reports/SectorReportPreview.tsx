
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { X, Download, Copy, FileText } from 'lucide-react';
import { SectorReportResult } from '@/types/sectorReports';
import { useToast } from '@/hooks/use-toast';
import { downloadSectorReportPDF } from '@/utils/sectorReportPdfGenerator';

interface SectorReportPreviewProps {
  report: SectorReportResult;
  onClose: () => void;
}

const SectorReportPreview: React.FC<SectorReportPreviewProps> = ({ report, onClose }) => {
  const { toast } = useToast();

  const handleCopyContent = () => {
    navigator.clipboard.writeText(report.content);
    toast({
      title: "Contenido copiado",
      description: "El contenido del reporte ha sido copiado al portapapeles",
    });
  };

  const handleDownloadMarkdown = () => {
    const blob = new Blob([report.content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${report.title.replace(/[^a-zA-Z0-9]/g, '_')}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadPDF = async () => {
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
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{report.title}</CardTitle>
            <CardDescription className="mt-1">
              Generado el {report.generatedAt.toLocaleDateString('es-ES')}
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2 mt-3">
          <Badge variant="secondary">{report.sector}</Badge>
          <Badge variant="outline">{report.wordCount.toLocaleString()} palabras</Badge>
        </div>

        <div className="flex items-center gap-2 mt-3">
          <Button variant="outline" size="sm" onClick={handleCopyContent}>
            <Copy className="h-4 w-4 mr-1" />
            Copiar
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownloadMarkdown}>
            <Download className="h-4 w-4 mr-1" />
            MD
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownloadPDF}>
            <FileText className="h-4 w-4 mr-1" />
            PDF
          </Button>
        </div>
      </CardHeader>

      <Separator />

      <CardContent className="pt-4">
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {/* Resumen Ejecutivo */}
          {report.sections.executiveSummary && (
            <div>
              <h4 className="font-medium text-sm text-gray-900 mb-2">Resumen Ejecutivo</h4>
              <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
                {report.sections.executiveSummary.substring(0, 200)}
                {report.sections.executiveSummary.length > 200 && '...'}
              </div>
            </div>
          )}

          <Separator />

          {/* Metadatos */}
          <div>
            <h4 className="font-medium text-sm text-gray-900 mb-2">Configuración</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-gray-50 p-2 rounded">
                <span className="font-medium">Profundidad:</span> {report.metadata.depth}
              </div>
              <div className="bg-gray-50 p-2 rounded">
                <span className="font-medium">Período:</span> {report.metadata.period}
              </div>
            </div>
          </div>

          <Separator />

          {/* Preview del contenido */}
          <div>
            <h4 className="font-medium text-sm text-gray-900 mb-2">Vista Previa</h4>
            <div className="text-xs text-gray-600 bg-gray-50 p-3 rounded-md max-h-48 overflow-y-auto">
              <pre className="whitespace-pre-wrap font-sans">
                {report.content.substring(0, 1000)}...
              </pre>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SectorReportPreview;
