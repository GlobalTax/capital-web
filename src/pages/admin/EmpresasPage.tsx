import React, { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, 
  Plus, 
  Search, 
  Target,
  Star,
  X,
  Filter,
  Settings2,
  Zap,
  Globe,
  Calculator,
  ChevronLeft,
  ChevronRight,
  Users,
  ListPlus,
  BookOpen,
} from 'lucide-react';
import { useEmpresas, Empresa } from '@/hooks/useEmpresas';
import { useFavoriteEmpresas } from '@/hooks/useEmpresaFavorites';
import { CompanyFormDialog } from '@/components/admin/companies/CompanyFormDialog';
import { EmpresasTableVirtualized } from '@/components/admin/empresas/EmpresasTableVirtualized';
import { EmpresasStatsCards } from '@/components/admin/empresas/EmpresasStatsCards';
import { EmpresasColumnsEditor } from '@/components/admin/empresas/EmpresasColumnsEditor';
import { ContactosDirectoryTable } from '@/components/admin/empresas/ContactosDirectoryTable';
import { AddContactsToListDialog } from '@/components/admin/empresas/AddContactsToListDialog';
import { AddItemsToListDialog } from '@/components/admin/shared/AddItemsToListDialog';
import { AddToRODDialog, RODContact } from '@/components/admin/shared/AddToRODDialog';
import { useEmpresasStats } from '@/hooks/useEmpresasStats';
import { useDirectorioContactos } from '@/hooks/useDirectorioContactos';

// Quick filter chips
const QUICK_FILTERS = [
  { id: 'with-revenue', label: 'Con Facturación', icon: null, filter: (e: Empresa) => !!e.facturacion },
  { id: 'with-ebitda', label: 'Con EBITDA', icon: null, filter: (e: Empresa) => !!e.ebitda },
  { id: 'sf-potential', label: 'Potencial SF', icon: null, filter: (e: Empresa) => !!e.potencial_search_fund },
  { id: 'with-apollo', label: 'Con Apollo', icon: Globe, filter: (e: Empresa) => !!(e as any).apollo_org_id },
  { id: 'high-intent', label: 'Alto Intent', icon: Zap, filter: (e: Empresa) => (e as any).apollo_intent_level === 'High' },
] as const;

const PAGE_SIZE = 50;

