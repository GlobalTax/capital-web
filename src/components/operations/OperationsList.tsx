import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building, Euro, Calendar, Search, Filter } from 'lucide-react';

interface Operation {
  id: string;
  company_name: string;
  sector: string;
  valuation_amount: number;
  valuation_currency: string;
  year: number;
  description: string;
  is_featured: boolean;
  is_active: boolean;
  display_locations: string[];
}

interface OperationsListProps {
  showFilters?: boolean;
  limit?: number;
  displayLocation?: string;
}

const OperationsList: React.FC<OperationsListProps> = ({ 
  showFilters = true, 
  limit,
  displayLocation = 'compra-empresas'
}) => {
  const [operations, setOperations] = useState<Operation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSector, setSelectedSector] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('featured');

  useEffect(() => {
    fetchOperations();
  }, [searchTerm, selectedSector, sortBy, limit, displayLocation]);

  const fetchOperations = async () => {
    try {
      let query = supabase
        .from('company_operations')
        .select('*')
        .eq('is_active', true);

      // Filtrar por ubicación de display si se especifica
      if (displayLocation) {
        query = query.contains('display_locations', [displayLocation]);
      }

      // Filtrar por sector
      if (selectedSector && selectedSector !== 'all') {
        query = query.eq('sector', selectedSector);
      }

      // Filtrar por término de búsqueda
      if (searchTerm) {
        query = query.or(`company_name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
      }

      // Ordenar
      switch (sortBy) {
        case 'featured':
          query = query.order('is_featured', { ascending: false }).order('year', { ascending: false });
          break;
        case 'valuation_asc':
          query = query.order('valuation_amount', { ascending: true });
          break;
        case 'valuation_desc':
          query = query.order('valuation_amount', { ascending: false });
          break;
        case 'year_desc':
          query = query.order('year', { ascending: false });
          break;
        case 'sector':
          query = query.order('sector', { ascending: true });
          break;
        default:
          query = query.order('created_at', { ascending: false });
      }

      // Aplicar límite si se especifica
      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching operations:', error);
        setOperations([]);
      } else {
        setOperations(data || []);
      }
    } catch (error) {
      console.error('Error:', error);
      setOperations([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Obtener sectores únicos para el filtro
  const [sectors, setSectors] = useState<string[]>([]);
  useEffect(() => {
    const fetchSectors = async () => {
      const { data } = await supabase
        .from('company_operations')
        .select('sector')
        .eq('is_active', true);
      
      const uniqueSectors = [...new Set(data?.map(op => op.sector) || [])];
      setSectors(uniqueSectors);
    };
    fetchSectors();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        {showFilters && (
          <div className="animate-pulse">
            <div className="h-12 bg-gray-200 rounded mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-gray-200 h-80 rounded-lg animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {showFilters && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">Filtros</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder="Buscar por nombre o descripción..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={selectedSector} onValueChange={setSelectedSector}>
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
            
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="featured">Destacados primero</SelectItem>
                <SelectItem value="valuation_desc">Valoración (mayor a menor)</SelectItem>
                <SelectItem value="valuation_asc">Valoración (menor a mayor)</SelectItem>
                <SelectItem value="year_desc">Año más reciente</SelectItem>
                <SelectItem value="sector">Sector (A-Z)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {operations.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {operations.map((operation) => (
            <Card key={operation.id} className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 group">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <Badge variant="secondary" className="rounded-lg">
                    {operation.sector}
                  </Badge>
                  <div className="flex items-center gap-2">
                    {operation.is_featured && (
                      <Badge variant="default" className="rounded-lg bg-yellow-100 text-yellow-800">
                        Destacado
                      </Badge>
                    )}
                    <Building className="w-5 h-5 text-blue-500" />
                  </div>
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-3 leading-tight">
                  {operation.company_name}
                </h3>
                
                <p className="text-gray-600 mb-4 leading-relaxed text-sm line-clamp-3">
                  {operation.description}
                </p>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 flex items-center">
                      <Euro className="w-4 h-4 mr-1" />
                      Valoración:
                    </span>
                    <span className="text-xl font-bold text-gray-900">
                      {operation.valuation_amount}M{operation.valuation_currency}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      Año:
                    </span>
                    <span className="font-medium text-gray-900">{operation.year}</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <Button variant="outline" className="w-full group-hover:bg-primary group-hover:text-white transition-colors">
                    Ver Detalles
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="max-w-md mx-auto">
            <Building className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No se encontraron operaciones
            </h3>
            <p className="text-gray-600">
              {searchTerm || selectedSector !== 'all' 
                ? 'Intenta ajustar tus filtros de búsqueda.' 
                : 'No hay operaciones disponibles en este momento.'
              }
            </p>
            {(searchTerm || selectedSector !== 'all') && (
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm('');
                  setSelectedSector('all');
                }}
                className="mt-4"
              >
                Limpiar Filtros
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default OperationsList;