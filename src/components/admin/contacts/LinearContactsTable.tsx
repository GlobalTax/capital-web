// ============= VIRTUALIZED CONTACTS TABLE =============
import React, { useMemo, useCallback, useRef, useState, useEffect } from 'react';
import { FixedSizeList as List } from 'react-window';
import { Checkbox } from '@/components/ui/checkbox';
import { Building2 } from 'lucide-react';
import { UnifiedContact, ContactOrigin } from '@/hooks/useUnifiedContacts';
import { TooltipProvider } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { SelectOption } from '@/components/admin/shared/EditableSelect';
import { useAcquisitionChannels, CATEGORY_COLORS } from '@/hooks/useAcquisitionChannels';
import { useContactInlineUpdate } from '@/hooks/useInlineUpdate';
import { ContactTableRow, COL_STYLES, STATUS_OPTIONS } from './ContactTableRow';

// Minimum table width to ensure all columns fit
const MIN_TABLE_WIDTH = 1000;

interface LinearContactsTableProps {
  contacts: UnifiedContact[];
  selectedContacts: string[];
  onSelectContact: (contactId: string) => void;
  onSelectAll: () => void;
  onViewDetails: (contact: UnifiedContact) => void;
  onSoftDelete?: (contactId: string) => void;
  isLoading?: boolean;
  onApolloEnrich?: (contact: UnifiedContact) => void;
  onApolloSelectCandidate?: (contact: UnifiedContact) => void;
  isEnriching?: string | null;
}

// Row height for virtualization
const ROW_HEIGHT = 52;

// Helper to get channel color
const getChannelColor = (category?: string) => {
  if (!category) return '#6b7280';
  if (CATEGORY_COLORS[category]?.includes('rose')) return '#f43f5e';
  if (CATEGORY_COLORS[category]?.includes('emerald')) return '#10b981';
  if (CATEGORY_COLORS[category]?.includes('blue')) return '#3b82f6';
  if (CATEGORY_COLORS[category]?.includes('amber')) return '#f59e0b';
  return '#6b7280';
};

// Table Header Component - memoized with scroll sync
const TableHeader = React.memo<{
  allSelected: boolean;
  someSelected: boolean;
  onSelectAll: () => void;
  scrollLeft: number;
}>(({ allSelected, someSelected, onSelectAll, scrollLeft }) => (
  <div className="overflow-hidden border-b border-[hsl(var(--linear-border))]">
    <div 
      className="flex bg-[hsl(var(--linear-bg-elevated))]"
      style={{ 
        minWidth: MIN_TABLE_WIDTH, 
        transform: `translateX(-${scrollLeft}px)` 
      }}
    >
      <div className="flex items-center justify-center h-10 px-2" style={{ flex: COL_STYLES.checkbox.flex, minWidth: COL_STYLES.checkbox.minWidth }}>
        <Checkbox
          checked={allSelected}
          ref={(el) => {
            if (el) (el as any).indeterminate = someSelected;
          }}
          onCheckedChange={onSelectAll}
          className="border-muted-foreground/30"
        />
      </div>
      <div className="flex items-center h-10 px-2 text-xs font-medium text-muted-foreground uppercase tracking-wider" style={{ flex: COL_STYLES.contact.flex, minWidth: COL_STYLES.contact.minWidth }}>
        Contacto
      </div>
      <div className="flex items-center h-10 px-2 text-xs font-medium text-muted-foreground uppercase tracking-wider" style={{ flex: COL_STYLES.origin.flex, minWidth: COL_STYLES.origin.minWidth }}>
        Origen
      </div>
      <div className="flex items-center h-10 px-2 text-xs font-medium text-muted-foreground uppercase tracking-wider" style={{ flex: COL_STYLES.channel.flex, minWidth: COL_STYLES.channel.minWidth }}>
        Canal
      </div>
      <div className="flex items-center h-10 px-2 text-xs font-medium text-muted-foreground uppercase tracking-wider" style={{ flex: COL_STYLES.company.flex, minWidth: COL_STYLES.company.minWidth }}>
        Empresa
      </div>
      <div className="flex items-center h-10 px-2 text-xs font-medium text-muted-foreground uppercase tracking-wider" style={{ flex: COL_STYLES.status.flex, minWidth: COL_STYLES.status.minWidth }}>
        Estado
      </div>
      <div className="flex items-center h-10 px-2 text-xs font-medium text-muted-foreground uppercase tracking-wider" style={{ flex: COL_STYLES.financials.flex, minWidth: COL_STYLES.financials.minWidth }}>
        Financieros
      </div>
      <div className="flex items-center h-10 px-2 text-xs font-medium text-muted-foreground uppercase tracking-wider" style={{ flex: COL_STYLES.apollo.flex, minWidth: COL_STYLES.apollo.minWidth }}>
        Apollo
      </div>
      <div className="flex items-center h-10 px-2 text-xs font-medium text-muted-foreground uppercase tracking-wider" style={{ flex: COL_STYLES.date.flex, minWidth: COL_STYLES.date.minWidth }}>
        Fecha
      </div>
      <div style={{ flex: COL_STYLES.actions.flex, minWidth: COL_STYLES.actions.minWidth }} />
    </div>
  </div>
));

TableHeader.displayName = 'TableHeader';

