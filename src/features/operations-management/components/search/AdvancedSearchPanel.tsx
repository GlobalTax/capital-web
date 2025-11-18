import React, { useState } from 'react';
import { useAdvancedSearch } from '../../hooks/useAdvancedSearch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Search,
  X,
  Save,
  Download,
  Filter,
  Trash2,
  Star,
} from 'lucide-react';
import { AdvancedSearchFilters } from '../../types/history';
import { useAdminUsers } from '@/hooks/useAdminUsers';
import { Separator } from '@/components/ui/separator';

export const AdvancedSearchPanel: React.FC = () => {
  const {
    filters,
    setFilters,
    results,
    totalCount,
    isLoading,
    hasActiveFilters,
    savedSearches,
    saveSearch,
    deleteSearch,
    isSaving,
    clearFilters,
    applySearch,
  } = useAdvancedSearch();

  const { users: adminUsers } = useAdminUsers();
  const [searchName, setSearchName] = useState('');
  const [isShared, setIsShared] = useState(false);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);

  const handleSaveSearch = () => {
    if (searchName.trim()) {
      saveSearch({ name: searchName, isShared });
      setSearchName('');
      setIsShared(false);
      setSaveDialogOpen(false);
    }
  };

  const exportToCSV = () => {
    const headers = ['Empresa', 'Sector', 'Valoración', 'Revenue', 'EBITDA', 'Estado', 'Año'];
    const rows = results.map((op) => [
      op.company_name,
      op.sector,
      op.valuation_amount,
      op.revenue_amount || '',
      op.ebitda_amount || '',
      op.status || '',
      op.year,
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.join(',')),
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `operaciones-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const updateFilter = <K extends keyof AdvancedSearchFilters>(
    key: K,
    value: AdvancedSearchFilters[K]
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const removeFilter = (key: keyof AdvancedSearchFilters) => {
    setFilters((prev) => {
      const newFilters = { ...prev };
      delete newFilters[key];
      return newFilters;
    });
  };

  const activeFilterCount = Object.keys(filters).length;

  return (
    <div className="space-y-4">
      {/* Saved Searches */}
      {savedSearches.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Star className="h-4 w-4" />
              Búsquedas Guardadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {savedSearches.map((search) => (
                <Badge
                  key={search.id}
                  variant="secondary"
                  className="cursor-pointer hover:bg-secondary/80 pr-1"
                >
                  <span onClick={() => applySearch(search)}>{search.name}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 ml-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteSearch(search.id);
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Search Panel */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Búsqueda Avanzada
              {activeFilterCount > 0 && (
                <Badge variant="secondary">{activeFilterCount} filtros</Badge>
              )}
            </CardTitle>
            <div className="flex gap-2">
              {hasActiveFilters && (
                <>
                  <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Save className="h-4 w-4 mr-2" />
                        Guardar
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Guardar Búsqueda</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label>Nombre de la búsqueda</Label>
                          <Input
                            value={searchName}
                            onChange={(e) => setSearchName(e.target.value)}
                            placeholder="Ej: Operaciones de tecnología +5M€"
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="shared">Compartir con el equipo</Label>
                          <Switch
                            id="shared"
                            checked={isShared}
                            onCheckedChange={setIsShared}
                          />
                        </div>
                        <Button
                          onClick={handleSaveSearch}
                          disabled={!searchName.trim() || isSaving}
                          className="w-full"
                        >
                          Guardar Búsqueda
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                  <Button variant="outline" size="sm" onClick={exportToCSV}>
                    <Download className="h-4 w-4 mr-2" />
                    Exportar
                  </Button>
                  <Button variant="outline" size="sm" onClick={clearFilters}>
                    <X className="h-4 w-4 mr-2" />
                    Limpiar
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px] pr-4">
            <div className="space-y-6">
              {/* Full-text search */}
              <div className="space-y-2">
                <Label>Búsqueda por texto</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar en nombre de empresa, descripción..."
                    value={filters.search || ''}
                    onChange={(e) => updateFilter('search', e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <Separator />

              {/* Valuation range */}
              <div className="space-y-3">
                <Label>Rango de Valoración (M€)</Label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Input
                      type="number"
                      placeholder="Mínimo"
                      value={filters.valuation_min || ''}
                      onChange={(e) =>
                        updateFilter('valuation_min', Number(e.target.value) * 1000000)
                      }
                    />
                  </div>
                  <div>
                    <Input
                      type="number"
                      placeholder="Máximo"
                      value={filters.valuation_max ? filters.valuation_max / 1000000 : ''}
                      onChange={(e) =>
                        updateFilter('valuation_max', Number(e.target.value) * 1000000)
                      }
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Status */}
              <div className="space-y-2">
                <Label>Estado</Label>
                <Select
                  value={filters.status?.[0] || ''}
                  onValueChange={(value) => updateFilter('status', [value])}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar estado..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="prospecting">Prospección</SelectItem>
                    <SelectItem value="valuation">Valoración</SelectItem>
                    <SelectItem value="negotiation">Negociación</SelectItem>
                    <SelectItem value="due_diligence">Due Diligence</SelectItem>
                    <SelectItem value="closing">Cierre</SelectItem>
                    <SelectItem value="closed">Cerrada</SelectItem>
                    <SelectItem value="archived">Archivada</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Assigned to */}
              <div className="space-y-2">
                <Label>Asignado a</Label>
                <Select
                  value={filters.assigned_to?.[0] || ''}
                  onValueChange={(value) => updateFilter('assigned_to', [value])}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar usuario..." />
                  </SelectTrigger>
                  <SelectContent>
                    {adminUsers.map((member) => (
                      <SelectItem key={member.user_id} value={member.user_id}>
                        {member.full_name || member.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              {/* Boolean filters */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Solo destacadas</Label>
                  <Switch
                    checked={filters.is_featured || false}
                    onCheckedChange={(checked) => updateFilter('is_featured', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Solo activas</Label>
                  <Switch
                    checked={filters.is_active || false}
                    onCheckedChange={(checked) => updateFilter('is_active', checked)}
                  />
                </div>
              </div>
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Results count */}
      {hasActiveFilters && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold">{totalCount}</p>
              <p className="text-sm text-muted-foreground">
                {totalCount === 1 ? 'operación encontrada' : 'operaciones encontradas'}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
