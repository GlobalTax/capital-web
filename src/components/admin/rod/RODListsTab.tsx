import React, { useState, useMemo, useRef, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Plus, Search, Trash2, Upload, Loader2, Users, X, Filter, SlidersHorizontal, Link2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Pencil, Check } from 'lucide-react';

// ─── Inline editable cell ───────────────────────────────────────────────
function EditableCell({
  value,
  memberId,
  field,
  language,
  className,
}: {
  value: string | null;
  memberId: string;
  field: ColumnKey;
  language: string;
  className?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(value || '');
  const [saving, setSaving] = useState(false);
  const queryClient = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);

  const display = value && value.trim() && value !== '—' ? value : '—';
  const isEmpty = display === '—';

  const startEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditValue(value || '');
    setEditing(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const save = async () => {
    const newVal = editValue.trim() || null;
    if (newVal === (value || null)) {
      setEditing(false);
      return;
    }
    setSaving(true);
    try {
      const { error } = await supabase
        .from('rod_list_members' as any)
        .update({ [field]: newVal })
        .eq('id', memberId);
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ['rod-list-members', language] });
    } catch {
      toast.error('Error al guardar');
    } finally {
      setSaving(false);
      setEditing(false);
    }
  };

  if (editing) {
    return (
      <div className="flex items-center gap-1">
        <Input
          ref={inputRef}
          value={editValue}
          onChange={e => setEditValue(e.target.value)}
          className="h-6 text-xs px-1.5 min-w-[80px]"
          onKeyDown={e => {
            if (e.key === 'Enter') save();
            if (e.key === 'Escape') setEditing(false);
          }}
          onBlur={save}
          disabled={saving}
        />
      </div>
    );
  }

  return (
    <button
      onClick={startEdit}
      className={cn(
        "text-left text-xs group inline-flex items-center gap-1 rounded px-1 -mx-1 py-0.5 hover:bg-muted transition-colors w-full",
        isEmpty && "text-muted-foreground/50 italic",
        className
      )}
      title="Clic para editar"
    >
      <span className="truncate">{display}</span>
      <Pencil className="h-2.5 w-2.5 text-muted-foreground/30 group-hover:text-muted-foreground shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
    </button>
  );
}

interface RODMember {
  id: string;
  language: string;
  full_name: string;
  email: string | null;
  company: string | null;
  phone: string | null;
  sector: string | null;
  notes: string | null;
  contacto_id: string | null;
  created_at: string;
}

type ColumnKey = 'full_name' | 'email' | 'company' | 'phone' | 'sector' | 'notes';

const ALL_COLUMNS: { key: ColumnKey; label: string }[] = [
  { key: 'full_name', label: 'Nombre' },
  { key: 'email', label: 'Email' },
  { key: 'company', label: 'Empresa' },
  { key: 'phone', label: 'Teléfono' },
  { key: 'sector', label: 'Sector' },
  { key: 'notes', label: 'Notas' },
];

const DEFAULT_VISIBLE: Set<ColumnKey> = new Set(['full_name', 'email', 'company', 'phone', 'sector', 'notes']);

const LANG_TABS = [
  { code: 'es', label: 'Castellano', flag: 'ES' },
  { code: 'en', label: 'Inglés', flag: 'EN' },
];

