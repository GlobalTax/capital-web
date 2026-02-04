// ============= CONTACTS LAYOUT (CSS GRID) =============
// Main layout using CSS Grid - no dynamic height calculations

import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw } from 'lucide-react';
import { useContacts } from './hooks/useContacts';
import { useFavoriteLeadIds } from '@/hooks/useCorporateFavorites';
import { useContactSelection } from '@/features/contacts';
import { Contact, TabType } from './types';
import ContactsHeader from './ContactsHeader';
import ContactsFilters from './ContactsFilters';
import VirtualContactsTable from './VirtualContactsTable';
import ContactDetailSheet from '../contacts/ContactDetailSheet';
import { ContactsPipelineView } from '../contacts/pipeline';
import { ContactsStatsPanel } from '@/features/contacts/components/stats/ContactsStatsPanel';

const ContactsLayout: React.FC = () => {
  const navigate = useNavigate();
  const { contacts, allContacts, stats, isLoading, filters, applyFilters, refetch } = useContacts();
  const { data: favoriteIds, isLoading: isFavoritesLoading } = useFavoriteLeadIds();
  
  const [activeTab, setActiveTab] = useState<TabType>('favorites');
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Compute displayed contacts based on active tab
  const displayedContacts = useMemo(() => {
    if (activeTab === 'favorites' && favoriteIds) {
      return contacts.filter(c => favoriteIds.has(c.id));
    }
    return contacts;
  }, [contacts, activeTab, favoriteIds]);

  const { selectedIds, selectContact, selectAll, clearSelection } = useContactSelection(displayedContacts);
  const favoriteCount = favoriteIds?.size ?? 0;

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

  const handleViewDetails = (contact: Contact) => {
    setSelectedContact(contact);
  };

  const handleNavigateToFull = (contact: Contact) => {
    setSelectedContact(null);
    navigate(`/admin/contacts/${contact.origin}_${contact.id}`);
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Cargando contactos...</p>
        </div>
      </div>
    );
  }

  // Render content based on active tab (conditional mounting)
  const renderContent = () => {
    switch (activeTab) {
      case 'favorites':
        if (favoriteCount === 0) {
          return (
            <div className="h-full flex flex-col items-center justify-center text-center bg-muted/30 border border-border rounded-lg">
              <p className="text-sm text-muted-foreground">No tienes leads favoritos</p>
              <p className="text-xs text-muted-foreground/70 mt-1">Marca leads con ★ para seguirlos aquí</p>
            </div>
          );
        }
        return (
          <VirtualContactsTable
            contacts={displayedContacts}
            selectedIds={selectedIds}
            onSelect={selectContact}
            onSelectAll={selectAll}
            onViewDetails={handleViewDetails}
            isLoading={isFavoritesLoading}
          />
        );
      
      case 'directory':
        return (
          <VirtualContactsTable
            contacts={displayedContacts}
            selectedIds={selectedIds}
            onSelect={selectContact}
            onSelectAll={selectAll}
            onViewDetails={handleViewDetails}
            isLoading={false}
          />
        );
      
      case 'pipeline':
        return (
          <ContactsPipelineView
            contacts={displayedContacts as any}
            onViewDetails={handleViewDetails as any}
            isLoading={false}
          />
        );
      
      case 'stats':
        return (
          <div className="h-full overflow-auto">
            <ContactsStatsPanel />
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <>
      {/* CSS Grid Layout: auto for header/filters, 1fr for content */}
      <div className="h-full grid grid-rows-[auto_auto_1fr] overflow-hidden gap-1">
        {/* Row 1: Header with tabs */}
        <ContactsHeader
          activeTab={activeTab}
          onTabChange={setActiveTab}
          favoriteCount={favoriteCount}
          selectedIds={selectedIds}
          contacts={displayedContacts}
          onClearSelection={clearSelection}
        />

        {/* Row 2: Filters (only for directory and favorites with content) */}
        {(activeTab === 'directory' || (activeTab === 'favorites' && favoriteCount > 0)) && (
          <ContactsFilters
            filters={filters}
            onFiltersChange={applyFilters}
            stats={stats}
            totalCount={allContacts.length}
            filteredCount={displayedContacts.length}
            onRefresh={handleRefresh}
            isRefreshing={isRefreshing}
            showStats={activeTab === 'directory'}
          />
        )}

        {/* Row 3: Content - fills remaining space */}
        <div className="min-h-0 overflow-hidden">
          {renderContent()}
        </div>
      </div>

      {/* Detail Sheet */}
      <ContactDetailSheet
        contact={selectedContact as any}
        open={!!selectedContact}
        onClose={() => setSelectedContact(null)}
        onNavigateToFull={handleNavigateToFull as any}
        onArchive={() => setSelectedContact(null)}
      />
    </>
  );
};

export default ContactsLayout;
