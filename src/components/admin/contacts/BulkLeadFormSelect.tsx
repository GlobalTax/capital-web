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
import { FileText, Loader2 } from 'lucide-react';
import { useLeadForms } from '@/hooks/useLeadForms';
import { useBulkUpdateLeadForm } from '@/hooks/useBulkUpdateLeadForm';
import { UnifiedContact } from '@/hooks/useUnifiedContacts';

interface BulkLeadFormSelectProps {
  selectedIds: string[];
  contacts: UnifiedContact[];
  onSuccess?: () => void;
}

export function BulkLeadFormSelect({ selectedIds, contacts, onSuccess }: BulkLeadFormSelectProps) {
  const [selectedForm, setSelectedForm] = useState<string>('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  
  const { forms, isLoading: formsLoading } = useLeadForms();
  const { mutate: updateForm, isPending: isUpdating } = useBulkUpdateLeadForm();

  // Get the selected form name for confirmation dialog
  const selectedFormData = forms.find(f => f.id === selectedForm);

  // Build full contact IDs with origin prefix
  const fullContactIds = selectedIds.map(id => {
    const contact = contacts.find(c => c.id === id);
    return contact ? `${contact.origin}_${contact.id}` : id;
  }).filter(Boolean);

  const handleApply = () => {
    if (!selectedForm || fullContactIds.length === 0) return;
    setShowConfirmDialog(true);
  };

  const handleConfirm = () => {
    updateForm(
      { 
        contactIds: fullContactIds, 
        leadFormId: selectedForm,
        leadFormName: selectedFormData?.name,
      },
      {
        onSuccess: () => {
          setShowConfirmDialog(false);
          setSelectedForm('');
          onSuccess?.();
        },
        onSettled: () => {
          setShowConfirmDialog(false);
        },
      }
    );
  };

  if (formsLoading) {
    return (
      <div className="flex items-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <Select value={selectedForm} onValueChange={setSelectedForm}>
          <SelectTrigger className="w-56 h-8 text-xs">
            <FileText className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
            <SelectValue placeholder="Formulario" />
          </SelectTrigger>
          <SelectContent>
            {forms.map((form) => (
              <SelectItem key={form.id} value={form.id}>
                <span className="text-xs">{form.name}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Button
          onClick={handleApply}
          variant="secondary"
          size="sm"
          className="h-8 text-xs"
          disabled={!selectedForm || isUpdating}
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
            <AlertDialogTitle>Asignar formulario de origen</AlertDialogTitle>
            <AlertDialogDescription>
              Vas a asignar el formulario <strong>"{selectedFormData?.name}"</strong> a{' '}
              <strong>{selectedIds.length}</strong> contacto{selectedIds.length !== 1 ? 's' : ''}.
              <br /><br />
              <span className="text-muted-foreground text-xs">
                Este campo indica el formulario específico por el cual entraron estos leads.
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
