import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, X, FileText } from 'lucide-react';
import { DocumentCategory, AccessLevel, DocumentStatus, getCategoryLabel, getAccessLevelLabel } from '../../types/documents';
import { formatFileSize } from '../../types/documents';

interface DocumentUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  operationId: string;
  onUpload: (file: File, metadata: {
    operation_id: string;
    title: string;
    description?: string;
    category: DocumentCategory;
    status: DocumentStatus;
    access_level: AccessLevel;
    tags: string[];
  }) => void;
  isUploading: boolean;
}

export const DocumentUploadDialog: React.FC<DocumentUploadDialogProps> = ({
  open,
  onOpenChange,
  operationId,
  onUpload,
  isUploading,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<DocumentCategory>(DocumentCategory.OTHER);
  const [accessLevel, setAccessLevel] = useState<AccessLevel>(AccessLevel.INTERNAL);
  const [tags, setTags] = useState('');

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setSelectedFile(file);
      if (!title) {
        setTitle(file.name.split('.').slice(0, -1).join('.'));
      }
    }
  }, [title]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    maxSize: 52428800, // 50MB
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-powerpoint': ['.ppt'],
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
      'image/*': ['.jpg', '.jpeg', '.png', '.gif'],
      'text/plain': ['.txt'],
      'text/csv': ['.csv'],
    }
  });

  const handleUpload = () => {
    if (!selectedFile || !title) return;

    onUpload(selectedFile, {
      operation_id: operationId,
      title,
      description: description || undefined,
      category,
      status: DocumentStatus.DRAFT,
      access_level: accessLevel,
      tags: tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : [],
    });

    // Reset form
    setSelectedFile(null);
    setTitle('');
    setDescription('');
    setCategory(DocumentCategory.OTHER);
    setAccessLevel(AccessLevel.INTERNAL);
    setTags('');
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Subir Documento</DialogTitle>
          <DialogDescription>
            Sube un documento relacionado con esta operación. Máximo 50MB.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* File dropzone */}
          {!selectedFile ? (
            <div
              {...getRootProps()}
              className={`
                border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
                ${isDragActive 
                  ? 'border-primary bg-primary/5' 
                  : 'border-border hover:border-primary/50'
                }
              `}
            >
              <input {...getInputProps()} />
              <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                {isDragActive 
                  ? 'Suelta el archivo aquí...' 
                  : 'Arrastra un archivo aquí o haz clic para seleccionar'
                }
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                PDF, Word, Excel, PowerPoint, Imágenes (máx. 50MB)
              </p>
            </div>
          ) : (
            <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
              <FileText className="h-8 w-8 text-primary flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{selectedFile.name}</p>
                <p className="text-xs text-muted-foreground">{formatFileSize(selectedFile.size)}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleRemoveFile}
                disabled={isUploading}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Metadata fields */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Título del documento"
                disabled={isUploading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descripción opcional del documento"
                rows={3}
                disabled={isUploading}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Categoría *</Label>
                <Select
                  value={category}
                  onValueChange={(value) => setCategory(value as DocumentCategory)}
                  disabled={isUploading}
                >
                  <SelectTrigger id="category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(DocumentCategory).map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {getCategoryLabel(cat)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="access">Nivel de Acceso *</Label>
                <Select
                  value={accessLevel}
                  onValueChange={(value) => setAccessLevel(value as AccessLevel)}
                  disabled={isUploading}
                >
                  <SelectTrigger id="access">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(AccessLevel).map((level) => (
                      <SelectItem key={level} value={level}>
                        {getAccessLevelLabel(level)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Etiquetas</Label>
              <Input
                id="tags"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="Separa con comas: nda, confidencial, urgente"
                disabled={isUploading}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isUploading}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleUpload}
              disabled={!selectedFile || !title || isUploading}
            >
              {isUploading ? 'Subiendo...' : 'Subir Documento'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