// ─── Column filter component ────────────────────────────────────────────
function ColumnFilterHeader({
  label,
  columnKey,
  members,
  activeFilter,
  onFilterChange,
}: {
  label: string;
  columnKey: ColumnKey;
  members: RODMember[];
  activeFilter: string | null; // null = all, '__has__' = with data, '__empty__' = without data, or specific value
  onFilterChange: (value: string | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const [filterSearch, setFilterSearch] = useState('');

  const uniqueValues = useMemo(() => {
    const vals = new Set<string>();
    for (const m of members) {
      const v = m[columnKey];
      if (v && v.trim() && v !== '—') vals.add(v);
    }
    return Array.from(vals).sort((a, b) => a.localeCompare(b, 'es'));
  }, [members, columnKey]);

  const filteredValues = useMemo(() => {
    if (!filterSearch.trim()) return uniqueValues.slice(0, 30);
    const q = filterSearch.toLowerCase();
    return uniqueValues.filter(v => v.toLowerCase().includes(q)).slice(0, 30);
  }, [uniqueValues, filterSearch]);

  const hasData = members.filter(m => {
    const v = m[columnKey];
    return v && v.trim() && v !== '—';
  }).length;
  const noData = members.length - hasData;

  return (
    <Popover open={open} onOpenChange={(o) => { setOpen(o); if (!o) setFilterSearch(''); }}>
      <PopoverTrigger asChild>
        <button className={cn(
          "flex items-center gap-1 text-xs hover:text-foreground transition-colors",
          activeFilter ? "text-primary font-semibold" : "text-muted-foreground"
        )}>
          {label}
          <Filter className={cn("h-3 w-3", activeFilter ? "text-primary" : "text-muted-foreground/50")} />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-2" align="start">
        {uniqueValues.length > 8 && (
          <Input
            placeholder="Buscar..."
            className="h-7 text-xs mb-2"
            value={filterSearch}
            onChange={e => setFilterSearch(e.target.value)}
          />
        )}
        <div className="space-y-0.5 max-h-[200px] overflow-y-auto">
          <button
            className={cn("w-full text-left text-xs px-2 py-1 rounded hover:bg-muted", !activeFilter && "bg-muted font-medium")}
            onClick={() => { onFilterChange(null); setOpen(false); }}
          >
            Todos ({members.length})
          </button>
          <button
            className={cn("w-full text-left text-xs px-2 py-1 rounded hover:bg-muted", activeFilter === '__has__' && "bg-muted font-medium")}
            onClick={() => { onFilterChange('__has__'); setOpen(false); }}
          >
            Con dato ({hasData})
          </button>
          <button
            className={cn("w-full text-left text-xs px-2 py-1 rounded hover:bg-muted", activeFilter === '__empty__' && "bg-muted font-medium")}
            onClick={() => { onFilterChange('__empty__'); setOpen(false); }}
          >
            Sin dato ({noData})
          </button>
          {filteredValues.length > 0 && <div className="border-t my-1" />}
          {filteredValues.map(v => (
            <button
              key={v}
              className={cn("w-full text-left text-xs px-2 py-1 rounded hover:bg-muted truncate", activeFilter === v && "bg-muted font-medium")}
              onClick={() => { onFilterChange(v); setOpen(false); }}
              title={v}
            >
              {v}
            </button>
          ))}
        </div>
        {activeFilter && (
          <Button variant="ghost" size="sm" className="w-full h-6 text-xs mt-1" onClick={() => { onFilterChange(null); setOpen(false); }}>
            <X className="h-3 w-3 mr-1" /> Quitar filtro
          </Button>
        )}
      </PopoverContent>
    </Popover>
  );
}

// ─── Column visibility toggle ───────────────────────────────────────────
function ColumnVisibilityToggle({
  visibleColumns,
  onToggle,
}: {
  visibleColumns: Set<ColumnKey>;
  onToggle: (key: ColumnKey) => void;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 text-xs gap-1">
          <SlidersHorizontal className="h-3 w-3" />
          Columnas
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-44 p-2" align="end">
        <p className="text-[11px] font-medium text-muted-foreground mb-1.5">Columnas visibles</p>
        {ALL_COLUMNS.map(col => (
          <label key={col.key} className="flex items-center gap-2 px-1 py-1 text-xs cursor-pointer hover:bg-muted rounded">
            <Checkbox
              checked={visibleColumns.has(col.key)}
              onCheckedChange={() => onToggle(col.key)}
              className="h-3.5 w-3.5"
            />
            {col.label}
          </label>
        ))}
      </PopoverContent>
    </Popover>
  );
}

// ─── Main list component ────────────────────────────────────────────────
const RODMembersList: React.FC<{ language: string }> = ({ language }) => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({ full_name: '', email: '', company: '', phone: '', sector: '', notes: '' });
  const [crmSearch, setCrmSearch] = useState('');
  const [selectedContactoId, setSelectedContactoId] = useState<string | null>(null);
  const [showCrmResults, setShowCrmResults] = useState(false);
  const crmSearchRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [visibleColumns, setVisibleColumns] = useState<Set<ColumnKey>>(new Set(DEFAULT_VISIBLE));
  const [columnFilters, setColumnFilters] = useState<Record<string, string | null>>({});

  const toggleColumn = useCallback((key: ColumnKey) => {
    setVisibleColumns(prev => {
      const next = new Set(prev);
      if (next.has(key) && next.size > 1) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  const setColumnFilter = useCallback((key: string, value: string | null) => {
    setColumnFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const hasActiveColumnFilters = Object.values(columnFilters).some(v => v !== null && v !== undefined);

  const clearAllFilters = useCallback(() => {
    setSearch('');
    setColumnFilters({});
  }, []);

  const { data: members, isLoading } = useQuery({
    queryKey: ['rod-list-members', language],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rod_list_members' as any)
        .select('*')
        .eq('language', language)
        .order('full_name');
      if (error) throw error;
      return (data || []) as unknown as RODMember[];
    },
  });

  const addMutation = useMutation({
    mutationFn: async (member: Partial<RODMember>) => {
      const { error } = await supabase.from('rod_list_members' as any).insert({
        language,
        full_name: member.full_name,
        email: member.email || null,
        company: member.company || null,
        phone: member.phone || null,
        sector: member.sector || null,
        notes: member.notes || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rod-list-members', language] });
      toast.success('Miembro añadido');
      setForm({ full_name: '', email: '', company: '', phone: '', sector: '', notes: '' });
      setAddOpen(false);
    },
    onError: (e: any) => {
      if (e.message?.includes('duplicate')) {
        toast.error('Ya existe un miembro con ese email en este listado');
      } else {
        toast.error('Error al añadir miembro');
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('rod_list_members' as any).delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rod-list-members', language] });
      toast.success('Miembro eliminado');
    },
    onError: () => toast.error('Error al eliminar'),
  });

  const bulkImportMutation = useMutation({
    mutationFn: async (rows: Partial<RODMember>[]) => {
      const payload = rows.map(r => ({
        language,
        full_name: r.full_name || 'Sin nombre',
        email: r.email || null,
        company: r.company || null,
        phone: r.phone || null,
        sector: r.sector || null,
        notes: r.notes || null,
      }));
      let imported = 0;
      for (let i = 0; i < payload.length; i += 50) {
        const chunk = payload.slice(i, i + 50);
        const { error } = await supabase.from('rod_list_members' as any).upsert(chunk, { onConflict: 'language,email', ignoreDuplicates: true });
        if (error) throw error;
        imported += chunk.length;
      }
      return imported;
    },
    onSuccess: (count) => {
      queryClient.invalidateQueries({ queryKey: ['rod-list-members', language] });
      toast.success(`${count} registros importados`);
    },
    onError: () => toast.error('Error en la importación'),
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const text = ev.target?.result as string;
        const lines = text.split('\n').filter(l => l.trim());
        if (lines.length < 2) { toast.error('El archivo no tiene datos'); return; }

        const headers = lines[0].split(/[,;\t]/).map(h => h.trim().toLowerCase().replace(/"/g, ''));
        const nameIdx = headers.findIndex(h => ['nombre', 'name', 'full_name', 'nombre completo'].includes(h));
        const emailIdx = headers.findIndex(h => ['email', 'correo', 'e-mail'].includes(h));
        const companyIdx = headers.findIndex(h => ['empresa', 'company', 'compañia'].includes(h));
        const phoneIdx = headers.findIndex(h => ['telefono', 'phone', 'tel', 'teléfono'].includes(h));
        const sectorIdx = headers.findIndex(h => ['sector'].includes(h));
        const notesIdx = headers.findIndex(h => ['notas', 'notes', 'observaciones'].includes(h));

        if (nameIdx === -1 && emailIdx === -1) {
          toast.error('El CSV debe tener al menos una columna "nombre" o "email"');
          return;
        }

        const rows: Partial<RODMember>[] = [];
        const separator = lines[0].includes('\t') ? '\t' : lines[0].includes(';') ? ';' : ',';

        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(separator).map(c => c.trim().replace(/^"|"$/g, ''));
          const row: Partial<RODMember> = {
            full_name: nameIdx >= 0 ? cols[nameIdx] || '' : '',
            email: emailIdx >= 0 ? cols[emailIdx] || '' : '',
            company: companyIdx >= 0 ? cols[companyIdx] || '' : '',
            phone: phoneIdx >= 0 ? cols[phoneIdx] || '' : '',
            sector: sectorIdx >= 0 ? cols[sectorIdx] || '' : '',
            notes: notesIdx >= 0 ? cols[notesIdx] || '' : '',
          };
          if (row.full_name || row.email) rows.push(row);
        }

        if (rows.length === 0) { toast.error('No se encontraron registros válidos'); return; }
        bulkImportMutation.mutate(rows);
      } catch {
        toast.error('Error al procesar el archivo');
      }
    };
    reader.readAsText(file);
    if (fileRef.current) fileRef.current.value = '';
  };

  const filtered = useMemo(() => {
    if (!members) return [];
    let result = members;

    // Text search
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(m =>
        m.full_name?.toLowerCase().includes(q) ||
        m.email?.toLowerCase().includes(q) ||
        m.company?.toLowerCase().includes(q) ||
        m.sector?.toLowerCase().includes(q)
      );
    }

    // Column filters
    for (const [key, filterVal] of Object.entries(columnFilters)) {
      if (!filterVal) continue;
      result = result.filter(m => {
        const v = m[key as ColumnKey];
        const hasValue = v && v.trim() && v !== '—';
        if (filterVal === '__has__') return hasValue;
        if (filterVal === '__empty__') return !hasValue;
        return v === filterVal;
      });
    }

    return result;
  }, [members, search, columnFilters]);

  const total = members?.length || 0;
  const hasAnyFilter = !!search.trim() || hasActiveColumnFilters;

  return (
    <div className="space-y-3">
      {/* Header bar */}
      <div className="flex flex-col gap-2">
        {/* Search bar - prominent */}
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre, email, empresa o sector..."
            className="pl-10 h-10 text-sm"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
            </button>
          )}
        </div>

        {/* Actions row */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              <Users className="h-3 w-3 mr-1" />
              {hasAnyFilter ? `${filtered.length} de ${total}` : `${total}`} miembros
            </Badge>
            {hasAnyFilter && (
              <Button variant="ghost" size="sm" className="h-7 text-xs px-2" onClick={clearAllFilters}>
                <X className="h-3 w-3 mr-1" /> Limpiar filtros
              </Button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <ColumnVisibilityToggle visibleColumns={visibleColumns} onToggle={toggleColumn} />
            <input ref={fileRef} type="file" accept=".csv,.txt" className="hidden" onChange={handleFileUpload} />
            <Button size="sm" variant="outline" className="text-xs h-8" onClick={() => fileRef.current?.click()} disabled={bulkImportMutation.isPending}>
              <Upload className="h-3 w-3 mr-1" />
              CSV
            </Button>
            <Dialog open={addOpen} onOpenChange={setAddOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="text-xs h-8">
                  <Plus className="h-3 w-3 mr-1" />
                  Añadir
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-sm">Añadir miembro al listado</DialogTitle>
                </DialogHeader>
                <div className="space-y-3">
                  <div>
                    <Label className="text-xs">Nombre *</Label>
                    <Input className="text-sm h-8" value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} placeholder="Nombre completo" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs">Email</Label>
                      <Input className="text-sm h-8" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="email@empresa.com" />
                    </div>
                    <div>
                      <Label className="text-xs">Teléfono</Label>
                      <Input className="text-sm h-8" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+34..." />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs">Empresa</Label>
                      <Input className="text-sm h-8" value={form.company} onChange={e => setForm(f => ({ ...f, company: e.target.value }))} placeholder="Nombre empresa" />
                    </div>
                    <div>
                      <Label className="text-xs">Sector</Label>
                      <Input className="text-sm h-8" value={form.sector} onChange={e => setForm(f => ({ ...f, sector: e.target.value }))} placeholder="Sector" />
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs">Notas</Label>
                    <Input className="text-sm h-8" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Observaciones..." />
                  </div>
                  <Button
                    className="w-full text-xs"
                    size="sm"
                    disabled={!form.full_name.trim() || addMutation.isPending}
                    onClick={() => addMutation.mutate(form)}
                  >
                    {addMutation.isPending ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Plus className="h-3 w-3 mr-1" />}
                    Añadir miembro
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-sm text-muted-foreground">
              {total === 0 ? 'No hay miembros en este listado. Añade personas manualmente o importa un CSV.' : 'No se encontraron resultados.'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {ALL_COLUMNS.filter(c => visibleColumns.has(c.key)).map(col => (
                      <TableHead key={col.key} className="text-xs">
                        <ColumnFilterHeader
                          label={col.label}
                          columnKey={col.key}
                          members={members || []}
                          activeFilter={columnFilters[col.key] || null}
                          onFilterChange={(v) => setColumnFilter(col.key, v)}
                        />
                      </TableHead>
                    ))}
                    <TableHead className="text-xs w-10" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map(m => (
                    <TableRow key={m.id}>
                      {visibleColumns.has('full_name') && (
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            {m.contacto_id ? (
                              <a
                                href={`/admin/contactos/${m.contacto_id}`}
                                className="font-medium text-primary hover:underline cursor-pointer flex items-center gap-1"
                                title="Ver perfil en directorio"
                              >
                                {m.full_name || '—'}
                                <Link2 className="h-3 w-3 text-muted-foreground" />
                              </a>
                            ) : (
                              <EditableCell value={m.full_name} memberId={m.id} field="full_name" language={language} className="font-medium" />
                            )}
                          </div>
                        </TableCell>
                      )}
                      {visibleColumns.has('email') && <TableCell><EditableCell value={m.email} memberId={m.id} field="email" language={language} /></TableCell>}
                      {visibleColumns.has('company') && <TableCell><EditableCell value={m.company} memberId={m.id} field="company" language={language} className="font-medium" /></TableCell>}
                      {visibleColumns.has('phone') && <TableCell><EditableCell value={m.phone} memberId={m.id} field="phone" language={language} /></TableCell>}
                      {visibleColumns.has('sector') && <TableCell><EditableCell value={m.sector} memberId={m.id} field="sector" language={language} /></TableCell>}
                      {visibleColumns.has('notes') && <TableCell className="max-w-[150px]"><EditableCell value={m.notes} memberId={m.id} field="notes" language={language} /></TableCell>}
                      <TableCell className="text-xs">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => { if (confirm('¿Eliminar este miembro?')) deleteMutation.mutate(m.id); }}
                            className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export const RODListsTab: React.FC = () => {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Gestiona las personas que forman parte de cada listado de la Relación de Oportunidades. Puedes añadir miembros manualmente o importar un CSV.
      </p>
      <Tabs defaultValue="es">
        <TabsList>
          {LANG_TABS.map(l => (
            <TabsTrigger key={l.code} value={l.code} className="text-xs gap-1.5">
              <span>{l.flag}</span> {l.label}
            </TabsTrigger>
          ))}
        </TabsList>
        {LANG_TABS.map(l => (
          <TabsContent key={l.code} value={l.code}>
            <RODMembersList language={l.code} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};
