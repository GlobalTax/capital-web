// ============= CONTACTS HEADER =============
// Header with tabs and bulk actions

import React from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Star, Users, Kanban, BarChart3, Archive, Trash2, Send } from 'lucide-react';
import { TabType, Contact } from './types';
import { useBrevoSync } from '@/hooks/useBrevoSync';
import { useContactActions } from '@/features/contacts';
import { BulkStatusSelect } from '../contacts/BulkStatusSelect';
import { BulkChannelSelect } from '../contacts/BulkChannelSelect';
import { BulkLeadFormSelect } from '../contacts/BulkLeadFormSelect';
import { StatusesEditor } from '../contacts/StatusesEditor';

interface ContactsHeaderProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  favoriteCount: number;
  selectedIds: string[];
  contacts: Contact[];
  onClearSelection: () => void;
}

const ContactsHeader: React.FC<ContactsHeaderProps> = ({
  activeTab,
  onTabChange,
  favoriteCount,
  selectedIds,
  contacts,
  onClearSelection,
}) => {
  const { syncBulkContacts, isSyncing } = useBrevoSync();
  const { bulkSoftDelete, bulkHardDelete } = useContactActions();

  const handleBulkArchive = async () => {
    if (selectedIds.length === 0) return;
    const result = await bulkSoftDelete(contacts as any, selectedIds);
    if (result.success || result.successCount > 0) {
      onClearSelection();
    }
  };

  const handleBulkSync = async () => {
    if (selectedIds.length === 0) return;
    await syncBulkContacts(selectedIds, contacts as any);
    onClearSelection();
  };

  return (
    <div className="flex items-center justify-between shrink-0 pb-1">
      <div className="flex items-center gap-3">
        <h1 className="text-lg font-semibold text-foreground">Leads</h1>
        
        <Tabs value={activeTab} onValueChange={(v) => onTabChange(v as TabType)}>
          <TabsList className="h-7">
            <TabsTrigger value="favorites" className="text-[11px] px-2.5 h-5 gap-1">
              <Star className="h-3 w-3" />
              Favoritos {favoriteCount > 0 && <span className="text-[10px] text-amber-500">({favoriteCount})</span>}
            </TabsTrigger>
            <TabsTrigger value="directory" className="text-[11px] px-2.5 h-5 gap-1">
              <Users className="h-3 w-3" />
              Todos
            </TabsTrigger>
            <TabsTrigger value="pipeline" className="text-[11px] px-2.5 h-5 gap-1">
              <Kanban className="h-3 w-3" />
              Pipeline
            </TabsTrigger>
            <TabsTrigger value="stats" className="text-[11px] px-2.5 h-5 gap-1">
              <BarChart3 className="h-3 w-3" />
              Stats
            </TabsTrigger>
          </TabsList>
        </Tabs>
        
        <StatusesEditor />
      </div>

      {/* Bulk Actions */}
      {selectedIds.length > 0 && (
        <div className="flex items-center gap-1.5">
          <Button
            onClick={handleBulkArchive}
            variant="outline"
            size="sm"
            className="h-7 text-xs"
          >
            <Archive className="h-3 w-3 mr-1" />
            Archivar ({selectedIds.length})
          </Button>

          <BulkStatusSelect
            selectedIds={selectedIds}
            contacts={contacts as any}
            onSuccess={onClearSelection}
          />

          <BulkChannelSelect
            selectedIds={selectedIds}
            contacts={contacts as any}
            onSuccess={onClearSelection}
          />

          <BulkLeadFormSelect
            selectedIds={selectedIds}
            contacts={contacts as any}
            onSuccess={onClearSelection}
          />

          <Button
            onClick={handleBulkSync}
            variant="secondary"
            size="sm"
            disabled={isSyncing}
            className="h-7 text-xs"
          >
            <Send className="h-3 w-3 mr-1" />
            {isSyncing ? 'Sync...' : `Brevo (${selectedIds.length})`}
          </Button>
        </div>
      )}
    </div>
  );
};

export default ContactsHeader;