// Item data for virtualized list
interface ItemData {
  contacts: UnifiedContact[];
  selectedContacts: Set<string>;
  channelOptions: SelectOption[];
  onSelect: (id: string) => void;
  onViewDetails: (contact: UnifiedContact) => void;
  onUpdateField: (id: string, origin: ContactOrigin, field: string, value: string | null) => Promise<void>;
  onSoftDelete?: (id: string) => void;
  onApolloEnrich?: (contact: UnifiedContact) => void;
  onApolloSelectCandidate?: (contact: UnifiedContact) => void;
  isEnriching?: string | null;
}

// Virtualized Row wrapper
const VirtualizedRow = React.memo<{ 
  index: number; 
  style: React.CSSProperties; 
  data: ItemData;
}>(({ index, style, data }) => {
  const contact = data.contacts[index];
  const isSelected = data.selectedContacts.has(contact.id);
  const isLast = index === data.contacts.length - 1;
  
  return (
    <ContactTableRow
      style={style}
      contact={contact}
      isSelected={isSelected}
      channelOptions={data.channelOptions}
      onSelect={data.onSelect}
      onViewDetails={data.onViewDetails}
      onUpdateField={data.onUpdateField}
      onSoftDelete={data.onSoftDelete}
      onApolloEnrich={data.onApolloEnrich}
      onApolloSelectCandidate={data.onApolloSelectCandidate}
      isEnriching={data.isEnriching === contact.id}
      isLast={isLast}
    />
  );
});

VirtualizedRow.displayName = 'VirtualizedRow';

const LinearContactsTable: React.FC<LinearContactsTableProps> = ({
  contacts,
  selectedContacts,
  onSelectContact,
  onSelectAll,
  onViewDetails,
  onSoftDelete,
  isLoading = false,
  onApolloEnrich,
  onApolloSelectCandidate,
  isEnriching,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [listHeight, setListHeight] = useState(500);
  const [scrollLeft, setScrollLeft] = useState(0);
  
  const allSelected = contacts.length > 0 && selectedContacts.length === contacts.length;
  const someSelected = selectedContacts.length > 0 && selectedContacts.length < contacts.length;
  
  // Hooks for inline editing
  const { channels } = useAcquisitionChannels();
  const { update: updateContact } = useContactInlineUpdate();
  
  // Calculate dynamic height based on container
  useEffect(() => {
    const updateHeight = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        // Leave some space for footer/padding
        const availableHeight = window.innerHeight - rect.top - 60;
        setListHeight(Math.max(300, Math.min(availableHeight, 800)));
      }
    };
    
    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, []);
  
  // Memoize selected contacts as Set for O(1) lookup
  const selectedSet = useMemo(() => new Set(selectedContacts), [selectedContacts]);
  
  // Memoize channel options
  const channelOptions = useMemo<SelectOption[]>(() => 
    channels.map(ch => ({
      value: ch.id,
      label: ch.name,
      color: getChannelColor(ch.category),
    })), [channels]
  );

  // Memoize update handler
  const handleUpdateField = useCallback(
    async (contactId: string, origin: ContactOrigin, field: string, value: string | null) => {
      await updateContact(contactId, origin, field, value);
    },
    [updateContact]
  );

  // Handle horizontal scroll sync via native scroll event
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;
    
    const handleHorizontalScroll = () => {
      setScrollLeft(scrollContainer.scrollLeft);
    };
    
    scrollContainer.addEventListener('scroll', handleHorizontalScroll);
    return () => scrollContainer.removeEventListener('scroll', handleHorizontalScroll);
  }, []);

  // Item data for virtualized list - memoized
  const itemData = useMemo<ItemData>(() => ({
    contacts,
    selectedContacts: selectedSet,
    channelOptions,
    onSelect: onSelectContact,
    onViewDetails,
    onUpdateField: handleUpdateField,
    onSoftDelete,
    onApolloEnrich,
    onApolloSelectCandidate,
    isEnriching,
  }), [
    contacts,
    selectedSet,
    channelOptions,
    onSelectContact,
    onViewDetails,
    handleUpdateField,
    onSoftDelete,
    onApolloEnrich,
    onApolloSelectCandidate,
    isEnriching,
  ]);

  if (contacts.length === 0 && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mb-4">
          <Building2 className="h-6 w-6 text-muted-foreground/50" />
        </div>
        <p className="text-sm text-muted-foreground">No se encontraron contactos</p>
        <p className="text-xs text-muted-foreground/70 mt-1">Ajusta los filtros o añade nuevos contactos</p>
      </div>
    );
  }

  return (
    <TooltipProvider delayDuration={300}>
      <div 
        ref={containerRef}
        className="border border-[hsl(var(--linear-border))] rounded-lg overflow-hidden bg-[hsl(var(--linear-bg))]"
      >
        {/* Header with scroll sync */}
        <TableHeader 
          allSelected={allSelected}
          someSelected={someSelected}
          onSelectAll={onSelectAll}
          scrollLeft={scrollLeft}
        />
        
        {/* Virtualized List with horizontal scroll */}
        <div ref={scrollContainerRef} className="overflow-x-auto">
          <div style={{ minWidth: MIN_TABLE_WIDTH }}>
            <List
              height={listHeight}
              width="100%"
              itemCount={contacts.length}
              itemSize={ROW_HEIGHT}
              itemData={itemData}
              overscanCount={5}
            >
              {VirtualizedRow}
            </List>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default React.memo(LinearContactsTable);
