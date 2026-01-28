import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, X, Sparkles, Eye, ArrowLeft, Loader2, AlertTriangle, LayoutGrid, List } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useDebounce } from '@/hooks/useDebounce';
import { EnhancedOperationsTable } from './enhanced/EnhancedOperationsTable';
import OperationCard from './OperationCard';
import { useI18n } from '@/shared/i18n/I18nProvider';

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
  project_status?: string;
  expected_market_text?: string;
  // i18n resolved fields
  resolved_description?: string;
  resolved_short_description?: string;
  resolved_sector?: string;
}

interface SectorOption {
  key: string;
  label: string;
}

interface OperationsListProps {
  displayLocation?: string;
  limit?: number;
}

const OperationsList: React.FC<OperationsListProps> = ({ 
  displayLocation = 'operaciones',
  limit = 20 
}) => {
  const { lang, t } = useI18n();
  const [operations, setOperations] = useState<Operation[]>([]);
  const [sectors, setSectors] = useState<SectorOption[]>([]);
  const [locations, setLocations] = useState<string[]>([]);
  const [companySizes, setCompanySizes] = useState<string[]>([]);
  const [dealTypes, setDealTypes] = useState<string[]>([]);
  const [projectStatuses, setProjectStatuses] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSector, setSelectedSector] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedCompanySize, setSelectedCompanySize] = useState('');
  const [selectedDealType, setSelectedDealType] = useState('');
  const [selectedProjectStatus, setSelectedProjectStatus] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [offset, setOffset] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  
  // Filtros de valoración
  const [valuationMin, setValuationMin] = useState<number | undefined>();
  const [valuationMax, setValuationMax] = useState<number | undefined>();
  
  // Filtro de fecha de publicación
  const [dateFilter, setDateFilter] = useState<string>('');
  
  // Nuevo: Estados para modo "Ver todas"
  const [viewMode, setViewMode] = useState<'paginated' | 'all'>('paginated');
  const [isLoadingAll, setIsLoadingAll] = useState(false);
  
  // Estado para toggle Grid/Lista con persistencia en localStorage (default: grid/tarjetas)
  const [displayType, setDisplayType] = useState<'grid' | 'list'>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('operations-display-type') as 'grid' | 'list') || 'grid';
    }
    return 'grid';
  });

  useEffect(() => {
    localStorage.setItem('operations-display-type', displayType);
  }, [displayType]);
  
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const fetchOperations = async () => {
    try {
      setIsLoading(true);
      
      // Determinar límite según modo de visualización
      const fetchLimit = viewMode === 'all' ? MAX_ITEMS_ALL : limit;
      const fetchOffset = viewMode === 'all' ? 0 : offset;
      
      // Calculate createdAfter date based on dateFilter
      let createdAfter: string | undefined;
      if (dateFilter) {
        const now = new Date();
        switch (dateFilter) {
          case 'week':
            createdAfter = new Date(now.setDate(now.getDate() - 7)).toISOString();
            break;
          case 'month':
            createdAfter = new Date(now.setMonth(now.getMonth() - 1)).toISOString();
            break;
          case '3months':
            createdAfter = new Date(now.setMonth(now.getMonth() - 3)).toISOString();
            break;
        }
      }

      // Use the new list-operations Edge Function
      const { data, error } = await supabase.functions.invoke('list-operations', {
        body: {
          locale: lang, // Send current language for translated content
          searchTerm: debouncedSearchTerm || undefined,
          sector: selectedSector || undefined,
          location: selectedLocation || undefined,
          companySize: selectedCompanySize || undefined,
          dealType: selectedDealType || undefined,
          projectStatus: selectedProjectStatus || undefined,
          sortBy,
          limit: fetchLimit,
          offset: fetchOffset,
          displayLocation,
          valuationMin: valuationMin ? valuationMin * 1000 : undefined, // Convert from k to actual
          valuationMax: valuationMax ? valuationMax * 1000 : undefined, // Convert from k to actual
          createdAfter
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
            locale: lang,
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
          setProjectStatuses(fallbackResponse.data.projectStatuses || []);
          return;
        }
      }

      setOperations(data.data || []);
      setTotalCount(data.count || 0);
      setSectors(data.sectors || []);
      setLocations(data.locations || []);
      setCompanySizes(data.companySizes || []);
      setDealTypes(data.dealTypes || []);
      setProjectStatuses(data.projectStatuses || []);

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
  }, [debouncedSearchTerm, selectedSector, selectedLocation, selectedCompanySize, selectedDealType, selectedProjectStatus, sortBy, offset, displayLocation, viewMode, valuationMin, valuationMax, dateFilter, lang]);

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

  const handleProjectStatusChange = (value: string) => {
    setSelectedProjectStatus(value === 'all' ? '' : value);
    setOffset(0);
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setSelectedSector('');
    setSelectedLocation('');
    setSelectedCompanySize('');
    setSelectedDealType('');
    setSelectedProjectStatus('');
    setValuationMin(undefined);
    setValuationMax(undefined);
    setDateFilter('');
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

  const hasActiveFilters = searchTerm || selectedSector || selectedLocation || selectedCompanySize || selectedDealType || selectedProjectStatus || valuationMin || valuationMax || dateFilter;


  return (
    <div className="space-y-6">
      {/* Filters Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Filter className="h-5 w-5" />
            {t('operations.filters.title') || 'Filtros y Búsqueda'}
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
                  placeholder={t('operations.filters.search')}
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
                  s.label.toLowerCase().includes(searchTerm.toLowerCase())
                ).length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-background border rounded-md shadow-lg z-10 max-h-48 overflow-y-auto">
                    {sectors
                      .filter(s => s.label.toLowerCase().includes(searchTerm.toLowerCase()))
                      .slice(0, 5)
                      .map((sector) => (
                        <button
                          key={sector.key}
                          onClick={() => {
                            setSelectedSector(sector.key);
                            setSearchTerm('');
                            setOffset(0);
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-accent transition-colors flex items-center space-x-2"
                        >
                          <Sparkles className="h-4 w-4 text-primary" />
                          <span className="text-sm">{sector.label}</span>
                        </button>
                      ))}
                  </div>
                )}
              </div>
              
              {/* Sector Filter */}
              <Select value={selectedSector || 'all'} onValueChange={handleSectorChange}>
                <SelectTrigger>
                  <SelectValue placeholder={t('operations.filters.allSectors')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('operations.filters.allSectors')}</SelectItem>
                  {sectors.map((sector) => (
                    <SelectItem key={sector.key} value={sector.key}>
                      {sector.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Location Filter */}
              <Select value={selectedLocation || 'all'} onValueChange={handleLocationChange}>
                <SelectTrigger>
                  <SelectValue placeholder={t('operations.filters.allLocations')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('operations.filters.allLocations')}</SelectItem>
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
                  <SelectValue placeholder={t('operations.filters.allSizes')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('operations.filters.allSizes')}</SelectItem>
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
                  <SelectValue placeholder={t('operations.filters.allTypes')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('operations.filters.allTypes')}</SelectItem>
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
                  <SelectValue placeholder={t('operations.filters.sortBy') || 'Ordenar por'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="created_at">{t('operations.filters.mostRecent') || 'Más recientes'}</SelectItem>
                  <SelectItem value="year">{t('operations.filters.year') || 'Año'}</SelectItem>
                  <SelectItem value="valuation_amount">{t('operations.filters.valuation') || 'Valoración'}</SelectItem>
                  <SelectItem value="company_name">{t('operations.filters.name') || 'Nombre'}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Tercera fila: Valoración, Fecha, Estado Proyecto y Limpiar */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {/* Valuation Min */}
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">{t('operations.filters.valuationMin')}</label>
                <Input
                  type="number"
                  placeholder="Ej: 500"
                  value={valuationMin || ''}
                  onChange={(e) => {
                    setValuationMin(e.target.value ? parseInt(e.target.value) : undefined);
                    setOffset(0);
                  }}
                />
              </div>
              
              {/* Valuation Max */}
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">{t('operations.filters.valuationMax')}</label>
                <Input
                  type="number"
                  placeholder="Ej: 5000"
                  value={valuationMax || ''}
                  onChange={(e) => {
                    setValuationMax(e.target.value ? parseInt(e.target.value) : undefined);
                    setOffset(0);
                  }}
                />
              </div>

              {/* Date Filter */}
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">{t('operations.filters.datePublished')}</label>
                <Select value={dateFilter || 'all'} onValueChange={(value) => {
                  setDateFilter(value === 'all' ? '' : value);
                  setOffset(0);
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('operations.filters.anyDate')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('operations.filters.anyDate')}</SelectItem>
                    <SelectItem value="week">{t('operations.filters.lastWeek')}</SelectItem>
                    <SelectItem value="month">{t('operations.filters.lastMonth')}</SelectItem>
                    <SelectItem value="3months">{t('operations.filters.last3Months')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Project Status Filter */}
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">{t('operations.filters.status')}</label>
                <Select value={selectedProjectStatus || 'all'} onValueChange={handleProjectStatusChange}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('operations.filters.allStatuses')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('operations.filters.allStatuses')}</SelectItem>
                    <SelectItem value="active">✓ {t('operations.status.active')}</SelectItem>
                    <SelectItem value="upcoming">⏳ {t('operations.status.upcoming')}</SelectItem>
                    <SelectItem value="exclusive">⭐ {t('operations.status.exclusive')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Clear filters button */}
              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={clearAllFilters}
                  disabled={!hasActiveFilters}
                  className="w-full"
                >
                  <X className="h-4 w-4 mr-2" />
                  {t('operations.filters.clearFilters')}
                </Button>
              </div>
            </div>

            {/* Active Filters Indicator */}
            {hasActiveFilters && (
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t">
                <span className="text-sm text-muted-foreground">{t('operations.filters.activeFilters')}</span>
                {searchTerm && <Badge variant="secondary">{searchTerm}</Badge>}
                {selectedSector && <Badge variant="secondary">{selectedSector}</Badge>}
                {selectedLocation && <Badge variant="secondary">{selectedLocation}</Badge>}
                {selectedCompanySize && <Badge variant="secondary">{selectedCompanySize}</Badge>}
                {selectedDealType && <Badge variant="secondary">{selectedDealType}</Badge>}
                {selectedProjectStatus && (
                  <Badge variant="secondary">
                    {selectedProjectStatus === 'active' ? `✓ ${t('operations.status.active')}` : 
                     selectedProjectStatus === 'upcoming' ? `⏳ ${t('operations.status.upcoming')}` : 
                     `⭐ ${t('operations.status.exclusive')}`}
                  </Badge>
                )}
                {valuationMin && <Badge variant="secondary">Min: €{valuationMin}k</Badge>}
                {valuationMax && <Badge variant="secondary">Max: €{valuationMax}k</Badge>}
                {dateFilter && (
                  <Badge variant="secondary">
                    {dateFilter === 'week' ? t('operations.filters.lastWeek') : dateFilter === 'month' ? t('operations.filters.lastMonth') : t('operations.filters.last3Months')}
                  </Badge>
                )}
                <Button variant="ghost" size="sm" onClick={clearAllFilters} className="h-7 text-xs">
                  {t('operations.filters.clearAll')}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Results count + View Toggle */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {t('operations.results.showing').replace('{count}', String(operations.length)).replace('{total}', String(totalCount))}
        </p>
        <div className="flex items-center gap-2">
          {isLoading && (
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm text-muted-foreground">{t('operations.pagination.loading')}</span>
            </div>
          )}
          {/* Grid/List Toggle */}
          <div className="flex items-center border rounded-lg p-1">
            <Button
              variant={displayType === 'grid' ? 'secondary' : 'ghost'}
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => setDisplayType('grid')}
              aria-label="Vista cuadrícula"
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={displayType === 'list' ? 'secondary' : 'ghost'}
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => setDisplayType('list')}
              aria-label="Vista lista"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Operations View - Grid or List */}
      {displayType === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {operations.map(op => (
            <OperationCard 
              key={op.id} 
              operation={op} 
              searchTerm={debouncedSearchTerm} 
            />
          ))}
        </div>
      ) : (
        <EnhancedOperationsTable 
          operations={operations}
          isLoading={isLoading}
          onBulkAction={(action, ids) => {
            console.log('Bulk action:', action, 'IDs:', ids);
            // TODO: Implementar acciones masivas
          }}
        />
      )}

      {/* Aviso si hay más de MAX_ITEMS_ALL */}
      {viewMode === 'all' && totalCount > MAX_ITEMS_ALL && (
        <Alert className="border-amber-200 bg-amber-50">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-700">
            {t('operations.alert.limitReached').replace('{max}', String(MAX_ITEMS_ALL)).replace('{total}', String(totalCount))}
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
              {t('operations.pagination.previous')}
            </Button>
            
            <span className="text-sm text-muted-foreground px-2">
              {t('operations.pagination.page').replace('{current}', String(Math.floor(offset / limit) + 1)).replace('{total}', String(Math.max(1, Math.ceil(totalCount / limit))))}
            </span>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setOffset(offset + limit)}
              disabled={offset + limit >= totalCount || isLoading}
            >
              {t('operations.pagination.next')}
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
                      {t('operations.pagination.loading')}
                    </>
                  ) : (
                    <>
                      <Eye className="h-4 w-4 mr-1" />
                      {t('operations.pagination.viewAll')} ({totalCount > MAX_ITEMS_ALL ? `${MAX_ITEMS_ALL}+` : totalCount})
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
              {t('operations.results.showing').replace('{count}', String(operations.length)).replace('{total}', String(totalCount))}
            </Badge>
            
            {totalCount > MAX_ITEMS_ALL && (
              <Badge variant="outline" className="text-amber-600 border-amber-300">
                ⚠️ {t('operations.alert.limitReached').split('.')[0]}
              </Badge>
            )}
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleReturnToPaginated}
              className="ml-2"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              {t('operations.pagination.backToPagination')}
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default OperationsList;