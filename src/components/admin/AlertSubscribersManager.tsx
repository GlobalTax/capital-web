import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Trash2, Loader2, Bell, BookOpen } from 'lucide-react';
import { AddToRODDialog, type RODContact } from '@/components/admin/shared/AddToRODDialog';
import { format } from 'date-fns';

interface BuyerPreference {
  id: string;
  full_name: string | null;
  email: string;
  phone: string | null;
  company: string | null;
  preferred_sectors: string[] | null;
  preferred_locations: string[] | null;
  min_valuation: number | null;
  max_valuation: number | null;
  alert_frequency: string | null;
  is_active: boolean | null;
  created_at: string | null;
}

const formatValuation = (v: number | null) => {
  if (v == null) return null;
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M€`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(0)}K€`;
  return `${v.toLocaleString('es-ES')}€`;
};

const FREQ_LABELS: Record<string, string> = {
  immediate: 'Inmediata',
  daily: 'Diaria',
  weekly: 'Semanal',
  monthly: 'Mensual',
};

export const AlertSubscribersManager: React.FC = () => {
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [rodDialogOpen, setRodDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: subscribers = [], isLoading } = useQuery({
    queryKey: ['buyer-preferences'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('buyer_preferences')
        .select('id, full_name, email, phone, company, preferred_sectors, preferred_locations, min_valuation, max_valuation, alert_frequency, is_active, created_at')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []) as BuyerPreference[];
    },
  });

  const filtered = useMemo(() => {
    if (!search.trim()) return subscribers;
    const q = search.toLowerCase();
    return subscribers.filter(s =>
      (s.full_name || '').toLowerCase().includes(q) ||
      s.email.toLowerCase().includes(q) ||
      (s.company || '').toLowerCase().includes(q)
    );
  }, [subscribers, search]);

  const allSelected = filtered.length > 0 && filtered.every(s => selectedIds.has(s.id));

  const toggleAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map(s => s.id)));
    }
  };

  const toggleOne = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      const { error } = await supabase
        .from('buyer_preferences')
        .delete()
        .in('id', ids);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buyer-preferences'] });
      setSelectedIds(new Set());
      toast.success('Suscriptores eliminados');
    },
    onError: () => toast.error('Error al eliminar suscriptores'),
  });

  const handleBulkDelete = () => {
    const ids = Array.from(selectedIds);
    if (!ids.length) return;
    if (!window.confirm(`¿Eliminar ${ids.length} suscriptor${ids.length > 1 ? 'es' : ''}?`)) return;
    bulkDeleteMutation.mutate(ids);
  };

  const rodContacts: RODContact[] = useMemo(() => {
    return filtered
      .filter(s => selectedIds.has(s.id))
      .map(s => ({
        full_name: s.full_name || s.email,
        email: s.email,
        company: s.company || undefined,
        phone: s.phone || undefined,
      }));
  }, [filtered, selectedIds]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre, email o empresa..."
              className="pl-9 h-9 text-sm"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="text-xs text-muted-foreground whitespace-nowrap">
            {subscribers.length} suscriptor{subscribers.length !== 1 ? 'es' : ''}
          </div>
        </div>

        {/* Bulk actions bar */}
        {selectedIds.size > 0 && (
          <div className="flex items-center gap-3 p-2 bg-muted/50 rounded-md text-sm">
            <span className="font-medium">{selectedIds.size} seleccionado{selectedIds.size > 1 ? 's' : ''}</span>
            <Button size="sm" variant="outline" onClick={() => setRodDialogOpen(true)} className="gap-1 h-7 text-xs">
              <BookOpen className="h-3.5 w-3.5" /> Añadir a ROD
            </Button>
            <Button size="sm" variant="destructive" onClick={handleBulkDelete} disabled={bulkDeleteMutation.isPending} className="gap-1 h-7 text-xs">
              <Trash2 className="h-3.5 w-3.5" /> Eliminar
            </Button>
          </div>
        )}

        {/* Table */}
        {filtered.length === 0 ? (
          <div className="text-center py-16 space-y-3">
            <Bell className="h-10 w-10 mx-auto text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">
              {subscribers.length === 0
                ? 'Aún no hay suscriptores de alertas. Aparecerán aquí cuando los usuarios se registren desde /oportunidades.'
                : 'No se encontraron resultados para la búsqueda.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table density="compact">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8 px-2">
                    <Checkbox checked={allSelected} onCheckedChange={toggleAll} />
                  </TableHead>
                  <TableHead className="text-xs">Nombre</TableHead>
                  <TableHead className="text-xs">Email</TableHead>
                  <TableHead className="text-xs">Teléfono</TableHead>
                  <TableHead className="text-xs">Empresa</TableHead>
                  <TableHead className="text-xs">Sectores</TableHead>
                  <TableHead className="text-xs">Ubicaciones</TableHead>
                  <TableHead className="text-xs">Rango Valoración</TableHead>
                  <TableHead className="text-xs">Frecuencia</TableHead>
                  <TableHead className="text-xs">Estado</TableHead>
                  <TableHead className="text-xs">Fecha</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(s => {
                  const minV = formatValuation(s.min_valuation);
                  const maxV = formatValuation(s.max_valuation);
                  const range = minV && maxV ? `${minV} – ${maxV}` : minV ? `≥ ${minV}` : maxV ? `≤ ${maxV}` : '—';

                  return (
                    <TableRow key={s.id}>
                      <TableCell className="w-8 px-2">
                        <Checkbox checked={selectedIds.has(s.id)} onCheckedChange={() => toggleOne(s.id)} />
                      </TableCell>
                      <TableCell className="text-xs font-medium">{s.full_name || '—'}</TableCell>
                      <TableCell className="text-xs">{s.email}</TableCell>
                      <TableCell className="text-xs">{s.phone || '—'}</TableCell>
                      <TableCell className="text-xs">{s.company || '—'}</TableCell>
                      <TableCell className="text-xs max-w-[140px]">
                        {s.preferred_sectors?.length ? (
                          <div className="flex flex-wrap gap-1">
                            {s.preferred_sectors.slice(0, 2).map((sec, i) => (
                              <span key={i} className="bg-muted px-1.5 py-0.5 rounded text-[10px]">{sec}</span>
                            ))}
                            {s.preferred_sectors.length > 2 && (
                              <span className="text-[10px] text-muted-foreground">+{s.preferred_sectors.length - 2}</span>
                            )}
                          </div>
                        ) : '—'}
                      </TableCell>
                      <TableCell className="text-xs max-w-[120px]">
                        {s.preferred_locations?.length ? (
                          <div className="flex flex-wrap gap-1">
                            {s.preferred_locations.slice(0, 2).map((loc, i) => (
                              <span key={i} className="bg-muted px-1.5 py-0.5 rounded text-[10px]">{loc}</span>
                            ))}
                            {s.preferred_locations.length > 2 && (
                              <span className="text-[10px] text-muted-foreground">+{s.preferred_locations.length - 2}</span>
                            )}
                          </div>
                        ) : '—'}
                      </TableCell>
                      <TableCell className="text-xs whitespace-nowrap">{range}</TableCell>
                      <TableCell className="text-xs">{FREQ_LABELS[s.alert_frequency || ''] || s.alert_frequency || '—'}</TableCell>
                      <TableCell className="text-xs">
                        <Badge variant={s.is_active ? 'default' : 'secondary'} className="text-[10px]">
                          {s.is_active ? 'Activo' : 'Inactivo'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs whitespace-nowrap">
                        {s.created_at ? format(new Date(s.created_at), 'dd/MM/yyyy') : '—'}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}

        {/* ROD Dialog */}
        <AddToRODDialog open={rodDialogOpen} onOpenChange={setRodDialogOpen} contacts={rodContacts} />
      </CardContent>
    </Card>
  );
};
