/**
 * Confirmation dialog for deleting a pipeline column
 */

import React from 'react';
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
import type { LeadPipelineColumn } from '../hooks/useLeadPipelineColumns';

interface ColumnDeleteDialogProps {
  column: LeadPipelineColumn | null;
  isOpen: boolean;
  isDeleting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ColumnDeleteDialog: React.FC<ColumnDeleteDialogProps> = ({
  column,
  isOpen,
  isDeleting,
  onConfirm,
  onCancel,
}) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Eliminar columna "{column?.label}"?</AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>
              Esta acción no se puede deshacer. Los leads que estén en esta columna 
              <strong> permanecerán con el mismo estado</strong> en la base de datos, 
              pero no aparecerán en ninguna columna visible del pipeline.
            </p>
            <p className="text-amber-600 dark:text-amber-400">
              ⚠️ Recomendamos mover los leads a otra columna antes de eliminar.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? 'Eliminando...' : 'Eliminar columna'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
