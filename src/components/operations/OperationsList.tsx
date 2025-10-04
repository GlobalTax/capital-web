import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, X, Sparkles } from 'lucide-react';
import { formatCurrency, normalizeValuationAmount } from '@/utils/formatters';
import { useDebounce } from '@/hooks/useDebounce';
import OperationCard from './OperationCard';

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
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSector, setSelectedSector] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [offset, setOffset] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const fetchOperations = async () => {
    try {
      setIsLoading(true);
      
      // Use the new list-operations Edge Function
      const { data, error } = await supabase.functions.invoke('list-operations', {
        body: {
          searchTerm: debouncedSearchTerm || undefined,
          sector: selectedSector || undefined,
          sortBy,
          limit,
          offset,
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
          return;
        }
      }

      setOperations(data.data || []);
      setTotalCount(data.count || 0);
      setSectors(data.sectors || []);

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
  }, [debouncedSearchTerm, selectedSector, sortBy, offset, displayLocation]);

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

  if (isLoading && operations.length === 0) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-6 bg-gray-200 rounded w-full"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar operaciones..."
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
        
        <Select value={selectedSector || 'all'} onValueChange={handleSectorChange}>
          <SelectTrigger className="w-full sm:w-48">
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

        <Select value={sortBy} onValueChange={handleSortChange}>
          <SelectTrigger className="w-full sm:w-48">
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

      {/* Operations Grid */}
      {operations.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {operations.map((operation) => (
            <OperationCard 
              key={operation.id} 
              operation={operation}
              searchTerm={debouncedSearchTerm}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            No se encontraron operaciones que coincidan con los criterios de búsqueda.
          </p>
        </div>
      )}

      {/* Pagination */}
      {totalCount > limit && (
        <div className="flex items-center justify-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setOffset(Math.max(0, offset - limit))}
            disabled={offset === 0 || isLoading}
          >
            Anterior
          </Button>
          <span className="text-sm text-muted-foreground">
            Página {Math.floor(offset / limit) + 1} de {Math.ceil(totalCount / limit)}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setOffset(offset + limit)}
            disabled={offset + limit >= totalCount || isLoading}
          >
            Siguiente
          </Button>
        </div>
      )}
    </div>
  );
};

export default OperationsList;