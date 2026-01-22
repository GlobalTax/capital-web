import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, Trash2, ExternalLink, Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useMandateTeasers, TeaserLanguage } from '@/hooks/useMandateTeasers';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface TeaserData {
  url: string | null;
  filename: string | null;
  uploadedAt: string | null;
}

interface MandateTeaserUploadProps {
  mandateId: string;
  teaserEs: TeaserData;
  teaserEn: TeaserData;
  onTeaserUpdated?: () => void;
}

interface SingleTeaserUploadProps {
  mandateId: string;
  language: TeaserLanguage;
  label: string;
  teaser: TeaserData;
  isUploading: boolean;
  isDeleting: boolean;
  onUpload: (file: File) => void;
  onDelete: () => void;
}

const SingleTeaserUpload: React.FC<SingleTeaserUploadProps> = ({
  language,
  label,
  teaser,
  isUploading,
  isDeleting,
  onUpload,
  onDelete,
}) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onUpload(acceptedFiles[0]);
    }
  }, [onUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
    disabled: isUploading || isDeleting,
  });

  const hasTeaser = !!teaser.url;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{label}</span>
        {hasTeaser && (
          <span className="inline-flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
            <CheckCircle2 className="h-3 w-3" />
            Subido
          </span>
        )}
      </div>

      {hasTeaser ? (
        <div className="flex items-center gap-3 p-3 bg-muted rounded-lg border">
          <FileText className="h-8 w-8 text-red-500 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{teaser.filename || 'teaser.pdf'}</p>
            {teaser.uploadedAt && (
              <p className="text-xs text-muted-foreground">
                {format(new Date(teaser.uploadedAt), "d MMM yyyy, HH:mm", { locale: es })}
              </p>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => window.open(teaser.url!, '_blank')}
              title="Ver teaser"
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  disabled={isDeleting}
                  title="Eliminar teaser"
                >
                  {isDeleting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4 text-destructive" />
                  )}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Eliminar teaser {language.toUpperCase()}?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta acción eliminará el archivo del servidor. No se puede deshacer.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={onDelete}>Eliminar</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      ) : (
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors
            ${isDragActive 
              ? 'border-primary bg-primary/5' 
              : 'border-border hover:border-primary/50'
            }
            ${(isUploading || isDeleting) ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          <input {...getInputProps()} />
          {isUploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Subiendo...</p>
            </div>
          ) : (
            <>
              <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                {isDragActive 
                  ? 'Suelta el archivo aquí...' 
                  : 'Arrastra un PDF o haz clic'
                }
              </p>
            </>
          )}
        </div>
      )}

      {/* Replace option when teaser exists */}
      {hasTeaser && !isUploading && (
        <div
          {...getRootProps()}
          className="text-center"
        >
          <input {...getInputProps()} />
          <Button variant="link" size="sm" className="text-xs text-muted-foreground">
            Reemplazar archivo
          </Button>
        </div>
      )}
    </div>
  );
};

export const MandateTeaserUpload: React.FC<MandateTeaserUploadProps> = ({
  mandateId,
  teaserEs,
  teaserEn,
  onTeaserUpdated,
}) => {
  const { 
    uploadTeaser, 
    deleteTeaser, 
    isUploading, 
    isDeleting 
  } = useMandateTeasers(mandateId);

  const [uploadingLang, setUploadingLang] = React.useState<TeaserLanguage | null>(null);
  const [deletingLang, setDeletingLang] = React.useState<TeaserLanguage | null>(null);

  const handleUpload = async (language: TeaserLanguage, file: File) => {
    setUploadingLang(language);
    try {
      await uploadTeaser.mutateAsync({ mandateId, language, file });
      onTeaserUpdated?.();
    } finally {
      setUploadingLang(null);
    }
  };

  const handleDelete = async (language: TeaserLanguage) => {
    setDeletingLang(language);
    try {
      await deleteTeaser.mutateAsync({ language });
      onTeaserUpdated?.();
    } finally {
      setDeletingLang(null);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Teasers del Mandato
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <SingleTeaserUpload
          mandateId={mandateId}
          language="es"
          label="Teaser (Español)"
          teaser={teaserEs}
          isUploading={uploadingLang === 'es'}
          isDeleting={deletingLang === 'es'}
          onUpload={(file) => handleUpload('es', file)}
          onDelete={() => handleDelete('es')}
        />

        <SingleTeaserUpload
          mandateId={mandateId}
          language="en"
          label="Teaser (English)"
          teaser={teaserEn}
          isUploading={uploadingLang === 'en'}
          isDeleting={deletingLang === 'en'}
          onUpload={(file) => handleUpload('en', file)}
          onDelete={() => handleDelete('en')}
        />
      </CardContent>
    </Card>
  );
};
