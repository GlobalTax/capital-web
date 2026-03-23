import React, { useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Copy, ChevronDown, Trash2, Loader2 } from 'lucide-react';
import { Contact } from './types';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface DuplicatesDialogProps {
  allContacts: Contact[];
  onDone: () => void;
}

interface DuplicateGroup {
  key: string;
  field: 'email' | 'cif' | 'phone';
  value: string;
  contacts: Contact[];
  keepId: string; // id to keep
}

function normalize(val: string | undefined | null, field: 'email' | 'cif' | 'phone'): string | null {
  if (!val || !val.trim()) return null;
  if (field === 'email') return val.toLowerCase().trim();
  if (field === 'cif') return val.toUpperCase().trim();
  return val.replace(/\s/g, '').trim();
}

function fieldsFilled(c: Contact): number {
  let count = 0;
  if (c.name) count++;
  if (c.email) count++;
  if (c.phone) count++;
  if (c.company) count++;
  if (c.cif) count++;
  if (c.revenue) count++;
  if (c.ebitda) count++;
  if (c.industry) count++;
  if (c.location) count++;
  return count;
}

function findDuplicates(contacts: Contact[]): DuplicateGroup[] {
  const groups: DuplicateGroup[] = [];
  const seen = new Set<string>();

  for (const field of ['email', 'cif', 'phone'] as const) {
    const map = new Map<string, Contact[]>();
    for (const c of contacts) {
      const raw = field === 'email' ? c.email : field === 'cif' ? c.cif : c.phone;
      const norm = normalize(raw, field);
      if (!norm) continue;
      const list = map.get(norm) || [];
      list.push(c);
      map.set(norm, list);
    }
    for (const [value, list] of map.entries()) {
      if (list.length < 2) continue;
      const key = `${field}:${value}`;
      if (seen.has(key)) continue;
      seen.add(key);
      // pick best to keep: most fields filled, then most recent
      const sorted = [...list].sort((a, b) => {
        const diff = fieldsFilled(b) - fieldsFilled(a);
        if (diff !== 0) return diff;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
      groups.push({ key, field, value, contacts: sorted, keepId: sorted[0].id });
    }
  }
  return groups;
}

const FIELD_LABELS: Record<string, string> = { email: 'Email', cif: 'CIF', phone: 'Teléfono' };

const DuplicatesDialog: React.FC<DuplicatesDialogProps> = ({ allContacts, onDone }) => {
  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const queryClient = useQueryClient();

  const groups = useMemo(() => (open ? findDuplicates(allContacts) : []), [allContacts, open]);
  const [keepIds, setKeepIds] = useState<Record<string, string>>({});

  const getKeepId = (g: DuplicateGroup) => keepIds[g.key] ?? g.keepId;

  const totalToDelete = groups.reduce((acc, g) => acc + g.contacts.length - 1, 0);

  const handleDelete = async () => {
    if (totalToDelete === 0) return;
    setIsDeleting(true);
    let deleted = 0;
    let errors = 0;

    for (const g of groups) {
      const keep = getKeepId(g);
      const toRemove = g.contacts.filter(c => c.id !== keep);
      for (const c of toRemove) {
        const table = c.origin === 'valuation' ? 'company_valuations'
          : c.origin === 'advisor' ? 'advisor_valuations'
          : c.origin === 'acquisition' ? 'acquisition_leads'
          : c.origin === 'company_acquisition' ? 'acquisition_leads'
          : 'contact_leads';

        const { error } = await (supabase as any)
          .from(table)
          .update({ is_deleted: true } as any)
          .eq('id', c.id);

        if (error) { errors++; } else { deleted++; }
      }
    }

    await queryClient.invalidateQueries({ queryKey: ['contacts-v2'] });
    toast.success(`${deleted} duplicados eliminados${errors > 0 ? ` (${errors} errores)` : ''}`);
    setIsDeleting(false);
    setOpen(false);
    onDone();
  };

  return (
    <>
      <Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={() => setOpen(true)}>
        <Copy className="h-3 w-3" />
        Duplicados
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Eliminar duplicados</DialogTitle>
            <DialogDescription>
              {groups.length === 0
                ? 'No se han encontrado duplicados.'
                : `${groups.length} grupo(s) con ${totalToDelete} registro(s) duplicado(s) detectados.`}
            </DialogDescription>
          </DialogHeader>

          {groups.length > 0 && (
            <ScrollArea className="flex-1 min-h-0 pr-2">
              <div className="space-y-2">
                {groups.map(g => (
                  <Collapsible key={g.key}>
                    <CollapsibleTrigger className="flex items-center gap-2 w-full text-left p-2 rounded-md hover:bg-muted/50 text-sm">
                      <ChevronDown className="h-3.5 w-3.5 shrink-0 transition-transform duration-200 [&[data-state=open]]:rotate-180" />
                      <Badge variant="secondary" className="text-[10px]">{FIELD_LABELS[g.field]}</Badge>
                      <span className="font-medium truncate">{g.value}</span>
                      <span className="ml-auto text-muted-foreground text-xs">{g.contacts.length} registros</span>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="pl-6 space-y-1 pb-2">
                        {g.contacts.map(c => {
                          const isKept = getKeepId(g) === c.id;
                          return (
                            <div
                              key={c.id}
                              className={`flex items-center gap-2 text-xs p-1.5 rounded ${isKept ? 'bg-primary/5 border border-primary/20' : 'opacity-60'}`}
                            >
                              <Checkbox
                                checked={isKept}
                                onCheckedChange={() => setKeepIds(prev => ({ ...prev, [g.key]: c.id }))}
                              />
                              <span className="font-medium truncate max-w-[140px]">{c.name}</span>
                              <span className="text-muted-foreground truncate max-w-[160px]">{c.email}</span>
                              <Badge variant="outline" className="text-[9px] shrink-0">{c.origin}</Badge>
                              <span className="ml-auto text-muted-foreground text-[10px] shrink-0">
                                {new Date(c.created_at).toLocaleDateString('es')}
                              </span>
                              {isKept && <Badge className="text-[9px] shrink-0 bg-primary/10 text-primary border-0">Conservar</Badge>}
                            </div>
                          );
                        })}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                ))}
              </div>
            </ScrollArea>
          )}

          <DialogFooter>
            <Button variant="ghost" size="sm" onClick={() => setOpen(false)} disabled={isDeleting}>Cancelar</Button>
            {groups.length > 0 && (
              <Button variant="destructive" size="sm" onClick={handleDelete} disabled={isDeleting}>
                {isDeleting ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Trash2 className="h-3 w-3 mr-1" />}
                Eliminar {totalToDelete} duplicados
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DuplicatesDialog;
