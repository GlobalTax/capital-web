import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, Mail, AlertCircle, CheckCircle2 } from 'lucide-react';
import { SFPersonWithFund } from '@/types/searchFunds';

interface SFBulkEmailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recipients: SFPersonWithFund[];
  onSuccess?: () => void;
}

export const SFBulkEmailDialog: React.FC<SFBulkEmailDialogProps> = ({
  open,
  onOpenChange,
  recipients,
  onSuccess,
}) => {
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const validRecipients = recipients.filter((r) => r.email);
  const invalidCount = recipients.length - validRecipients.length;

  const handleSend = async () => {
    if (!subject.trim() || !body.trim()) {
      toast.error('Completa el asunto y el mensaje');
      return;
    }

    if (validRecipients.length === 0) {
      toast.error('No hay destinatarios con email válido');
      return;
    }

    setSending(true);

    try {
      const { data, error } = await supabase.functions.invoke('send-sf-bulk-email', {
        body: {
          person_ids: validRecipients.map((r) => r.id),
          subject,
          body,
        },
      });

      if (error) throw error;

      toast.success(`${data.sent} email(s) enviados correctamente`);
      setSent(true);
      onSuccess?.();
      
      // Reset and close after a short delay
      setTimeout(() => {
        setSubject('');
        setBody('');
        setSent(false);
        onOpenChange(false);
      }, 1500);
    } catch (error: any) {
      console.error('Error sending emails:', error);
      toast.error(error.message || 'Error al enviar emails');
    } finally {
      setSending(false);
    }
  };

  const handleClose = () => {
    if (!sending) {
      setSubject('');
      setBody('');
      setSent(false);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Enviar Email Masivo
          </DialogTitle>
          <DialogDescription>
            Envía un email personalizado a los contactos seleccionados
          </DialogDescription>
        </DialogHeader>

        {sent ? (
          <div className="py-12 flex flex-col items-center gap-4">
            <CheckCircle2 className="h-16 w-16 text-green-500" />
            <p className="text-lg font-medium">Emails enviados correctamente</p>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {/* Recipients summary */}
              <div className="p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-sm font-medium">Destinatarios</Label>
                  <div className="flex gap-2">
                    <Badge variant="secondary">
                      {validRecipients.length} con email
                    </Badge>
                    {invalidCount > 0 && (
                      <Badge variant="destructive">
                        {invalidCount} sin email
                      </Badge>
                    )}
                  </div>
                </div>
                <ScrollArea className="h-24">
                  <div className="flex flex-wrap gap-1">
                    {validRecipients.map((r) => (
                      <Badge key={r.id} variant="outline" className="text-xs">
                        {r.full_name}
                      </Badge>
                    ))}
                  </div>
                </ScrollArea>
              </div>

              {invalidCount > 0 && (
                <div className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400">
                  <AlertCircle className="h-4 w-4" />
                  {invalidCount} contacto(s) sin email serán omitidos
                </div>
              )}

              {/* Subject */}
              <div className="space-y-2">
                <Label htmlFor="subject">Asunto *</Label>
                <Input
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Oportunidad de inversión - {{fund_name}}"
                />
                <p className="text-xs text-muted-foreground">
                  Variables: {'{{name}}'}, {'{{fund_name}}'}
                </p>
              </div>

              {/* Body */}
              <div className="space-y-2">
                <Label htmlFor="body">Mensaje *</Label>
                <Textarea
                  id="body"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={8}
                  placeholder={`Estimado/a {{name}},

Nos ponemos en contacto contigo desde Capittal...

Un saludo,
El equipo de Capittal`}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleClose} disabled={sending}>
                Cancelar
              </Button>
              <Button
                onClick={handleSend}
                disabled={sending || validRecipients.length === 0}
              >
                {sending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Mail className="h-4 w-4 mr-2" />
                    Enviar a {validRecipients.length} contacto(s)
                  </>
                )}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SFBulkEmailDialog;
