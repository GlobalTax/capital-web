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
import { CheckCircle2, Clock } from 'lucide-react';

interface PostCopyConfirmationProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirmSent: () => void;
  onKeepDraft: () => void;
}

export const PostCopyConfirmation: React.FC<PostCopyConfirmationProps> = ({
  open,
  onOpenChange,
  onConfirmSent,
  onKeepDraft,
}) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            📋 HTML Copiado
          </AlertDialogTitle>
          <AlertDialogDescription className="text-base">
            ¿Ya has enviado este newsletter desde Brevo?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
          <AlertDialogCancel onClick={onKeepDraft} className="gap-2">
            <Clock className="h-4 w-4" />
            No, lo haré después
          </AlertDialogCancel>
          <AlertDialogAction onClick={onConfirmSent} className="gap-2">
            <CheckCircle2 className="h-4 w-4" />
            Sí, marcar como enviado
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
