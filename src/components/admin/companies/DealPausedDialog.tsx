import React, { useState } from 'react';
import { format } from 'date-fns';
import { CalendarIcon, PauseCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { usePausedReasons, useActivePause, useDealPausedMutations } from '@/hooks/useDealsPaused';

interface DealPausedDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyId: string;
  companyName: string;
}

export function DealPausedDialog({ open, onOpenChange, companyId, companyName }: DealPausedDialogProps) {
  const [reasonId, setReasonId] = useState('');
  const [notes, setNotes] = useState('');
  const [reminderDate, setReminderDate] = useState<Date | undefined>();
  const [reminderText, setReminderText] = useState('');

  const { data: reasons, isLoading: loadingReasons } = usePausedReasons();
  const { data: activePause } = useActivePause(companyId);
  const { pauseCompany, reactivateCompany } = useDealPausedMutations();

  const handleSubmit = () => {
    if (!reasonId) return;
    pauseCompany.mutate(
      {
        companyId,
        reasonId,
        notes: notes || undefined,
        reminderAt: reminderDate?.toISOString(),
        reminderText: reminderText || undefined,
      },
      {
        onSuccess: () => {
          onOpenChange(false);
          resetForm();
        },
      }
    );
  };

  const handleReactivate = () => {
    if (!activePause) return;
    reactivateCompany.mutate(
      { pausedItemId: activePause.id, companyId },
      { onSuccess: () => onOpenChange(false) }
    );
  };

  const resetForm = () => {
    setReasonId('');
    setNotes('');
    setReminderDate(undefined);
    setReminderText('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PauseCircle className="h-5 w-5" />
            Deal Paused
          </DialogTitle>
          <DialogDescription>
            {activePause
              ? `"${companyName}" ya tiene un deal pausado activo.`
              : `Marcar "${companyName}" como deal pausado.`}
          </DialogDescription>
        </DialogHeader>

        {activePause ? (
          <div className="space-y-3">
            <div className="rounded-md border p-3 text-sm space-y-1">
              <p><span className="text-muted-foreground">Motivo:</span> {activePause.reason?.name}</p>
              {activePause.notes && <p><span className="text-muted-foreground">Notas:</span> {activePause.notes}</p>}
              {activePause.reminder_at && (
                <p><span className="text-muted-foreground">Recordatorio:</span> {format(new Date(activePause.reminder_at), 'dd/MM/yyyy')}</p>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)}>Cerrar</Button>
              <Button onClick={handleReactivate} disabled={reactivateCompany.isPending}>
                ▶️ Reactivar
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Motivo *</Label>
              <Select value={reasonId} onValueChange={setReasonId} disabled={loadingReasons}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un motivo" />
                </SelectTrigger>
                <SelectContent>
                  {reasons?.map((r) => (
                    <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Notas (opcional)</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Contexto adicional..."
                className="min-h-[80px]"
              />
            </div>

            <div className="space-y-2">
              <Label>Recordatorio (opcional)</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !reminderDate && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {reminderDate ? format(reminderDate, 'dd/MM/yyyy') : 'Fecha de recontacto'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={reminderDate}
                    onSelect={setReminderDate}
                    initialFocus
                    className={cn('p-3 pointer-events-auto')}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {reminderDate && (
              <div className="space-y-2">
                <Label>Texto recordatorio</Label>
                <Input
                  value={reminderText}
                  onChange={(e) => setReminderText(e.target.value)}
                  placeholder="Ej: Llamar para revisar situación"
                />
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
              <Button onClick={handleSubmit} disabled={!reasonId || pauseCompany.isPending}>
                ⏸️ Pausar Deal
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
