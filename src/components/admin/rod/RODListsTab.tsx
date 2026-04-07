import React, { useState, useMemo, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Plus, Search, Trash2, Upload, Loader2, Users, X } from 'lucide-react';
import { toast } from 'sonner';

interface RODMember {
  id: string;
  language: string;
  full_name: string;
  email: string | null;
  company: string | null;
  phone: string | null;
  sector: string | null;
  notes: string | null;
  created_at: string;
}

const LANG_TABS = [
  { code: 'es', label: 'Castellano', flag: 'ES' },
  { code: 'en', label: 'Inglés', flag: 'EN' },
];

const RODMembersList: React.FC<{ language: string }> = ({ language }) => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({ full_name: '', email: '', company: '', phone: '', sector: '', notes: '' });
  const fileRef = useRef<HTMLInputElement>(null);

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
      // Batch in chunks of 50
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
    if (!search.trim()) return members;
    const q = search.toLowerCase();
    return members.filter(m =>
      m.full_name?.toLowerCase().includes(q) ||
      m.email?.toLowerCase().includes(q) ||
      m.company?.toLowerCase().includes(q) ||
      m.sector?.toLowerCase().includes(q)
    );
  }, [members, search]);

  const total = members?.length || 0;

  return (
    <div className="space-y-3">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            <Users className="h-3 w-3 mr-1" />
            {total} miembros
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Buscar nombre, email, empresa..."
              className="pl-8 h-8 text-xs"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2">
                <X className="h-3 w-3 text-muted-foreground" />
              </button>
            )}
          </div>
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
                    <TableHead className="text-xs">Nombre</TableHead>
                    <TableHead className="text-xs">Email</TableHead>
                    <TableHead className="text-xs">Empresa</TableHead>
                    <TableHead className="text-xs">Teléfono</TableHead>
                    <TableHead className="text-xs">Sector</TableHead>
                    <TableHead className="text-xs">Notas</TableHead>
                    <TableHead className="text-xs w-10" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map(m => (
                    <TableRow key={m.id}>
                      <TableCell className="text-xs font-medium">{m.full_name}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{m.email || '—'}</TableCell>
                      <TableCell className="text-xs">{m.company || '—'}</TableCell>
                      <TableCell className="text-xs">{m.phone || '—'}</TableCell>
                      <TableCell className="text-xs">{m.sector || '—'}</TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-[150px] truncate">{m.notes || '—'}</TableCell>
                      <TableCell className="text-xs">
                        <button
                          onClick={() => { if (confirm('¿Eliminar este miembro?')) deleteMutation.mutate(m.id); }}
                          className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
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
