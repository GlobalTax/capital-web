// ============= VIRTUALIZED CONTACTS TABLE WITH SORTING =============
import React, { useMemo, useCallback, useRef, useState, useEffect } from 'react';
import { FixedSizeList as List } from 'react-window';
import { Checkbox } from '@/components/ui/checkbox';
import { Building2, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { UnifiedContact, ContactOrigin } from '@/hooks/useUnifiedContacts';
import { TooltipProvider } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { SelectOption } from '@/components/admin/shared/EditableSelect';
import { useAcquisitionChannels, CATEGORY_COLORS } from '@/hooks/useAcquisitionChannels';
import { useContactInlineUpdate } from '@/hooks/useInlineUpdate';
import { ContactTableRow } from './ContactTableRow';
import { useContactStatuses, STATUS_COLOR_MAP, ContactStatus } from '@/hooks/useContactStatuses';
import { useLeadForms } from '@/hooks/useLeadForms';

// ===== COLUMN WIDTHS IN FIXED PIXELS (like empresas pattern) =====
export const COLUMN_WIDTHS: Record<string, number> = {
  star: 36,
  checkbox: 40,
  contact: 180,
  origin: 90,      // F. Registro
  channel: 130,
  company: 150,
  province: 80,
  sector: 100,
  status: 120,
  revenue: 75,
  ebitda: 75,
  apollo: 80,
  date: 85,
  actions: 44,
};

// Calculate total width from column widths
const TOTAL_TABLE_WIDTH = Object.values(COLUMN_WIDTHS).reduce((sum, w) => sum + w, 0);

// Sortable column keys
type SortColumn = 'lead_received_at' | 'created_at' | 'revenue' | 'ebitda' | 'name' | 'company' | null;
type SortDirection = 'asc' | 'desc';

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

// Row height for virtualization - compact
const ROW_HEIGHT = 44;

// Helper to get channel color
const getChannelColor = (category?: string) => {
  if (!category) return '#6b7280';
  if (CATEGORY_COLORS[category]?.includes('rose')) return '#f43f5e';
  if (CATEGORY_COLORS[category]?.includes('emerald')) return '#10b981';
  if (CATEGORY_COLORS[category]?.includes('blue')) return '#3b82f6';
  if (CATEGORY_COLORS[category]?.includes('amber')) return '#f59e0b';
  return '#6b7280';
};

// Sortable Header Cell Component
const SortableHeaderCell: React.FC<{
  label: string;
  column: SortColumn;
  currentSort: SortColumn;
  currentDirection: SortDirection;
  onSort: (column: SortColumn) => void;
  style: React.CSSProperties;
}> = ({ label, column, currentSort, currentDirection, onSort, style }) => {
  const isActive = currentSort === column;
  
  return (
    <div 
      className={cn(
        "flex items-center h-8 px-1.5 text-[10px] font-medium uppercase tracking-wider cursor-pointer select-none transition-colors",
        isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground/70"
      )}
      style={style}
      onClick={() => onSort(column)}
    >
      <span>{label}</span>
      <span className="ml-1 flex items-center">
        {isActive ? (
          currentDirection === 'asc' ? (
            <ArrowUp className="h-3 w-3" />
          ) : (
            <ArrowDown className="h-3 w-3" />
          )
        ) : (
          <ArrowUpDown className="h-3 w-3 opacity-40" />
        )}
      </span>
    </div>
  );
};

// Table Header Component - memoized with fixed widths (no translateX)
const TableHeader = React.memo<{
  allSelected: boolean;
  someSelected: boolean;
  onSelectAll: () => void;
  sortColumn: SortColumn;
  sortDirection: SortDirection;
  onSort: (column: SortColumn) => void;
}>(({ allSelected, someSelected, onSelectAll, sortColumn, sortDirection, onSort }) => (
  <div 
    className="flex bg-[hsl(var(--linear-bg-elevated))] border-b border-[hsl(var(--linear-border))]"
    style={{ width: TOTAL_TABLE_WIDTH, minWidth: TOTAL_TABLE_WIDTH }}
  >
    {/* Star column header */}
    <div 
      className="flex items-center justify-center h-8 px-0.5" 
      style={{ width: COLUMN_WIDTHS.star, minWidth: COLUMN_WIDTHS.star }}
    />
    <div 
      className="flex items-center justify-center h-8 px-1.5" 
      style={{ width: COLUMN_WIDTHS.checkbox, minWidth: COLUMN_WIDTHS.checkbox }}
    >
      <Checkbox
        checked={allSelected}
        ref={(el) => {
          if (el) (el as any).indeterminate = someSelected;
        }}
        onCheckedChange={onSelectAll}
        className="border-muted-foreground/30"
      />
    </div>
    <SortableHeaderCell 
      label="Contacto" 
      column="name" 
      currentSort={sortColumn} 
      currentDirection={sortDirection} 
      onSort={onSort}
      style={{ width: COLUMN_WIDTHS.contact, minWidth: COLUMN_WIDTHS.contact }}
    />
    <SortableHeaderCell 
      label="F. Registro" 
      column="lead_received_at" 
      currentSort={sortColumn} 
      currentDirection={sortDirection} 
      onSort={onSort}
      style={{ width: COLUMN_WIDTHS.origin, minWidth: COLUMN_WIDTHS.origin }}
    />
    <div 
      className="flex items-center h-8 px-1.5 text-[10px] font-medium text-muted-foreground uppercase tracking-wider" 
      style={{ width: COLUMN_WIDTHS.channel, minWidth: COLUMN_WIDTHS.channel }}
    >
      Canal
    </div>
    <SortableHeaderCell 
      label="Empresa" 
      column="company" 
      currentSort={sortColumn} 
      currentDirection={sortDirection} 
      onSort={onSort}
      style={{ width: COLUMN_WIDTHS.company, minWidth: COLUMN_WIDTHS.company }}
    />
    <div 
      className="flex items-center h-8 px-1.5 text-[10px] font-medium text-muted-foreground uppercase tracking-wider" 
      style={{ width: COLUMN_WIDTHS.province, minWidth: COLUMN_WIDTHS.province }}
    >
      Prov.
    </div>
    <div 
      className="flex items-center h-8 px-1.5 text-[10px] font-medium text-muted-foreground uppercase tracking-wider" 
      style={{ width: COLUMN_WIDTHS.sector, minWidth: COLUMN_WIDTHS.sector }}
    >
      Sector
    </div>
    <div 
      className="flex items-center h-8 px-1.5 text-[10px] font-medium text-muted-foreground uppercase tracking-wider" 
      style={{ width: COLUMN_WIDTHS.status, minWidth: COLUMN_WIDTHS.status }}
    >
      Estado
    </div>
    <SortableHeaderCell 
      label="Fact." 
      column="revenue" 
      currentSort={sortColumn} 
      currentDirection={sortDirection} 
      onSort={onSort}
      style={{ width: COLUMN_WIDTHS.revenue, minWidth: COLUMN_WIDTHS.revenue }}
    />
    <SortableHeaderCell 
      label="EBITDA" 
      column="ebitda" 
      currentSort={sortColumn} 
      currentDirection={sortDirection} 
      onSort={onSort}
      style={{ width: COLUMN_WIDTHS.ebitda, minWidth: COLUMN_WIDTHS.ebitda }}
    />
    <div 
      className="flex items-center h-8 px-1.5 text-[10px] font-medium text-muted-foreground uppercase tracking-wider" 
      style={{ width: COLUMN_WIDTHS.apollo, minWidth: COLUMN_WIDTHS.apollo }}
    >
      Apollo
    </div>
    <SortableHeaderCell 
      label="Fecha" 
      column="created_at" 
      currentSort={sortColumn} 
      currentDirection={sortDirection} 
      onSort={onSort}
      style={{ width: COLUMN_WIDTHS.date, minWidth: COLUMN_WIDTHS.date }}
    />
    <div style={{ width: COLUMN_WIDTHS.actions, minWidth: COLUMN_WIDTHS.actions }} />
  </div>
));

TableHeader.displayName = 'TableHeader';

// Item data for virtualized list
interface ItemData {
  contacts: UnifiedContact[];
  selectedContacts: Set<string>;
  channelOptions: SelectOption[];
  statusOptions: SelectOption[];
  allStatuses: ContactStatus[];
  leadFormOptions: SelectOption[];
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
      statusOptions={data.statusOptions}
      allStatuses={data.allStatuses}
      leadFormOptions={data.leadFormOptions}
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
  
  // Sorting state
  const [sortColumn, setSortColumn] = useState<SortColumn>('lead_received_at');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  
  const allSelected = contacts.length > 0 && selectedContacts.length === contacts.length;
  const someSelected = selectedContacts.length > 0 && selectedContacts.length < contacts.length;
  
  // Hooks for inline editing
  const { channels } = useAcquisitionChannels();
  const { update: updateContact } = useContactInlineUpdate();
  const { activeStatuses, statuses: allStatuses } = useContactStatuses();
  const { forms: leadForms } = useLeadForms();
  
  // Handle column sort toggle
  const handleSort = useCallback((column: SortColumn) => {
    if (sortColumn === column) {
      // Toggle direction if same column
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      // New column - text columns default to ascending, dates/numbers to descending
      setSortColumn(column);
      const textColumns: SortColumn[] = ['name', 'company'];
      setSortDirection(textColumns.includes(column) ? 'asc' : 'desc');
    }
  }, [sortColumn]);
  
  // Sort contacts based on current sort state
  const sortedContacts = useMemo(() => {
    if (!sortColumn) return contacts;
    
    return [...contacts].sort((a, b) => {
      let aVal: any;
      let bVal: any;
      
      switch (sortColumn) {
        case 'lead_received_at':
          aVal = a.lead_received_at ? new Date(a.lead_received_at).getTime() : (a.created_at ? new Date(a.created_at).getTime() : 0);
          bVal = b.lead_received_at ? new Date(b.lead_received_at).getTime() : (b.created_at ? new Date(b.created_at).getTime() : 0);
          break;
        case 'created_at':
          aVal = a.created_at ? new Date(a.created_at).getTime() : 0;
          bVal = b.created_at ? new Date(b.created_at).getTime() : 0;
          break;
        case 'revenue':
          aVal = typeof a.revenue === 'number' ? a.revenue : 0;
          bVal = typeof b.revenue === 'number' ? b.revenue : 0;
          break;
        case 'ebitda':
          aVal = typeof a.ebitda === 'number' ? a.ebitda : 0;
          bVal = typeof b.ebitda === 'number' ? b.ebitda : 0;
          break;
        case 'name':
          aVal = (a.name || '').toLowerCase();
          bVal = (b.name || '').toLowerCase();
          break;
        case 'company':
          aVal = (a.company || '').toLowerCase();
          bVal = (b.company || '').toLowerCase();
          break;
        default:
          return 0;
      }
      
      // Handle null/undefined values - push them to the end
      if (aVal === 0 && bVal !== 0) return sortDirection === 'desc' ? 1 : -1;
      if (bVal === 0 && aVal !== 0) return sortDirection === 'desc' ? -1 : 1;
      
      // Compare values
      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [contacts, sortColumn, sortDirection]);
  
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

  // Memoize dynamic status options from database
  const statusOptions = useMemo<SelectOption[]>(() => 
    activeStatuses.map(s => ({
      value: s.status_key,
      label: s.label,
      color: STATUS_COLOR_MAP[s.color]?.text?.replace('text-', '#') || '#6b7280',
      icon: s.icon ? <span className="text-xs">{s.icon}</span> : undefined,
    })), [activeStatuses]
  );

  // Memoize lead form options from database
  const leadFormOptions = useMemo<SelectOption[]>(() => 
    leadForms.map(lf => ({
      value: lf.id,
      label: lf.name,
      color: '#6b7280',
    })), [leadForms]
  );

  // Memoize update handler
  const handleUpdateField = useCallback(
    async (contactId: string, origin: ContactOrigin, field: string, value: string | null) => {
      await updateContact(contactId, origin, field, value);
    },
    [updateContact]
  );

  // Note: Horizontal scroll sync is now automatic since header is inside the same scroll container

  // Item data for virtualized list - memoized (use sortedContacts)
  const itemData = useMemo<ItemData>(() => ({
    contacts: sortedContacts,
    selectedContacts: selectedSet,
    channelOptions,
    statusOptions,
    allStatuses,
    leadFormOptions,
    onSelect: onSelectContact,
    onViewDetails,
    onUpdateField: handleUpdateField,
    onSoftDelete,
    onApolloEnrich,
    onApolloSelectCandidate,
    isEnriching,
  }), [
    sortedContacts,
    selectedSet,
    channelOptions,
    statusOptions,
    allStatuses,
    leadFormOptions,
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
        {/* Unified scroll container for header + list */}
        <div ref={scrollContainerRef} className="overflow-x-auto">
          <div style={{ minWidth: TOTAL_TABLE_WIDTH }}>
            {/* Header inside scroll container for synchronized scroll */}
            <TableHeader 
              allSelected={allSelected}
              someSelected={someSelected}
              onSelectAll={onSelectAll}
              sortColumn={sortColumn}
              sortDirection={sortDirection}
              onSort={handleSort}
            />
            
            {/* Virtualized List */}
            <List
              height={listHeight}
              width={TOTAL_TABLE_WIDTH}
              itemCount={sortedContacts.length}
              itemSize={ROW_HEIGHT}
              itemData={itemData}
              overscanCount={5}
              style={{ overflow: 'hidden' }}
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
