// ============= SF DIRECTORY PAGE =============
// Directorio de Search Funds - Estilo Apollo

import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Users, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSFPeopleWithFunds } from '@/hooks/useSFPeopleWithFunds';
import { useSFFunds } from '@/hooks/useSFFunds';
import { SFPeopleTable } from '@/components/admin/search-funds/SFPeopleTable';
import { SFFundsTable } from '@/components/admin/search-funds/SFFundsTable';
import { SFPersonRole } from '@/types/searchFunds';

export const SFDirectoryPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('people');
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<SFPersonRole | 'all'>('all');
  const [countryFilter, setCountryFilter] = useState<string>('all');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // People query
  const { data: people, isLoading: loadingPeople } = useSFPeopleWithFunds({
    search: search || undefined,
    role: roleFilter !== 'all' ? roleFilter : undefined,
    country: countryFilter !== 'all' ? countryFilter : undefined,
  });

  // Funds query
  const { data: funds, isLoading: loadingFunds } = useSFFunds({
    search: search || undefined,
    country_base: countryFilter !== 'all' ? countryFilter : undefined,
  });

  // Extract unique countries from people/funds
  const countries = useMemo(() => {
    const fromPeople = people?.map(p => p.fund?.country_base).filter(Boolean) || [];
    const fromFunds = funds?.map(f => f.country_base).filter(Boolean) || [];
    const unique = [...new Set([...fromPeople, ...fromFunds])];
    return unique.sort() as string[];
  }, [people, funds]);

  const handleToggleSelection = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSelectAll = () => {
    if (!people) return;
    if (selectedIds.size === people.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(people.map(p => p.id)));
    }
  };

  const clearFilters = () => {
    setSearch('');
    setRoleFilter('all');
    setCountryFilter('all');
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-normal tracking-tight">Directorio Search Funds</h1>
          <p className="text-sm text-muted-foreground">
            {people?.length || 0} personas · {funds?.length || 0} funds
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link to="/admin/sf-apollo-import">
              Importar desde Apollo
            </Link>
          </Button>
          <Button asChild>
            <Link to="/admin/sf-directory/new">
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Fund
            </Link>
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex items-center justify-between border-b border-border/50">
          <TabsList className="h-10 bg-transparent p-0 border-0">
            <TabsTrigger 
              value="people" 
              className="h-10 px-4 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
            >
              <Users className="h-4 w-4 mr-2" />
              Personas ({people?.length || 0})
            </TabsTrigger>
            <TabsTrigger 
              value="funds"
              className="h-10 px-4 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
            >
              <Building2 className="h-4 w-4 mr-2" />
              Funds ({funds?.length || 0})
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Filters - Apollo style inline bar */}
        <div className="flex items-center gap-3 py-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-9"
            />
          </div>
          
          {activeTab === 'people' && (
            <Select value={roleFilter} onValueChange={(v) => setRoleFilter(v as SFPersonRole | 'all')}>
              <SelectTrigger className="w-[140px] h-9">
                <SelectValue placeholder="Rol" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los roles</SelectItem>
                <SelectItem value="searcher">Searcher</SelectItem>
                <SelectItem value="partner">Partner</SelectItem>
                <SelectItem value="principal">Principal</SelectItem>
                <SelectItem value="advisor">Advisor</SelectItem>
              </SelectContent>
            </Select>
          )}
          
          <Select value={countryFilter} onValueChange={setCountryFilter}>
            <SelectTrigger className="w-[140px] h-9">
              <SelectValue placeholder="País" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los países</SelectItem>
              {countries.map(country => (
                <SelectItem key={country} value={country}>{country}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {(search || roleFilter !== 'all' || countryFilter !== 'all') && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="h-9">
              Limpiar filtros
            </Button>
          )}
        </div>

        <TabsContent value="people" className="mt-0">
          <SFPeopleTable 
            people={people || []}
            isLoading={loadingPeople}
            selectedIds={selectedIds}
            onToggleSelection={handleToggleSelection}
            onSelectAll={handleSelectAll}
          />
        </TabsContent>

        <TabsContent value="funds" className="mt-0">
          <SFFundsTable 
            funds={funds || []}
            isLoading={loadingFunds}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SFDirectoryPage;
