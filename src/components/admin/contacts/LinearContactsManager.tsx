import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUnifiedContacts, UnifiedContact } from '@/hooks/useUnifiedContacts';
import { useBrevoSync } from '@/hooks/useBrevoSync';
import { useBrevoSyncStatusBulk } from '@/hooks/useBrevoSyncStatus';
import { useContactActions, useContactSelection } from '@/features/contacts';
import { useApolloEnrichment } from '@/hooks/useApolloEnrichment';
import { useFavoriteLeadIds } from '@/hooks/useCorporateFavorites';
import LinearContactsTable from './LinearContactsTable';
import LinearFilterBar from './LinearFilterBar';
import ContactDetailSheet from './ContactDetailSheet';
import { BulkChannelSelect } from './BulkChannelSelect';
import { BulkLeadFormSelect } from './BulkLeadFormSelect';
import BulkArchiveDialog from './BulkArchiveDialog';
import BulkDeleteDialog from './BulkDeleteDialog';
import { ApolloMatchModal } from './ApolloMatchModal';
import { ContactsStatsPanel } from '@/features/contacts/components/stats/ContactsStatsPanel';
import { StatusesEditor } from './StatusesEditor';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Send, RefreshCw, CheckCircle2, Archive, Trash2, BarChart3, Users, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

