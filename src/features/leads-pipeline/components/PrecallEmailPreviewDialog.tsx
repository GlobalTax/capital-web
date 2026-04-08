/**
 * Dialog to preview and edit the pre-call email before sending.
 */

import React, { useState, useEffect, useRef } from 'react';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, Send, Loader2, Pencil } from 'lucide-react';
import type { PrecallEmailPreview } from '../utils/buildPrecallEmailPreview';

export type { PrecallEmailPreview };

interface PrecallEmailPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  preview: PrecallEmailPreview | null;
  onConfirmSend: (edited: { subject: string; htmlBody: string }) => void;
  isSending: boolean;
}

export const PrecallEmailPreviewDialog: React.FC<PrecallEmailPreviewDialogProps> = ({
  open,
  onOpenChange,
  preview,
  onConfirmSend,
  isSending,
}) => {
  const [editedSubject, setEditedSubject] = useState('');
  const [editedHtml, setEditedHtml] = useState('');
  const bodyRef = useRef<HTMLDivElement>(null);

  // Sync state when preview changes
  useEffect(() => {
    if (preview) {
      setEditedSubject(preview.subject);
      setEditedHtml(preview.htmlBody);
    }
  }, [preview]);

  if (!preview) return null;

  const handleSend = () => {
    // Capture any contentEditable changes
    const currentHtml = bodyRef.current?.innerHTML || editedHtml;
    onConfirmSend({ subject: editedSubject, htmlBody: currentHtml });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Vista previa del email
          </DialogTitle>
          <DialogDescription>
            Puedes editar el asunto y el cuerpo antes de enviar
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
          </div>

          {/* Editable subject */}
          <div className="space-y-1.5">
            <Label htmlFor="email-subject" className="flex items-center gap-1.5 text-sm font-medium">
              <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
              Asunto
            </Label>
            <Input
              id="email-subject"
              value={editedSubject}
              onChange={(e) => setEditedSubject(e.target.value)}
              className="font-medium"
            />
          </div>

          {/* Editable email body */}
          <div className="space-y-1.5">
            <Label className="flex items-center gap-1.5 text-sm font-medium">
              <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
              Cuerpo del email
            </Label>
            <div
              ref={bodyRef}
              className="border rounded-lg p-4 bg-white min-h-[200px] focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              contentEditable
              suppressContentEditableWarning
              dangerouslySetInnerHTML={{ __html: editedHtml }}
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSending}>
            Cancelar
          </Button>
          <Button onClick={handleSend} disabled={isSending} className="gap-2">
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
