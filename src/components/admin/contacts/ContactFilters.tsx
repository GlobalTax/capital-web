import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, ChevronDown, ChevronUp, X } from 'lucide-react';
import { ContactFilters as ContactFiltersType } from '@/hooks/useUnifiedContacts';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface ContactFiltersProps {
  filters: ContactFiltersType;
  onFiltersChange: (filters: ContactFiltersType) => void;
  totalContacts: number;
}

const ContactFilters: React.FC<ContactFiltersProps> = ({
  filters,
  onFiltersChange,
  totalContacts,
}) => {
  const [localFilters, setLocalFilters] = useState<ContactFiltersType>(filters);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  useEffect(() => {
    // Load filters from localStorage
    const savedFilters = localStorage.getItem('contactFilters');
    if (savedFilters) {
      const parsed = JSON.parse(savedFilters);
      setLocalFilters(parsed);
      onFiltersChange(parsed);
    }
  }, []);

  const handleFilterChange = (key: keyof ContactFiltersType, value: any) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
    
    // Save to localStorage
    localStorage.setItem('contactFilters', JSON.stringify(newFilters));
  };

  const handleClearFilters = () => {
    const emptyFilters: ContactFiltersType = {
      origin: 'all',
      emailStatus: 'all',
    };
    setLocalFilters(emptyFilters);
    onFiltersChange(emptyFilters);
    localStorage.removeItem('contactFilters');
  };

  const hasActiveFilters = () => {
    return localFilters.search ||
      (localFilters.origin && localFilters.origin !== 'all') ||
      localFilters.status ||
      (localFilters.emailStatus && localFilters.emailStatus !== 'all') ||
      localFilters.dateFrom ||
      localFilters.dateTo ||
      localFilters.utmSource ||
      localFilters.budget ||
      localFilters.sector ||
      localFilters.companySize;
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Main Filters Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div className="relative lg:col-span-2">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre, email o empresa..."
                value={localFilters.search || ''}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Status Filter */}
            <Select
              value={localFilters.status || 'all'}
              onValueChange={(value) => handleFilterChange('status', value === 'all' ? undefined : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="new">Nuevo</SelectItem>
                <SelectItem value="contacted">Contactado</SelectItem>
                <SelectItem value="qualified">Cualificado</SelectItem>
                <SelectItem value="opportunity">Oportunidad</SelectItem>
                <SelectItem value="customer">Cliente</SelectItem>
                <SelectItem value="lost">Perdido</SelectItem>
              </SelectContent>
            </Select>

            {/* Email Status Filter */}
            <Select
              value={localFilters.emailStatus || 'all'}
              onValueChange={(value) => handleFilterChange('emailStatus', value as any)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Estado Email" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="opened">Abiertos</SelectItem>
                <SelectItem value="sent">Enviados (no abiertos)</SelectItem>
                <SelectItem value="not_contacted">No contactados</SelectItem>
              </SelectContent>
            </Select>

            {/* Clear Filters */}
            <Button
              variant="outline"
              onClick={handleClearFilters}
              disabled={!hasActiveFilters()}
            >
              <X className="h-4 w-4 mr-2" />
              Limpiar
            </Button>
          </div>

          {/* Advanced Filters */}
          <Collapsible open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="w-full">
                <Filter className="h-4 w-4 mr-2" />
                Filtros Avanzados
                {isAdvancedOpen ? (
                  <ChevronUp className="h-4 w-4 ml-2" />
                ) : (
                  <ChevronDown className="h-4 w-4 ml-2" />
                )}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Date From */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Desde</label>
                  <Input
                    type="date"
                    value={localFilters.dateFrom || ''}
                    onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                  />
                </div>

                {/* Date To */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Hasta</label>
                  <Input
                    type="date"
                    value={localFilters.dateTo || ''}
                    onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                  />
                </div>

                {/* UTM Source */}
                <div>
                  <label className="text-sm font-medium mb-2 block">UTM Source</label>
                  <Input
                    placeholder="Ej: google, facebook..."
                    value={localFilters.utmSource || ''}
                    onChange={(e) => handleFilterChange('utmSource', e.target.value)}
                  />
                </div>

                {/* Budget */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Presupuesto</label>
                  <Select
                    value={localFilters.budget || 'all'}
                    onValueChange={(value) => handleFilterChange('budget', value === 'all' ? undefined : value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="< 500k">{'< 500k'}</SelectItem>
                      <SelectItem value="500k - 1M">500k - 1M</SelectItem>
                      <SelectItem value="1M - 5M">1M - 5M</SelectItem>
                      <SelectItem value="> 5M">{'>  5M'}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Sector */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Sector</label>
                  <Input
                    placeholder="Ej: tecnología, retail..."
                    value={localFilters.sector || ''}
                    onChange={(e) => handleFilterChange('sector', e.target.value)}
                  />
                </div>

                {/* Company Size */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Tamaño Empresa</label>
                  <Select
                    value={localFilters.companySize || 'all'}
                    onValueChange={(value) => handleFilterChange('companySize', value === 'all' ? undefined : value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="1-10">1-10</SelectItem>
                      <SelectItem value="11-50">11-50</SelectItem>
                      <SelectItem value="51-200">51-200</SelectItem>
                      <SelectItem value="201-500">201-500</SelectItem>
                      <SelectItem value="500+">500+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Results Count */}
          <div className="text-sm text-muted-foreground">
            Mostrando <span className="font-semibold text-foreground">{totalContacts}</span> contactos
            {hasActiveFilters() && ' (filtrados)'}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ContactFilters;
