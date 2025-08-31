import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, Building, TrendingUp, Users, Globe } from 'lucide-react';
import { useOperations, OperationsFilters } from '@/shared/hooks/useOperations';
import { useDebounce } from '@/hooks/useDebounce';
import OperationCard from '@/components/operations/OperationCard';

export interface OperationsSectionProps {
  variant?: 'homepage' | 'full' | 'compact';
  showFilters?: boolean;
  showStats?: boolean;
  showCTA?: boolean;
  title?: string;
  description?: string;
  limit?: number;
  displayLocation?: string;
  className?: string;
}

const OperationsSection: React.FC<OperationsSectionProps> = ({
  variant = 'full',
  showFilters = false,
  showStats = false,
  showCTA = true,
  title,
  description,
  limit,
  displayLocation,
  className = ''
}) => {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedSector, setSelectedSector] = React.useState<string>('');
  const [sortBy, setSortBy] = React.useState<string>('featured');

  // Debounce search term to prevent excessive API calls
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Simple filters object
  const filters: OperationsFilters = React.useMemo(() => ({
    searchTerm: debouncedSearchTerm || undefined,
    sector: selectedSector || undefined,
    displayLocation,
    limit,
    sortBy,
    ...(variant === 'homepage' && { featured: true })
  }), [debouncedSearchTerm, selectedSector, displayLocation, limit, sortBy, variant]);

  const { operations, sectors, stats, isLoading, error, refresh } = useOperations(filters);

  // Simplified variant configurations
  const config = {
    homepage: {
      title: title || 'Oportunidades de Inversión',
      description: description || 'Oportunidades exclusivas seleccionadas por nuestro equipo',
      gridCols: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
      ctaText: 'Ver Todas las Oportunidades',
      ctaLink: '/operaciones'
    },
    full: {
      title: title || 'Todas las Oportunidades',
      description: description || 'Explore nuestra cartera completa de oportunidades de inversión',
      gridCols: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
      ctaText: 'Contactar Equipo',
      ctaLink: '/contacto'
    },
    compact: {
      title: title || 'Operaciones Destacadas',
      description: description || 'Selección de nuestras mejores oportunidades',
      gridCols: 'grid-cols-1 md:grid-cols-3',
      ctaText: 'Ver Todas',
      ctaLink: '/operaciones'
    }
  };

  const currentConfig = config[variant];

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedSector('');
    setSortBy('featured');
  };

  if (isLoading) {
    return (
      <section className={`py-20 bg-white ${className}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-64 mx-auto mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-96 mx-auto"></div>
            </div>
          </div>
          <div className={`grid ${currentConfig.gridCols} gap-8`}>
            {Array.from({ length: limit || 6 }).map((_, i) => (
              <div key={i} className="bg-gray-200 h-80 rounded-lg animate-pulse"></div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className={`py-20 bg-white ${className}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={refresh} className="mr-2">
              Reintentar
            </Button>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Recargar Página
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={`py-20 bg-white ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-black mb-6">
            {currentConfig.title}
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            {currentConfig.description}
          </p>
        </div>

        {/* Stats */}
        {showStats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-4">
                <Building className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-black">{stats.totalOperations}+</div>
              <div className="text-sm text-gray-600">Oportunidades activas</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mx-auto mb-4">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-black">{stats.avgMultiple}x</div>
              <div className="text-sm text-gray-600">Múltiplo EBITDA promedio</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mx-auto mb-4">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <div className="text-2xl font-bold text-black">€{stats.avgValuation}M</div>
              <div className="text-sm text-gray-600">Valoración promedio</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-lg mx-auto mb-4">
                <Globe className="w-6 h-6 text-orange-600" />
              </div>
              <div className="text-2xl font-bold text-black">{stats.offMarketDeals}%</div>
              <div className="text-sm text-gray-600">Deals off-market</div>
            </div>
          </div>
        )}

        {/* Filters */}
        {showFilters && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-12">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar empresas..."
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
                  <SelectItem value="">Todos los sectores</SelectItem>
                  {sectors.map((sector) => (
                    <SelectItem key={sector} value={sector}>
                      {sector}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={(value: string) => setSortBy(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Ordenar por" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="featured">Destacados</SelectItem>
                  <SelectItem value="year">Año</SelectItem>
                  <SelectItem value="valuation">Valoración</SelectItem>
                </SelectContent>
              </Select>

              <Button 
                variant="outline" 
                onClick={clearFilters}
                className="w-full"
              >
                <Filter className="w-4 h-4 mr-2" />
                Limpiar filtros
              </Button>
            </div>
          </div>
        )}

        {/* Operations Grid */}
        {operations.length > 0 ? (
          <div className={`grid ${currentConfig.gridCols} gap-8 mb-12`}>
            {operations.map((operation, index) => (
              <div 
                key={operation.id}
                style={{ 
                  animationDelay: `${index * 0.1}s`,
                  animationFillMode: 'both'
                }}
                className="animate-in fade-in slide-in-from-bottom-4 duration-700"
              >
                <OperationCard operation={operation} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Building className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              No se encontraron operaciones
            </h3>
            <p className="text-gray-500 mb-4">
              {showFilters ? 'Intenta ajustar los filtros de búsqueda' : 'No hay operaciones disponibles en este momento'}
            </p>
            {showFilters && (
              <Button variant="outline" onClick={clearFilters}>
                Limpiar filtros
              </Button>
            )}
          </div>
        )}

        {/* CTA */}
        {showCTA && operations.length > 0 && (
          <div className="text-center">
            <Link to={currentConfig.ctaLink}>
              <Button 
                variant="outline" 
                size="lg" 
                className="px-6 py-3 text-base font-medium hover:bg-gray-50 hover:text-black hover:shadow-lg transition-all duration-300 ease-out"
              >
                {currentConfig.ctaText}
              </Button>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};

export default OperationsSection;