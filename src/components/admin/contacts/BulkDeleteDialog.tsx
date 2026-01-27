import React, { useState, useEffect } from 'react';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertTriangle, Loader2 } from 'lucide-react';

interface BulkDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCount: number;
  onConfirm: () => Promise<void>;
  isLoading?: boolean;
}

const CONFIRMATION_TEXT = 'ELIMINAR';

const BulkDeleteDialog: React.FC<BulkDeleteDialogProps> = ({
  open,
  onOpenChange,
  selectedCount,
  onConfirm,
  isLoading = false,
}) => {
  const [confirmationInput, setConfirmationInput] = useState('');
  const isConfirmed = confirmationInput === CONFIRMATION_TEXT;

  // Reset input when dialog opens/closes
  useEffect(() => {
    if (!open) {
      setConfirmationInput('');
    }
  }, [open]);

  const handleConfirm = async () => {
    if (!isConfirmed) return;
    await onConfirm();
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Eliminar {selectedCount} contacto{selectedCount > 1 ? 's' : ''} permanentemente
          </AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción <strong>NO se puede deshacer</strong>. Los contactos serán
            eliminados de forma definitiva del sistema.
          </AlertDialogDescription>
          <div className="pt-2">
            <Label htmlFor="confirm-delete" className="text-foreground">
              Escribe <strong>{CONFIRMATION_TEXT}</strong> para confirmar:
            </Label>
            <Input
              id="confirm-delete"
              value={confirmationInput}
              onChange={(e) => setConfirmationInput(e.target.value)}
              placeholder={CONFIRMATION_TEXT}
              className="mt-2"
              autoComplete="off"
              disabled={isLoading}
            />
          </div>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={!isConfirmed || isLoading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Eliminando...
              </>
            ) : (
              'Eliminar permanentemente'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default BulkDeleteDialog;
