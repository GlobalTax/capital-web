import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
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
import { CalendarIcon, Loader2 } from 'lucide-react';
import { format, startOfDay, isFuture } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useBulkUpdateReceivedDate } from '@/hooks/useBulkUpdateReceivedDate';
import { UnifiedContact } from '@/hooks/useUnifiedContacts';

interface BulkDateSelectProps {
  selectedIds: string[];
  contacts: UnifiedContact[];
  onSuccess?: () => void;
}

export function BulkDateSelect({ selectedIds, contacts, onSuccess }: BulkDateSelectProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  
  const { mutate: updateDate, isPending: isUpdating } = useBulkUpdateReceivedDate();

  // Build full contact IDs with origin prefix
  const fullContactIds = selectedIds.map(id => {
    const contact = contacts.find(c => c.id === id);
    return contact ? `${contact.origin}_${contact.id}` : id;
  }).filter(Boolean);

  const handleApply = () => {
    if (!selectedDate || fullContactIds.length === 0) return;
    setShowConfirmDialog(true);
  };

  const handleConfirm = () => {
    if (!selectedDate) return;
    
    // Convert to ISO string at start of day in local timezone
    const dateString = startOfDay(selectedDate).toISOString();
    
    updateDate(
      { contactIds: fullContactIds, receivedDate: dateString },
      {
        onSuccess: () => {
          setShowConfirmDialog(false);
          setSelectedDate(undefined);
          onSuccess?.();
        },
        onSettled: () => {
          setShowConfirmDialog(false);
        },
      }
    );
  };

  // Disable future dates
  const disabledDays = { after: new Date() };

  return (
    <>
      <div className="flex items-center gap-2">
        <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={cn(
                "w-44 h-8 text-xs justify-start text-left font-normal",
                !selectedDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-3.5 w-3.5" />
              {selectedDate ? format(selectedDate, "dd MMM yyyy", { locale: es }) : "Fecha registro"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => {
                setSelectedDate(date);
                setIsCalendarOpen(false);
              }}
              disabled={disabledDays}
              initialFocus
              className={cn("p-3 pointer-events-auto")}
              locale={es}
            />
          </PopoverContent>
        </Popover>
        
        <Button
          onClick={handleApply}
          variant="secondary"
          size="sm"
          className="h-8 text-xs"
          disabled={!selectedDate || isUpdating}
        >
          {isUpdating ? (
            <>
              <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
              Aplicando...
            </>
          ) : (
            'Aplicar'
          )}
        </Button>
      </div>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cambiar fecha de registro</AlertDialogTitle>
            <AlertDialogDescription>
              Vas a cambiar la fecha de registro de <strong>{selectedIds.length}</strong> contacto{selectedIds.length !== 1 ? 's' : ''} a{' '}
              <strong>{selectedDate ? format(selectedDate, "dd 'de' MMMM 'de' yyyy", { locale: es }) : ''}</strong>.
              <br /><br />
              <span className="text-muted-foreground text-xs">
                Esta fecha se usará para análisis y reportes. La fecha técnica de creación (created_at) se mantiene intacta.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isUpdating}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirm} disabled={isUpdating}>
              {isUpdating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Actualizando...
                </>
              ) : (
                'Confirmar'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
