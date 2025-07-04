import React, { useState, useCallback, useRef } from 'react';
import { useUnifiedContacts } from '@/hooks/useUnifiedContacts';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { TooltipProvider } from '@/components/ui/tooltip';
import { 
  Users, 
  UserPlus, 
  Download, 
  Upload, 
  Filter,
  Search
} from 'lucide-react';
import { ContactsTable } from './contacts/ContactsTable';
import { ContactsPagination } from './contacts/ContactsPagination';
import { ContactsLoadingSkeleton } from './contacts/ContactsLoadingSkeleton';
import { AdvancedSearchBar } from './contacts/AdvancedSearchBar';
import { QuickActions } from './contacts/QuickActions';
import { useContactSearch } from '@/hooks/useContactSearch';
import { useContactsKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';

export const ContactsManager = () => {
  const { 
    contacts, 
    allContacts, 
    isLoading, 
    filters, 
    currentPage,
    totalContacts,
    hasMore,
    applyFilters, 
    updateContactStatus,
    bulkUpdateStatus,
    exportContacts,
    nextPage,
    prevPage,
    goToPage,
    refreshContacts
  } = useUnifiedContacts();

  // State management
  const [showFilters, setShowFilters] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [selectedContactIndex, setSelectedContactIndex] = useState(-1);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const {
    searchQuery,
    searchResults,
    suggestions,
    searchHistory,
    isSearching,
    showSuggestions,
    handleSearchChange,
    selectSuggestion,
    useHistorySearch,
    clearSearch,
    toggleSuggestions,
    hasResults,
    hasQuery
  } = useContactSearch({
    contacts: allContacts
  });

  // Keyboard shortcuts callbacks
  const handleSearchFocus = useCallback(() => {
    searchInputRef.current?.focus();
  }, []);

  const handleNewContact = useCallback(() => {
    // TODO: Implement new contact modal
    console.log('New contact action');
  }, []);

  const handleExport = useCallback(() => {
    exportContacts('csv');
  }, [exportContacts]);

  const handleClearFilters = useCallback(() => {
    applyFilters({});
    clearSearch();
    setSelectedContactIndex(-1);
  }, [applyFilters, clearSearch]);

  const handleSelectNext = useCallback(() => {
    if (contacts.length > 0) {
      setSelectedContactIndex(prev => 
        prev < contacts.length - 1 ? prev + 1 : 0
      );
    }
  }, [contacts.length]);

  const handleSelectPrevious = useCallback(() => {
    if (contacts.length > 0) {
      setSelectedContactIndex(prev => 
        prev > 0 ? prev - 1 : contacts.length - 1
      );
    }
  }, [contacts.length]);

  const handleViewSelected = useCallback(() => {
    if (selectedContactIndex >= 0 && selectedContactIndex < contacts.length) {
      const selectedContact = contacts[selectedContactIndex];
      // TODO: Implement contact detail modal
      console.log('View contact:', selectedContact);
    }
  }, [selectedContactIndex, contacts]);

  // Keyboard shortcuts setup
  useContactsKeyboardShortcuts({
    onSearch: handleSearchFocus,
    onNewContact: handleNewContact,
    onExport: handleExport,
    onClearFilters: handleClearFilters,
    onSelectNext: handleSelectNext,
    onSelectPrevious: handleSelectPrevious,
    onViewSelected: handleViewSelected,
    enabled: true
  });

  // Combined search handler
  const handleCombinedSearch = useCallback((value: string) => {
    handleSearchChange(value);
    // Also apply to original filter system for backwards compatibility
    applyFilters({ ...filters, search: value });
  }, [handleSearchChange, applyFilters, filters]);

  const hasActiveFilters = Object.keys(filters).length > 0 || hasQuery;

  if (isLoading && currentPage === 1) {
    return (
      <TooltipProvider>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-admin-text-primary">
                Contactos
              </h1>
              <p className="text-admin-text-secondary">
                Cargando contactos...
              </p>
            </div>
            <QuickActions
              onSearch={handleSearchFocus}
              onNewContact={handleNewContact}
              onExport={handleExport}
              onRefresh={refreshContacts}
              onClearFilters={handleClearFilters}
              onToggleFilters={() => setShowFilters(!showFilters)}
              showShortcuts={showShortcuts}
              onToggleShortcuts={() => setShowShortcuts(!showShortcuts)}
              hasFilters={hasActiveFilters}
              isLoading={true}
            />
          </div>
          
          <ContactsLoadingSkeleton />
        </div>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-admin-text-primary">
              Contactos
            </h1>
            <p className="text-admin-text-secondary">
              {totalContacts} contactos en total
              {hasQuery && (
                <span className="ml-2 text-sm">
                  • {contacts.length} en resultados
                </span>
              )}
            </p>
          </div>
          <div className="relative">
            <QuickActions
              onSearch={handleSearchFocus}
              onNewContact={handleNewContact}
              onExport={handleExport}
              onRefresh={refreshContacts}
              onClearFilters={handleClearFilters}
              onToggleFilters={() => setShowFilters(!showFilters)}
              showShortcuts={showShortcuts}
              onToggleShortcuts={() => setShowShortcuts(!showShortcuts)}
              hasFilters={hasActiveFilters}
              isLoading={isLoading}
            />
          </div>
        </div>

        {/* Advanced Search */}
        <Card>
          <CardContent className="p-4">
            <div className="space-y-4">
              <AdvancedSearchBar
                searchQuery={searchQuery}
                onSearchChange={handleCombinedSearch}
                suggestions={suggestions}
                searchHistory={searchHistory}
                onSelectSuggestion={selectSuggestion}
                onUseHistorySearch={useHistorySearch}
                onClearSearch={clearSearch}
                isSearching={isSearching}
                showSuggestions={showSuggestions}
                onToggleSuggestions={toggleSuggestions}
                hasResults={hasResults}
                placeholder="Buscar contactos por nombre, email, empresa, teléfono..."
              />
              
              {showFilters && (
                <div className="border-t pt-4">
                  <p className="text-sm text-muted-foreground">
                    Filtros avanzados próximamente...
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Contacts Table */}
        <ContactsTable 
          contacts={contacts}
          onStatusUpdate={updateContactStatus}
          onBulkUpdate={bulkUpdateStatus}
        />

        {/* Pagination */}
        <ContactsPagination
          currentPage={currentPage}
          totalContacts={totalContacts}
          contactsPerPage={50}
          hasMore={hasMore}
          isLoading={isLoading}
          onPrevPage={prevPage}
          onNextPage={nextPage}
          onGoToPage={goToPage}
        />
      </div>
    </TooltipProvider>
  );
};

export default ContactsManager;