import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { Badge } from '@/components/ui/badge';
import { CircleDot, Loader2 } from 'lucide-react';
import { useContactStatuses, STATUS_COLOR_MAP } from '@/hooks/useContactStatuses';
import { useBulkUpdateStatus } from '@/hooks/useBulkUpdateStatus';
import { UnifiedContact } from '@/hooks/useUnifiedContacts';

interface BulkStatusSelectProps {
  selectedIds: string[];
  contacts: UnifiedContact[];
  onSuccess?: () => void;
}

export function BulkStatusSelect({ selectedIds, contacts, onSuccess }: BulkStatusSelectProps) {
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  
  const { activeStatuses, isLoading: statusesLoading } = useContactStatuses();
  const { mutate: updateStatus, isPending: isUpdating } = useBulkUpdateStatus();

  // Get the selected status data for confirmation dialog
  const selectedStatusData = activeStatuses.find(s => s.status_key === selectedStatus);

  // Build full contact IDs with origin prefix
  const fullContactIds = selectedIds.map(id => {
    const contact = contacts.find(c => c.id === id);
    return contact ? `${contact.origin}_${contact.id}` : id;
  }).filter(Boolean);

  const handleApply = () => {
    if (!selectedStatus || fullContactIds.length === 0) return;
    setShowConfirmDialog(true);
  };

  const handleConfirm = () => {
    updateStatus(
      { 
        contactIds: fullContactIds, 
        statusKey: selectedStatus,
        statusLabel: selectedStatusData?.label,
      },
      {
        onSuccess: () => {
          setShowConfirmDialog(false);
          setSelectedStatus('');
          onSuccess?.();
        },
        onSettled: () => {
          setShowConfirmDialog(false);
        },
      }
    );
  };

  if (statusesLoading) {
    return (
      <div className="flex items-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <SelectTrigger className="w-44 h-8 text-xs">
            <CircleDot className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            {activeStatuses.map((status) => {
              const colorConfig = STATUS_COLOR_MAP[status.color] || STATUS_COLOR_MAP.gray;
              return (
                <SelectItem key={status.id} value={status.status_key}>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant="outline" 
                      className={`text-[10px] px-1.5 py-0 ${colorConfig.bg} ${colorConfig.text}`}
                    >
                      {status.label}
                    </Badge>
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
        
        <Button
          onClick={handleApply}
          variant="secondary"
          size="sm"
          className="h-8 text-xs"
          disabled={!selectedStatus || isUpdating}
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
            <AlertDialogTitle>Actualizar estado</AlertDialogTitle>
            <AlertDialogDescription>
              Vas a cambiar el estado de <strong>{selectedIds.length}</strong> contacto{selectedIds.length !== 1 ? 's' : ''} a{' '}
              <strong>"{selectedStatusData?.label}"</strong>.
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
