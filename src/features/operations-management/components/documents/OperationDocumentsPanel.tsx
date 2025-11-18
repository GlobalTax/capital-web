import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Upload, FileText, AlertCircle } from 'lucide-react';
import { useOperationDocuments } from '../../hooks/useOperationDocuments';
import { DocumentUploadDialog } from './DocumentUploadDialog';
import { DocumentsGallery } from './DocumentsGallery';
import { DocumentViewer } from './DocumentViewer';
import { OperationDocument } from '../../types/documents';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface OperationDocumentsPanelProps {
  operationId: string;
}

export const OperationDocumentsPanel: React.FC<OperationDocumentsPanelProps> = ({
  operationId,
}) => {
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [viewerDocument, setViewerDocument] = useState<OperationDocument | null>(null);
  const [viewerOpen, setViewerOpen] = useState(false);

  const {
    documents,
    isLoading,
    error,
    uploadDocument,
    downloadDocument,
    updateDocument,
    deleteDocument,
    isUploading,
    isDownloading,
    getPreviewUrl,
  } = useOperationDocuments(operationId);

  const handlePreview = (documentId: string) => {
    const doc = documents.find(d => d.id === documentId);
    if (doc) {
      setViewerDocument(doc);
      setViewerOpen(true);
    }
  };

  const handleEdit = (documentId: string) => {
    // TODO: Implement edit dialog
    console.log('Edit document:', documentId);
  };

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Documentos</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Error al cargar documentos: {error.message}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-64" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Documentos
                {documents.length > 0 && (
                  <span className="text-sm font-normal text-muted-foreground">
                    ({documents.length})
                  </span>
                )}
              </CardTitle>
              <CardDescription>
                Gestiona todos los documentos relacionados con esta operación
              </CardDescription>
            </div>
            <Button onClick={() => setUploadDialogOpen(true)}>
              <Upload className="h-4 w-4 mr-2" />
              Subir Documento
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {documents.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">No hay documentos</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Sube el primer documento para esta operación
              </p>
              <Button onClick={() => setUploadDialogOpen(true)}>
                <Upload className="h-4 w-4 mr-2" />
                Subir Documento
              </Button>
            </div>
          ) : (
            <DocumentsGallery
              documents={documents}
              onDownload={downloadDocument}
              onPreview={handlePreview}
              onEdit={handleEdit}
              onDelete={deleteDocument}
              isDownloading={isDownloading}
            />
          )}
        </CardContent>
      </Card>

      <DocumentUploadDialog
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
        operationId={operationId}
        onUpload={(file, metadata) => {
          uploadDocument({ file, metadata });
          setUploadDialogOpen(false);
        }}
        isUploading={isUploading}
      />

      <DocumentViewer
        document={viewerDocument}
        open={viewerOpen}
        onOpenChange={setViewerOpen}
        onDownload={downloadDocument}
        getPreviewUrl={getPreviewUrl}
      />
    </>
  );
};
