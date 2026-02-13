import { useState, useCallback } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ProfessionalValuationData } from '@/types/professionalValuation';
import { RefreshCw, Download, Loader2 } from 'lucide-react';

interface PdfPreviewPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: ProfessionalValuationData;
}

export function PdfPreviewPanel({ open, onOpenChange, data }: PdfPreviewPanelProps) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [isRendering, setIsRendering] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generatePreview = useCallback(async () => {
    setIsRendering(true);
    setError(null);
    try {
      // Dynamic import to avoid loading @react-pdf/renderer eagerly
      const [{ pdf }, pdfModule] = await Promise.all([
        import('@react-pdf/renderer'),
        import('@/components/pdf/ProfessionalValuationPDF'),
      ]);
      const ProfessionalValuationPDF = pdfModule.default;

      const blob = await pdf(<ProfessionalValuationPDF data={data} />).toBlob();
      
      // Revoke previous URL
      if (blobUrl) URL.revokeObjectURL(blobUrl);
      
      const url = URL.createObjectURL(blob);
      setBlobUrl(url);
    } catch (err) {
      console.error('[PdfPreviewPanel] Error generating PDF:', err);
      setError('Error al generar el PDF. Inténtalo de nuevo.');
    } finally {
      setIsRendering(false);
    }
  }, [data, blobUrl]);

  const handleOpenChange = useCallback((newOpen: boolean) => {
    if (newOpen) {
      generatePreview();
    } else {
      // Clean up blob URL when closing
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
        setBlobUrl(null);
      }
    }
    onOpenChange(newOpen);
  }, [onOpenChange, generatePreview, blobUrl]);

  const handleDownload = () => {
    if (!blobUrl) return;
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = `Valoracion_${data.clientCompany || 'empresa'}.pdf`;
    a.click();
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-[50vw] p-0 flex flex-col">
        <SheetHeader className="p-6 pb-0">
          <SheetTitle>Vista previa PDF</SheetTitle>
          <SheetDescription>
            {data.clientCompany || 'Valoración'}
          </SheetDescription>
        </SheetHeader>

        <div className="flex items-center gap-2 px-6 py-3 border-b">
          <Button
            variant="outline"
            size="sm"
            onClick={generatePreview}
            disabled={isRendering}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRendering ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            disabled={!blobUrl || isRendering}
          >
            <Download className="w-4 h-4 mr-2" />
            Descargar
          </Button>
        </div>

        <div className="flex-1 min-h-0">
          {isRendering && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center space-y-3">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
                <p className="text-sm text-muted-foreground">Generando PDF...</p>
              </div>
            </div>
          )}
          {error && !isRendering && (
            <div className="flex items-center justify-center h-full">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}
          {blobUrl && !isRendering && (
            <iframe
              src={blobUrl}
              className="w-full h-full border-0"
              title="Vista previa PDF"
            />
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}