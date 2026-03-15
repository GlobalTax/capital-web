
import React, { useState, useRef, useCallback } from 'react';
import { usePhotoLibrary, PhotoFile } from '@/hooks/usePhotoLibrary';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Upload, Trash2, Copy, Loader2, ImageIcon, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const PhotoLibraryManager: React.FC = () => {
  const [search, setSearch] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<PhotoFile | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const { photos, isLoading, isUploading, uploadProgress, uploadPhotos, deletePhoto } = usePhotoLibrary(search);

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;
    uploadPhotos(Array.from(files));
  }, [uploadPhotos]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast({ title: 'URL copiada', description: 'URL copiada al portapapeles' });
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    await deletePhoto(deleteTarget.name);
    setDeleteTarget(null);
  };

  const formatSize = (bytes: number | undefined) => {
    if (!bytes) return '—';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">📸 Biblioteca de Fotos</h1>
          <p className="text-sm text-muted-foreground mt-1">{photos.length} fotos · Sube, organiza y copia URLs</p>
        </div>
        <Button onClick={() => fileInputRef.current?.click()} disabled={isUploading} variant="accent">
          <Upload className="h-4 w-4 mr-2" />
          Subir fotos
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={e => handleFiles(e.target.files)}
        />
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nombre..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-9"
        />
        {search && (
          <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
            <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
          </button>
        )}
      </div>

      {/* Upload progress */}
      {isUploading && (
        <div className="rounded-[var(--radius)] border border-border bg-muted/50 p-4 flex items-center gap-3">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <div className="flex-1">
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div className="h-full bg-primary transition-all" style={{ width: `${uploadProgress}%` }} />
            </div>
          </div>
          <span className="text-sm text-muted-foreground">{uploadProgress}%</span>
        </div>
      )}

      {/* Drop zone / Grid */}
      <div
        className={`relative min-h-[300px] rounded-[var(--radius-lg)] border-2 border-dashed transition-colors ${
          isDragging ? 'border-primary bg-primary/5' : 'border-border'
        }`}
        onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        {isDragging && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/80 rounded-[var(--radius-lg)]">
            <div className="flex flex-col items-center gap-2 text-primary">
              <Upload className="h-10 w-10" />
              <p className="text-lg font-medium">Suelta las fotos aquí</p>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : photos.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-muted-foreground gap-3">
            <ImageIcon className="h-12 w-12" />
            <p>No hay fotos. Arrastra imágenes aquí o usa el botón "Subir fotos".</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 p-4">
            {photos.map(photo => (
              <div
                key={photo.id}
                className="group relative rounded-[var(--radius)] border border-border bg-card overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="aspect-square bg-muted">
                  <img
                    src={photo.publicUrl}
                    alt={photo.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                {/* Overlay actions */}
                <div className="absolute inset-0 bg-background/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button size="icon" variant="secondary" onClick={() => copyUrl(photo.publicUrl)} title="Copiar URL">
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="destructive" onClick={() => setDeleteTarget(photo)} title="Eliminar">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                {/* Info */}
                <div className="p-2">
                  <p className="text-xs text-foreground truncate" title={photo.name}>{photo.name}</p>
                  <p className="text-xs text-muted-foreground">{formatSize(photo.metadata?.size)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={open => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar foto?</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminará <strong>{deleteTarget?.name}</strong> permanentemente. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PhotoLibraryManager;
