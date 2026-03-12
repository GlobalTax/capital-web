import React, { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  ClipboardList, Plus, Search, MoreHorizontal, Eye, Copy, Archive, Trash2,
} from 'lucide-react';
import { useContactLists, ContactList, ContactListTipo } from '@/hooks/useContactLists';
import { EditableCell } from '@/components/admin/shared/EditableCell';
import { cn } from '@/lib/utils';

const TIPO_BADGES: Record<ContactListTipo, { label: string; className: string }> = {
  compradores: { label: 'Compradores', className: 'bg-blue-50 text-blue-700 border-blue-200' },
  outbound: { label: 'Outbound', className: 'bg-amber-50 text-amber-700 border-amber-200' },
  otros: { label: 'Otros', className: 'bg-slate-50 text-slate-600 border-slate-200' },
};

const ESTADO_BADGES: Record<string, { label: string; className: string }> = {
  borrador: { label: 'Borrador', className: 'bg-muted text-muted-foreground border-border' },
  activa: { label: 'Activa', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  archivada: { label: 'Archivada', className: 'bg-red-50 text-red-700 border-red-200' },
};

export default function ContactListsPage() {
  const navigate = useNavigate();
  const { lists, isLoading, createList, deleteList, duplicateList, updateList } = useContactLists();
  const [search, setSearch] = useState('');
  const [estadoFilter, setEstadoFilter] = useState('all');
  const [tipoFilter, setTipoFilter] = useState('all');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newSector, setNewSector] = useState('');
  const [newTipo, setNewTipo] = useState<ContactListTipo>('outbound');

  const filtered = useMemo(() => {
    let result = lists;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(l => l.name.toLowerCase().includes(q));
    }
    if (estadoFilter !== 'all') result = result.filter(l => l.estado === estadoFilter);
    return result;
  }, [lists, search, estadoFilter]);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    const result = await createList.mutateAsync({
      nombre: newName.trim(),
      descripcion: newDesc.trim() || undefined,
      sector: newSector.trim() || undefined,
    });
    setIsCreateOpen(false);
    setNewName('');
    setNewDesc('');
    setNewSector('');
    navigate(`/admin/listas-contacto/${result.id}`);
  };

  const handleArchive = (list: ContactList) => {
    updateList.mutate({ id: list.id, estado: 'archivada' });
  };

  const handleDelete = (list: ContactList) => {
    if (confirm(`¿Eliminar la lista "${list.name}"? Se perderán todas las empresas asociadas.`)) {
      deleteList.mutate(list.id);
    }
  };

  const handleDuplicate = (list: ContactList) => {
    duplicateList.mutate(list.id);
  };

  const handleInlineSave = useCallback(async (listId: string, field: string, value: string) => {
    await updateList.mutateAsync({ id: listId, [field]: value || null });
  }, [updateList]);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold flex items-center gap-2">
            <ClipboardList className="h-6 w-6" />
            Listas de Contacto
          </h1>
          <p className="text-sm text-muted-foreground">
            Gestiona y depura listas de empresas para tus campañas outbound
          </p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nueva Lista
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4 pb-3">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar por nombre..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
            </div>
            <Select value={estadoFilter} onValueChange={setEstadoFilter}>
              <SelectTrigger className="w-full md:w-[160px]">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent className="bg-background">
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="borrador">Borrador</SelectItem>
                <SelectItem value="activa">Activa</SelectItem>
                <SelectItem value="archivada">Archivada</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center py-16">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16">
              <ClipboardList className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground">No se encontraron listas</p>
              <Button variant="outline" size="sm" className="mt-4" onClick={() => setIsCreateOpen(true)}>
                <Plus className="h-4 w-4 mr-2" /> Crear lista
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Sector</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Nº Empresas</TableHead>
                  <TableHead>Campaña vinculada</TableHead>
                  <TableHead>Fecha creación</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(list => {
                  const estado = ESTADO_BADGES[list.estado] || ESTADO_BADGES.borrador;
                  return (
                    <TableRow
                      key={list.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => navigate(`/admin/listas-contacto/${list.id}`)}
                    >
                      <TableCell>
                        <EditableCell
                          value={list.name}
                          onSave={async (val) => handleInlineSave(list.id, 'name', val)}
                          placeholder="Nombre de la lista"
                          displayClassName="font-medium"
                        />
                      </TableCell>
                      <TableCell>
                        <EditableCell
                          value={list.sector}
                          onSave={async (val) => handleInlineSave(list.id, 'sector', val)}
                          placeholder="Sector"
                          emptyText="—"
                        />
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn('text-xs', estado.className)}>{estado.label}</Badge>
                      </TableCell>
                      <TableCell className="text-right tabular-nums">{list.contact_count}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{list.last_campaign_name || '—'}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(list.created_at).toLocaleDateString('es-ES')}
                      </TableCell>
                      <TableCell onClick={e => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-background">
                            <DropdownMenuItem onClick={() => navigate(`/admin/listas-contacto/${list.id}`)}>
                              <Eye className="h-4 w-4 mr-2" /> Ver detalle
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDuplicate(list)}>
                              <Copy className="h-4 w-4 mr-2" /> Duplicar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleArchive(list)}>
                              <Archive className="h-4 w-4 mr-2" /> Archivar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDelete(list)} className="text-destructive focus:text-destructive">
                              <Trash2 className="h-4 w-4 mr-2" /> Eliminar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nueva Lista de Contacto</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nombre *</Label>
              <Input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Ej: Empresas Sector Salud Q1 2026" />
            </div>
            <div>
              <Label>Descripción</Label>
              <Textarea value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="Descripción opcional..." rows={2} />
            </div>
            <div>
              <Label>Sector</Label>
              <Input value={newSector} onChange={e => setNewSector(e.target.value)} placeholder="Ej: Tecnología, Salud..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancelar</Button>
            <Button onClick={handleCreate} disabled={!newName.trim() || createList.isPending}>
              {createList.isPending ? 'Creando...' : 'Crear lista'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
