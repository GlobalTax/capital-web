// ============= CR FUNDS TABLE VIRTUALIZED =============
// High-performance virtualized table using react-window
import React, { useMemo, useCallback, useRef, useState, useEffect } from 'react';
import { FixedSizeList as List } from 'react-window';
import { Building2, ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { CRFund, CRFundType, CRFundStatus, CR_FUND_TYPE_LABELS, CR_FUND_STATUS_LABELS } from '@/types/capitalRiesgo';
import { useDeleteCRFund, useUpdateCRFund } from '@/hooks/useCRFunds';
import { CRFundTableRow, CRFundWithCounts, COL_STYLES } from './CRFundTableRow';
import { SelectOption } from '@/components/admin/shared/EditableSelect';

// Min table width for horizontal scroll
const MIN_TABLE_WIDTH = 950;

// Row height - compact style
const ROW_HEIGHT = 44;

interface PortfolioCompany {
  company_name: string;
  website: string | null;
}

interface CRFundsTableVirtualizedProps {
  funds: CRFundWithCounts[];
  isLoading: boolean;
  showFavorites?: boolean;
  sortBy?: 'name' | 'people_count' | 'aum' | 'portfolio_count';
  sortOrder?: 'asc' | 'desc';
  onSort?: (field: 'name' | 'people_count' | 'aum' | 'portfolio_count') => void;
}

// Fund type options - static
const fundTypeOptions: SelectOption[] = Object.entries(CR_FUND_TYPE_LABELS).map(([value, label]) => ({
  value,
  label,
}));

// Status options - static
const statusOptions: SelectOption[] = Object.entries(CR_FUND_STATUS_LABELS).map(([value, label]) => ({
  value,
  label,
}));

// Sortable header component
const SortableHeader: React.FC<{
  label: string;
  field: 'name' | 'people_count' | 'aum' | 'portfolio_count';
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  onSort?: (field: any) => void;
  style: React.CSSProperties;
}> = ({ label, field, sortBy, sortOrder, onSort, style }) => (
  <div 
    className="flex items-center h-8 px-2 text-[10px] font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:bg-muted/50 select-none"
    style={style}
    onClick={() => onSort?.(field)}
  >
    <span className="flex items-center gap-1">
      {label}
      {sortBy === field ? (
        sortOrder === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
      ) : (
        <ArrowUpDown className="h-3 w-3 opacity-40" />
      )}
    </span>
  </div>
);

// Table header with scroll sync
const TableHeader = React.memo<{
  showFavorites: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  onSort?: (field: any) => void;
  scrollLeft: number;
}>(({ showFavorites, sortBy, sortOrder, onSort, scrollLeft }) => (
  <div className="overflow-hidden border-b border-border/50">
    <div 
      className="flex bg-muted/30"
      style={{ 
        minWidth: MIN_TABLE_WIDTH, 
        transform: `translateX(-${scrollLeft}px)` 
      }}
    >
      {showFavorites && (
        <div 
          className="flex items-center h-8" 
          style={{ flex: COL_STYLES.favorite.flex, minWidth: COL_STYLES.favorite.minWidth }} 
        />
      )}
      <SortableHeader 
        label="Fondo" 
        field="name" 
        sortBy={sortBy} 
        sortOrder={sortOrder} 
        onSort={onSort}
        style={{ flex: COL_STYLES.name.flex, minWidth: COL_STYLES.name.minWidth }}
      />
      <div 
        className="flex items-center h-8 px-2 text-[10px] font-medium text-muted-foreground uppercase tracking-wider"
        style={{ flex: COL_STYLES.typeStatus.flex, minWidth: COL_STYLES.typeStatus.minWidth }}
      >
        Tipo / Estado
      </div>
      <div 
        className="flex items-center h-8 px-2 text-[10px] font-medium text-muted-foreground uppercase tracking-wider"
        style={{ flex: COL_STYLES.country.flex, minWidth: COL_STYLES.country.minWidth }}
      >
        País
      </div>
      <SortableHeader 
        label="AUM · Ticket" 
        field="aum" 
        sortBy={sortBy} 
        sortOrder={sortOrder} 
        onSort={onSort}
        style={{ flex: COL_STYLES.financials.flex, minWidth: COL_STYLES.financials.minWidth }}
      />
      <SortableHeader 
        label="Port." 
        field="portfolio_count" 
        sortBy={sortBy} 
        sortOrder={sortOrder} 
        onSort={onSort}
        style={{ flex: COL_STYLES.portfolio.flex, minWidth: COL_STYLES.portfolio.minWidth }}
      />
      <SortableHeader 
        label="Cont." 
        field="people_count" 
        sortBy={sortBy} 
        sortOrder={sortOrder} 
        onSort={onSort}
        style={{ flex: COL_STYLES.contacts.flex, minWidth: COL_STYLES.contacts.minWidth }}
      />
      <div 
        className="flex items-center h-8" 
        style={{ flex: COL_STYLES.actions.flex, minWidth: COL_STYLES.actions.minWidth }} 
      />
    </div>
  </div>
));

TableHeader.displayName = 'TableHeader';

// Item data for virtualized list
interface ItemData {
  funds: CRFundWithCounts[];
  showFavorites: boolean;
  fundTypeOptions: SelectOption[];
  statusOptions: SelectOption[];
  onUpdateFundType: (fundId: string, newType: string) => Promise<void>;
  onUpdateStatus: (fundId: string, newStatus: string) => Promise<void>;
  onDelete: (fundId: string) => void;
}

// Virtualized row wrapper
const VirtualizedRow = React.memo<{
  index: number;
  style: React.CSSProperties;
  data: ItemData;
}>(({ index, style, data }) => {
  const fund = data.funds[index];
  const isLast = index === data.funds.length - 1;
  
  return (
    <CRFundTableRow
      style={style}
      fund={fund}
      showFavorites={data.showFavorites}
      fundTypeOptions={data.fundTypeOptions}
      statusOptions={data.statusOptions}
      onUpdateFundType={data.onUpdateFundType}
      onUpdateStatus={data.onUpdateStatus}
      onDelete={data.onDelete}
      isLast={isLast}
    />
  );
});

VirtualizedRow.displayName = 'VirtualizedRow';

export const CRFundsTableVirtualized: React.FC<CRFundsTableVirtualizedProps> = ({
  funds,
  isLoading,
  showFavorites = false,
  sortBy,
  sortOrder,
  onSort,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [listHeight, setListHeight] = useState(500);
  const [scrollLeft, setScrollLeft] = useState(0);
  
  // Mutations
  const deleteMutation = useDeleteCRFund();
  const updateMutation = useUpdateCRFund();

  // Calculate dynamic height
  useEffect(() => {
    const updateHeight = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const availableHeight = window.innerHeight - rect.top - 80;
        setListHeight(Math.max(300, Math.min(availableHeight, 800)));
      }
    };
    
    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, []);

  // Horizontal scroll sync
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;
    
    const handleHorizontalScroll = () => {
      setScrollLeft(scrollContainer.scrollLeft);
    };
    
    scrollContainer.addEventListener('scroll', handleHorizontalScroll);
    return () => scrollContainer.removeEventListener('scroll', handleHorizontalScroll);
  }, []);

  // Handlers
  const handleUpdateFundType = useCallback(async (fundId: string, newType: string) => {
    await updateMutation.mutateAsync({ id: fundId, data: { fund_type: newType as CRFundType } });
  }, [updateMutation]);

  const handleUpdateStatus = useCallback(async (fundId: string, newStatus: string) => {
    await updateMutation.mutateAsync({ id: fundId, data: { status: newStatus as CRFundStatus } });
  }, [updateMutation]);

  const handleDelete = useCallback((fundId: string) => {
    deleteMutation.mutate(fundId);
  }, [deleteMutation]);

  // Memoized item data
  const itemData = useMemo<ItemData>(() => ({
    funds,
    showFavorites,
    fundTypeOptions,
    statusOptions,
    onUpdateFundType: handleUpdateFundType,
    onUpdateStatus: handleUpdateStatus,
    onDelete: handleDelete,
  }), [funds, showFavorites, handleUpdateFundType, handleUpdateStatus, handleDelete]);

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="space-y-1 p-4">
        {[...Array(10)].map((_, i) => (
          <Skeleton key={i} className="h-11 w-full" />
        ))}
      </div>
    );
  }

  // Empty state
  if (funds.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mb-4">
          <Building2 className="h-6 w-6 text-muted-foreground/50" />
        </div>
        <p className="text-sm text-muted-foreground">No se encontraron fondos</p>
        <p className="text-xs text-muted-foreground/70 mt-1">Ajusta los filtros o añade nuevos fondos</p>
      </div>
    );
  }

  return (
    <TooltipProvider delayDuration={300}>
      <div 
        ref={containerRef}
        className="border border-border/50 rounded-lg overflow-hidden bg-background"
      >
        {/* Header with scroll sync */}
        <TableHeader 
          showFavorites={showFavorites}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSort={onSort}
          scrollLeft={scrollLeft}
        />
        
        {/* Virtualized List with horizontal scroll */}
        <div ref={scrollContainerRef} className="overflow-x-auto">
          <div style={{ minWidth: MIN_TABLE_WIDTH }}>
            <List
              height={listHeight}
              width="100%"
              itemCount={funds.length}
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

export default React.memo(CRFundsTableVirtualized);
