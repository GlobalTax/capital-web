/**
 * Dialog to preview the pre-call email before sending.
 */

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Mail, Send, Loader2 } from 'lucide-react';
import type { PrecallEmailPreview } from '../utils/buildPrecallEmailPreview';

// Re-export the type so it's importable from this file too
export type { PrecallEmailPreview };

interface PrecallEmailPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  preview: PrecallEmailPreview | null;
  onConfirmSend: () => void;
  isSending: boolean;
}

export const PrecallEmailPreviewDialog: React.FC<PrecallEmailPreviewDialogProps> = ({
  open,
  onOpenChange,
  preview,
  onConfirmSend,
  isSending,
}) => {
  if (!preview) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Vista previa del email
          </DialogTitle>
          <DialogDescription>
            Revisa el contenido antes de enviar
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4">
          {/* Email metadata */}
          <div className="space-y-2 text-sm border rounded-lg p-3 bg-muted/30">
            <div className="flex items-start gap-2">
              <span className="font-medium text-muted-foreground w-16 shrink-0">De:</span>
              <span>{preview.from}</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-medium text-muted-foreground w-16 shrink-0">Para:</span>
              <span>{preview.to}</span>
            </div>
            {preview.ccList.length > 0 && (
              <div className="flex items-start gap-2">
                <span className="font-medium text-muted-foreground w-16 shrink-0">CC:</span>
                <div className="flex flex-wrap gap-1">
                  {preview.ccList.map((email) => (
                    <Badge key={email} variant="secondary" className="text-xs">
                      {email}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            <div className="flex items-start gap-2">
              <span className="font-medium text-muted-foreground w-16 shrink-0">Asunto:</span>
              <span className="font-medium">{preview.subject}</span>
            </div>
          </div>

          {/* Email body */}
          <div
            className="border rounded-lg p-4 bg-white"
            dangerouslySetInnerHTML={{ __html: preview.htmlBody }}
          />
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSending}>
            Cancelar
          </Button>
          <Button onClick={onConfirmSend} disabled={isSending} className="gap-2">
            {isSending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            {isSending ? 'Enviando...' : 'Enviar email'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
