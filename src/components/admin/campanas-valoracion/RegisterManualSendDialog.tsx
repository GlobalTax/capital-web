import { useState } from 'react';
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Loader2, MailCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ManualSendTarget {
  companyId: string;       // valuation_campaign_companies.id
  companyName: string;
  campaignId: string;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  targets: ManualSendTarget[];
  onSuccess: () => void;
}

export function RegisterManualSendDialog({ open, onOpenChange, targets, onSuccess }: Props) {
  const [sentDate, setSentDate] = useState<Date>(new Date());
  const [sentTime, setSentTime] = useState(format(new Date(), 'HH:mm'));
  const [deliveryStatus, setDeliveryStatus] = useState<string>('delivered');
  const [emailOpened, setEmailOpened] = useState(false);
  const [openedDate, setOpenedDate] = useState<Date | undefined>();
  const [openedTime, setOpenedTime] = useState('');
  const [messageId, setMessageId] = useState('');
  const [saving, setSaving] = useState(false);

  const isBulk = targets.length > 1;

  const handleSubmit = async () => {
    if (!sentDate) {
      toast.error('La fecha de envío es obligatoria');
      return;
    }

    setSaving(true);
    try {
      const [hours, minutes] = sentTime.split(':').map(Number);
      const sentAt = new Date(sentDate);
      sentAt.setHours(hours || 0, minutes || 0, 0, 0);

      let emailOpenedAt: string | null = null;
      if (emailOpened && openedDate) {
        const oDate = new Date(openedDate);
        if (openedTime) {
          const [oh, om] = openedTime.split(':').map(Number);
          oDate.setHours(oh || 0, om || 0, 0, 0);
        }
        emailOpenedAt = oDate.toISOString();
      }

      // For each target, upsert campaign_emails and update company status
      for (const target of targets) {
        // Check if email record exists
        const { data: existing } = await (supabase as any)
          .from('campaign_emails')
          .select('id')
          .eq('campaign_id', target.campaignId)
          .eq('company_id', target.companyId)
          .maybeSingle();

        const emailData = {
          campaign_id: target.campaignId,
          company_id: target.companyId,
          status: 'sent',
          sent_at: sentAt.toISOString(),
          delivery_status: deliveryStatus,
          email_opened: emailOpened,
          email_opened_at: emailOpenedAt,
          email_message_id: messageId || null,
          is_manually_edited: true,
          updated_at: new Date().toISOString(),
        };

        if (existing?.id) {
          await (supabase as any)
            .from('campaign_emails')
            .update(emailData)
            .eq('id', existing.id);
        } else {
          await (supabase as any)
            .from('campaign_emails')
            .insert({
              ...emailData,
              subject: 'Registrado manualmente',
              body: 'Envío registrado manualmente desde datos de Resend',
            });
        }

        // Update company status to 'sent'
        await (supabase as any)
          .from('valuation_campaign_companies')
          .update({ status: 'sent', updated_at: new Date().toISOString() })
          .eq('id', target.companyId);
      }

      toast.success(
        isBulk
          ? `${targets.length} envíos registrados correctamente`
          : `Envío registrado para ${targets[0].companyName}`
      );
      onSuccess();
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err?.message || 'Error al registrar el envío');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MailCheck className="h-4 w-4" />
            Registrar envío manual
          </DialogTitle>
          <DialogDescription>
            {isBulk
              ? `Registrar envío para ${targets.length} empresas seleccionadas`
              : `Registrar envío para ${targets[0]?.companyName}`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Sent date */}
          <div className="space-y-1.5">
            <Label>Fecha de envío *</Label>
            <div className="flex gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn('flex-1 justify-start text-left font-normal')}>
                    <CalendarIcon className="h-3.5 w-3.5 mr-2" />
                    {format(sentDate, 'PPP', { locale: es })}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={sentDate}
                    onSelect={(d) => d && setSentDate(d)}
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
              <Input
                type="time"
                value={sentTime}
                onChange={(e) => setSentTime(e.target.value)}
                className="w-24"
              />
            </div>
          </div>

          {/* Delivery status */}
          <div className="space-y-1.5">
            <Label>Estado de entrega</Label>
            <Select value={deliveryStatus} onValueChange={setDeliveryStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="delivered">Entregado</SelectItem>
                <SelectItem value="bounced">Rebotado</SelectItem>
                <SelectItem value="not_delivered">No entregado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Opened */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Checkbox
                id="email-opened"
                checked={emailOpened}
                onCheckedChange={(v) => setEmailOpened(!!v)}
              />
              <Label htmlFor="email-opened" className="cursor-pointer">Email abierto por el destinatario</Label>
            </div>

            {emailOpened && (
              <div className="ml-6 space-y-1.5">
                <Label className="text-xs text-muted-foreground">Fecha de apertura (opcional)</Label>
                <div className="flex gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm" className="flex-1 justify-start text-left font-normal text-xs">
                        <CalendarIcon className="h-3 w-3 mr-1.5" />
                        {openedDate ? format(openedDate, 'PPP', { locale: es }) : 'Seleccionar fecha'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={openedDate}
                        onSelect={setOpenedDate}
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                  <Input
                    type="time"
                    value={openedTime}
                    onChange={(e) => setOpenedTime(e.target.value)}
                    className="w-24 h-8 text-xs"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Resend Message ID */}
          {!isBulk && (
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Resend Message ID (opcional)</Label>
              <Input
                placeholder="msg_xxxxxxxx"
                value={messageId}
                onChange={(e) => setMessageId(e.target.value)}
                className="text-xs"
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={saving}>
            {saving ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <MailCheck className="h-3.5 w-3.5 mr-1.5" />}
            {isBulk ? `Registrar ${targets.length} envíos` : 'Registrar envío'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
