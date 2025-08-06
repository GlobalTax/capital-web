
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, TrendingUp, Award, Search, Filter, Star } from 'lucide-react';
import { useCaseStudies } from '@/hooks/useCaseStudies';

const CaseStudies = () => {
  const { filteredCases, isLoading, filterCaseStudies, getUniqueSectors, getUniqueYears } = useCaseStudies();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSector, setSelectedSector] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    applyFilters(value, selectedSector, selectedYear, showFeaturedOnly);
  };

  const handleSectorFilter = (value: string) => {
    setSelectedSector(value);
    applyFilters(searchTerm, value, selectedYear, showFeaturedOnly);
  };

  const handleYearFilter = (value: string) => {
    setSelectedYear(value);
    applyFilters(searchTerm, selectedSector, value, showFeaturedOnly);
  };

  const handleFeaturedToggle = () => {
    const newFeaturedState = !showFeaturedOnly;
    setShowFeaturedOnly(newFeaturedState);
    applyFilters(searchTerm, selectedSector, selectedYear, newFeaturedState);
  };

  const applyFilters = (search: string, sector: string, year: string, featured: boolean) => {
    filterCaseStudies({
      search: search || undefined,
      sector: sector && sector !== 'all' ? sector : undefined,
      year: year && year !== 'all' ? parseInt(year) : undefined,
      featured: featured || undefined,
    });
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedSector('all');
    setSelectedYear('all');
    setShowFeaturedOnly(false);
    filterCaseStudies({});
  };

  const sectors = getUniqueSectors();
  const years = getUniqueYears();

  if (isLoading) {
    return (
      <section id="casos" className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-pulse">
              <div className="h-8 bg-muted rounded w-64 mx-auto mb-4"></div>
              <div className="h-4 bg-muted rounded w-96 mx-auto mb-8"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="bg-muted h-80 rounded-lg"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="casos" className="py-20 bg-background">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-normal text-foreground mb-6 tracking-tight">
            Casos de Éxito
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed font-normal">
            Nuestro historial habla por sí mismo. Descubra cómo hemos ayudado a empresas 
            a alcanzar sus objetivos estratégicos.
          </p>
        </div>

        {/* Filtros */}
        <div className="mb-12 space-y-6">
          <div className="flex flex-wrap gap-4 items-center justify-center">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Buscar casos..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            
            <Select value={selectedSector} onValueChange={handleSectorFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrar por sector" />
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

            <Select value={selectedYear} onValueChange={handleYearFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Año" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {years.map((year) => (
                  <SelectItem key={year} value={year!.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              variant={showFeaturedOnly ? "default" : "outline"}
              onClick={handleFeaturedToggle}
              className="gap-2"
            >
              <Star className="w-4 h-4" />
              Destacados
            </Button>

            <Button variant="ghost" onClick={clearFilters} className="gap-2">
              <Filter className="w-4 h-4" />
              Limpiar filtros
            </Button>
          </div>

          <div className="text-center text-sm text-muted-foreground">
            Mostrando {filteredCases.length} caso{filteredCases.length !== 1 ? 's' : ''} de éxito
          </div>
        </div>

        {filteredCases.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCases.map((case_) => (
              <Card key={case_.id} className="bg-card border hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ease-out group">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Badge variant="secondary" className="rounded-lg">
                      {case_.sector}
                    </Badge>
                    {case_.is_featured && (
                      <Award className="w-5 h-5 text-yellow-500" />
                    )}
                  </div>
                  
                  <h3 className="text-lg font-semibold text-card-foreground mb-3 leading-tight">
                    {case_.title}
                  </h3>
                  
                  <p className="text-muted-foreground mb-4 leading-relaxed text-sm">
                    {case_.description}
                  </p>

                  <div className="space-y-3 mb-4">
                    {case_.value_amount && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Valoración:</span>
                        <span className="text-xl font-bold text-primary">
                          {case_.value_amount}M{case_.value_currency}
                        </span>
                      </div>
                    )}
                    
                    {case_.year && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          Año:
                        </span>
                        <span className="font-medium text-card-foreground">{case_.year}</span>
                      </div>
                    )}

                    {case_.company_size && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Tamaño:</span>
                        <span className="font-medium text-card-foreground">{case_.company_size}</span>
                      </div>
                    )}
                  </div>

                  {case_.highlights && case_.highlights.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-card-foreground mb-2">Destacados:</h4>
                      {case_.highlights.slice(0, 3).map((highlight, idx) => (
                        <div key={idx} className="flex items-start text-sm text-muted-foreground">
                          <TrendingUp className="w-3 h-3 text-green-500 mt-1 mr-2 flex-shrink-0" />
                          <span className="leading-relaxed">{highlight}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg">No se encontraron casos de éxito con los filtros aplicados.</p>
            <Button variant="outline" onClick={clearFilters} className="mt-4">
              Limpiar filtros
            </Button>
          </div>
        )}

        <div className="text-center mt-16">
          <p className="text-lg text-muted-foreground mb-6">
            ¿Quiere conocer más detalles sobre nuestros casos de éxito?
          </p>
          <Button variant="outline" size="lg">
            Descargar Case Studies
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CaseStudies;
