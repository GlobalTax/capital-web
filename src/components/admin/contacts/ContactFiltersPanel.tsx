import React from 'react';
import { ContactFilters, UnifiedContact } from '@/hooks/useUnifiedContacts';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';

interface ContactFiltersPanelProps {
  filters: ContactFilters;
  onFiltersChange: (filters: ContactFilters) => void;
  contacts: UnifiedContact[];
}

export const ContactFiltersPanel: React.FC<ContactFiltersPanelProps> = ({
  filters,
  onFiltersChange,
  contacts
}) => {
  const updateFilter = (key: keyof ContactFilters, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const getUniqueIndustries = () => {
    const industries = contacts
      .map(c => c.industry)
      .filter(Boolean)
      .filter((industry, index, self) => self.indexOf(industry) === index);
    return industries as string[];
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Status Filter */}
      <div className="space-y-2">
        <Label>Estado</Label>
        <Select 
          value={filters.status || 'all'} 
          onValueChange={(value) => updateFilter('status', value === 'all' ? undefined : value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Todos los estados" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            <SelectItem value="new">Nuevo</SelectItem>
            <SelectItem value="contacted">Contactado</SelectItem>
            <SelectItem value="qualified">Calificado</SelectItem>
            <SelectItem value="opportunity">Oportunidad</SelectItem>
            <SelectItem value="customer">Cliente</SelectItem>
            <SelectItem value="lost">Perdido</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Source Filter */}
      <div className="space-y-2">
        <Label>Fuente</Label>
        <Select 
          value={filters.source || 'all'} 
          onValueChange={(value) => updateFilter('source', value === 'all' ? undefined : value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Todas las fuentes" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las fuentes</SelectItem>
            <SelectItem value="contact_lead">Formulario Web</SelectItem>
            <SelectItem value="apollo">Apollo</SelectItem>
            <SelectItem value="lead_score">Web Tracking</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Industry Filter */}
      <div className="space-y-2">
        <Label>Industria</Label>
        <Select 
          value={filters.industry || 'all'} 
          onValueChange={(value) => updateFilter('industry', value === 'all' ? undefined : value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Todas las industrias" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las industrias</SelectItem>
            {getUniqueIndustries().map((industry) => (
              <SelectItem key={industry} value={industry}>
                {industry}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Hot Leads Toggle */}
      <div className="space-y-2">
        <Label>Sólo Leads Calientes</Label>
        <div className="flex items-center space-x-2">
          <Switch
            checked={filters.isHotLead || false}
            onCheckedChange={(checked) => updateFilter('isHotLead', checked)}
          />
          <span className="text-sm text-admin-text-secondary">
            Puntuación ≥ 80
          </span>
        </div>
      </div>

      {/* Score Range */}
      <div className="space-y-3 md:col-span-2">
        <Label>Rango de Puntuación: {filters.minScore || 0} - {filters.maxScore || 100}</Label>
        <div className="space-y-2">
          <div className="flex gap-2">
            <div className="flex-1">
              <Label className="text-xs">Mínimo</Label>
              <Input
                type="number"
                min="0"
                max="100"
                value={filters.minScore || 0}
                onChange={(e) => updateFilter('minScore', parseInt(e.target.value) || 0)}
                className="h-8"
              />
            </div>
            <div className="flex-1">
              <Label className="text-xs">Máximo</Label>
              <Input
                type="number"
                min="0"
                max="100"
                value={filters.maxScore || 100}
                onChange={(e) => updateFilter('maxScore', parseInt(e.target.value) || 100)}
                className="h-8"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Date Range */}
      <div className="space-y-2 md:col-span-2">
        <Label>Rango de Fechas</Label>
        <div className="flex gap-2">
          <div className="flex-1">
            <Label className="text-xs">Desde</Label>
            <Input
              type="date"
              value={filters.dateRange?.start || ''}
              onChange={(e) => updateFilter('dateRange', {
                ...filters.dateRange,
                start: e.target.value
              })}
              className="h-8"
            />
          </div>
          <div className="flex-1">
            <Label className="text-xs">Hasta</Label>
            <Input
              type="date"
              value={filters.dateRange?.end || ''}
              onChange={(e) => updateFilter('dateRange', {
                ...filters.dateRange,
                end: e.target.value
              })}
              className="h-8"
            />
          </div>
        </div>
      </div>
    </div>
  );
};