import React, { useState } from 'react';
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
import { 
  Building2, 
  Plus, 
  Search, 
  TrendingUp,
  Euro,
  Target,
  Star
} from 'lucide-react';
import { useEmpresas, Empresa } from '@/hooks/useEmpresas';
import { useFavoriteEmpresas } from '@/hooks/useEmpresaFavorites';
import { CompanyFormDialog } from '@/components/admin/companies/CompanyFormDialog';
import { EmpresasTable } from '@/components/admin/empresas/EmpresasTable';
import { formatCompactCurrency } from '@/shared/utils/format';

export default function EmpresasPage() {
  const [activeTab, setActiveTab] = useState('favorites');
  const [searchQuery, setSearchQuery] = useState('');
  const [sectorFilter, setSectorFilter] = useState<string>('all');
  const [targetFilter, setTargetFilter] = useState<string>('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEmpresa, setEditingEmpresa] = useState<Empresa | null>(null);

  // Hook para todas las empresas (con filtros)
  const { 
    empresas, 
    isLoading, 
    sectors, 
    refetch,
    deleteEmpresa 
  } = useEmpresas({
    search: searchQuery,
    sector: sectorFilter !== 'all' ? sectorFilter : undefined,
    esTarget: targetFilter === 'target' ? true : targetFilter === 'no-target' ? false : undefined,
  });

  // Hook para empresas favoritas
  const { data: favoriteEmpresas = [], isLoading: isLoadingFavorites } = useFavoriteEmpresas();

  // Hook para targets (sin otros filtros)
  const { empresas: targetEmpresas, isLoading: isLoadingTargets } = useEmpresas({
    esTarget: true,
  });

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

  // Stats
  const totalEmpresas = empresas.length;
  const totalTargets = targetEmpresas?.length || 0;
  const totalFavorites = favoriteEmpresas.length;
  const totalFacturacion = empresas.reduce((sum, e) => sum + (e.facturacion || 0), 0);
  const avgEbitda = empresas.length > 0 
    ? empresas.reduce((sum, e) => sum + (e.ebitda || 0), 0) / empresas.filter(e => e.ebitda).length 
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
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
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-yellow-500" />
              <span className="text-sm text-muted-foreground">Favoritos</span>
            </div>
            <p className="text-2xl font-bold mt-1">{totalFavorites}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Total</span>
            </div>
            <p className="text-2xl font-bold mt-1">{totalEmpresas}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-green-600" />
              <span className="text-sm text-muted-foreground">Targets</span>
            </div>
            <p className="text-2xl font-bold mt-1">{totalTargets}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Euro className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Facturación</span>
            </div>
            <p className="text-2xl font-bold mt-1">{formatCompactCurrency(totalFacturacion)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">EBITDA Medio</span>
            </div>
            <p className="text-2xl font-bold mt-1">
              {avgEbitda > 0 ? formatCompactCurrency(avgEbitda) : '-'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid">
          <TabsTrigger value="favorites" className="flex items-center gap-2">
            <Star className="h-4 w-4" />
            <span>Favoritos</span>
            <span className="ml-1 text-xs bg-muted px-1.5 py-0.5 rounded-full">
              {totalFavorites}
            </span>
          </TabsTrigger>
          <TabsTrigger value="all" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            <span>Todas</span>
            <span className="ml-1 text-xs bg-muted px-1.5 py-0.5 rounded-full">
              {totalEmpresas}
            </span>
          </TabsTrigger>
          <TabsTrigger value="targets" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            <span>Targets</span>
            <span className="ml-1 text-xs bg-muted px-1.5 py-0.5 rounded-full">
              {totalTargets}
            </span>
          </TabsTrigger>
        </TabsList>

        {/* Tab: Favoritos */}
        <TabsContent value="favorites" className="mt-4">
          <Card>
            <CardContent className="p-0">
              <EmpresasTable
                empresas={favoriteEmpresas}
                isLoading={isLoadingFavorites}
                showFavorites={true}
                emptyMessage="No hay empresas favoritas. Añade empresas desde la pestaña 'Todas'."
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Todas */}
        <TabsContent value="all" className="mt-4 space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="pt-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nombre o CIF..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Select value={sectorFilter} onValueChange={setSectorFilter}>
                  <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Sector" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los sectores</SelectItem>
                    {sectors.map((sector) => (
                      <SelectItem key={sector} value={sector}>
                        {sector}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={targetFilter} onValueChange={setTargetFilter}>
                  <SelectTrigger className="w-full md:w-[150px]">
                    <SelectValue placeholder="Target" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="target">Solo Targets</SelectItem>
                    <SelectItem value="no-target">No Targets</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-0">
              <EmpresasTable
                empresas={empresas}
                isLoading={isLoading}
                showFavorites={true}
                emptyMessage="No se encontraron empresas"
                emptyAction={() => setIsFormOpen(true)}
                emptyActionLabel="Crear primera empresa"
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Targets */}
        <TabsContent value="targets" className="mt-4">
          <Card>
            <CardContent className="p-0">
              <EmpresasTable
                empresas={targetEmpresas || []}
                isLoading={isLoadingTargets}
                showFavorites={true}
                emptyMessage="No hay empresas marcadas como target"
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            </CardContent>
          </Card>
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
