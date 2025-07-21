
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Calendar, Building, TrendingUp, ArrowRight } from 'lucide-react';
import { useCaseStudies } from '@/hooks/useCaseStudies';
import OptimizedImage from './OptimizedImage';

const CaseStudies = () => {
  const {
    caseStudies,
    filteredCases,
    isLoading,
    filterCaseStudies,
    getUniqueSectors,
    getUniqueYears,
  } = useCaseStudies();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSector, setSelectedSector] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<string>('');

  const handleFilterChange = () => {
    filterCaseStudies({
      search: searchTerm,
      sector: selectedSector,
      year: selectedYear ? parseInt(selectedYear) : undefined,
      featured: undefined,
    });
  };

  React.useEffect(() => {
    handleFilterChange();
  }, [searchTerm, selectedSector, selectedYear]);

  const formatCurrency = (amount: number, currency: string) => {
    // Normalizar códigos de divisa comunes para evitar problemas de codificación
    const normalizedCurrency = currency === '€' || currency === 'â¬' ? 'EUR' : currency;
    
    try {
      return new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency: normalizedCurrency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(amount);
    } catch (error) {
      // Fallback si hay problemas con el código de divisa
      return `${currency}${amount.toLocaleString('es-ES')}`;
    }
  };

  if (isLoading) {
    return (
      <section id="casos-exito" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-64 mx-auto mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-96 mx-auto"></div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 rounded-lg h-64"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="casos-exito" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-black mb-4">
            Casos de Éxito
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Descubre cómo hemos ayudado a empresas a alcanzar sus objetivos de M&A
          </p>
        </div>

        {/* Filtros */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar casos de éxito..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={selectedSector} onValueChange={setSelectedSector}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Sector" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos los sectores</SelectItem>
              {getUniqueSectors().map((sector) => (
                <SelectItem key={sector} value={sector}>
                  {sector}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-full md:w-32">
              <SelectValue placeholder="Año" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos</SelectItem>
              {getUniqueYears().map((year) => (
                <SelectItem key={year} value={year!.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Grid de casos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCases.map((caseStudy) => (
            <Card 
              key={caseStudy.id} 
              className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-white border border-gray-200"
            >
              <CardContent className="p-0">
                {/* Imagen destacada */}
                {caseStudy.featured_image_url && (
                  <div className="relative h-48 overflow-hidden rounded-t-lg">
                    <OptimizedImage
                      src={caseStudy.featured_image_url}
                      alt={caseStudy.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      placeholderClassName="w-full h-48 bg-gray-200"
                      threshold={0.1}
                      rootMargin="100px"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    {caseStudy.is_featured && (
                      <Badge className="absolute top-4 right-4 bg-yellow-500 text-white">
                        Destacado
                      </Badge>
                    )}
                  </div>
                )}

                <div className="p-6">
                  {/* Logo de la empresa */}
                  {caseStudy.logo_url && (
                    <div className="mb-4">
                      <OptimizedImage
                        src={caseStudy.logo_url}
                        alt={`Logo de ${caseStudy.title}`}
                        className="h-8 w-auto object-contain"
                        placeholderClassName="h-8 w-16 bg-gray-200 rounded"
                        threshold={0.1}
                      />
                    </div>
                  )}

                  {/* Título y sector */}
                  <h3 className="text-xl font-bold text-black mb-2 group-hover:text-gray-700 transition-colors">
                    {caseStudy.title}
                  </h3>
                  
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="outline" className="text-xs">
                      <Building className="w-3 h-3 mr-1" />
                      {caseStudy.sector}
                    </Badge>
                    {caseStudy.year && (
                      <Badge variant="outline" className="text-xs">
                        <Calendar className="w-3 h-3 mr-1" />
                        {caseStudy.year}
                      </Badge>
                    )}
                  </div>

                  {/* Descripción */}
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {caseStudy.description}
                  </p>

                  {/* Valor de la operación */}
                  {caseStudy.value_amount && (
                    <div className="flex items-center gap-2 mb-4">
                      <TrendingUp className="w-4 h-4 text-green-600" />
                      <span className="font-semibold text-green-600">
                        {formatCurrency(caseStudy.value_amount, caseStudy.value_currency)}
                      </span>
                    </div>
                  )}

                  {/* Highlights */}
                  {caseStudy.highlights && caseStudy.highlights.length > 0 && (
                    <div className="mb-4">
                      <ul className="text-sm text-gray-600 space-y-1">
                        {caseStudy.highlights.slice(0, 2).map((highlight, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-green-500 mt-0.5">•</span>
                            {highlight}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* CTA Button */}
                  <Button 
                    variant="ghost" 
                    className="w-full justify-between group-hover:bg-black group-hover:text-white transition-all duration-300"
                  >
                    Ver caso completo
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredCases.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Building className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              No se encontraron casos de éxito
            </h3>
            <p className="text-gray-600">
              Intenta ajustar los filtros para ver más resultados
            </p>
          </div>
        )}

        {/* CTA final */}
        <div className="text-center mt-16">
          <Button size="lg" className="bg-black text-white hover:bg-gray-800">
            Ver todos los casos de éxito
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CaseStudies;