const LinearContactsManager = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { 
    contacts, 
    allContacts, 
    stats, 
    isLoading, 
    filters, 
    applyFilters, 
    exportContacts, 
    refetch 
  } = useUnifiedContacts();
  
  const [selectedContact, setSelectedContact] = useState<UnifiedContact | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showArchiveDialog, setShowArchiveDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [apolloModalContact, setApolloModalContact] = useState<UnifiedContact | null>(null);
  const [activeTab, setActiveTab] = useState<'favorites' | 'directory' | 'stats'>('favorites');

  // Favorites data
  const { data: favoriteIds, isLoading: isFavoritesLoading } = useFavoriteLeadIds();
  const favoriteCount = favoriteIds?.size ?? 0;

  // Filter contacts for favorites tab
  const displayedContacts = useMemo(() => {
    if (activeTab === 'favorites' && favoriteIds) {
      return contacts.filter(c => favoriteIds.has(c.id));
    }
    return contacts;
  }, [contacts, activeTab, favoriteIds]);

  const { selectedIds, selectContact, selectAll, clearSelection } = useContactSelection(displayedContacts);
  const { enrichLead, confirmMatch, isEnriching, isConfirming } = useApolloEnrichment();
  
  // useContactActions ya no necesita onRefetch - usa optimistic updates
  const { softDelete, bulkSoftDelete, bulkHardDelete } = useContactActions();
  const { syncBulkContacts, isSyncing } = useBrevoSync();
  
  // Get sync status for all selected contacts
  const { syncedIds } = useBrevoSyncStatusBulk(selectedIds);
  
  // Calculate how many selected contacts are already synced
  const alreadySyncedCount = selectedIds.filter(id => syncedIds.has(id)).length;
  const notSyncedCount = selectedIds.length - alreadySyncedCount;

  const handleViewDetails = (contact: UnifiedContact) => {
    setSelectedContact(contact);
  };

  const handleNavigateToFull = (contact: UnifiedContact) => {
    setSelectedContact(null);
    navigate(`/admin/contacts/${contact.origin}_${contact.id}`);
  };

  const handleSoftDelete = async (contactId: string) => {
    const contact = contacts.find(c => c.id === contactId);
    if (contact) await softDelete(contact);
  };

  const handleBulkArchive = async () => {
    if (selectedIds.length === 0) return;
    setIsArchiving(true);
    try {
      const result = await bulkSoftDelete(displayedContacts, selectedIds);
      if (result.success || result.successCount > 0) {
        clearSelection();
      }
    } finally {
      setIsArchiving(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    setIsDeleting(true);
    try {
      const result = await bulkHardDelete(displayedContacts, selectedIds);
      if (result.success || result.successCount > 0) {
        clearSelection();
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const handleBulkSyncToBrevo = async () => {
    if (selectedIds.length === 0) return;
    
    // Filter out already synced contacts
    const idsToSync = selectedIds.filter(id => !syncedIds.has(id));
    
    if (idsToSync.length === 0) {
      toast({
        title: "Todos ya sincronizados",
        description: `Los ${selectedIds.length} contactos seleccionados ya están en Brevo`,
      });
      clearSelection();
      return;
    }
    
    if (alreadySyncedCount > 0) {
      toast({
        title: "Sincronización parcial",
        description: `${alreadySyncedCount} contactos ya estaban en Brevo, se sincronizarán ${idsToSync.length}`,
      });
    }
    
    await syncBulkContacts(idsToSync, displayedContacts);
    clearSelection();
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

  const handleApolloEnrich = async (contact: UnifiedContact) => {
    const result = await enrichLead(contact.id, contact.origin);
    if (result?.status === 'needs_review') {
      // Refresh to get candidates, then open modal
      await refetch();
      const updatedContact = displayedContacts.find(c => c.id === contact.id);
      if (updatedContact) {
        setApolloModalContact(updatedContact);
      }
    } else {
      // Refresh to show updated status
      refetch();
    }
  };

  const handleApolloSelectCandidate = (contact: UnifiedContact) => {
    setApolloModalContact(contact);
  };

  const handleApolloConfirmMatch = async (apolloOrgId: string) => {
    if (!apolloModalContact) return;
    await confirmMatch(apolloModalContact.id, apolloOrgId, apolloModalContact.origin);
    setApolloModalContact(null);
    refetch();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Cargando contactos...</p>
        </div>
      </div>
    );
  }

  return (
    <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'favorites' | 'directory' | 'stats')} className="space-y-6">
      {/* Header with Tabs */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-xl font-semibold text-foreground">Leads</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Gestión unificada de leads
            </p>
          </div>
          <TabsList className="h-8">
            <TabsTrigger value="favorites" className="text-xs px-3 h-6 gap-1.5">
              <Star className="h-3 w-3" />
              Favoritos {favoriteCount > 0 && <span className="text-[10px] ml-0.5 text-amber-500">({favoriteCount})</span>}
            </TabsTrigger>
            <TabsTrigger value="directory" className="text-xs px-3 h-6 gap-1.5">
              <Users className="h-3 w-3" />
              Todos
            </TabsTrigger>
            <TabsTrigger value="stats" className="text-xs px-3 h-6 gap-1.5">
              <BarChart3 className="h-3 w-3" />
              Estadísticas
            </TabsTrigger>
          </TabsList>
          {/* Status Management Button */}
          <StatusesEditor />
        </div>
        
        {selectedIds.length > 0 && (
          <div className="flex items-center gap-2">
            {/* Archivar button */}
            <Button 
              onClick={() => setShowArchiveDialog(true)}
              variant="outline" 
              size="sm"
              className="h-8"
            >
              <Archive className="h-3.5 w-3.5 mr-1.5" />
              Archivar ({selectedIds.length})
            </Button>
            
            {/* Eliminar button */}
            <Button 
              onClick={() => setShowDeleteDialog(true)}
              variant="outline" 
              size="sm"
              className="h-8 text-destructive hover:text-destructive border-destructive/50 hover:bg-destructive/10"
            >
              <Trash2 className="h-3.5 w-3.5 mr-1.5" />
              Eliminar
            </Button>

            <BulkChannelSelect 
              selectedIds={selectedIds}
              contacts={displayedContacts}
              onSuccess={clearSelection}
            />
            <BulkLeadFormSelect 
              selectedIds={selectedIds}
              contacts={displayedContacts}
              onSuccess={clearSelection}
            />
            <Button 
              onClick={handleBulkSyncToBrevo} 
              variant="secondary" 
              size="sm"
              disabled={isSyncing || notSyncedCount === 0}
              className={cn(
                "h-8",
                notSyncedCount === 0 && "border-green-500/30 text-green-600"
              )}
            >
              {notSyncedCount === 0 ? (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5 mr-1.5 text-green-600" />
                  Ya en Brevo ({selectedIds.length})
                </>
              ) : (
                <>
                  <Send className="h-3.5 w-3.5 mr-1.5" />
                  {isSyncing ? 'Sincronizando...' : `Brevo (${notSyncedCount}${alreadySyncedCount > 0 ? `/${selectedIds.length}` : ''})`}
                </>
              )}
            </Button>
          </div>
        )}
      </div>

      {/* Favorites Tab */}
      <TabsContent value="favorites" className="space-y-6 mt-0">
        {favoriteCount === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center bg-[hsl(var(--linear-bg-elevated))] border border-[hsl(var(--linear-border))] rounded-lg">
            <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center mb-4">
              <Star className="h-6 w-6 text-amber-500" />
            </div>
            <p className="text-sm text-muted-foreground">No tienes leads favoritos</p>
            <p className="text-xs text-muted-foreground/70 mt-1">Marca leads con ★ en el directorio para seguirlos aquí</p>
          </div>
        ) : (
          <>
            {/* Filter Bar for favorites */}
            <LinearFilterBar
              filters={filters}
              onFiltersChange={applyFilters}
              totalCount={favoriteCount}
              filteredCount={displayedContacts.length}
              selectedCount={selectedIds.length}
              onRefresh={handleRefresh}
              onExport={() => exportContacts('excel')}
              isRefreshing={isRefreshing}
            />

            {/* Table */}
            <LinearContactsTable
              contacts={displayedContacts}
              selectedContacts={selectedIds}
              onSelectContact={selectContact}
              onSelectAll={selectAll}
              onViewDetails={handleViewDetails}
              onSoftDelete={handleSoftDelete}
              isLoading={isLoading || isFavoritesLoading}
              onApolloEnrich={handleApolloEnrich}
              onApolloSelectCandidate={handleApolloSelectCandidate}
              isEnriching={isEnriching}
            />
          </>
        )}
      </TabsContent>

      {/* Directory Tab */}
      <TabsContent value="directory" className="space-y-6 mt-0">
        {/* Stats Cards - Compact version */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-[hsl(var(--linear-bg-elevated))] border border-[hsl(var(--linear-border))] rounded-lg p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Total</p>
            <p className="text-2xl font-semibold mt-1">{stats.total}</p>
          </div>
          <div className="bg-[hsl(var(--linear-bg-elevated))] border border-[hsl(var(--linear-border))] rounded-lg p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Valoraciones</p>
            <p className="text-2xl font-semibold mt-1 text-emerald-600">{stats.byOrigin.valuation || 0}</p>
          </div>
          <div className="bg-[hsl(var(--linear-bg-elevated))] border border-[hsl(var(--linear-border))] rounded-lg p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Únicos</p>
            <p className="text-2xl font-semibold mt-1 text-blue-600">{stats.uniqueContacts || 0}</p>
          </div>
          <div className="bg-[hsl(var(--linear-bg-elevated))] border border-[hsl(var(--linear-border))] rounded-lg p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Calificados</p>
            <p className="text-2xl font-semibold mt-1 text-amber-600">{stats.qualified || 0}</p>
          </div>
        </div>

        {/* Filter Bar */}
        <LinearFilterBar
          filters={filters}
          onFiltersChange={applyFilters}
          totalCount={allContacts.length}
          filteredCount={contacts.length}
          selectedCount={selectedIds.length}
          onRefresh={handleRefresh}
          onExport={() => exportContacts('excel')}
          isRefreshing={isRefreshing}
        />

        {/* Table */}
        <LinearContactsTable
          contacts={contacts}
          selectedContacts={selectedIds}
          onSelectContact={selectContact}
          onSelectAll={selectAll}
          onViewDetails={handleViewDetails}
          onSoftDelete={handleSoftDelete}
          isLoading={isLoading}
          onApolloEnrich={handleApolloEnrich}
          onApolloSelectCandidate={handleApolloSelectCandidate}
          isEnriching={isEnriching}
        />
      </TabsContent>

      {/* Statistics Tab */}
      <TabsContent value="stats" className="mt-0">
        <ContactsStatsPanel />
      </TabsContent>

      {/* Detail Sheet */}
      <ContactDetailSheet
        contact={selectedContact}
        open={!!selectedContact}
        onClose={() => setSelectedContact(null)}
        onNavigateToFull={handleNavigateToFull}
        onArchive={(contact) => {
          setSelectedContact(null);
          handleSoftDelete(contact.id);
        }}
      />

      {/* Bulk Archive Dialog */}
      <BulkArchiveDialog
        open={showArchiveDialog}
        onOpenChange={setShowArchiveDialog}
        selectedCount={selectedIds.length}
        onConfirm={handleBulkArchive}
        isLoading={isArchiving}
      />

      {/* Bulk Delete Dialog */}
      <BulkDeleteDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        selectedCount={selectedIds.length}
        onConfirm={handleBulkDelete}
        isLoading={isDeleting}
      />

      {/* Apollo Match Modal */}
      <ApolloMatchModal
        isOpen={!!apolloModalContact}
        onClose={() => setApolloModalContact(null)}
        candidates={apolloModalContact?.apollo_candidates || []}
        leadName={apolloModalContact?.name || ''}
        companyName={apolloModalContact?.company || ''}
        onConfirm={handleApolloConfirmMatch}
        isConfirming={!!isConfirming}
      />
    </Tabs>
  );
};

export default LinearContactsManager;
