import React, { useRef } from 'react';
import { useSFFundFiles, useUploadSFFundFile, useDeleteSFFundFile, SFFundFile } from '@/hooks/useSFFundFiles';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Upload, Trash2, FileText, Download, File, Image, FileSpreadsheet } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface SFFundFilesPanelProps {
  fundId: string;
}

const formatFileSize = (bytes: number | null) => {
  if (!bytes) return '-';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const getFileIcon = (type: string) => {
  if (type.startsWith('image/')) return <Image className="h-4 w-4 text-blue-500" />;
  if (type.includes('spreadsheet') || type.includes('excel') || type.includes('csv')) return <FileSpreadsheet className="h-4 w-4 text-green-600" />;
  if (type.includes('pdf')) return <FileText className="h-4 w-4 text-red-500" />;
  return <File className="h-4 w-4 text-muted-foreground" />;
};

export const SFFundFilesPanel: React.FC<SFFundFilesPanelProps> = ({ fundId }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { data: files = [], isLoading } = useSFFundFiles(fundId);
  const uploadFile = useUploadSFFundFile();
  const deleteFile = useDeleteSFFundFile();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles) return;

    for (const file of Array.from(selectedFiles)) {
      await uploadFile.mutateAsync({ file, fundId });
    }

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-medium">Documentos</h3>
          <Badge variant="secondary" className="text-xs">{files.length}</Badge>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploadFile.isPending}
          className="gap-1.5 text-xs"
        >
          <Upload className="h-3.5 w-3.5" />
          {uploadFile.isPending ? 'Subiendo...' : 'Subir archivo'}
        </Button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />

      {isLoading ? (
        <div className="py-8 text-center text-sm text-muted-foreground">Cargando...</div>
      ) : files.length === 0 ? (
        <div className="py-8 text-center">
          <FileText className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">No hay documentos</p>
          <p className="text-xs text-muted-foreground mt-1">Sube archivos para asociarlos a este perfil</p>
        </div>
      ) : (
        <div className="divide-y">
          {files.map((file) => (
            <FileRow key={file.id} file={file} onDelete={() => deleteFile.mutate({ file })} isDeleting={deleteFile.isPending} />
          ))}
        </div>
      )}
    </div>
  );
};

const FileRow: React.FC<{ file: SFFundFile; onDelete: () => void; isDeleting: boolean }> = ({ file, onDelete, isDeleting }) => (
  <div className="py-2.5 flex items-center gap-3 group">
    {getFileIcon(file.file_type)}
    <div className="flex-1 min-w-0">
      <a
        href={file.public_url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm font-medium text-foreground hover:underline truncate block"
      >
        {file.file_name}
      </a>
      <p className="text-xs text-muted-foreground">
        {formatFileSize(file.file_size_bytes)} · {format(new Date(file.created_at), "d MMM yyyy", { locale: es })}
      </p>
    </div>
    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
      <Button size="icon" variant="ghost" className="h-7 w-7" asChild>
        <a href={file.public_url} target="_blank" rel="noopener noreferrer">
          <Download className="h-3.5 w-3.5" />
        </a>
      </Button>
      <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={onDelete} disabled={isDeleting}>
        <Trash2 className="h-3.5 w-3.5" />
      </Button>
    </div>
  </div>
);
