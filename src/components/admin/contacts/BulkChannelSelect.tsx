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
import { Megaphone, Loader2 } from 'lucide-react';
import { useAcquisitionChannels, CATEGORY_LABELS, CATEGORY_COLORS } from '@/hooks/useAcquisitionChannels';
import { useBulkUpdateChannel } from '@/hooks/useBulkUpdateChannel';
import { UnifiedContact } from '@/hooks/useUnifiedContacts';

interface BulkChannelSelectProps {
  selectedIds: string[];
  contacts: UnifiedContact[];
  onSuccess?: () => void;
}

export function BulkChannelSelect({ selectedIds, contacts, onSuccess }: BulkChannelSelectProps) {
  const [selectedChannel, setSelectedChannel] = useState<string>('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  
  const { channels, isLoading: channelsLoading } = useAcquisitionChannels();
  const { mutate: updateChannel, isPending: isUpdating } = useBulkUpdateChannel();

  // Get the selected channel name for confirmation dialog
  const selectedChannelData = channels.find(c => c.id === selectedChannel);

  // Build full contact IDs with origin prefix
  const fullContactIds = selectedIds.map(id => {
    const contact = contacts.find(c => c.id === id);
    return contact ? `${contact.origin}_${contact.id}` : id;
  }).filter(Boolean);

  const handleApply = () => {
    if (!selectedChannel || fullContactIds.length === 0) return;
    setShowConfirmDialog(true);
  };

  const handleConfirm = () => {
    updateChannel(
      { contactIds: fullContactIds, channelId: selectedChannel },
      {
        onSuccess: () => {
          setShowConfirmDialog(false);
          setSelectedChannel('');
          onSuccess?.();
        },
        onSettled: () => {
          setShowConfirmDialog(false);
        },
      }
    );
  };

  if (channelsLoading) {
    return (
      <div className="flex items-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <Select value={selectedChannel} onValueChange={setSelectedChannel}>
          <SelectTrigger className="w-44 h-8 text-xs">
            <Megaphone className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
            <SelectValue placeholder="Canal" />
          </SelectTrigger>
          <SelectContent>
            {channels.map((channel) => (
              <SelectItem key={channel.id} value={channel.id}>
                <div className="flex items-center gap-2">
                  <Badge 
                    variant="outline" 
                    className={`text-[10px] px-1.5 py-0 ${CATEGORY_COLORS[channel.category]}`}
                  >
                    {CATEGORY_LABELS[channel.category]}
                  </Badge>
                  <span className="text-xs">{channel.name}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Button
          onClick={handleApply}
          variant="secondary"
          size="sm"
          className="h-8 text-xs"
          disabled={!selectedChannel || isUpdating}
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
            <AlertDialogTitle>Actualizar canal de adquisición</AlertDialogTitle>
            <AlertDialogDescription>
              Vas a cambiar el canal de <strong>{selectedIds.length}</strong> contacto{selectedIds.length !== 1 ? 's' : ''} a{' '}
              <strong>"{selectedChannelData?.name}"</strong>.
              <br /><br />
              <span className="text-muted-foreground text-xs">
                Nota: Solo se actualizarán los contactos que soporten canal de adquisición 
                (Contactos y General). Valoraciones y otros tipos se omitirán.
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
