import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { useUnifiedContacts, ContactOrigin } from '@/hooks/useUnifiedContacts';
import ContactFilters from './ContactFilters';
import ContactsTable from './ContactsTable';
import BulkActionsToolbar from './BulkActionsToolbar';
import ContactDetailsModal from './ContactDetailsModal';
import {
  ContactStatsCards,
  ContactTabs,
  useContactActions,
  useContactSelection,
} from '@/features/contacts';

const ContactsManager = () => {
  const navigate = useNavigate();
  const { contacts, stats, isLoading, filters, applyFilters, updateContactStatus, bulkUpdateStatus, exportContacts, refetch } = useUnifiedContacts();
  const [selectedContact, setSelectedContact] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ContactOrigin | 'all'>('all');

  const { selectedIds, selectContact, selectAll, clearSelection } = useContactSelection(contacts);
  const { softDelete, hardDelete, bulkSoftDelete, bulkHardDelete } = useContactActions(refetch);

  const handleTabChange = (value: string) => {
    setActiveTab(value as ContactOrigin | 'all');
    applyFilters({
      ...filters,
      origin: value as ContactOrigin | 'all',
    });
  };

  const handleViewDetails = (contactId: string, origin: ContactOrigin) => {
    navigate(`/admin/contacts/${origin}_${contactId}`);
  };

  const handleSoftDelete = async (contactId: string) => {
    const contact = contacts.find(c => c.id === contactId);
    if (contact) await softDelete(contact);
  };

  const handleHardDelete = async (contactId: string) => {
    const contact = contacts.find(c => c.id === contactId);
    if (contact) await hardDelete(contact);
  };

  const handleBulkSoftDelete = async () => {
    const success = await bulkSoftDelete(contacts, selectedIds);
    if (success) clearSelection();
  };

  const handleBulkHardDelete = async () => {
    const success = await bulkHardDelete(contacts, selectedIds);
    if (success) clearSelection();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-2">
          <RefreshCw className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Cargando contactos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Gestión de Contactos</h1>
          <p className="text-muted-foreground mt-2">
            Sistema unificado de gestión de leads y contactos
          </p>
        </div>
        <Button onClick={refetch} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Actualizar
        </Button>
      </div>

      {/* Stats Cards - Componente modular */}
      <ContactStatsCards stats={stats} />

      {/* Filters */}
      <ContactFilters
        filters={filters}
        onFiltersChange={applyFilters}
        totalContacts={contacts.length}
      />

      {/* Bulk Actions Toolbar */}
      {selectedIds.length > 0 && (
        <BulkActionsToolbar
          selectedCount={selectedIds.length}
          onBulkUpdateStatus={bulkUpdateStatus}
          onExport={exportContacts}
          onClearSelection={clearSelection}
          selectedIds={selectedIds}
        />
      )}

      {/* Tabs - Componente modular */}
      <ContactTabs
        activeTab={activeTab}
        stats={{ total: stats.total, ...stats.byOrigin }}
        onTabChange={handleTabChange}
      >
        <ContactsTable
          contacts={contacts}
          selectedContacts={selectedIds}
          onSelectContact={selectContact}
          onSelectAll={selectAll}
          onViewDetails={handleViewDetails}
          onSoftDelete={handleSoftDelete}
          onHardDelete={handleHardDelete}
          onBulkSoftDelete={handleBulkSoftDelete}
          onBulkHardDelete={handleBulkHardDelete}
        />
      </ContactTabs>

      {/* Contact Details Modal */}
      {selectedContact && (
        <ContactDetailsModal
          contactId={selectedContact}
          contact={contacts.find(c => c.id === selectedContact)}
          onClose={() => setSelectedContact(null)}
          onUpdate={refetch}
        />
      )}
    </div>
  );
};

export default ContactsManager;
