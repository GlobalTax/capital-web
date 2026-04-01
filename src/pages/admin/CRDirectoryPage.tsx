// ============= CR DIRECTORY PAGE =============
// Directorio de Capital Riesgo (PE/VC) - Tabla virtualizada optimizada

import React, { useState, useMemo, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Users, Building2, Upload, Star, ListPlus, X, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useCRPeopleWithFunds } from '@/hooks/useCRPeople';
import { useCRFunds } from '@/hooks/useCRFunds';
import { useFavoriteFunds, useFavoritePeople } from '@/hooks/useCRFavorites';
import { CRPeopleTable } from '@/components/admin/capital-riesgo/CRPeopleTable';
import { CRFundsTableVirtualized } from '@/components/admin/capital-riesgo/CRFundsTableVirtualized';
import { CRFundFiltersBar, CRFundFiltersState } from '@/components/admin/capital-riesgo/CRFundFiltersBar';
import { CRPersonRole, CR_PERSON_ROLE_LABELS } from '@/types/capitalRiesgo';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { AddItemsToListDialog, ListItemRow } from '@/components/admin/shared/AddItemsToListDialog';

export const CRDirectoryPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('favorite-funds');
  
  // Fund filters state
  const [fundFilters, setFundFilters] = useState<CRFundFiltersState>({
    search: '',
    fundType: 'all',
    status: 'all',
    country: 'all',
    aumRange: 'all',
    hasPortfolio: null,
  });
  
  // People filters state
  const [peopleSearch, setPeopleSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<CRPersonRole | 'all'>('all');
  const [peopleFundFilter, setPeopleFundFilter] = useState<string>('all');
  const [peopleCountryFilter, setPeopleCountryFilter] = useState<string>('all');
  const [peopleHasEmail, setPeopleHasEmail] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectedFundIds, setSelectedFundIds] = useState<Set<string>>(new Set());
  const [showAddToList, setShowAddToList] = useState(false);
  const [showAddPeopleToList, setShowAddPeopleToList] = useState(false);
  // Sorting state for funds
  const [sortBy, setSortBy] = useState<'name' | 'people_count' | 'aum' | 'portfolio_count'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // People query
  const { data: people, isLoading: loadingPeople } = useCRPeopleWithFunds({
    search: peopleSearch || undefined,
    role: roleFilter !== 'all' ? roleFilter : undefined,
  });

  // Funds query - fetch all, filter client-side for performance
  const { data: allFunds, isLoading: loadingFunds } = useCRFunds({});

  // Favorites queries
  const { data: favoriteFunds, isLoading: loadingFavFunds } = useFavoriteFunds();
  const { data: favoritePeople, isLoading: loadingFavPeople } = useFavoritePeople();

  // Extract unique countries from funds
  const countries = useMemo(() => {
    const fromFunds = allFunds?.map(f => f.country_base).filter(Boolean) || [];
    const unique = [...new Set(fromFunds)];
    return unique.sort() as string[];
  }, [allFunds]);

  // Extract unique fund names for people filter
  const fundNames = useMemo(() => {
    const names = people?.map(p => p.fund?.name).filter(Boolean) || [];
    return [...new Set(names)].sort() as string[];
  }, [people]);

  // Extract unique locations for people filter
  const peopleCountries = useMemo(() => {
    const locs = people?.map(p => p.location || p.fund?.country_base).filter(Boolean) || [];
    return [...new Set(locs)].sort() as string[];
  }, [people]);

  // Filter people client-side (beyond server search/role)
  const filteredPeople = useMemo(() => {
    if (!people) return [];
    return people.filter(p => {
      if (peopleFundFilter !== 'all' && p.fund?.name !== peopleFundFilter) return false;
      if (peopleCountryFilter !== 'all') {
        const loc = p.location || p.fund?.country_base || '';
        if (loc !== peopleCountryFilter) return false;
      }
      if (peopleHasEmail && !p.email) return false;
      return true;
    });
  }, [people, peopleFundFilter, peopleCountryFilter, peopleHasEmail]);

  const hasPeopleFilters = peopleSearch || roleFilter !== 'all' || peopleFundFilter !== 'all' || peopleCountryFilter !== 'all' || peopleHasEmail;

  // Filter funds client-side
  const filteredFunds = useMemo(() => {
    if (!allFunds) return [];
    
    return allFunds.filter(fund => {
      // Search filter
      if (fundFilters.search) {
        const searchLower = fundFilters.search.toLowerCase();
        const nameMatch = fund.name?.toLowerCase().includes(searchLower);
        const sectorMatch = fund.sector_focus?.some(s => s.toLowerCase().includes(searchLower));
        if (!nameMatch && !sectorMatch) return false;
      }
      
      // Fund type filter
      if (fundFilters.fundType !== 'all' && fund.fund_type !== fundFilters.fundType) {
        return false;
      }
      
      // Country filter
      if (fundFilters.country !== 'all' && fund.country_base !== fundFilters.country) {
        return false;
      }
      
      // AUM range filter
      if (fundFilters.aumRange !== 'all') {
        const aum = fund.aum || 0;
        switch (fundFilters.aumRange) {
          case '<100M':
            if (aum >= 100000000) return false;
            break;
          case '100M-500M':
            if (aum < 100000000 || aum >= 500000000) return false;
            break;
          case '500M-1B':
            if (aum < 500000000 || aum >= 1000000000) return false;
            break;
          case '>1B':
            if (aum < 1000000000) return false;
            break;
        }
      }
      
      // Has portfolio filter
      if (fundFilters.hasPortfolio !== null) {
        const hasPortfolio = (fund.portfolio_count || 0) > 0;
        if (fundFilters.hasPortfolio !== hasPortfolio) return false;
      }
      
      return true;
    });
  }, [allFunds, fundFilters]);

  // Sort funds client-side
  const sortedFunds = useMemo(() => {
    return [...filteredFunds].sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'people_count':
          comparison = (a.people_count || 0) - (b.people_count || 0);
          break;
        case 'aum':
          comparison = (a.aum || 0) - (b.aum || 0);
          break;
        case 'portfolio_count':
          comparison = (a.portfolio_count || 0) - (b.portfolio_count || 0);
          break;
        default: // name
          const nameA = a.name?.toLowerCase() || '';
          const nameB = b.name?.toLowerCase() || '';
          comparison = nameA.localeCompare(nameB);
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [filteredFunds, sortBy, sortOrder]);

  // Handle sort toggle
  const handleSort = useCallback((field: 'name' | 'people_count' | 'aum' | 'portfolio_count') => {
    if (sortBy === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder(field === 'name' ? 'asc' : 'desc');
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

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-normal tracking-tight">Directorio Capital Riesgo</h1>
          <p className="text-sm text-muted-foreground">
            {allFunds?.length || 0} fondos · {people?.length || 0} personas
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
              value="favorite-funds"
              className="h-10 px-4 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
            >
              <Star className="h-4 w-4 mr-2 fill-yellow-400 text-yellow-400" />
              Fondos Fav ({favoriteFunds?.length || 0})
            </TabsTrigger>
            <TabsTrigger 
              value="funds"
              className="h-10 px-4 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
            >
              <Building2 className="h-4 w-4 mr-2" />
              Fondos ({sortedFunds.length})
            </TabsTrigger>
            <TabsTrigger 
              value="favorite-people"
              className="h-10 px-4 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
            >
              <Star className="h-4 w-4 mr-2 fill-yellow-400 text-yellow-400" />
              Personas Fav ({favoritePeople?.length || 0})
            </TabsTrigger>
            <TabsTrigger 
              value="people" 
              className="h-10 px-4 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
            >
              <Users className="h-4 w-4 mr-2" />
              Personas ({people?.length || 0})
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Selection toolbar - funds */}
        {selectedFundIds.size > 0 && (
          <div className="flex items-center gap-3 px-4 py-2 bg-primary/5 border border-primary/20 rounded-lg">
            <span className="text-sm font-medium">{selectedFundIds.size} fondo(s) seleccionado(s)</span>
            <Button size="sm" variant="outline" onClick={() => setShowAddToList(true)}>
              <ListPlus className="h-4 w-4 mr-1" />
              Añadir a lista
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setSelectedFundIds(new Set())}>
              <X className="h-4 w-4 mr-1" />
              Deseleccionar
            </Button>
          </div>
        )}

        {/* Selection toolbar - people */}
        {selectedIds.size > 0 && (
          <div className="flex items-center gap-3 px-4 py-2 bg-primary/5 border border-primary/20 rounded-lg">
            <span className="text-sm font-medium">{selectedIds.size} persona(s) seleccionada(s)</span>
            <Button size="sm" variant="outline" onClick={() => setShowAddPeopleToList(true)}>
              <ListPlus className="h-4 w-4 mr-1" />
              Añadir a lista
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setSelectedIds(new Set())}>
              <X className="h-4 w-4 mr-1" />
              Deseleccionar
            </Button>
          </div>
        )}

        {/* Funds Tab - with new filters bar */}
        <TabsContent value="funds" className="mt-0 space-y-3">
          <CRFundFiltersBar
            filters={fundFilters}
            onFiltersChange={setFundFilters}
            countries={countries}
            totalCount={allFunds?.length || 0}
            filteredCount={sortedFunds.length}
          />
          <CRFundsTableVirtualized 
            funds={sortedFunds}
            isLoading={loadingFunds}
            showFavorites
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSort={handleSort}
            selectedIds={selectedFundIds}
            onSelectionChange={setSelectedFundIds}
          />
        </TabsContent>

        {/* People Tab - filter bar */}
        <TabsContent value="people" className="mt-0 space-y-3">
          <div className="flex flex-col gap-3 py-2">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nombre, email..."
                  value={peopleSearch}
                  onChange={(e) => setPeopleSearch(e.target.value)}
                  className="pl-10 h-9"
                />
              </div>
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
              <Select value={peopleFundFilter} onValueChange={setPeopleFundFilter}>
                <SelectTrigger className="w-[180px] h-9">
                  <SelectValue placeholder="Fondo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los fondos</SelectItem>
                  {fundNames.map(name => (
                    <SelectItem key={name} value={name}>{name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={peopleCountryFilter} onValueChange={setPeopleCountryFilter}>
                <SelectTrigger className="w-[150px] h-9">
                  <SelectValue placeholder="Ubicación" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las ubicaciones</SelectItem>
                  {peopleCountries.map(c => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Filter className="h-3.5 w-3.5 text-muted-foreground" />
              <Badge
                variant={peopleHasEmail ? 'default' : 'outline'}
                className="cursor-pointer text-xs"
                onClick={() => setPeopleHasEmail(!peopleHasEmail)}
              >
                Con email
              </Badge>
              {hasPeopleFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
                  onClick={() => {
                    setPeopleSearch('');
                    setRoleFilter('all');
                    setPeopleFundFilter('all');
                    setPeopleCountryFilter('all');
                    setPeopleHasEmail(false);
                  }}
                >
                  <X className="h-3 w-3 mr-1" />
                  Limpiar filtros
                </Button>
              )}
            </div>
          </div>
          <CRPeopleTable 
            people={filteredPeople}
            isLoading={loadingPeople}
            selectedIds={selectedIds}
            onToggleSelection={handleToggleSelection}
            onSelectAll={handleSelectAll}
            showFavorites
          />
        </TabsContent>

        {/* Favorite Funds Tab */}
        <TabsContent value="favorite-funds" className="mt-0 pt-3">
          <CRFundsTableVirtualized 
            funds={favoriteFunds || []}
            isLoading={loadingFavFunds}
            showFavorites
            selectedIds={selectedFundIds}
            onSelectionChange={setSelectedFundIds}
          />
        </TabsContent>

        {/* Favorite People Tab */}
        <TabsContent value="favorite-people" className="mt-0 pt-3">
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

      {/* Add funds to list dialog */}
      <AddItemsToListDialog
        open={showAddToList}
        onOpenChange={setShowAddToList}
        itemLabel="fondo"
        items={(() => {
          const allFundsList = [...(allFunds || []), ...(favoriteFunds || [])];
          const uniqueFunds = allFundsList.filter((f, i, arr) => arr.findIndex(x => x.id === f.id) === i);
          return uniqueFunds
            .filter(f => selectedFundIds.has(f.id))
            .map(f => ({
              empresa: f.name || '',
              notas: [
                f.sector_focus?.length ? `Sectores: ${f.sector_focus.join(', ')}` : null,
                f.country_base ? `País: ${f.country_base}` : null,
              ].filter(Boolean).join(' | '),
            }));
        })()}
        onSuccess={() => setSelectedFundIds(new Set())}
      />

      {/* Add people to list dialog */}
      <AddItemsToListDialog
        open={showAddPeopleToList}
        onOpenChange={setShowAddPeopleToList}
        itemLabel="persona"
        items={(() => {
          const allPeople = [...(people || []), ...(favoritePeople || [])];
          const uniquePeople = allPeople.filter((p, i, arr) => arr.findIndex(x => x.id === p.id) === i);
          return uniquePeople
            .filter(p => selectedIds.has(p.id))
            .map(p => ({
              empresa: p.fund?.name || '',
              contacto: p.full_name || '',
              email: p.email || '',
              notas: [
                p.role ? `Rol: ${CR_PERSON_ROLE_LABELS[p.role as keyof typeof CR_PERSON_ROLE_LABELS] || p.role}` : null,
                p.location || p.fund?.country_base ? `Ubicación: ${p.location || p.fund?.country_base}` : null,
              ].filter(Boolean).join(' | '),
            }));
        })()}
        onSuccess={() => setSelectedIds(new Set())}
      />
    </div>
  );
};

export default CRDirectoryPage;
