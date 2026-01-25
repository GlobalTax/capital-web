// =============================================
// CORPORATE BUYERS PAGE
// =============================================

import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Download, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CorporateBuyersTable, 
  CorporateFiltersBar, 
  CorporateKPIs 
} from '@/components/admin/corporate-buyers';
import { useCorporateBuyers, useCorporateBuyerCountries } from '@/hooks/useCorporateBuyers';
import { useFavoriteBuyerIds, useToggleCorporateFavorite } from '@/hooks/useCorporateFavorites';
import { CorporateBuyersFilters } from '@/types/corporateBuyers';

const CorporateBuyersPage = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<CorporateBuyersFilters>({});
  const [activeTab, setActiveTab] = useState('favorites');

  // Data hooks
  const { data: buyers = [], isLoading: loadingBuyers } = useCorporateBuyers(filters);
  const { data: countries = [] } = useCorporateBuyerCountries();
  const { data: favoriteIds = new Set(), isLoading: loadingFavorites } = useFavoriteBuyerIds();
  const toggleFavorite = useToggleCorporateFavorite();

  // Filter buyers based on tab
  const displayedBuyers = useMemo(() => {
    if (activeTab === 'favorites') {
      return buyers.filter(b => favoriteIds.has(b.id));
    }
    return buyers;
  }, [buyers, favoriteIds, activeTab]);

  const handleToggleFavorite = (id: string, isFavorite: boolean) => {
    toggleFavorite.mutate({ entityType: 'buyer', entityId: id, isFavorite });
  };

  const isLoading = loadingBuyers || loadingFavorites;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Compradores Corporativos</h1>
          <p className="text-muted-foreground">
            Directorio de compradores estratégicos, family offices y fondos
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1">
            <Upload className="h-4 w-4" />
            Importar
          </Button>
          <Button variant="outline" size="sm" className="gap-1">
            <Download className="h-4 w-4" />
            Exportar
          </Button>
          <Button 
            size="sm" 
            className="gap-1"
            onClick={() => navigate('/admin/corporate-buyers/new')}
          >
            <Plus className="h-4 w-4" />
            Nuevo
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <CorporateKPIs buyers={buyers} favoritesCount={favoriteIds.size} />

      {/* Filters */}
      <CorporateFiltersBar
        filters={filters}
        onFiltersChange={setFilters}
        countries={countries}
      />

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="favorites" className="gap-1">
            ⭐ Favoritos
            <span className="text-xs bg-muted px-1.5 py-0.5 rounded-full">
              {buyers.filter(b => favoriteIds.has(b.id)).length}
            </span>
          </TabsTrigger>
          <TabsTrigger value="all" className="gap-1">
            Todos
            <span className="text-xs bg-muted px-1.5 py-0.5 rounded-full">
              {buyers.length}
            </span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="favorites" className="mt-4">
          <CorporateBuyersTable
            buyers={displayedBuyers}
            favoriteIds={favoriteIds}
            onToggleFavorite={handleToggleFavorite}
            isLoading={isLoading}
          />
        </TabsContent>

        <TabsContent value="all" className="mt-4">
          <CorporateBuyersTable
            buyers={displayedBuyers}
            favoriteIds={favoriteIds}
            onToggleFavorite={handleToggleFavorite}
            isLoading={isLoading}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CorporateBuyersPage;
