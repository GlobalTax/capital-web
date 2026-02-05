// =============================================
// CORPORATE BUYERS PAGE
// =============================================

import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Download, Upload, RefreshCw, X, Target, Mail, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  CorporateBuyersTable, 
  CorporateFiltersBar, 
  CorporateKPIs,
  BatchEnrichmentDialog,
  AutoConfigDialog,
  CorporateEmailDialog,
  CorporateBuyersImportModal,
  BulkDeleteBuyersDialog
} from '@/components/admin/corporate-buyers';
import { useCorporateBuyers, useCorporateBuyerCountries, useBulkDeleteCorporateBuyers, useToggleBuyerReviewed } from '@/hooks/useCorporateBuyers';
import { useFavoriteBuyerIds, useToggleCorporateFavorite } from '@/hooks/useCorporateFavorites';
import { CorporateBuyersFilters } from '@/types/corporateBuyers';

const CorporateBuyersPage = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<CorporateBuyersFilters>({});
  const [activeTab, setActiveTab] = useState('favorites');
  
  // Selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showBatchDialog, setShowBatchDialog] = useState(false);
  const [showAutoConfigDialog, setShowAutoConfigDialog] = useState(false);
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const bulkDelete = useBulkDeleteCorporateBuyers();
  const { mutate: toggleReviewed } = useToggleBuyerReviewed();

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

  // Calculate selection stats
  const selectionStats = useMemo(() => {
    const selectedBuyers = buyers.filter(b => selectedIds.has(b.id));
    const withWebsite = selectedBuyers.filter(b => b.website);
    return {
      total: selectedIds.size,
      withWebsite: withWebsite.length,
    };
  }, [buyers, selectedIds]);

  // Get selected buyers for dialog
  const selectedBuyers = useMemo(() => {
    return buyers.filter(b => selectedIds.has(b.id));
  }, [buyers, selectedIds]);

  // Calculate auto-config candidates
  const autoConfigCandidates = useMemo(() => {
    return buyers.filter(b => 
      b.description && 
      b.description.length >= 50 &&
      (!b.sector_focus || b.sector_focus.length === 0)
    );
  }, [buyers]);

  const handleToggleFavorite = (id: string, isFavorite: boolean) => {
    toggleFavorite.mutate({ entityType: 'buyer', entityId: id, isFavorite });
  };

  const handleClearSelection = () => {
    setSelectedIds(new Set());
  };

  const handleBatchComplete = () => {
    setSelectedIds(new Set());
    setShowBatchDialog(false);
  };

  const handleBulkDelete = async () => {
    setIsDeleting(true);
    try {
      await bulkDelete.mutateAsync(Array.from(selectedIds));
      setSelectedIds(new Set());
      setShowDeleteDialog(false);
    } catch (error) {
      // Error handled in hook
    } finally {
      setIsDeleting(false);
    }
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
          {/* Selection Actions */}
          {selectedIds.size > 0 && (
            <>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={handleClearSelection}
                className="gap-1"
              >
                <X className="h-4 w-4" />
                Deseleccionar ({selectedIds.size})
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowBatchDialog(true)}
                disabled={selectionStats.withWebsite === 0}
                className="gap-1"
              >
                <RefreshCw className="h-4 w-4" />
                Enriquecer
                <Badge variant="secondary" className="ml-1">
                  {selectionStats.withWebsite}
                </Badge>
              </Button>
              <Button 
                variant="default" 
                size="sm"
                onClick={() => setShowEmailDialog(true)}
                className="gap-1"
              >
                <Mail className="h-4 w-4" />
                Email
              </Button>
              <Button 
                variant="destructive" 
                size="sm"
                onClick={() => setShowDeleteDialog(true)}
                className="gap-1"
              >
                <Trash2 className="h-4 w-4" />
                Eliminar
              </Button>
            </>
          )}
          
          {/* Auto-config button */}
          {autoConfigCandidates.length > 0 && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowAutoConfigDialog(true)}
              className="gap-1"
            >
              <Target className="h-4 w-4" />
              Auto-configurar
              <Badge variant="secondary" className="ml-1">
                {autoConfigCandidates.length}
              </Badge>
            </Button>
          )}
          
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-1"
            onClick={() => setShowImportModal(true)}
          >
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
            onToggleReviewed={(id, isReviewed) => toggleReviewed({ id, isReviewed })}
            isLoading={isLoading}
            selectedIds={selectedIds}
            onSelectionChange={setSelectedIds}
            selectionMode={true}
          />
        </TabsContent>

        <TabsContent value="all" className="mt-4">
          <CorporateBuyersTable
            buyers={displayedBuyers}
            favoriteIds={favoriteIds}
            onToggleFavorite={handleToggleFavorite}
            onToggleReviewed={(id, isReviewed) => toggleReviewed({ id, isReviewed })}
            isLoading={isLoading}
            selectedIds={selectedIds}
            onSelectionChange={setSelectedIds}
            selectionMode={true}
          />
        </TabsContent>
      </Tabs>

      {/* Batch Enrichment Dialog */}
      <BatchEnrichmentDialog
        open={showBatchDialog}
        onClose={() => setShowBatchDialog(false)}
        buyers={selectedBuyers}
        onComplete={handleBatchComplete}
      />

      {/* Auto-Config Dialog */}
      <AutoConfigDialog
        open={showAutoConfigDialog}
        onClose={() => setShowAutoConfigDialog(false)}
        buyers={buyers}
        onComplete={() => setShowAutoConfigDialog(false)}
      />

      {/* Email Dialog */}
      <CorporateEmailDialog
        open={showEmailDialog}
        onClose={() => {
          setShowEmailDialog(false);
          setSelectedIds(new Set());
        }}
        buyers={selectedBuyers}
      />

      {/* Delete Confirmation Dialog */}
      <BulkDeleteBuyersDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        selectedCount={selectedIds.size}
        onConfirm={handleBulkDelete}
        isLoading={isDeleting}
      />

      {/* Import Modal */}
      <CorporateBuyersImportModal
        open={showImportModal}
        onClose={() => setShowImportModal(false)}
      />
    </div>
  );
};

export default CorporateBuyersPage;
