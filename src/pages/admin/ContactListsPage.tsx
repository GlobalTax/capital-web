import React, { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  ClipboardList, Plus, Search, MoreHorizontal, Eye, Copy, Archive, Trash2,
  Crown, Users, Send, Building2, List, CheckCircle, BarChart3, Megaphone,
  ChevronDown,
} from 'lucide-react';
import { useContactLists, ContactList, ContactListTipo } from '@/hooks/useContactLists';
import { useDebounce } from '@/hooks/useDebounce';
import { EditableCell } from '@/components/admin/shared/EditableCell';
import { cn } from '@/lib/utils';

type ListTab = 'madre' | 'compradores' | 'outbound';

const TIPO_BADGES: Record<ContactListTipo, { label: string; className: string }> = {
  madre: { label: 'Listado Madre', className: 'bg-purple-50 text-purple-700 border-purple-200' },
  compradores: { label: 'Compradores', className: 'bg-blue-50 text-blue-700 border-blue-200' },
  outbound: { label: 'Outbound', className: 'bg-amber-50 text-amber-700 border-amber-200' },
  otros: { label: 'Otros', className: 'bg-slate-50 text-slate-600 border-slate-200' },
};

const ESTADO_BADGES: Record<string, { label: string; className: string }> = {
  borrador: { label: 'Borrador', className: 'bg-muted text-muted-foreground border-border' },
  activa: { label: 'Activa', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  archivada: { label: 'Archivada', className: 'bg-red-50 text-red-700 border-red-200' },
};

const TAB_DEFAULT_TIPO: Record<ListTab, ContactListTipo> = {
  madre: 'outbound',
  compradores: 'compradores',
  outbound: 'outbound',
};

const NO_SECTOR_KEY = '__sin_sector__';

export default function ContactListsPage() {
  const navigate = useNavigate();
  const { lists, isLoading, createList, deleteList, duplicateList, updateList } = useContactLists();
  const [activeTab, setActiveTab] = useState<ListTab>('madre');
  const [search, setSearch] = useState('');
  const [activitySearch, setActivitySearch] = useState('');
  const debouncedActivitySearch = useDebounce(activitySearch, 400);
  const [estadoFilter, setEstadoFilter] = useState('all');
  const [tipoFilter, setTipoFilter] = useState('all');
  const [sectorFilter, setSectorFilter] = useState('all');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newSector, setNewSector] = useState('');
  const [newTipo, setNewTipo] = useState<ContactListTipo>('outbound');
  const [expandedSectors, setExpandedSectors] = useState<Set<string>>(new Set());

  // Activity search query
  const { data: activityMatches } = useQuery({
    queryKey: ['activity-search', debouncedActivitySearch],
    enabled: !!debouncedActivitySearch.trim(),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('outbound_list_companies' as any)
        .select('list_id')
        .ilike('descripcion_actividad', `%${debouncedActivitySearch.trim()}%`);
      if (error) throw error;
      const counts: Record<string, number> = {};
      (data as any[]).forEach((row: any) => {
        counts[row.list_id] = (counts[row.list_id] || 0) + 1;
      });
      return counts;
    },
  });

  // KPI stats
  const kpiStats = useMemo(() => {
    const totalEmpresas = lists.reduce((acc, l) => acc + (l.contact_count || 0), 0);
    const totalListas = lists.length;
    const activas = lists.filter(l => l.estado === 'activa').length;
    const avgEmpresas = totalListas ? Math.round(totalEmpresas / totalListas) : 0;
    const conCampana = lists.filter(l => l.last_campaign_name).length;
    return { totalEmpresas, totalListas, activas, avgEmpresas, conCampana };
  }, [lists]);

  // Tab counts
  const tabCounts = useMemo(() => ({
    madre: lists.filter(l => l.has_children || l.tipo === 'madre').length,
    compradores: lists.filter(l => !l.has_children && l.tipo === 'compradores').length,
    outbound: lists.filter(l => !l.has_children && l.tipo !== 'compradores' && l.tipo !== 'madre').length,
  }), [lists]);

  // Filter by tab first, then other filters
  const filtered = useMemo(() => {
    let result = lists;

    // Tab filter
    switch (activeTab) {
      case 'madre':
        result = result.filter(l => l.has_children || l.tipo === 'madre');
        break;
      case 'compradores':
        result = result.filter(l => !l.has_children && l.tipo === 'compradores');
        break;
      case 'outbound':
        result = result.filter(l => !l.has_children && l.tipo !== 'compradores' && l.tipo !== 'madre');
        break;
    }

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(l => l.name.toLowerCase().includes(q));
    }
    if (estadoFilter !== 'all') result = result.filter(l => l.estado === estadoFilter);
    if (tipoFilter !== 'all') result = result.filter(l => l.tipo === tipoFilter);
    if (sectorFilter !== 'all') {
      if (sectorFilter === NO_SECTOR_KEY) {
        result = result.filter(l => !l.sector || !l.sector.trim());
      } else {
        result = result.filter(l => l.sector === sectorFilter);
      }
    }
    if (debouncedActivitySearch.trim() && activityMatches) {
      result = result.filter(l => activityMatches[l.id]);
    }
    return result;
  }, [lists, activeTab, search, estadoFilter, tipoFilter, sectorFilter, debouncedActivitySearch, activityMatches]);

  // Available sectors for filter (from current tab's lists)
  const availableSectors = useMemo(() => {
    let tabLists = lists;
    switch (activeTab) {
      case 'madre':
        tabLists = tabLists.filter(l => l.has_children || l.tipo === 'madre');
        break;
      case 'compradores':
        tabLists = tabLists.filter(l => !l.has_children && l.tipo === 'compradores');
        break;
      case 'outbound':
        tabLists = tabLists.filter(l => !l.has_children && l.tipo !== 'compradores' && l.tipo !== 'madre');
        break;
    }
    const sectors = new Set<string>();
    let hasEmpty = false;
    tabLists.forEach(l => {
      if (l.sector && l.sector.trim()) sectors.add(l.sector.trim());
      else hasEmpty = true;
    });
    const sorted = Array.from(sectors).sort((a, b) => a.localeCompare(b, 'es'));
    return { sectors: sorted, hasEmpty };
  }, [lists, activeTab]);

  // Group filtered lists by sector (used for madre tab fallback)
  const groupedBySector = useMemo(() => {
    const groups: { sector: string; displayName: string; lists: typeof filtered }[] = [];
    const sectorMap = new Map<string, typeof filtered>();

    filtered.forEach(l => {
      const key = l.sector?.trim() || NO_SECTOR_KEY;
      if (!sectorMap.has(key)) sectorMap.set(key, []);
      sectorMap.get(key)!.push(l);
    });

    const keys = Array.from(sectorMap.keys()).sort((a, b) => {
      if (a === NO_SECTOR_KEY) return 1;
      if (b === NO_SECTOR_KEY) return -1;
      return a.localeCompare(b, 'es');
    });

    keys.forEach(key => {
      groups.push({
        sector: key,
        displayName: key === NO_SECTOR_KEY ? 'Sin sector' : key,
        lists: sectorMap.get(key)!,
      });
    });

    return groups;
  }, [filtered]);

  // Group filtered lists by Lista Madre (for Outbound & Compradores tabs)
  const groupedByMadre = useMemo(() => {
    const madreMap = new Map<string, { madreName: string; madreId: string; lists: typeof filtered }>();
    const orphanLists: typeof filtered = [];

    filtered.forEach(l => {
      if (l.lista_madre_id) {
        if (!madreMap.has(l.lista_madre_id)) {
          const madre = lists.find(m => m.id === l.lista_madre_id);
          madreMap.set(l.lista_madre_id, {
            madreId: l.lista_madre_id,
            madreName: madre?.name || 'Lista Madre desconocida',
            lists: [],
          });
        }
        madreMap.get(l.lista_madre_id)!.lists.push(l);
      } else {
        orphanLists.push(l);
      }
    });

    const groups = Array.from(madreMap.values()).sort((a, b) =>
      a.madreName.localeCompare(b.madreName, 'es')
    );

    return { groups, orphanLists };
  }, [filtered, lists]);

  const toggleSectorCollapse = useCallback((sector: string) => {
    setExpandedSectors(prev => {
      const next = new Set(prev);
      if (next.has(sector)) next.delete(sector);
      else next.add(sector);
      return next;
    });
  }, []);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    const result = await createList.mutateAsync({
      nombre: newName.trim(),
      descripcion: newDesc.trim() || undefined,
      sector: newSector.trim() || undefined,
      tipo: newTipo,
    });
    setIsCreateOpen(false);
    setNewName('');
    setNewDesc('');
    setNewSector('');
    setNewTipo(TAB_DEFAULT_TIPO[activeTab]);
    navigate(`/admin/listas-contacto/${result.id}`);
  };

  const handleOpenCreate = () => {
    setNewTipo(TAB_DEFAULT_TIPO[activeTab]);
    setIsCreateOpen(true);
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

  const renderTableHeaders = () => (
    <TableHeader>
      <TableRow>
        <TableHead>Nombre</TableHead>
        <TableHead>Tipo</TableHead>
        <TableHead>Estado</TableHead>
        <TableHead className="text-right">Nº Empresas</TableHead>
        <TableHead>Campaña vinculada</TableHead>
        {activeTab === 'compradores' && <TableHead>Lista Madre</TableHead>}
        <TableHead>Notas</TableHead>
        <TableHead>Fecha creación</TableHead>
        <TableHead className="w-12" />
      </TableRow>
    </TableHeader>
  );

  const renderListRow = (list: ContactList) => {
    const estado = ESTADO_BADGES[list.estado] || ESTADO_BADGES.borrador;
    const tipo = TIPO_BADGES[list.tipo] || TIPO_BADGES.outbound;
    return (
      <TableRow
        key={list.id}
        className="cursor-pointer hover:bg-muted/50"
        onClick={() => navigate(`/admin/listas-contacto/${list.id}`)}
      >
        <TableCell>
          <div>
            <EditableCell
              value={list.name}
              onSave={async (val) => handleInlineSave(list.id, 'name', val)}
              placeholder="Nombre de la lista"
              displayClassName="font-medium"
            />
            {debouncedActivitySearch.trim() && activityMatches && activityMatches[list.id] && (
              <span className="text-xs text-primary">{activityMatches[list.id]} empresas coinciden</span>
            )}
          </div>
        </TableCell>
        <TableCell>
          <Badge variant="outline" className={cn('text-xs', tipo.className)}>{tipo.label}</Badge>
        </TableCell>
        <TableCell>
          <Badge variant="outline" className={cn('text-xs', estado.className)}>{estado.label}</Badge>
        </TableCell>
        <TableCell className="text-right tabular-nums">{list.contact_count}</TableCell>
        <TableCell className="text-sm text-muted-foreground">{list.last_campaign_name || '—'}</TableCell>
        {activeTab === 'compradores' && (
          <TableCell className="text-sm">
            {list.lista_madre_id ? (() => {
              const madre = lists.find(l => l.id === list.lista_madre_id);
              return madre ? (
                <Badge
                  variant="outline"
                  className="text-xs bg-purple-50 text-purple-700 border-purple-200 cursor-pointer hover:bg-purple-100 transition-colors"
                  onClick={(e) => { e.stopPropagation(); navigate(`/admin/listas-contacto/${madre.id}`); }}
                >
                  <Crown className="h-3 w-3 mr-1" />
                  {madre.name}
                </Badge>
              ) : '—';
            })() : '—'}
          </TableCell>
        )}
        <TableCell>
          <EditableCell
            value={list.notes}
            onSave={async (val) => handleInlineSave(list.id, 'notes', val)}
            placeholder="Añadir nota..."
            emptyText="—"
          />
        </TableCell>
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
  };

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
        <Button onClick={handleOpenCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Nueva Lista
        </Button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { title: 'Total Empresas', value: kpiStats.totalEmpresas.toLocaleString('es-ES'), icon: Building2, iconColor: 'text-blue-600', iconBg: 'bg-blue-50', subtitle: 'En todas las listas' },
          { title: 'Total Listas', value: kpiStats.totalListas, icon: List, iconColor: 'text-slate-600', iconBg: 'bg-slate-100', subtitle: 'Creadas' },
          { title: 'Listas Activas', value: kpiStats.activas, icon: CheckCircle, iconColor: 'text-emerald-600', iconBg: 'bg-emerald-50', subtitle: `${kpiStats.totalListas ? ((kpiStats.activas / kpiStats.totalListas) * 100).toFixed(0) : 0}% del total` },
          { title: 'Media Empresas/Lista', value: kpiStats.avgEmpresas, icon: BarChart3, iconColor: 'text-purple-600', iconBg: 'bg-purple-50', subtitle: 'Promedio' },
          { title: 'Con Campaña', value: kpiStats.conCampana, icon: Megaphone, iconColor: 'text-amber-600', iconBg: 'bg-amber-50', subtitle: 'Listas asignadas' },
        ].map((stat) => (
          <Card key={stat.title} className="shadow-sm">
            <CardContent className="pt-3 pb-2 px-4">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground truncate">{stat.title}</p>
                  <p className="text-xl font-semibold mt-0.5 truncate">{stat.value}</p>
                  <p className="text-[10px] text-muted-foreground/70 mt-0.5 truncate">{stat.subtitle}</p>
                </div>
                <div className={cn("p-2 rounded-lg flex-shrink-0", stat.iconBg)}>
                  <stat.icon className={cn("h-4 w-4", stat.iconColor)} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v as ListTab); setSectorFilter('all'); }}>
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="madre" className="gap-2">
            <Crown className="h-4 w-4" />
            Listados Madre
            <Badge variant="secondary" className="ml-1 h-5 min-w-[20px] px-1.5 text-[10px]">
              {tabCounts.madre}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="compradores" className="gap-2">
            <Users className="h-4 w-4" />
            Potenciales Compradores
            <Badge variant="secondary" className="ml-1 h-5 min-w-[20px] px-1.5 text-[10px]">
              {tabCounts.compradores}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="outbound" className="gap-2">
            <Send className="h-4 w-4" />
            Outbound
            <Badge variant="secondary" className="ml-1 h-5 min-w-[20px] px-1.5 text-[10px]">
              {tabCounts.outbound}
            </Badge>
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4 pb-3">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar por nombre..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
            </div>
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar por actividad... (ej: centro especial empleo, instalación eléctrica)" value={activitySearch} onChange={e => setActivitySearch(e.target.value)} className="pl-9" />
            </div>
            {/* Sector filter */}
            <Select value={sectorFilter} onValueChange={setSectorFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Sector" />
              </SelectTrigger>
              <SelectContent className="bg-background">
                <SelectItem value="all">Todos los sectores</SelectItem>
                {availableSectors.sectors.map(s => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
                {availableSectors.hasEmpty && (
                  <SelectItem value={NO_SECTOR_KEY}>Sin sector</SelectItem>
                )}
              </SelectContent>
            </Select>
            {activeTab === 'outbound' && (
              <Select value={tipoFilter} onValueChange={setTipoFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent className="bg-background">
                  <SelectItem value="all">Todos los tipos</SelectItem>
                  <SelectItem value="outbound">Outbound</SelectItem>
                  <SelectItem value="otros">Otros</SelectItem>
                </SelectContent>
              </Select>
            )}
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

      {/* Table grouped by sector folders */}
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
              <Button variant="outline" size="sm" className="mt-4" onClick={handleOpenCreate}>
                <Plus className="h-4 w-4 mr-2" /> Crear lista
              </Button>
            </div>
          ) : activeTab === 'madre' ? (
            <Table>
              {renderTableHeaders()}
              <TableBody>
                {filtered.map(renderListRow)}
              </TableBody>
            </Table>
          ) : (
            <div className="divide-y divide-border">
              {groupedByMadre.groups.map(group => {
                const isExpanded = expandedSectors.has(group.madreId);
                const totalEmpresas = group.lists.reduce((acc, l) => acc + (l.contact_count || 0), 0);
                return (
                  <Collapsible
                    key={group.madreId}
                    open={isExpanded}
                    onOpenChange={() => toggleSectorCollapse(group.madreId)}
                  >
                    <CollapsibleTrigger className="flex items-center justify-between w-full px-4 py-2.5 hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-2">
                        <Crown className="h-4 w-4 text-purple-600" />
                        <span className="text-sm font-medium">{group.madreName}</span>
                        <Badge variant="secondary" size="sm" className="text-[10px]">
                          {group.lists.length} {group.lists.length === 1 ? 'sublista' : 'sublistas'}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          · {totalEmpresas.toLocaleString('es-ES')} empresas
                        </span>
                      </div>
                      <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", isExpanded && "rotate-180")} />
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <Table>
                        {renderTableHeaders()}
                        <TableBody>
                          {group.lists.map(renderListRow)}
                        </TableBody>
                      </Table>
                    </CollapsibleContent>
                  </Collapsible>
                );
              })}
              {groupedByMadre.orphanLists.length > 0 && (
                <>
                  {groupedByMadre.groups.length > 0 && (
                    <div className="px-4 py-2 text-xs text-muted-foreground font-medium bg-muted/30">
                      Sin lista madre vinculada
                    </div>
                  )}
                  <Table>
                    {renderTableHeaders()}
                    <TableBody>
                      {groupedByMadre.orphanLists.map(renderListRow)}
                    </TableBody>
                  </Table>
                </>
              )}
            </div>
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
              <Label>Tipo de lista *</Label>
              <Select value={newTipo} onValueChange={(v) => setNewTipo(v as ContactListTipo)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent className="bg-background">
                  <SelectItem value="madre">Listado Madre</SelectItem>
                  <SelectItem value="compradores">Potenciales compradores</SelectItem>
                  <SelectItem value="outbound">Outbound</SelectItem>
                  <SelectItem value="otros">Otros</SelectItem>
                </SelectContent>
              </Select>
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