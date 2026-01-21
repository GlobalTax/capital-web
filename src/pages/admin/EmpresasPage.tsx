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
  Filter
} from 'lucide-react';
import { useEmpresas, Empresa } from '@/hooks/useEmpresas';
import { useFavoriteEmpresas } from '@/hooks/useEmpresaFavorites';
import { CompanyFormDialog } from '@/components/admin/companies/CompanyFormDialog';
import { EmpresasTableVirtualized } from '@/components/admin/empresas/EmpresasTableVirtualized';
import { EmpresasStatsCards } from '@/components/admin/empresas/EmpresasStatsCards';

// Quick filter chips
const QUICK_FILTERS = [
  { id: 'with-revenue', label: 'Con Facturación', filter: (e: Empresa) => !!e.facturacion },
  { id: 'with-ebitda', label: 'Con EBITDA', filter: (e: Empresa) => !!e.ebitda },
  { id: 'sf-potential', label: 'Potencial SF', filter: (e: Empresa) => !!e.potencial_search_fund },
] as const;

export default function EmpresasPage() {
  const [activeTab, setActiveTab] = useState('favorites');
  const [searchQuery, setSearchQuery] = useState('');
  const [sectorFilter, setSectorFilter] = useState<string>('all');
  const [targetFilter, setTargetFilter] = useState<string>('all');
  const [quickFilters, setQuickFilters] = useState<string[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEmpresa, setEditingEmpresa] = useState<Empresa | null>(null);

  // Hook para todas las empresas (sin filtros de texto para mantener stats correctas)
  const { 
    empresas: allEmpresas, 
    isLoading, 
    sectors, 
    refetch,
    deleteEmpresa 
  } = useEmpresas();

  // Hook para empresas favoritas
  const { data: favoriteEmpresas = [], isLoading: isLoadingFavorites } = useFavoriteEmpresas();

  // Hook para targets
  const { empresas: targetEmpresas, isLoading: isLoadingTargets } = useEmpresas({
    esTarget: true,
  });

  // Apply filters client-side for better UX
  const filteredEmpresas = useMemo(() => {
    let result = allEmpresas;

    // Text search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(e => 
        e.nombre.toLowerCase().includes(query) ||
        e.cif?.toLowerCase().includes(query) ||
        e.sector?.toLowerCase().includes(query)
      );
    }

    // Sector filter
    if (sectorFilter !== 'all') {
      result = result.filter(e => e.sector === sectorFilter);
    }

    // Target filter
    if (targetFilter === 'target') {
      result = result.filter(e => e.es_target);
    } else if (targetFilter === 'no-target') {
      result = result.filter(e => !e.es_target);
    }

    // Quick filters
    quickFilters.forEach(filterId => {
      const quickFilter = QUICK_FILTERS.find(f => f.id === filterId);
      if (quickFilter) {
        result = result.filter(quickFilter.filter);
      }
    });

    return result;
  }, [allEmpresas, searchQuery, sectorFilter, targetFilter, quickFilters]);

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
      prev.includes(filterId) 
        ? prev.filter(f => f !== filterId)
        : [...prev, filterId]
    );
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setSectorFilter('all');
    setTargetFilter('all');
    setQuickFilters([]);
  };

  const hasActiveFilters = searchQuery || sectorFilter !== 'all' || targetFilter !== 'all' || quickFilters.length > 0;

  // Stats (calculated from all empresas, not filtered)
  const totalEmpresas = allEmpresas.length;
  const totalTargets = targetEmpresas?.length || 0;
  const totalFavorites = favoriteEmpresas.length;
  const totalFacturacion = allEmpresas.reduce((sum, e) => sum + (e.facturacion || 0), 0);
  const empresasWithEbitda = allEmpresas.filter(e => e.ebitda).length;
  const avgEbitda = empresasWithEbitda > 0 
    ? allEmpresas.reduce((sum, e) => sum + (e.ebitda || 0), 0) / empresasWithEbitda 
    : 0;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold flex items-center gap-2">
            <Building2 className="h-6 w-6" />
            Empresas
          </h1>
          <p className="text-sm text-muted-foreground">
            Base de datos de empresas con datos financieros
          </p>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nueva Empresa
        </Button>
      </div>

      {/* Stats Cards */}
      <EmpresasStatsCards
        totalFavorites={totalFavorites}
        totalEmpresas={totalEmpresas}
        totalTargets={totalTargets}
        totalFacturacion={totalFacturacion}
        avgEbitda={avgEbitda}
        empresasWithEbitda={empresasWithEbitda}
      />

      {/* Global Filters - Always visible */}
      <Card>
        <CardContent className="pt-4 pb-3">
          <div className="flex flex-col gap-3">
            {/* Main filters row */}
            <div className="flex flex-col md:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nombre, CIF o sector..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={sectorFilter} onValueChange={setSectorFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Sector" />
                </SelectTrigger>
                <SelectContent className="bg-background">
                  <SelectItem value="all">Todos los sectores</SelectItem>
                  {sectors.map((sector) => (
                    <SelectItem key={sector} value={sector}>
                      {sector}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={targetFilter} onValueChange={setTargetFilter}>
                <SelectTrigger className="w-full md:w-[140px]">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent className="bg-background">
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="target">Solo Targets</SelectItem>
                  <SelectItem value="no-target">No Targets</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Quick filters */}
            <div className="flex items-center gap-2 flex-wrap">
              <Filter className="h-3.5 w-3.5 text-muted-foreground" />
              {QUICK_FILTERS.map(filter => (
                <Badge
                  key={filter.id}
                  variant={quickFilters.includes(filter.id) ? 'default' : 'outline'}
                  className="cursor-pointer text-xs"
                  onClick={() => toggleQuickFilter(filter.id)}
                >
                  {filter.label}
                </Badge>
              ))}
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

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid">
          <TabsTrigger value="favorites" className="flex items-center gap-2">
            <Star className="h-4 w-4" />
            <span className="hidden sm:inline">Favoritos</span>
            <span className="text-xs bg-muted px-1.5 py-0.5 rounded-full">
              {totalFavorites}
            </span>
          </TabsTrigger>
          <TabsTrigger value="all" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            <span className="hidden sm:inline">Todas</span>
            <span className="text-xs bg-muted px-1.5 py-0.5 rounded-full">
              {filteredEmpresas.length}
            </span>
          </TabsTrigger>
          <TabsTrigger value="targets" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            <span className="hidden sm:inline">Targets</span>
            <span className="text-xs bg-muted px-1.5 py-0.5 rounded-full">
              {totalTargets}
            </span>
          </TabsTrigger>
        </TabsList>

        {/* Tab: Favoritos */}
        <TabsContent value="favorites" className="mt-4">
          <EmpresasTableVirtualized
            empresas={favoriteEmpresas}
            isLoading={isLoadingFavorites}
            showFavorites={true}
            emptyMessage="No hay empresas favoritas"
            onEdit={handleEdit}
            onDelete={handleDelete}
            height={450}
          />
        </TabsContent>

        {/* Tab: Todas */}
        <TabsContent value="all" className="mt-4">
          <EmpresasTableVirtualized
            empresas={filteredEmpresas}
            isLoading={isLoading}
            showFavorites={true}
            emptyMessage="No se encontraron empresas"
            emptyAction={() => setIsFormOpen(true)}
            emptyActionLabel="Crear primera empresa"
            onEdit={handleEdit}
            onDelete={handleDelete}
            height={500}
          />
        </TabsContent>

        {/* Tab: Targets */}
        <TabsContent value="targets" className="mt-4">
          <EmpresasTableVirtualized
            empresas={targetEmpresas || []}
            isLoading={isLoadingTargets}
            showFavorites={true}
            emptyMessage="No hay empresas marcadas como target"
            onEdit={handleEdit}
            onDelete={handleDelete}
            height={450}
          />
        </TabsContent>
      </Tabs>

      {/* Form Dialog */}
      <CompanyFormDialog
        open={isFormOpen}
        onOpenChange={handleFormClose}
        onSuccess={handleFormSuccess}
        empresa={editingEmpresa}
      />
    </div>
  );
}
