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

interface DuplicateCluster {
  id: number;
  contacts: Contact[];
  matchFields: Set<string>; // which fields caused the merge
  keepId: string;
}

function normalize(val: string | undefined | null, field: 'email' | 'cif' | 'phone'): string | null {
  if (!val || !val.trim()) return null;
  if (field === 'email') return val.toLowerCase().trim();
  if (field === 'cif') return val.toUpperCase().trim();
  return val.replace(/[\s\-\.]/g, '').trim();
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

// ---- Union-Find ----
class UnionFind {
  parent: number[];
  rank: number[];
  constructor(n: number) {
    this.parent = Array.from({ length: n }, (_, i) => i);
    this.rank = new Array(n).fill(0);
  }
  find(x: number): number {
    if (this.parent[x] !== x) this.parent[x] = this.find(this.parent[x]);
    return this.parent[x];
  }
  union(a: number, b: number) {
    const ra = this.find(a), rb = this.find(b);
    if (ra === rb) return;
    if (this.rank[ra] < this.rank[rb]) this.parent[ra] = rb;
    else if (this.rank[ra] > this.rank[rb]) this.parent[rb] = ra;
    else { this.parent[rb] = ra; this.rank[ra]++; }
  }
}

function findDuplicateClusters(contacts: Contact[]): DuplicateCluster[] {
  const n = contacts.length;
  if (n === 0) return [];
  const uf = new UnionFind(n);

  // Track which fields caused merges
  const mergeFields = new Map<string, Set<string>>(); // "i-j" -> Set<field>

  for (const field of ['email', 'cif', 'phone'] as const) {
    const map = new Map<string, number[]>();
    for (let i = 0; i < n; i++) {
      const raw = field === 'email' ? contacts[i].email : field === 'cif' ? contacts[i].cif : contacts[i].phone;
      const norm = normalize(raw, field);
      if (!norm) continue;
      const list = map.get(norm) || [];
      // union all in this group with the first
      if (list.length > 0) {
        const first = list[0];
        uf.union(first, i);
        const key = [Math.min(first, i), Math.max(first, i)].join('-');
        if (!mergeFields.has(key)) mergeFields.set(key, new Set());
        mergeFields.get(key)!.add(field);
      }
      list.push(i);
      map.set(norm, list);
    }
  }

  // Group by root
  const groups = new Map<number, number[]>();
  for (let i = 0; i < n; i++) {
    const root = uf.find(i);
    if (!groups.has(root)) groups.set(root, []);
    groups.get(root)!.push(i);
  }

  const FIELD_LABELS: Record<string, string> = { email: 'Email', cif: 'CIF', phone: 'Tel' };

  const clusters: DuplicateCluster[] = [];
  let clusterId = 0;
  for (const [, indices] of groups) {
    if (indices.length < 2) continue;

    // Collect all match fields for this cluster
    const fields = new Set<string>();
    for (let a = 0; a < indices.length; a++) {
      for (let b = a + 1; b < indices.length; b++) {
        const key = [Math.min(indices[a], indices[b]), Math.max(indices[a], indices[b])].join('-');
        const f = mergeFields.get(key);
        if (f) f.forEach(ff => fields.add(FIELD_LABELS[ff] || ff));
      }
    }

    // Sort: best first
    const sorted = indices
      .map(i => contacts[i])
      .sort((a, b) => {
        const diff = fieldsFilled(b) - fieldsFilled(a);
        if (diff !== 0) return diff;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });

    clusters.push({
      id: clusterId++,
      contacts: sorted,
      matchFields: fields,
      keepId: sorted[0].id,
    });
  }

  return clusters;
}

const DuplicatesDialog: React.FC<DuplicatesDialogProps> = ({ allContacts, onDone }) => {
  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const queryClient = useQueryClient();

  const clusters = useMemo(() => (open ? findDuplicateClusters(allContacts) : []), [allContacts, open]);
  const [keepIds, setKeepIds] = useState<Record<number, string>>({});

  const getKeepId = (c: DuplicateCluster) => keepIds[c.id] ?? c.keepId;

  const totalToDelete = clusters.reduce((acc, c) => acc + c.contacts.length - 1, 0);

  const handleDelete = async () => {
    if (totalToDelete === 0) return;
    setIsDeleting(true);
    let deleted = 0;
    let errors = 0;

    for (const cluster of clusters) {
      const keepId = getKeepId(cluster);
      const toRemove = cluster.contacts.filter(c => c.id !== keepId);

      for (const c of toRemove) {
        const table = c.origin === 'valuation' ? 'company_valuations'
          : c.origin === 'advisor' ? 'advisor_valuations'
          : c.origin === 'acquisition' ? 'acquisition_leads'
          : c.origin === 'company_acquisition' ? 'acquisition_leads'
          : 'contact_leads';

        const { error } = await (supabase as any)
          .from(table)
          .update({ is_deleted: true, deleted_at: new Date().toISOString() } as any)
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
              {clusters.length === 0
                ? 'No se han encontrado duplicados.'
                : `${clusters.length} grupo(s) con ${totalToDelete} registro(s) duplicado(s). Se conservará 1 por grupo.`}
            </DialogDescription>
          </DialogHeader>

          {clusters.length > 0 && (
            <ScrollArea className="flex-1 min-h-0 pr-2">
              <div className="space-y-2">
                {clusters.map(cluster => (
                  <Collapsible key={cluster.id}>
                    <CollapsibleTrigger className="flex items-center gap-2 w-full text-left p-2 rounded-md hover:bg-muted/50 text-sm">
                      <ChevronDown className="h-3.5 w-3.5 shrink-0 transition-transform duration-200 [&[data-state=open]]:rotate-180" />
                      {[...cluster.matchFields].map(f => (
                        <Badge key={f} variant="secondary" className="text-[10px]">{f}</Badge>
                      ))}
                      <span className="font-medium truncate">
                        {cluster.contacts[0].name || cluster.contacts[0].email}
                      </span>
                      <span className="ml-auto text-muted-foreground text-xs">{cluster.contacts.length} registros</span>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="pl-6 space-y-1 pb-2">
                        {cluster.contacts.map(c => {
                          const isKept = getKeepId(cluster) === c.id;
                          return (
                            <div
                              key={c.id}
                              className={`flex items-center gap-2 text-xs p-1.5 rounded ${isKept ? 'bg-primary/5 border border-primary/20' : 'opacity-60'}`}
                            >
                              <Checkbox
                                checked={isKept}
                                onCheckedChange={() => setKeepIds(prev => ({ ...prev, [cluster.id]: c.id }))}
                              />
                              <span className="font-medium truncate max-w-[140px]">{c.name}</span>
                              <span className="text-muted-foreground truncate max-w-[160px]">{c.email}</span>
                              {c.cif && <span className="text-muted-foreground text-[10px]">{c.cif}</span>}
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
            {clusters.length > 0 && (
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
