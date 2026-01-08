import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUnifiedContacts, ContactOrigin, UnifiedContact } from '@/hooks/useUnifiedContacts';
import { useBrevoSync } from '@/hooks/useBrevoSync';
import { useBrevoSyncStatusBulk } from '@/hooks/useBrevoSyncStatus';
import { useContactActions, useContactSelection } from '@/features/contacts';
import LinearContactsTable from './LinearContactsTable';
import LinearFilterBar from './LinearFilterBar';
import ContactDetailSheet from './ContactDetailSheet';
import { ContactStatsCards } from '@/features/contacts';
import { BulkChannelSelect } from './BulkChannelSelect';
import { Button } from '@/components/ui/button';
import { Send, RefreshCw, CheckCircle2 } from 'lucide-react';
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

  const { selectedIds, selectContact, selectAll, clearSelection } = useContactSelection(contacts);
  const { softDelete } = useContactActions(refetch);
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
    
    await syncBulkContacts(idsToSync, contacts);
    clearSelection();
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Contactos</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Gestión unificada de leads y contactos
          </p>
        </div>
        
        {selectedIds.length > 0 && (
          <div className="flex items-center gap-2">
            <BulkChannelSelect 
              selectedIds={selectedIds}
              contacts={contacts}
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
      />

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
    </div>
  );
};

export default LinearContactsManager;
