
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ImageIcon, Search, Folder, ChevronRight, Home, ArrowLeft, Loader2 } from 'lucide-react';
import { usePhotoLibrary } from '@/hooks/usePhotoLibrary';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import ImageCropEditor from '@/components/admin/ImageCropEditor';

interface PhotoLibraryPickerProps {
  onSelect: (url: string) => void;
  trigger?: React.ReactNode;
}

const PhotoLibraryPicker: React.FC<PhotoLibraryPickerProps> = ({ onSelect, trigger }) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [currentFolder, setCurrentFolder] = useState('');
  const [editingUrl, setEditingUrl] = useState<string | null>(null);

  const { photos, folders, totalPhotos, hasMorePhotos, loadMorePhotos, isLoading, isError, error, refetch } = usePhotoLibrary(search, currentFolder);

  const { sentinelRef, loading: loadingMore } = useInfiniteScroll(loadMorePhotos, hasMorePhotos);

  const breadcrumbs = currentFolder ? currentFolder.split('/') : [];

  const handleSelect = (url: string) => {
    // Open crop editor instead of inserting directly
    setEditingUrl(url);
  };

  const handleCropConfirm = (url: string) => {
    onSelect(url);
    setEditingUrl(null);
    setOpen(false);
    setSearch('');
    setCurrentFolder('');
  };

  const handleCropCancel = () => {
    setEditingUrl(null);
  };

  const navigateTo = (index: number) => {
    if (index < 0) {
      setCurrentFolder('');
    } else {
      setCurrentFolder(breadcrumbs.slice(0, index + 1).join('/'));
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setEditingUrl(null); } }}>
      <DialogTrigger asChild>
        {trigger || (
          <Button type="button" variant="outline" className="border border-gray-300 rounded-lg px-3">
            <ImageIcon className="w-4 h-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {editingUrl ? (
              <span className="flex items-center gap-2">
                <Button type="button" size="icon" variant="ghost" className="h-6 w-6" onClick={handleCropCancel}>
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                Recortar / Redimensionar
              </span>
            ) : (
              'Seleccionar foto de la biblioteca'
            )}
          </DialogTitle>
        </DialogHeader>

        {editingUrl ? (
          <ImageCropEditor
            imageUrl={editingUrl}
            onConfirm={handleCropConfirm}
            onCancel={handleCropCancel}
          />
        ) : (
          <>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar fotos..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Breadcrumb */}
            <div className="flex items-center gap-1 text-sm text-muted-foreground flex-wrap">
              <button onClick={() => navigateTo(-1)} className="hover:text-foreground flex items-center gap-1">
                <Home className="w-3.5 h-3.5" /> Inicio
              </button>
              {breadcrumbs.map((crumb, i) => (
                <React.Fragment key={i}>
                  <ChevronRight className="w-3 h-3" />
                  <button onClick={() => navigateTo(i)} className="hover:text-foreground">{crumb}</button>
                </React.Fragment>
              ))}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto min-h-0">
              {isLoading ? (
                <p className="text-sm text-muted-foreground text-center py-8">Cargando...</p>
              ) : isError ? (
                <div className="col-span-4 flex flex-col items-center gap-2 py-8 text-destructive">
                  <p className="text-sm font-medium">Error al cargar fotos</p>
                  <p className="text-xs text-muted-foreground">{(error as Error)?.message || 'Error de permisos'}</p>
                  <Button variant="outline" size="sm" onClick={() => refetch()}>Reintentar</Button>
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-3">
                  {folders.map((folder) => (
                    <button
                      key={folder.name}
                      onClick={() => setCurrentFolder(currentFolder ? `${currentFolder}/${folder.name}` : folder.name)}
                      className="flex flex-col items-center gap-1 p-3 rounded-lg border border-border hover:bg-accent transition-colors"
                    >
                      <Folder className="w-8 h-8 text-muted-foreground" />
                      <span className="text-xs truncate w-full text-center">{folder.name}</span>
                    </button>
                  ))}
                  {photos.map((photo) => (
                    <button
                      key={photo.id}
                      onClick={() => handleSelect(photo.publicUrl)}
                      className="group relative aspect-square rounded-lg overflow-hidden border border-border hover:ring-2 hover:ring-primary transition-all"
                    >
                      <img src={photo.thumbnailUrl || photo.publicUrl} alt={photo.name} className="w-full h-full object-cover" loading="lazy" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                    </button>
                  ))}
                  {folders.length === 0 && photos.length === 0 && (
                    <p className="col-span-4 text-sm text-muted-foreground text-center py-8">No hay fotos en esta ubicación</p>
                  )}
                </div>
                {/* Infinite scroll sentinel */}
                <div ref={sentinelRef} className="h-1" />
                {loadingMore && (
                  <div className="flex justify-center py-3">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  </div>
                )}
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PhotoLibraryPicker;
