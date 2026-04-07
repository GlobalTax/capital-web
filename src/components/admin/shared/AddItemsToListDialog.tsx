import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Search, ListPlus, Loader2, Check } from 'lucide-react';

export interface ListItemRow {
  empresa: string;
  contacto?: string;
  email?: string;
  telefono?: string;
  notas?: string;
  cif?: string;
  facturacion?: number | null;
  ebitda?: number | null;
}

interface AddItemsToListDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: ListItemRow[];
  itemLabel?: string;
  onSuccess?: () => void;
}

export const AddItemsToListDialog: React.FC<AddItemsToListDialogProps> = ({
  open, onOpenChange, items, itemLabel = 'registro', onSuccess,
}) => {
  const [search, setSearch] = useState('');
  const [selectedListId, setSelectedListId] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: lists = [], isLoading: listsLoading } = useQuery({
    queryKey: ['outbound-lists-picker'],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('outbound_lists')
        .select('id, name, sector, contact_count, lista_madre_id')
        .eq('is_active', true)
        .order('name');
      if (error) throw error;
      return data as { id: string; name: string; sector: string | null; contact_count: number; lista_madre_id: string | null }[];
    },
    enabled: open,
  });

  const filteredLists = lists.filter(l =>
    !search || l.name.toLowerCase().includes(search.toLowerCase())
  );

  const addMutation = useMutation({
    mutationFn: async (listId: string) => {
      const rows = items.map(item => ({
        list_id: listId,
        empresa: item.empresa || '',
        contacto: item.contacto || '',
        email: item.email || '',
        telefono: item.telefono || '',
        notas: item.notas || '',
        cif: item.cif || '',
        facturacion: item.facturacion || null,
        ebitda: item.ebitda || null,
      }));

      // Insert in batches of 50 to avoid statement timeout
      const BATCH_SIZE = 50;
      for (let i = 0; i < rows.length; i += BATCH_SIZE) {
        const batch = rows.slice(i, i + BATCH_SIZE);
        const { error } = await (supabase as any)
          .from('outbound_list_companies')
          .insert(batch);
        if (error) throw error;
      }

      const list = lists.find(l => l.id === listId);
      if (list) {
        await (supabase as any)
          .from('outbound_lists')
          .update({ contact_count: (list.contact_count || 0) + items.length })
          .eq('id', listId);
      }
    },
    onSuccess: () => {
      toast({ title: 'Añadidos correctamente', description: `${items.length} ${itemLabel}(s) añadidos a la lista.` });
      queryClient.invalidateQueries({ queryKey: ['outbound-lists'] });
      onOpenChange(false);
      setSelectedListId(null);
      setSearch('');
      onSuccess?.();
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message || 'No se pudieron añadir.', variant: 'destructive' });
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ListPlus className="h-5 w-5" />
            Añadir a lista
          </DialogTitle>
          <DialogDescription>
            {items.length} {itemLabel}(s) seleccionado(s). Elige la lista destino.
          </DialogDescription>
        </DialogHeader>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar lista..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>

        <ScrollArea className="max-h-[300px]">
          {listsLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
          ) : filteredLists.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-8">No se encontraron listas</p>
          ) : (
            <div className="space-y-1">
              {filteredLists.map(list => (
                <button
                  key={list.id}
                  onClick={() => setSelectedListId(list.id)}
                  className={`w-full text-left px-3 py-2.5 rounded-md text-sm transition-colors flex items-center justify-between gap-2 ${
                    selectedListId === list.id ? 'bg-primary/10 border border-primary/30' : 'hover:bg-muted/50 border border-transparent'
                  }`}
                >
                  <div className="min-w-0">
                    <p className="font-medium truncate">{list.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {list.sector && <Badge variant="outline" className="text-xs">{list.sector}</Badge>}
                      <span className="text-xs text-muted-foreground">{list.contact_count || 0} contactos</span>
                      {list.lista_madre_id && <Badge variant="secondary" className="text-xs">Sublista</Badge>}
                    </div>
                  </div>
                  {selectedListId === list.id && <Check className="h-4 w-4 text-primary shrink-0" />}
                </button>
              ))}
            </div>
          )}
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={() => selectedListId && addMutation.mutate(selectedListId)} disabled={!selectedListId || addMutation.isPending}>
            {addMutation.isPending ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Añadiendo...</>
            ) : (
              <><ListPlus className="h-4 w-4 mr-2" />Añadir {items.length}</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
