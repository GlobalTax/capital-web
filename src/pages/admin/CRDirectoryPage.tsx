// ============= CR DIRECTORY PAGE =============
// Directorio de Capital Riesgo (PE/VC) - Estilo Apollo

import React, { useState, useMemo, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Search, Users, Building2, Upload, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCRPeopleWithFunds } from '@/hooks/useCRPeople';
import { useCRFunds } from '@/hooks/useCRFunds';
import { useFavoriteFunds, useFavoritePeople } from '@/hooks/useCRFavorites';
import { CRPeopleTable } from '@/components/admin/capital-riesgo/CRPeopleTable';
import { CRFundsTable } from '@/components/admin/capital-riesgo/CRFundsTable';
import { CRPersonRole, CRFundType, CR_PERSON_ROLE_LABELS, CR_FUND_TYPE_LABELS } from '@/types/capitalRiesgo';

export const CRDirectoryPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('funds');
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<CRPersonRole | 'all'>('all');
  const [fundTypeFilter, setFundTypeFilter] = useState<CRFundType | 'all'>('all');
  const [countryFilter, setCountryFilter] = useState<string>('all');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  
  // Sorting state for funds
  const [sortBy, setSortBy] = useState<'name' | 'people_count'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // People query
  const { data: people, isLoading: loadingPeople } = useCRPeopleWithFunds({
    search: search || undefined,
    role: roleFilter !== 'all' ? roleFilter : undefined,
  });

  // Funds query
  const { data: funds, isLoading: loadingFunds } = useCRFunds({
    search: search || undefined,
    fund_type: fundTypeFilter !== 'all' ? fundTypeFilter : undefined,
    country: countryFilter !== 'all' ? countryFilter : undefined,
  });

  // Favorites queries
  const { data: favoriteFunds, isLoading: loadingFavFunds } = useFavoriteFunds();
  const { data: favoritePeople, isLoading: loadingFavPeople } = useFavoritePeople();

  // Extract unique countries from funds
  const countries = useMemo(() => {
    const fromFunds = funds?.map(f => f.country_base).filter(Boolean) || [];
    const unique = [...new Set(fromFunds)];
    return unique.sort() as string[];
  }, [funds]);

  // Sort funds client-side
  const sortedFunds = useMemo(() => {
    if (!funds) return [];
    
    return [...funds].sort((a, b) => {
      if (sortBy === 'people_count') {
        const countA = a.people_count || 0;
        const countB = b.people_count || 0;
        return sortOrder === 'asc' ? countA - countB : countB - countA;
      }
      // Default: sort by name
      const nameA = a.name?.toLowerCase() || '';
      const nameB = b.name?.toLowerCase() || '';
      return sortOrder === 'asc' 
        ? nameA.localeCompare(nameB) 
        : nameB.localeCompare(nameA);
    });
  }, [funds, sortBy, sortOrder]);

  // Handle sort toggle
  const handleSort = useCallback((field: 'name' | 'people_count') => {
    if (sortBy === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder(field === 'people_count' ? 'desc' : 'asc');
    }
  }, [sortBy]);

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
    setFundTypeFilter('all');
    setCountryFilter('all');
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-normal tracking-tight">Directorio Capital Riesgo</h1>
          <p className="text-sm text-muted-foreground">
            {funds?.length || 0} fondos · {people?.length || 0} personas
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={() => navigate('/admin/cr-apollo-import')}
          >
            <Upload className="mr-2 h-4 w-4" />
            Importar desde Apollo
          </Button>
          <Button asChild>
            <Link to="/admin/cr-directory/new">
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
              value="funds"
              className="h-10 px-4 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
            >
              <Building2 className="h-4 w-4 mr-2" />
              Fondos ({funds?.length || 0})
            </TabsTrigger>
            <TabsTrigger 
              value="people" 
              className="h-10 px-4 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
            >
              <Users className="h-4 w-4 mr-2" />
              Personas ({people?.length || 0})
            </TabsTrigger>
            <TabsTrigger 
              value="favorite-funds"
              className="h-10 px-4 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
            >
              <Star className="h-4 w-4 mr-2 fill-yellow-400 text-yellow-400" />
              Fondos Fav ({favoriteFunds?.length || 0})
            </TabsTrigger>
            <TabsTrigger 
              value="favorite-people"
              className="h-10 px-4 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
            >
              <Star className="h-4 w-4 mr-2 fill-yellow-400 text-yellow-400" />
              Personas Fav ({favoritePeople?.length || 0})
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
            <Select value={roleFilter} onValueChange={(v) => setRoleFilter(v as CRPersonRole | 'all')}>
              <SelectTrigger className="w-[160px] h-9">
                <SelectValue placeholder="Rol" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los roles</SelectItem>
                {Object.entries(CR_PERSON_ROLE_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {activeTab === 'funds' && (
            <Select value={fundTypeFilter} onValueChange={(v) => setFundTypeFilter(v as CRFundType | 'all')}>
              <SelectTrigger className="w-[160px] h-9">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tipos</SelectItem>
                {Object.entries(CR_FUND_TYPE_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
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

          {(search || roleFilter !== 'all' || fundTypeFilter !== 'all' || countryFilter !== 'all') && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="h-9">
              Limpiar filtros
            </Button>
          )}
        </div>

        <TabsContent value="funds" className="mt-0">
          <CRFundsTable 
            funds={sortedFunds}
            isLoading={loadingFunds}
            showFavorites
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSort={handleSort}
          />
        </TabsContent>

        <TabsContent value="people" className="mt-0">
          <CRPeopleTable 
            people={people || []}
            isLoading={loadingPeople}
            selectedIds={selectedIds}
            onToggleSelection={handleToggleSelection}
            onSelectAll={handleSelectAll}
            showFavorites
          />
        </TabsContent>

        <TabsContent value="favorite-funds" className="mt-0">
          <CRFundsTable 
            funds={favoriteFunds || []}
            isLoading={loadingFavFunds}
            showFavorites
          />
        </TabsContent>

        <TabsContent value="favorite-people" className="mt-0">
          <CRPeopleTable 
            people={favoritePeople || []}
            isLoading={loadingFavPeople}
            selectedIds={selectedIds}
            onToggleSelection={handleToggleSelection}
            onSelectAll={handleSelectAll}
            showFavorites
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CRDirectoryPage;
