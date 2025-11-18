import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, ExternalLink, Loader2 } from 'lucide-react';
import { OperationDocument, isPreviewable } from '../../types/documents';

interface DocumentViewerProps {
  document: OperationDocument | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDownload: (documentId: string) => void;
  getPreviewUrl: (documentId: string) => Promise<string | null>;
}

export const DocumentViewer: React.FC<DocumentViewerProps> = ({
  document,
  open,
  onOpenChange,
  onDownload,
  getPreviewUrl,
}) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!document || !open) {
      setPreviewUrl(null);
      setError(null);
      return;
    }

    const loadPreview = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const url = await getPreviewUrl(document.id);
        if (url) {
          setPreviewUrl(url);
        } else {
          setError('No se pudo cargar la vista previa');
        }
      } catch (err) {
        setError('Error al cargar la vista previa');
      } finally {
        setIsLoading(false);
      }
    };

    loadPreview();
  }, [document, open, getPreviewUrl]);

  if (!document) return null;

  const canPreview = isPreviewable(document.file_type);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex-1 truncate pr-4">{document.title}</DialogTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDownload(document.id)}
              >
                <Download className="h-4 w-4 mr-2" />
                Descargar
              </Button>
              {previewUrl && (
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                >
                  <a href={previewUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Abrir en nueva pestaña
                  </a>
                </Button>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center space-y-4">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                <p className="text-sm text-muted-foreground">Cargando vista previa...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center space-y-4">
                <p className="text-sm text-muted-foreground">{error}</p>
                <Button
                  variant="outline"
                  onClick={() => onDownload(document.id)}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Descargar documento
                </Button>
              </div>
            </div>
          ) : !canPreview ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center space-y-4">
                <p className="text-sm text-muted-foreground">
                  Vista previa no disponible para este tipo de archivo
                </p>
                <Button
                  variant="outline"
                  onClick={() => onDownload(document.id)}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Descargar para ver
                </Button>
              </div>
            </div>
          ) : previewUrl ? (
            <div className="h-full w-full">
              {document.file_type === 'application/pdf' ? (
                <iframe
                  src={previewUrl}
                  className="w-full h-full border-0 rounded-lg"
                  title={document.title}
                />
              ) : document.file_type.startsWith('image/') ? (
                <div className="h-full flex items-center justify-center bg-muted rounded-lg">
                  <img
                    src={previewUrl}
                    alt={document.title}
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
              ) : document.file_type === 'text/plain' ? (
                <iframe
                  src={previewUrl}
                  className="w-full h-full border-0 rounded-lg bg-background"
                  title={document.title}
                />
              ) : null}
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
};