export default function EmpresasPage() {
  // Top-level directory tab
  const [directoryTab, setDirectoryTab] = useState<'empresas' | 'contactos'>('empresas');
  
  // Empresas state
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sectorFilter, setSectorFilter] = useState<string>('all');
  const [targetFilter, setTargetFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [quickFilters, setQuickFilters] = useState<string[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEmpresa, setEditingEmpresa] = useState<Empresa | null>(null);
  const [isColumnsEditorOpen, setIsColumnsEditorOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedEmpresaIds, setSelectedEmpresaIds] = useState<Set<string>>(new Set());
  const [isAddEmpresasToListOpen, setIsAddEmpresasToListOpen] = useState(false);

  // Contactos state
  const [contactosPage, setContactosPage] = useState(0);
  const [contactosCargoFilter, setContactosCargoFilter] = useState('');
  const [contactosSourceFilter, setContactosSourceFilter] = useState<string>('all');
  const [contactosHasEmail, setContactosHasEmail] = useState(false);
  const [selectedContactIds, setSelectedContactIds] = useState<Set<string>>(new Set());
  const [isAddToListOpen, setIsAddToListOpen] = useState(false);
  const [isAddToRODOpen, setIsAddToRODOpen] = useState(false);

  // Lightweight stats (separate count queries)
  const { stats, isLoading: isLoadingStats } = useEmpresasStats();

  // Build server-side filters for "all" tab
  const serverFilters = useMemo(() => ({
    search: searchQuery || undefined,
    sector: sectorFilter !== 'all' ? sectorFilter : undefined,
    esTarget: targetFilter === 'target' ? true : targetFilter === 'no-target' ? false : undefined,
    source: sourceFilter !== 'all' ? sourceFilter : undefined,
    page: currentPage,
    pageSize: PAGE_SIZE,
  }), [searchQuery, sectorFilter, targetFilter, sourceFilter, currentPage]);

  // Only fetch "all" empresas when that tab (or valuations) is active
  const isAllTabActive = activeTab === 'all' || activeTab === 'valuations';
  const { 
    empresas: allEmpresas, 
    totalCount,
    isLoading, 
    sectors, 
    refetch,
    deleteEmpresa 
  } = useEmpresas(serverFilters, isAllTabActive && directoryTab === 'empresas');

  // Favorites - only when favorites tab is active
  const { data: favoriteEmpresas = [], isLoading: isLoadingFavorites } = useFavoriteEmpresas();

  // Targets - only when targets tab is active
  const { empresas: targetEmpresas, totalCount: targetCount, isLoading: isLoadingTargets } = useEmpresas(
    { esTarget: true, page: 0, pageSize: PAGE_SIZE },
    activeTab === 'targets' && directoryTab === 'empresas'
  );

  // Contactos directory
  const {
    contactos,
    totalCount: contactosTotalCount,
    isLoading: isLoadingContactos,
  } = useDirectorioContactos(
    {
      search: directoryTab === 'contactos' ? searchQuery : undefined,
      cargo: contactosCargoFilter || undefined,
      source: contactosSourceFilter !== 'all' ? contactosSourceFilter : undefined,
      hasEmail: contactosHasEmail || undefined,
      page: contactosPage,
      pageSize: PAGE_SIZE,
    },
    directoryTab === 'contactos'
  );

  // Client-side quick filters (applied on top of server results)
  const displayEmpresas = useMemo(() => {
    if (quickFilters.length === 0) return allEmpresas;
    let result = allEmpresas;
    quickFilters.forEach(filterId => {
      const qf = QUICK_FILTERS.find(f => f.id === filterId);
      if (qf) result = result.filter(qf.filter);
    });
    return result;
  }, [allEmpresas, quickFilters]);

  // Valuations filtered from current page results
  const valuationEmpresas = useMemo(() => 
    allEmpresas.filter(e => e.source === 'valuation'),
    [allEmpresas]
  );

  const handleEdit = (empresa: Empresa) => {
    setEditingEmpresa(empresa);
    setIsFormOpen(true);
  };

  const handleDelete = async (empresa: Empresa) => {
    if (confirm(`¿Eliminar la empresa "${empresa.nombre}"? Esta acción no se puede deshacer.`)) {
      await deleteEmpresa(empresa.id);
    }
  };

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    setEditingEmpresa(null);
    refetch();
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingEmpresa(null);
  };

  const toggleQuickFilter = (filterId: string) => {
    setQuickFilters(prev => 
      prev.includes(filterId) ? prev.filter(f => f !== filterId) : [...prev, filterId]
    );
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setSectorFilter('all');
    setTargetFilter('all');
    setSourceFilter('all');
    setQuickFilters([]);
    setCurrentPage(0);
    setContactosPage(0);
  };

  const hasActiveFilters = searchQuery || sectorFilter !== 'all' || targetFilter !== 'all' || sourceFilter !== 'all' || quickFilters.length > 0;
  const hasContactosFilters = searchQuery || contactosCargoFilter || contactosSourceFilter !== 'all' || contactosHasEmail;

  // Reset page when filters change
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(0);
    setContactosPage(0);
  };

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);
  const contactosTotalPages = Math.ceil(contactosTotalCount / PAGE_SIZE);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold flex items-center gap-2">
            <Building2 className="h-6 w-6" />
            Directorio
          </h1>
          <p className="text-sm text-muted-foreground">
            Base de datos de empresas y contactos
          </p>
        </div>
        <div className="flex items-center gap-2">
          {directoryTab === 'empresas' && (
            <>
              <Button variant="outline" size="sm" onClick={() => setIsColumnsEditorOpen(true)}>
                <Settings2 className="h-4 w-4 mr-2" />
                Columnas
              </Button>
              <Button onClick={() => setIsFormOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Nueva Empresa
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Top-level directory tabs */}
      <Tabs value={directoryTab} onValueChange={(v) => { setDirectoryTab(v as 'empresas' | 'contactos'); setCurrentPage(0); setContactosPage(0); }}>
        <TabsList className="w-auto">
          <TabsTrigger value="empresas" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Empresas
            <span className="text-xs bg-muted px-1.5 py-0.5 rounded-full ml-1">
              {stats.total.toLocaleString()}
            </span>
          </TabsTrigger>
          <TabsTrigger value="contactos" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Contactos
            {directoryTab === 'contactos' && contactosTotalCount > 0 && (
              <span className="text-xs bg-muted px-1.5 py-0.5 rounded-full ml-1">
                {contactosTotalCount.toLocaleString()}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        {/* ==================== EMPRESAS TAB ==================== */}
        <TabsContent value="empresas" className="mt-4 space-y-4">
          {/* Stats Cards */}
          <EmpresasStatsCards
            totalFavorites={stats.favorites}
            totalEmpresas={stats.total}
            totalTargets={stats.targets}
            totalFacturacion={stats.totalFacturacion}
            avgEbitda={stats.avgEbitda}
            empresasWithEbitda={stats.empresasWithEbitda}
          />

          {/* Global Filters */}
          <Card>
            <CardContent className="pt-4 pb-3">
              <div className="flex flex-col gap-3">
                <div className="flex flex-col md:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar por nombre, CIF o sector..."
                      value={searchQuery}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  <Select value={sectorFilter} onValueChange={(v) => { setSectorFilter(v); setCurrentPage(0); }}>
                    <SelectTrigger className="w-full md:w-[180px]">
                      <SelectValue placeholder="Sector" />
                    </SelectTrigger>
                    <SelectContent className="bg-background">
                      <SelectItem value="all">Todos los sectores</SelectItem>
                      {sectors.map((sector) => (
                        <SelectItem key={sector} value={sector}>{sector}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={targetFilter} onValueChange={(v) => { setTargetFilter(v); setCurrentPage(0); }}>
                    <SelectTrigger className="w-full md:w-[140px]">
                      <SelectValue placeholder="Estado" />
                    </SelectTrigger>
                    <SelectContent className="bg-background">
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="target">Solo Targets</SelectItem>
                      <SelectItem value="no-target">No Targets</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={sourceFilter} onValueChange={(v) => { setSourceFilter(v); setCurrentPage(0); }}>
                    <SelectTrigger className="w-full md:w-[160px]">
                      <SelectValue placeholder="Origen" />
                    </SelectTrigger>
                    <SelectContent className="bg-background">
                      <SelectItem value="all">Todos los orígenes</SelectItem>
                      <SelectItem value="outbound">Outbound</SelectItem>
                      <SelectItem value="inbound">Inbound</SelectItem>
                      <SelectItem value="valuation">Valoraciones</SelectItem>
                      <SelectItem value="advisor">Asesor</SelectItem>
                      <SelectItem value="apollo">Apollo</SelectItem>
                      <SelectItem value="campaign">Campaña</SelectItem>
                      <SelectItem value="manual">Manual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Quick filters */}
                <div className="flex items-center gap-2 flex-wrap">
                  <Filter className="h-3.5 w-3.5 text-muted-foreground" />
                  {QUICK_FILTERS.map(filter => {
                    const Icon = filter.icon;
                    return (
                      <Badge
                        key={filter.id}
                        variant={quickFilters.includes(filter.id) ? 'default' : 'outline'}
                        className="cursor-pointer text-xs gap-1"
                        onClick={() => toggleQuickFilter(filter.id)}
                      >
                        {Icon && <Icon className="h-3 w-3" />}
                        {filter.label}
                      </Badge>
                    );
                  })}
                  {hasActiveFilters && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
                      onClick={clearAllFilters}
                    >
                      <X className="h-3 w-3 mr-1" />
                      Limpiar filtros
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Selection toolbar for empresas */}
          {selectedEmpresaIds.size > 0 && (
            <div className="flex items-center gap-3 p-3 bg-primary/5 border border-primary/20 rounded-lg">
              <span className="text-sm font-medium">
                {selectedEmpresaIds.size} empresa(s) seleccionada(s)
              </span>
              <Button size="sm" onClick={() => setIsAddEmpresasToListOpen(true)}>
                <ListPlus className="h-4 w-4 mr-2" />
                Añadir a lista
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setSelectedEmpresaIds(new Set())}>
                <X className="h-4 w-4 mr-1" />
                Deseleccionar
              </Button>
            </div>
          )}

          {/* Sub-Tabs */}
          <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); setCurrentPage(0); }} className="w-full">
            <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
              <TabsTrigger value="favorites" className="flex items-center gap-2">
                <Star className="h-4 w-4" />
                <span className="hidden sm:inline">Favoritos</span>
                <span className="text-xs bg-muted px-1.5 py-0.5 rounded-full">
                  {stats.favorites}
                </span>
              </TabsTrigger>
              <TabsTrigger value="all" className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                <span className="hidden sm:inline">Todas</span>
                <span className="text-xs bg-muted px-1.5 py-0.5 rounded-full">
                  {isAllTabActive ? totalCount : stats.total}
                </span>
              </TabsTrigger>
              <TabsTrigger value="valuations" className="flex items-center gap-2">
                <Calculator className="h-4 w-4" />
                <span className="hidden sm:inline">Valoraciones</span>
              </TabsTrigger>
              <TabsTrigger value="targets" className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                <span className="hidden sm:inline">Targets</span>
                <span className="text-xs bg-muted px-1.5 py-0.5 rounded-full">
                  {stats.targets}
                </span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="favorites" className="mt-4">
              <EmpresasTableVirtualized
                empresas={favoriteEmpresas}
                isLoading={isLoadingFavorites}
                showFavorites={true}
                emptyMessage="No hay empresas favoritas"
                onEdit={handleEdit}
                onDelete={handleDelete}
                height={600}
                selectedIds={selectedEmpresaIds}
                onSelectionChange={setSelectedEmpresaIds}
              />
            </TabsContent>

            <TabsContent value="all" className="mt-4">
              <EmpresasTableVirtualized
                empresas={displayEmpresas}
                isLoading={isLoading}
                showFavorites={true}
                emptyMessage="No se encontraron empresas"
                emptyAction={() => setIsFormOpen(true)}
                emptyActionLabel="Crear primera empresa"
                onEdit={handleEdit}
                onDelete={handleDelete}
                height={600}
                selectedIds={selectedEmpresaIds}
                onSelectionChange={setSelectedEmpresaIds}
              />
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 px-2">
                  <p className="text-sm text-muted-foreground">
                    Mostrando {currentPage * PAGE_SIZE + 1}–{Math.min((currentPage + 1) * PAGE_SIZE, totalCount)} de {totalCount.toLocaleString()}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" disabled={currentPage === 0} onClick={() => setCurrentPage(p => p - 1)}>
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Anterior
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      Página {currentPage + 1} de {totalPages}
                    </span>
                    <Button variant="outline" size="sm" disabled={currentPage >= totalPages - 1} onClick={() => setCurrentPage(p => p + 1)}>
                      Siguiente
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="valuations" className="mt-4">
              <EmpresasTableVirtualized
                empresas={valuationEmpresas}
                isLoading={isLoading}
                showFavorites={true}
                emptyMessage="No hay empresas de valoraciones"
                onEdit={handleEdit}
                onDelete={handleDelete}
                height={600}
                selectedIds={selectedEmpresaIds}
                onSelectionChange={setSelectedEmpresaIds}
              />
            </TabsContent>

            <TabsContent value="targets" className="mt-4">
              <EmpresasTableVirtualized
                empresas={targetEmpresas || []}
                isLoading={isLoadingTargets}
                showFavorites={true}
                emptyMessage="No hay empresas marcadas como target"
                onEdit={handleEdit}
                onDelete={handleDelete}
                height={600}
                selectedIds={selectedEmpresaIds}
                onSelectionChange={setSelectedEmpresaIds}
              />
            </TabsContent>
          </Tabs>
        </TabsContent>

        {/* ==================== CONTACTOS TAB ==================== */}
        <TabsContent value="contactos" className="mt-4 space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="pt-4 pb-3">
              <div className="flex flex-col md:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nombre, email, teléfono o cargo..."
                    value={searchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Input
                  placeholder="Filtrar por cargo..."
                  value={contactosCargoFilter}
                  onChange={(e) => { setContactosCargoFilter(e.target.value); setContactosPage(0); }}
                  className="w-full md:w-[180px]"
                />
                <Select value={contactosSourceFilter} onValueChange={(v) => { setContactosSourceFilter(v); setContactosPage(0); }}>
                  <SelectTrigger className="w-full md:w-[160px]">
                    <SelectValue placeholder="Origen" />
                  </SelectTrigger>
                  <SelectContent className="bg-background">
                    <SelectItem value="all">Todos los orígenes</SelectItem>
                    <SelectItem value="manual">Manual</SelectItem>
                    <SelectItem value="lista">Lista</SelectItem>
                    <SelectItem value="apollo">Apollo</SelectItem>
                    <SelectItem value="valuation">Valoración</SelectItem>
                    <SelectItem value="inbound">Inbound</SelectItem>
                    <SelectItem value="campaign">Campaña</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2 mt-3 flex-wrap">
                <Filter className="h-3.5 w-3.5 text-muted-foreground" />
                <Badge
                  variant={contactosHasEmail ? 'default' : 'outline'}
                  className="cursor-pointer text-xs"
                  onClick={() => { setContactosHasEmail(!contactosHasEmail); setContactosPage(0); }}
                >
                  Con email
                </Badge>
                {hasContactosFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
                    onClick={() => {
                      setSearchQuery('');
                      setContactosCargoFilter('');
                      setContactosSourceFilter('all');
                      setContactosHasEmail(false);
                      setContactosPage(0);
                    }}
                  >
                    <X className="h-3 w-3 mr-1" />
                    Limpiar filtros
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Selection toolbar */}
          {selectedContactIds.size > 0 && (
            <div className="flex items-center gap-3 p-3 bg-primary/5 border border-primary/20 rounded-lg">
              <span className="text-sm font-medium">
                {selectedContactIds.size} contacto(s) seleccionado(s)
              </span>
              <Button size="sm" onClick={() => setIsAddToListOpen(true)}>
                <ListPlus className="h-4 w-4 mr-2" />
                Añadir a lista
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setSelectedContactIds(new Set())}>
                Deseleccionar
              </Button>
            </div>
          )}

          {/* Contacts table */}
          <ContactosDirectoryTable
            contactos={contactos}
            isLoading={isLoadingContactos}
            emptyMessage={searchQuery ? 'No se encontraron contactos con esa búsqueda' : 'No hay contactos en el directorio'}
            selectedIds={selectedContactIds}
            onSelectionChange={setSelectedContactIds}
          />

          {/* Pagination */}
          {contactosTotalPages > 1 && (
            <div className="flex items-center justify-between px-2">
              <p className="text-sm text-muted-foreground">
                Mostrando {contactosPage * PAGE_SIZE + 1}–{Math.min((contactosPage + 1) * PAGE_SIZE, contactosTotalCount)} de {contactosTotalCount.toLocaleString()}
              </p>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" disabled={contactosPage === 0} onClick={() => setContactosPage(p => p - 1)}>
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Anterior
                </Button>
                <span className="text-sm text-muted-foreground">
                  Página {contactosPage + 1} de {contactosTotalPages}
                </span>
                <Button variant="outline" size="sm" disabled={contactosPage >= contactosTotalPages - 1} onClick={() => setContactosPage(p => p + 1)}>
                  Siguiente
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Form Dialog */}
      <CompanyFormDialog
        open={isFormOpen}
        onOpenChange={handleFormClose}
        onSuccess={handleFormSuccess}
        empresa={editingEmpresa}
      />

      {/* Columns Editor */}
      <EmpresasColumnsEditor
        open={isColumnsEditorOpen}
        onOpenChange={setIsColumnsEditorOpen}
      />

      {/* Add to List Dialog */}
      <AddContactsToListDialog
        open={isAddToListOpen}
        onOpenChange={setIsAddToListOpen}
        contacts={contactos.filter(c => selectedContactIds.has(c.id))}
        onSuccess={() => setSelectedContactIds(new Set())}
      />

      {/* Add Empresas to List Dialog */}
      <AddItemsToListDialog
        open={isAddEmpresasToListOpen}
        onOpenChange={setIsAddEmpresasToListOpen}
        itemLabel="empresa"
        items={[...displayEmpresas, ...favoriteEmpresas, ...(targetEmpresas || []), ...valuationEmpresas]
          .filter((e, i, arr) => arr.findIndex(x => x.id === e.id) === i)
          .filter(e => selectedEmpresaIds.has(e.id))
          .map(e => ({
            empresa: e.nombre || '',
            cif: e.cif || '',
            facturacion: e.facturacion || null,
            ebitda: e.ebitda || null,
            notas: [e.sector, e.ubicacion].filter(Boolean).join(' | '),
          }))}
        onSuccess={() => setSelectedEmpresaIds(new Set())}
      />
    </div>
  );
}
