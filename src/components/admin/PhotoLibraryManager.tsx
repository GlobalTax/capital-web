
import React, { useState, useRef, useCallback } from 'react';
import { usePhotoLibrary, PhotoFile } from '@/hooks/usePhotoLibrary';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Upload, Trash2, Copy, Loader2, ImageIcon, X, FolderPlus, Folder, ChevronRight, Home, GripVertical } from 'lucide-react';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

const PhotoLibraryManager: React.FC = () => {
  const [search, setSearch] = useState('');
  const [currentFolder, setCurrentFolder] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<PhotoFile | null>(null);
  const [deleteFolderTarget, setDeleteFolderTarget] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOverFolder, setDragOverFolder] = useState<string | null>(null);
  const [draggingPhoto, setDraggingPhoto] = useState<PhotoFile | null>(null);
  const [isMoving, setIsMoving] = useState(false);
  const [newFolderOpen, setNewFolderOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const { photos, folders, isLoading, isUploading, uploadProgress, uploadPhotos, deletePhoto, createFolder, deleteFolder, movePhoto } = usePhotoLibrary(search, currentFolder);

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;
    uploadPhotos(Array.from(files));
  }, [uploadPhotos]);

  const handleExternalDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    // Only handle file drops (not internal photo drags)
    if (e.dataTransfer.files.length > 0 && !e.dataTransfer.getData('application/photo-path')) {
      handleFiles(e.dataTransfer.files);
    }
  }, [handleFiles]);

  // --- Internal drag & drop for moving photos ---
  const handlePhotoDragStart = useCallback((e: React.DragEvent, photo: PhotoFile) => {
    e.dataTransfer.setData('application/photo-path', photo.fullPath);
    e.dataTransfer.effectAllowed = 'move';
    setDraggingPhoto(photo);
  }, []);

  const handleFolderDragOver = useCallback((e: React.DragEvent, folderName: string) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
    setDragOverFolder(folderName);
  }, []);

  const handleFolderDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOverFolder(null);
  }, []);

  const handleFolderDrop = useCallback(async (e: React.DragEvent, folderName: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverFolder(null);
    setDraggingPhoto(null);

    const photoPath = e.dataTransfer.getData('application/photo-path');
    if (!photoPath) return; // Not an internal photo drag

    const targetFolder = currentFolder ? `${currentFolder}/${folderName}` : folderName;
    setIsMoving(true);
    await movePhoto(photoPath, targetFolder);
    setIsMoving(false);
  }, [currentFolder, movePhoto]);

  // Drop on breadcrumb (move to parent/root)
  const handleBreadcrumbDrop = useCallback(async (e: React.DragEvent, targetFolder: string) => {
    e.preventDefault();
    e.stopPropagation();
    const photoPath = e.dataTransfer.getData('application/photo-path');
    if (!photoPath) return;

    setIsMoving(true);
    await movePhoto(photoPath, targetFolder);
    setIsMoving(false);
  }, [movePhoto]);

  const handlePhotoDragEnd = useCallback(() => {
    setDraggingPhoto(null);
    setDragOverFolder(null);
  }, []);

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast({ title: 'URL copiada', description: 'URL copiada al portapapeles' });
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    await deletePhoto(deleteTarget.fullPath);
    setDeleteTarget(null);
  };

  const confirmDeleteFolder = async () => {
    if (!deleteFolderTarget) return;
    await deleteFolder(deleteFolderTarget);
    setDeleteFolderTarget(null);
  };

  const handleCreateFolder = async () => {
    const name = newFolderName.trim();
    if (!name) return;
    await createFolder(name);
    setNewFolderName('');
    setNewFolderOpen(false);
  };

  const navigateToFolder = (folderName: string) => {
    setCurrentFolder(prev => prev ? `${prev}/${folderName}` : folderName);
    setSearch('');
  };

  const breadcrumbParts = currentFolder ? currentFolder.split('/') : [];

  const navigateToBreadcrumb = (index: number) => {
    if (index < 0) {
      setCurrentFolder('');
    } else {
      setCurrentFolder(breadcrumbParts.slice(0, index + 1).join('/'));
    }
    setSearch('');
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
          <p className="text-sm text-muted-foreground mt-1">
            {photos.length} fotos · {folders.length} carpetas · Arrastra fotos a carpetas para moverlas
            {isMoving && <span className="ml-2 text-primary animate-pulse">Moviendo...</span>}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => setNewFolderOpen(true)} variant="outline" size="sm">
            <FolderPlus className="h-4 w-4 mr-2" />
            Nueva carpeta
          </Button>
          <Button onClick={() => fileInputRef.current?.click()} disabled={isUploading} variant="accent">
            <Upload className="h-4 w-4 mr-2" />
            Subir fotos
          </Button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={e => handleFiles(e.target.files)}
        />
      </div>

      {/* Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            {currentFolder ? (
              <BreadcrumbLink
                className="cursor-pointer flex items-center gap-1 px-1 rounded transition-colors"
                onClick={() => navigateToBreadcrumb(-1)}
                onDragOver={e => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; }}
                onDrop={e => handleBreadcrumbDrop(e, '')}
              >
                <Home className="h-3.5 w-3.5" />
                Inicio
              </BreadcrumbLink>
            ) : (
              <BreadcrumbPage className="flex items-center gap-1">
                <Home className="h-3.5 w-3.5" />
                Inicio
              </BreadcrumbPage>
            )}
          </BreadcrumbItem>
          {breadcrumbParts.map((part, i) => (
            <React.Fragment key={i}>
              <BreadcrumbSeparator>
                <ChevronRight className="h-3.5 w-3.5" />
              </BreadcrumbSeparator>
              <BreadcrumbItem>
                {i === breadcrumbParts.length - 1 ? (
                  <BreadcrumbPage>{part}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink
                    className="cursor-pointer px-1 rounded transition-colors"
                    onClick={() => navigateToBreadcrumb(i)}
                    onDragOver={e => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; }}
                    onDrop={e => handleBreadcrumbDrop(e, breadcrumbParts.slice(0, i + 1).join('/'))}
                  >
                    {part}
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </React.Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>

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
        ) : photos.length === 0 && folders.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-muted-foreground gap-3">
            <ImageIcon className="h-12 w-12" />
            <p>No hay fotos. Arrastra imágenes aquí o usa el botón "Subir fotos".</p>
          </div>
        ) : (
          <div className="p-4 space-y-4">
            {/* Folders */}
            {folders.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
                {folders.map(folder => (
                  <div
                    key={folder.name}
                    className="group relative flex flex-col items-center gap-2 p-4 rounded-[var(--radius)] border border-border bg-card hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => navigateToFolder(folder.name)}
                  >
                    <Folder className="h-10 w-10 text-muted-foreground group-hover:text-primary transition-colors" />
                    <p className="text-xs text-foreground truncate w-full text-center" title={folder.name}>
                      {folder.name}
                    </p>
                    <button
                      className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-destructive/10"
                      onClick={(e) => { e.stopPropagation(); setDeleteFolderTarget(folder.name); }}
                      title="Eliminar carpeta"
                    >
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Photos */}
            {photos.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
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
                    <div className="absolute inset-0 bg-background/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <Button size="icon" variant="secondary" onClick={() => copyUrl(photo.publicUrl)} title="Copiar URL">
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="destructive" onClick={() => setDeleteTarget(photo)} title="Eliminar">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="p-2">
                      <p className="text-xs text-foreground truncate" title={photo.name}>{photo.name}</p>
                      <p className="text-xs text-muted-foreground">{formatSize(photo.metadata?.size)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* New folder dialog */}
      <Dialog open={newFolderOpen} onOpenChange={setNewFolderOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nueva carpeta</DialogTitle>
          </DialogHeader>
          <Input
            placeholder="Nombre de la carpeta..."
            value={newFolderName}
            onChange={e => setNewFolderName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleCreateFolder()}
            autoFocus
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewFolderOpen(false)}>Cancelar</Button>
            <Button variant="accent" onClick={handleCreateFolder} disabled={!newFolderName.trim()}>Crear</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete photo confirmation */}
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

      {/* Delete folder confirmation */}
      <AlertDialog open={!!deleteFolderTarget} onOpenChange={open => !open && setDeleteFolderTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar carpeta?</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminará la carpeta <strong>{deleteFolderTarget}</strong> y todo su contenido. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteFolder} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PhotoLibraryManager;
