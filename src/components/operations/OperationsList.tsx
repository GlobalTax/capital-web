import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, X, Sparkles, Eye, ArrowLeft, Loader2, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useDebounce } from '@/hooks/useDebounce';
import { EnhancedOperationsTable } from './enhanced/EnhancedOperationsTable';

// Constantes para límites
const MAX_ITEMS_ALL = 500;

interface Operation {
  id: string;
  company_name: string;
  sector: string;
  valuation_amount: number;
  valuation_currency: string;
  revenue_amount?: number;
  ebitda_amount?: number;
  year: number;
  description: string;
  short_description?: string;
  is_featured: boolean;
  is_active: boolean;
  logo_url?: string;
  company_size?: string;
  company_size_employees?: string;
  highlights?: string[];
  deal_type?: string;
  display_locations: string[];
  created_at?: string;
}

interface OperationsListProps {
  displayLocation?: string;
  limit?: number;
}

const OperationsList: React.FC<OperationsListProps> = ({ 
  displayLocation = 'operaciones',
  limit = 20 
}) => {
  const [operations, setOperations] = useState<Operation[]>([]);
  const [sectors, setSectors] = useState<string[]>([]);
  const [locations, setLocations] = useState<string[]>([]);
  const [companySizes, setCompanySizes] = useState<string[]>([]);
  const [dealTypes, setDealTypes] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSector, setSelectedSector] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedCompanySize, setSelectedCompanySize] = useState('');
  const [selectedDealType, setSelectedDealType] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [offset, setOffset] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  
  // Nuevo: Estados para modo "Ver todas"
  const [viewMode, setViewMode] = useState<'paginated' | 'all'>('paginated');
  const [isLoadingAll, setIsLoadingAll] = useState(false);
  
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const fetchOperations = async () => {
    try {
      setIsLoading(true);
      
      // Determinar límite según modo de visualización
      const fetchLimit = viewMode === 'all' ? MAX_ITEMS_ALL : limit;
      const fetchOffset = viewMode === 'all' ? 0 : offset;
      
      // Use the new list-operations Edge Function
      const { data, error } = await supabase.functions.invoke('list-operations', {
        body: {
          searchTerm: debouncedSearchTerm || undefined,
          sector: selectedSector || undefined,
          location: selectedLocation || undefined,
          companySize: selectedCompanySize || undefined,
          dealType: selectedDealType || undefined,
          sortBy,
          limit: fetchLimit,
          offset: fetchOffset,
          displayLocation
        }
      });

      if (error) {
        console.error('Error fetching operations:', error);
        setOperations([]);
        setTotalCount(0);
        setSectors([]);
        return;
      }

      // Fallback: if no results with custom location, try 'operaciones'
      if (data && (data.count || 0) === 0 && displayLocation && displayLocation !== 'operaciones') {
        console.info(`ℹ️ No results with location '${displayLocation}', falling back to 'operaciones'`);
        
        const fallbackResponse = await supabase.functions.invoke('list-operations', {
          body: {
            searchTerm: debouncedSearchTerm || undefined,
            sector: selectedSector || undefined,
            location: selectedLocation || undefined,
            companySize: selectedCompanySize || undefined,
            dealType: selectedDealType || undefined,
            sortBy,
            limit,
            offset,
            displayLocation: 'operaciones'
          }
        });
        
        if (fallbackResponse.data) {
          setOperations(fallbackResponse.data.data || []);
          setTotalCount(fallbackResponse.data.count || 0);
          setSectors(fallbackResponse.data.sectors || []);
          setLocations(fallbackResponse.data.locations || []);
          setCompanySizes(fallbackResponse.data.companySizes || []);
          setDealTypes(fallbackResponse.data.dealTypes || []);
          return;
        }
      }

      setOperations(data.data || []);
      setTotalCount(data.count || 0);
      setSectors(data.sectors || []);
      setLocations(data.locations || []);
      setCompanySizes(data.companySizes || []);
      setDealTypes(data.dealTypes || []);

    } catch (error) {
      console.error('Error calling list-operations Edge Function:', error);
      setOperations([]);
      setTotalCount(0);
      setSectors([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOperations();
    setIsLoadingAll(false);
  }, [debouncedSearchTerm, selectedSector, selectedLocation, selectedCompanySize, selectedDealType, sortBy, offset, displayLocation, viewMode]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setOffset(0); // Reset pagination
  };

  const handleSectorChange = (value: string) => {
    setSelectedSector(value === 'all' ? '' : value);
    setOffset(0); // Reset pagination
  };

  const handleSortChange = (value: string) => {
    setSortBy(value);
    setOffset(0); // Reset pagination
  };

  const handleLocationChange = (value: string) => {
    setSelectedLocation(value === 'all' ? '' : value);
    setOffset(0);
  };

  const handleCompanySizeChange = (value: string) => {
    setSelectedCompanySize(value === 'all' ? '' : value);
    setOffset(0);
  };

  const handleDealTypeChange = (value: string) => {
    setSelectedDealType(value === 'all' ? '' : value);
    setOffset(0);
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setSelectedSector('');
    setSelectedLocation('');
    setSelectedCompanySize('');
    setSelectedDealType('');
    setOffset(0);
  };

  // Handlers para "Ver todas"
  const handleViewAll = () => {
    setIsLoadingAll(true);
    setViewMode('all');
    setOffset(0);
  };

  const handleReturnToPaginated = () => {
    setViewMode('paginated');
    setOffset(0);
  };

  const hasActiveFilters = searchTerm || selectedSector || selectedLocation || selectedCompanySize || selectedDealType;


  return (
    <div className="space-y-6">
      {/* Filters Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Filter className="h-5 w-5" />
            Filtros y Búsqueda
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Primera fila: Búsqueda, Sector, Ubicación */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por empresa o descripción..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10 pr-20"
                  maxLength={100}
                />
                {searchTerm && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
                    <span className="text-xs text-muted-foreground">{searchTerm.length}/100</span>
                    <button 
                      onClick={() => handleSearch('')}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                      aria-label="Limpiar búsqueda"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}
                
                {/* Sector Suggestions */}
                {searchTerm.length >= 2 && sectors.filter(s => 
                  s.toLowerCase().includes(searchTerm.toLowerCase())
                ).length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-background border rounded-md shadow-lg z-10 max-h-48 overflow-y-auto">
                    {sectors
                      .filter(s => s.toLowerCase().includes(searchTerm.toLowerCase()))
                      .slice(0, 5)
                      .map((sector) => (
                        <button
                          key={sector}
                          onClick={() => {
                            setSelectedSector(sector);
                            setSearchTerm('');
                            setOffset(0);
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-accent transition-colors flex items-center space-x-2"
                        >
                          <Sparkles className="h-4 w-4 text-primary" />
                          <span className="text-sm">{sector}</span>
                        </button>
                      ))}
                  </div>
                )}
              </div>
              
              {/* Sector Filter */}
              <Select value={selectedSector || 'all'} onValueChange={handleSectorChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos los sectores" />
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

              {/* Location Filter */}
              <Select value={selectedLocation || 'all'} onValueChange={handleLocationChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas las ubicaciones" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las ubicaciones</SelectItem>
                  {locations.map((location) => (
                    <SelectItem key={location} value={location}>
                      {location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Segunda fila: Tamaño, Tipo Deal, Ordenar */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Company Size Filter */}
              <Select value={selectedCompanySize || 'all'} onValueChange={handleCompanySizeChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos los tamaños" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los tamaños</SelectItem>
                  {companySizes.map((size) => (
                    <SelectItem key={size} value={size}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Deal Type Filter */}
              <Select value={selectedDealType || 'all'} onValueChange={handleDealTypeChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos los tipos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los tipos</SelectItem>
                  {dealTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Sort */}
              <Select value={sortBy} onValueChange={handleSortChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Ordenar por" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="created_at">Más recientes</SelectItem>
                  <SelectItem value="year">Año</SelectItem>
                  <SelectItem value="valuation_amount">Valoración</SelectItem>
                  <SelectItem value="company_name">Nombre</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Active Filters Indicator */}
            {hasActiveFilters && (
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t">
                <span className="text-sm text-muted-foreground">Filtros activos:</span>
                {searchTerm && <Badge variant="secondary">{searchTerm}</Badge>}
                {selectedSector && <Badge variant="secondary">{selectedSector}</Badge>}
                {selectedLocation && <Badge variant="secondary">{selectedLocation}</Badge>}
                {selectedCompanySize && <Badge variant="secondary">{selectedCompanySize}</Badge>}
                {selectedDealType && <Badge variant="secondary">{selectedDealType}</Badge>}
                <Button variant="ghost" size="sm" onClick={clearAllFilters} className="h-7 text-xs">
                  Limpiar todos
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Results count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Mostrando {operations.length} de {totalCount} operaciones
        </p>
        {isLoading && (
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm text-muted-foreground">Cargando...</span>
          </div>
        )}
      </div>

      {/* Operations Table */}
      <EnhancedOperationsTable 
        operations={operations}
        isLoading={isLoading}
        onBulkAction={(action, ids) => {
          console.log('Bulk action:', action, 'IDs:', ids);
          // TODO: Implementar acciones masivas
        }}
      />

      {/* Aviso si hay más de MAX_ITEMS_ALL */}
      {viewMode === 'all' && totalCount > MAX_ITEMS_ALL && (
        <Alert className="border-amber-200 bg-amber-50">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-700">
            Se muestran las primeras {MAX_ITEMS_ALL} operaciones de {totalCount} totales.
            Usa los filtros para refinar tu búsqueda.
          </AlertDescription>
        </Alert>
      )}

      {/* Pagination */}
      <div className="flex items-center justify-center gap-2 flex-wrap">
        {viewMode === 'paginated' ? (
          <>
            {/* Modo paginado normal */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setOffset(Math.max(0, offset - limit))}
              disabled={offset === 0 || isLoading}
            >
              Anterior
            </Button>
            
            <span className="text-sm text-muted-foreground px-2">
              Página {Math.floor(offset / limit) + 1} de {Math.max(1, Math.ceil(totalCount / limit))}
            </span>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setOffset(offset + limit)}
              disabled={offset + limit >= totalCount || isLoading}
            >
              Siguiente
            </Button>
            
            {/* Separador y botón Ver todas */}
            {totalCount > limit && (
              <>
                <span className="text-muted-foreground mx-2">|</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleViewAll}
                  disabled={isLoading || isLoadingAll}
                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                >
                  {isLoadingAll ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                      Cargando...
                    </>
                  ) : (
                    <>
                      <Eye className="h-4 w-4 mr-1" />
                      Ver todas ({totalCount > MAX_ITEMS_ALL ? `${MAX_ITEMS_ALL}+` : totalCount})
                    </>
                  )}
                </Button>
              </>
            )}
          </>
        ) : (
          <>
            {/* Modo "Ver todas" */}
            <Badge variant="secondary" className="px-3 py-1">
              Mostrando {operations.length} de {totalCount} operaciones
            </Badge>
            
            {totalCount > MAX_ITEMS_ALL && (
              <Badge variant="outline" className="text-amber-600 border-amber-300">
                ⚠️ Limitado a {MAX_ITEMS_ALL}
              </Badge>
            )}
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleReturnToPaginated}
              className="ml-2"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Volver a paginación
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default OperationsList;