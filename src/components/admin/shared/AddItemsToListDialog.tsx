import React, { useState, useEffect } from 'react';
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
import { Search, ListPlus, Loader2, Check, AlertTriangle } from 'lucide-react';

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

interface DuplicateInfo {
  duplicates: ListItemRow[];
  newItems: ListItemRow[];
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
  const [duplicateInfo, setDuplicateInfo] = useState<DuplicateInfo | null>(null);
  const [checkingDuplicates, setCheckingDuplicates] = useState(false);
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

  // Check duplicates when a list is selected
  useEffect(() => {
    if (!selectedListId || items.length === 0) {
      setDuplicateInfo(null);
      return;
    }

    const checkDuplicates = async () => {
      setCheckingDuplicates(true);
      try {
        // Fetch existing entries in the selected list
        const { data: existing, error } = await (supabase as any)
          .from('outbound_list_companies')
          .select('empresa, email, contacto')
          .eq('list_id', selectedListId)
          .eq('is_deleted', false);

        if (error) throw error;

        const existingSet = new Set(
          (existing || []).map((e: any) => {
            // Match by email (primary) or empresa+contacto combo
            if (e.email && e.email.trim()) return `email:${e.email.trim().toLowerCase()}`;
            return `name:${(e.empresa || '').trim().toLowerCase()}|${(e.contacto || '').trim().toLowerCase()}`;
          })
        );

        const duplicates: ListItemRow[] = [];
        const newItems: ListItemRow[] = [];

        for (const item of items) {
          const emailKey = item.email?.trim() ? `email:${item.email.trim().toLowerCase()}` : null;
          const nameKey = `name:${(item.empresa || '').trim().toLowerCase()}|${(item.contacto || '').trim().toLowerCase()}`;
          
          if ((emailKey && existingSet.has(emailKey)) || existingSet.has(nameKey)) {
            duplicates.push(item);
          } else {
            newItems.push(item);
          }
        }

        setDuplicateInfo({ duplicates, newItems });
      } catch (err) {
        console.error('Error checking duplicates:', err);
        setDuplicateInfo(null);
      } finally {
        setCheckingDuplicates(false);
      }
    };

    checkDuplicates();
  }, [selectedListId, items]);

  const filteredLists = lists.filter(l =>
    !search || l.name.toLowerCase().includes(search.toLowerCase())
  );

  const addMutation = useMutation({
    mutationFn: async ({ listId, itemsToAdd }: { listId: string; itemsToAdd: ListItemRow[] }) => {
      const rows = itemsToAdd.map(item => ({
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
          .update({ contact_count: (list.contact_count || 0) + itemsToAdd.length })
          .eq('id', listId);
      }

      return itemsToAdd.length;
    },
    onSuccess: (count) => {
      const dupCount = duplicateInfo?.duplicates.length || 0;
      const desc = dupCount > 0
        ? `${count} ${itemLabel}(s) añadidos. ${dupCount} duplicado(s) omitidos.`
        : `${count} ${itemLabel}(s) añadidos a la lista.`;
      toast({ title: 'Añadidos correctamente', description: desc });
      queryClient.invalidateQueries({ queryKey: ['outbound-lists'] });
      queryClient.invalidateQueries({ queryKey: ['outbound-list-companies'] });
      onOpenChange(false);
      setSelectedListId(null);
      setSearch('');
      setDuplicateInfo(null);
      onSuccess?.();
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message || 'No se pudieron añadir.', variant: 'destructive' });
    },
  });

  const handleAdd = (includeAll: boolean) => {
    if (!selectedListId) return;
    const itemsToAdd = includeAll ? items : (duplicateInfo?.newItems || items);
    if (itemsToAdd.length === 0) {
      toast({ title: 'Sin registros nuevos', description: 'Todos los registros ya existen en la lista.', variant: 'destructive' });
      return;
    }
    addMutation.mutate({ listId: selectedListId, itemsToAdd });
  };

  const hasDuplicates = duplicateInfo && duplicateInfo.duplicates.length > 0;
  const allDuplicates = duplicateInfo && duplicateInfo.newItems.length === 0 && duplicateInfo.duplicates.length > 0;

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) { setDuplicateInfo(null); setSelectedListId(null); } }}>
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

        {/* Duplicate warning */}
        {selectedListId && checkingDuplicates && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground px-1">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Comprobando duplicados...
          </div>
        )}

        {selectedListId && !checkingDuplicates && hasDuplicates && (
          <div className="rounded-md border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30 p-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-amber-800 dark:text-amber-300">
                  {duplicateInfo!.duplicates.length} duplicado{duplicateInfo!.duplicates.length > 1 ? 's' : ''} detectado{duplicateInfo!.duplicates.length > 1 ? 's' : ''}
                </p>
                <p className="text-amber-700 dark:text-amber-400 mt-0.5 text-xs">
                  {duplicateInfo!.duplicates.slice(0, 3).map(d => d.contacto || d.empresa).join(', ')}
                  {duplicateInfo!.duplicates.length > 3 && ` y ${duplicateInfo!.duplicates.length - 3} más`}
                </p>
              </div>
            </div>
          </div>
        )}

        <DialogFooter className={hasDuplicates ? 'flex-col sm:flex-col gap-2' : ''}>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          
          {hasDuplicates ? (
            <>
              {!allDuplicates && (
                <Button 
                  onClick={() => handleAdd(false)} 
                  disabled={addMutation.isPending}
                >
                  {addMutation.isPending ? (
                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Añadiendo...</>
                  ) : (
                    <><ListPlus className="h-4 w-4 mr-2" />Añadir solo nuevos ({duplicateInfo!.newItems.length})</>
                  )}
                </Button>
              )}
              <Button 
                variant="secondary"
                onClick={() => handleAdd(true)} 
                disabled={addMutation.isPending}
              >
                {addMutation.isPending ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Añadiendo...</>
                ) : (
                  <><ListPlus className="h-4 w-4 mr-2" />Añadir todos ({items.length}) igualmente</>
                )}
              </Button>
            </>
          ) : (
            <Button 
              onClick={() => handleAdd(false)} 
              disabled={!selectedListId || addMutation.isPending || checkingDuplicates}
            >
              {addMutation.isPending ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Añadiendo...</>
              ) : (
                <><ListPlus className="h-4 w-4 mr-2" />Añadir {items.length}</>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};