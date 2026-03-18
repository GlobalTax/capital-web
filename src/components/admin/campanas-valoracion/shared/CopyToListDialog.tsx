import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { List, Loader2, Search, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { CampaignCompany } from '@/hooks/useCampaignCompanies';

interface CopyToListDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCompanies: CampaignCompany[];
}

export function CopyToListDialog({ open, onOpenChange, selectedCompanies }: CopyToListDialogProps) {
  const [selectedListId, setSelectedListId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showNewList, setShowNewList] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [newListSector, setNewListSector] = useState('');

  const { data: lists = [], refetch: refetchLists } = useQuery({
    queryKey: ['outbound-lists-for-copy'],
    enabled: open,
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('outbound_lists')
        .select('id, name, sector, contact_count')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as { id: string; name: string; sector: string | null; contact_count: number }[];
    },
  });

  const filteredLists = useMemo(() => {
    if (!searchQuery.trim()) return lists;
    const q = searchQuery.toLowerCase();
    return lists.filter(l => l.name.toLowerCase().includes(q) || (l.sector || '').toLowerCase().includes(q));
  }, [lists, searchQuery]);

  const handleCreateList = async () => {
    if (!newListName.trim()) return;
    setIsLoading(true);
    try {
      const { data, error } = await (supabase as any)
        .from('outbound_lists')
        .insert({ name: newListName.trim(), sector: newListSector.trim() || null })
        .select('id')
        .single();
      if (error) throw error;
      setSelectedListId(data.id);
      setShowNewList(false);
      setNewListName('');
      setNewListSector('');
      await refetchLists();
      toast.success('Lista creada');
    } catch (err: any) {
      toast.error('Error al crear lista: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!selectedListId || selectedCompanies.length === 0) return;
    setIsLoading(true);
    try {
      // Get existing CIFs in target list
      const { data: existing, error: fetchErr } = await (supabase as any)
        .from('outbound_list_companies')
        .select('cif')
        .eq('list_id', selectedListId);
      if (fetchErr) throw fetchErr;

      const existingCifs = new Set(
        (existing || []).filter((r: any) => r.cif).map((r: any) => r.cif.toUpperCase().trim())
      );

      // Map and deduplicate
      const toInsert: any[] = [];
      let duplicates = 0;

      for (const c of selectedCompanies) {
        const cif = c.client_cif?.toUpperCase().trim();
        if (cif && existingCifs.has(cif)) {
          duplicates++;
          continue;
        }
        if (cif) existingCifs.add(cif); // prevent intra-batch dupes

        toInsert.push({
          list_id: selectedListId,
          empresa: c.client_company || '',
          contacto: c.client_name || '',
          email: c.client_email || '',
          telefono: c.client_phone || '',
          cif: c.client_cif || '',
          web: c.client_website || '',
          provincia: c.client_provincia || '',
          facturacion: c.revenue || null,
          ebitda: c.ebitda || null,
        });
      }

      // Batch insert (50 at a time)
      const BATCH = 50;
      for (let i = 0; i < toInsert.length; i += BATCH) {
        const batch = toInsert.slice(i, i + BATCH);
        const { error: insertErr } = await (supabase as any)
          .from('outbound_list_companies')
          .insert(batch);
        if (insertErr) throw insertErr;
      }

      // Update contact_count
      await (supabase as any)
        .from('outbound_lists')
        .update({ contact_count: (existing?.length || 0) + toInsert.length })
        .eq('id', selectedListId);

      const parts: string[] = [];
      if (toInsert.length > 0) parts.push(`${toInsert.length} copiada${toInsert.length !== 1 ? 's' : ''}`);
      if (duplicates > 0) parts.push(`${duplicates} duplicada${duplicates !== 1 ? 's' : ''} omitida${duplicates !== 1 ? 's' : ''}`);
      toast.success(parts.join(', '));

      onOpenChange(false);
      setSelectedListId('');
      setSearchQuery('');
    } catch (err: any) {
      toast.error('Error al copiar: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const selectedListName = lists.find(l => l.id === selectedListId)?.name;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <List className="h-5 w-5" />
            Copiar {selectedCompanies.length} empresa{selectedCompanies.length !== 1 ? 's' : ''} a lista
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar lista..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* List selector */}
          <div className="max-h-52 overflow-y-auto border rounded-md divide-y">
            {filteredLists.map(list => (
              <button
                key={list.id}
                onClick={() => setSelectedListId(list.id)}
                className={`w-full text-left px-3 py-2 text-sm hover:bg-muted/50 flex items-center justify-between transition-colors ${
                  selectedListId === list.id ? 'bg-primary/10 font-medium' : ''
                }`}
              >
                <span className="truncate">{list.name}</span>
                <div className="flex items-center gap-2 shrink-0 ml-2">
                  {list.sector && <Badge variant="outline" className="text-xs">{list.sector}</Badge>}
                  <span className="text-xs text-muted-foreground">{list.contact_count || 0}</span>
                </div>
              </button>
            ))}
            {filteredLists.length === 0 && (
              <p className="text-sm text-muted-foreground p-3 text-center">Sin resultados</p>
            )}
          </div>

          {/* Create new list */}
          {!showNewList ? (
            <Button variant="ghost" size="sm" onClick={() => setShowNewList(true)} className="w-full">
              <Plus className="h-4 w-4 mr-1" /> Crear nueva lista
            </Button>
          ) : (
            <div className="space-y-2 p-3 border rounded-md bg-muted/30">
              <Label className="text-xs">Nombre</Label>
              <Input value={newListName} onChange={e => setNewListName(e.target.value)} placeholder="Nombre de la lista" />
              <Label className="text-xs">Sector (opcional)</Label>
              <Input value={newListSector} onChange={e => setNewListSector(e.target.value)} placeholder="Sector" />
              <div className="flex gap-2 justify-end">
                <Button variant="ghost" size="sm" onClick={() => setShowNewList(false)}>Cancelar</Button>
                <Button size="sm" onClick={handleCreateList} disabled={!newListName.trim() || isLoading}>
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Crear'}
                </Button>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleCopy} disabled={!selectedListId || isLoading}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <List className="h-4 w-4 mr-1" />}
            Copiar a {selectedListName ? `"${selectedListName}"` : 'lista'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
