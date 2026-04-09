import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Loader2, BookOpen } from 'lucide-react';

export interface RODContact {
  full_name: string;
  email: string;
  company?: string;
  phone?: string;
  notes?: string;
}

interface AddToRODDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contacts: RODContact[];
}

export const AddToRODDialog: React.FC<AddToRODDialogProps> = ({
  open,
  onOpenChange,
  contacts,
}) => {
  const [language, setLanguage] = useState<'es' | 'en'>('es');
  const queryClient = useQueryClient();

  const validContacts = contacts.filter(c => c.email && c.email.trim() !== '');

  const mutation = useMutation({
    mutationFn: async () => {
      const payload = validContacts.map(c => ({
        language,
        full_name: c.full_name,
        email: c.email.toLowerCase().trim(),
        company: c.company || null,
        phone: c.phone || null,
        notes: c.notes || null,
      }));

      for (let i = 0; i < payload.length; i += 50) {
        const chunk = payload.slice(i, i + 50);
        const { error } = await supabase
          .from('rod_list_members' as any)
          .upsert(chunk, { onConflict: 'language,email', ignoreDuplicates: true });
        if (error) throw error;
      }

      return payload.length;
    },
    onSuccess: (count) => {
      queryClient.invalidateQueries({ queryKey: ['rod-list-members'] });
      toast.success(`${count} contacto${count > 1 ? 's' : ''} añadido${count > 1 ? 's' : ''} a la lista ROD (${language === 'es' ? 'Castellano' : 'Inglés'})`);
      onOpenChange(false);
    },
    onError: (error) => {
      console.error('Error adding to ROD:', error);
      toast.error('Error al añadir contactos a la ROD');
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Añadir a Lista ROD
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <p className="text-sm text-muted-foreground">
            Se añadirán <strong>{validContacts.length}</strong> contacto{validContacts.length !== 1 ? 's' : ''} con email a la lista de distribución de la ROD.
            {contacts.length !== validContacts.length && (
              <span className="text-amber-600 dark:text-amber-400">
                {' '}({contacts.length - validContacts.length} sin email serán omitidos)
              </span>
            )}
          </p>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Idioma de la lista</Label>
            <RadioGroup
              value={language}
              onValueChange={(v) => setLanguage(v as 'es' | 'en')}
              className="flex gap-4"
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem value="es" id="rod-es" />
                <Label htmlFor="rod-es" className="cursor-pointer">🇪🇸 Castellano</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="en" id="rod-en" />
                <Label htmlFor="rod-en" className="cursor-pointer">🇬🇧 Inglés</Label>
              </div>
            </RadioGroup>
          </div>

          {validContacts.length > 0 && validContacts.length <= 10 && (
            <div className="text-xs text-muted-foreground space-y-1 max-h-32 overflow-y-auto border rounded p-2">
              {validContacts.map((c, i) => (
                <div key={i}>{c.full_name} — {c.email}</div>
              ))}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending || validContacts.length === 0}
          >
            {mutation.isPending ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Añadiendo...</>
            ) : (
              `Añadir ${validContacts.length} a ROD`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
