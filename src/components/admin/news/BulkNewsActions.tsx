// ============= BULK NEWS ACTIONS =============
// Barra de acciones para operaciones masivas en noticias

import { useState } from 'react';
import { Button } from '@/components/ui/button';
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
  CheckCircle, 
  XCircle, 
  Trash2, 
  X,
  RotateCcw,
  Loader2
} from 'lucide-react';

interface BulkNewsActionsProps {
  selectedCount: number;
  onPublish: () => void;
  onUnpublish: () => void;
  onDelete: () => void;
  onRestore?: () => void;
  onClear: () => void;
  isProcessing?: boolean;
  isDeletedView?: boolean;
}

export const BulkNewsActions = ({
  selectedCount,
  onPublish,
  onUnpublish,
  onDelete,
  onRestore,
  onClear,
  isProcessing = false,
  isDeletedView = false,
}: BulkNewsActionsProps) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    onDelete();
    setDeleteDialogOpen(false);
  };

  if (selectedCount === 0) return null;

  return (
    <>
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-4 fade-in duration-200">
        <div className="flex items-center gap-2 bg-background border shadow-lg rounded-lg px-4 py-3">
          <span className="text-sm font-medium mr-2">
            {selectedCount} seleccionada{selectedCount > 1 ? 's' : ''}
          </span>
          
          {isProcessing ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Procesando...</span>
            </div>
          ) : isDeletedView ? (
            // Vista de archivados: solo restaurar
            <>
              {onRestore && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onRestore}
                  className="gap-1.5"
                >
                  <RotateCcw className="h-4 w-4" />
                  Restaurar
                </Button>
              )}
            </>
          ) : (
            // Vista normal: publicar, despublicar, archivar
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={onPublish}
                className="gap-1.5 text-green-600 hover:text-green-700 hover:bg-green-50"
              >
                <CheckCircle className="h-4 w-4" />
                Publicar
              </Button>
              
              <Button
                size="sm"
                variant="outline"
                onClick={onUnpublish}
                className="gap-1.5 text-amber-600 hover:text-amber-700 hover:bg-amber-50"
              >
                <XCircle className="h-4 w-4" />
                Despublicar
              </Button>
              
              <Button
                size="sm"
                variant="outline"
                onClick={handleDeleteClick}
                className="gap-1.5 text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4" />
                Archivar
              </Button>
            </>
          )}
          
          <div className="w-px h-6 bg-border mx-1" />
          
          <Button
            size="sm"
            variant="ghost"
            onClick={onClear}
            className="gap-1.5"
          >
            <X className="h-4 w-4" />
            Limpiar
          </Button>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Archivar {selectedCount} noticia{selectedCount > 1 ? 's' : ''}?</AlertDialogTitle>
            <AlertDialogDescription>
              Las noticias serán archivadas y podrás restaurarlas desde la pestaña "Archivadas".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete} 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Archivar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
