import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter } from 'lucide-react';
import { formatCurrency, normalizeValuationAmount } from '@/utils/formatters';

interface Operation {
  id: string;
  company_name: string;
  sector: string;
  valuation_amount: number;
  valuation_currency: string;
  revenue_amount?: number;
  year: number;
  description: string;
  is_featured: boolean;
  is_active: boolean;
  display_locations: string[];
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

  const fetchOperations = async () => {
    try {
      setIsLoading(true);
      
      // Use the new list-operations Edge Function
      const { data, error } = await supabase.functions.invoke('list-operations', {
        body: {
          searchTerm: searchTerm || undefined,
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
  }, [searchTerm, selectedSector, sortBy, offset, displayLocation]);

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
            className="pl-10"
          />
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
            <Card key={operation.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <h3 className="font-semibold text-lg line-clamp-2">
                      {operation.company_name}
                    </h3>
                    {operation.is_featured && (
                      <Badge variant="secondary" className="text-xs">
                        Destacado
                      </Badge>
                    )}
                  </div>
                  
                  <Badge variant="outline" className="text-xs">
                    {operation.sector}
                  </Badge>
                  
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {operation.description}
                  </p>
                  
                  <div className="space-y-2 pt-4 border-t">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Valoración:</span>
                      <span className="font-bold text-green-600">
                        {operation.revenue_amount ? 
                          formatCurrency(normalizeValuationAmount(operation.revenue_amount), operation.valuation_currency || 'EUR') :
                          formatCurrency(normalizeValuationAmount(operation.valuation_amount), operation.valuation_currency || 'EUR')
                        }
                      </span>
                    </div>
                    {!operation.revenue_amount && (
                      <p className="text-xs text-muted-foreground">
                        Valoración de la operación
                      </p>
                    )}
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Año:</span>
                      <span className="font-medium">{operation.year}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
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