import React, { useMemo, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Eye, Star, Scale } from 'lucide-react';
import { formatCurrency, normalizeValuationAmount, formatCompactCurrency } from '@/shared/utils/format';
import { formatDate, isRecentOperation } from '@/shared/utils/date';
import { useColumnResizing, ColumnDef } from '@/hooks/useColumnResizing';
import { useMultiSelect } from '@/hooks/useMultiSelect';
import { useKeyboardNavigation } from '@/hooks/useKeyboardNavigation';
import { useIsMobile } from '@/hooks/use-mobile';
import { useCompare } from '@/contexts/CompareContext';
import { ColumnVisibilityMenu } from './ColumnVisibilityMenu';
import { BulkActionsToolbar } from '../BulkActionsToolbar';
import OperationDetailsModal from '../OperationDetailsModal';
import { EnhancedOperationsMobileView } from './EnhancedOperationsMobileView';

interface Operation {
  id: string;
  company_name: string;
  sector: string;
  valuation_amount: number;
  valuation_currency: string;
  revenue_amount?: number;
  ebitda_amount?: number;
  year: number;
  description: string;
  short_description?: string;
  is_featured: boolean;
  is_active: boolean;
  logo_url?: string;
  company_size?: string;
  company_size_employees?: string;
  highlights?: string[];
  deal_type?: string;
  display_locations: string[];
  created_at?: string;
}

interface EnhancedOperationsTableProps {
  operations: Operation[];
  isLoading?: boolean;
  onBulkAction?: (action: string, ids: string[]) => void;
}

const initialColumns: ColumnDef[] = [
  { key: 'select', title: '', width: 50, minWidth: 50, maxWidth: 50, visible: true },
  { key: 'logo', title: '', width: 60, minWidth: 60, maxWidth: 60, visible: true },
  { key: 'company', title: 'Empresa', width: 220, minWidth: 150, sortable: true, filterable: true, visible: true },
  { key: 'sector', title: 'Sector', width: 180, minWidth: 120, sortable: true, filterable: true, visible: true },
  { key: 'revenue', title: 'Facturación', width: 140, minWidth: 100, sortable: true, visible: true },
  { key: 'ebitda', title: 'EBITDA', width: 140, minWidth: 100, sortable: true, visible: true },
  { key: 'published', title: 'Publicado', width: 120, minWidth: 100, sortable: true, visible: true },
  { key: 'deal_type', title: 'Tipo', width: 120, minWidth: 100, sortable: true, visible: true },
  { key: 'compare', title: 'Comparar', width: 90, minWidth: 80, visible: true },
  { key: 'actions', title: 'Acciones', width: 120, minWidth: 100, visible: true },
];

export const EnhancedOperationsTable: React.FC<EnhancedOperationsTableProps> = ({
  operations,
  isLoading,
  onBulkAction,
}) => {
  const [selectedOperation, setSelectedOperation] = React.useState<Operation | null>(null);
  const [focusedIndex, setFocusedIndex] = React.useState<number>(-1);
  const isMobile = useIsMobile();
  const { addToCompare, removeFromCompare, isInCompare, canAddMore } = useCompare();

  const { columns, visibleColumns, handleResize, toggleColumnVisibility } = useColumnResizing(initialColumns);
  
  const {
    selectedIds,
    handleSelect,
    handleSelectAll,
    handleClearSelection,
    isSelected,
    selectedCount,
  } = useMultiSelect(operations);

  // Keyboard navigation
  useKeyboardNavigation({
    onArrowUp: () => setFocusedIndex(prev => Math.max(0, prev - 1)),
    onArrowDown: () => setFocusedIndex(prev => Math.min(operations.length - 1, prev + 1)),
    onEnter: () => {
      if (focusedIndex >= 0 && focusedIndex < operations.length) {
        setSelectedOperation(operations[focusedIndex]);
      }
    },
    onEscape: () => {
      setFocusedIndex(-1);
      handleClearSelection();
    },
    enabled: true,
  });

  const renderRow = (operation: Operation, index: number) => {
    const selected = isSelected(operation.id);
    const focused = index === focusedIndex;

    return (
      <div
        key={operation.id}
        className={`flex items-center border-b transition-colors ${
          selected ? 'bg-primary/5' : focused ? 'bg-muted/50' : 'hover:bg-muted/30'
        }`}
        onClick={(e) => {
          if (!(e.target as HTMLElement).closest('button, input')) {
            handleSelect(operation.id, index, e);
            setFocusedIndex(index);
          }
        }}
      >
        {visibleColumns.map((column) => {
          const width = column.width;

          switch (column.key) {
            case 'select':
              return (
                <div key={column.key} style={{ width }} className="flex items-center justify-center px-4">
                  <Checkbox
                    checked={selected}
                    onCheckedChange={() => handleSelect(operation.id, index)}
                  />
                </div>
              );

            case 'logo':
              return (
                <div key={column.key} style={{ width }} className="flex items-center justify-center px-2">
                  {operation.logo_url && (
                    <img
                      src={operation.logo_url}
                      alt={operation.company_name}
                      className="w-10 h-10 rounded-lg object-contain bg-muted p-1"
                    />
                  )}
                </div>
              );

            case 'company':
              return (
                <div key={column.key} style={{ width }} className="px-4 min-w-0">
                  <div className="font-medium truncate">{operation.company_name}</div>
                  <div className="flex items-center gap-1 flex-wrap mt-1">
                    {operation.is_featured && (
                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 text-xs gap-1">
                        <Star className="h-3 w-3" />
                        Destacado
                      </Badge>
                    )}
                    {isRecentOperation(operation.created_at) && (
                      <Badge className="bg-green-500 text-white text-xs">
                        Nuevo
                      </Badge>
                    )}
                  </div>
                </div>
              );

            case 'sector':
              return (
                <div key={column.key} style={{ width }} className="px-4">
                  <Badge variant="outline" className="font-normal">
                    {operation.sector}
                  </Badge>
                </div>
              );

            case 'revenue':
              return (
                <div key={column.key} style={{ width }} className="px-4 text-right">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="font-semibold text-green-600 cursor-help">
                          {operation.revenue_amount
                            ? formatCompactCurrency(operation.revenue_amount, operation.valuation_currency)
                            : <span className="text-muted-foreground">Consultar</span>}
                        </span>
                      </TooltipTrigger>
                      {operation.revenue_amount && (
                        <TooltipContent>
                          <p>{formatCurrency(normalizeValuationAmount(operation.revenue_amount), operation.valuation_currency)}</p>
                        </TooltipContent>
                      )}
                    </Tooltip>
                  </TooltipProvider>
                </div>
              );

            case 'ebitda':
              return (
                <div key={column.key} style={{ width }} className="px-4 text-right">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="font-semibold text-blue-600 cursor-help">
                          {operation.ebitda_amount
                            ? formatCompactCurrency(operation.ebitda_amount, operation.valuation_currency)
                            : <span className="text-muted-foreground">Consultar</span>}
                        </span>
                      </TooltipTrigger>
                      {operation.ebitda_amount && (
                        <TooltipContent>
                          <p>{formatCurrency(normalizeValuationAmount(operation.ebitda_amount), operation.valuation_currency)}</p>
                        </TooltipContent>
                      )}
                    </Tooltip>
                  </TooltipProvider>
                </div>
              );

            case 'published':
              return (
                <div key={column.key} style={{ width }} className="px-4 text-center">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="text-sm font-medium text-muted-foreground cursor-help">
                          {operation.created_at 
                            ? formatDate(operation.created_at, 'MMM yyyy')
                            : <span className="text-xs">-</span>
                          }
                        </span>
                      </TooltipTrigger>
                      {operation.created_at && (
                        <TooltipContent>
                          <p>Publicado el {formatDate(operation.created_at, 'PPP')}</p>
                        </TooltipContent>
                      )}
                    </Tooltip>
                  </TooltipProvider>
                </div>
              );

            case 'deal_type':
              return (
                <div key={column.key} style={{ width }} className="px-4 text-center">
                  {operation.deal_type ? (
                    <Badge
                      variant="outline"
                      className={
                        operation.deal_type === 'sale'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'bg-orange-50 text-orange-700 border-orange-200'
                      }
                    >
                      {operation.deal_type === 'sale' ? 'Venta' : 'Adquisición'}
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground text-xs">-</span>
                  )}
                </div>
              );

            case 'compare':
              const inCompare = isInCompare(operation.id);
              return (
                <div key={column.key} style={{ width }} className="px-4 text-center">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant={inCompare ? 'default' : 'ghost'}
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (inCompare) {
                              removeFromCompare(operation.id);
                            } else if (canAddMore) {
                              addToCompare(operation);
                            }
                          }}
                          disabled={!inCompare && !canAddMore}
                          className="gap-1"
                        >
                          <Scale className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        {inCompare ? 'Quitar' : canAddMore ? 'Comparar' : 'Máx. 4'}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              );

            case 'actions':
              return (
                <div key={column.key} style={{ width }} className="px-4 text-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedOperation(operation);
                    }}
                    className="gap-1"
                  >
                    <Eye className="h-4 w-4" />
                    <span className="hidden sm:inline">Ver</span>
                  </Button>
                </div>
              );

            default:
              return null;
          }
        })}
      </div>
    );
  };

  // Renderizar vista móvil si es pantalla pequeña
  if (isMobile) {
    return (
      <div className="w-full">
        <EnhancedOperationsMobileView
          operations={operations}
          onViewDetails={(operation) => setSelectedOperation(operation)}
          isLoading={isLoading}
        />
        {selectedOperation && (
          <OperationDetailsModal
            operation={selectedOperation}
            isOpen={!!selectedOperation}
            onClose={() => setSelectedOperation(null)}
          />
        )}
      </div>
    );
  }

  // Vista desktop (tabla completa)
  return (
    <>
      <Card>
        <CardContent className="p-0">
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-2">
              <Checkbox
                checked={selectedCount > 0 && selectedCount === operations.length}
                onCheckedChange={() => {
                  selectedCount === operations.length ? handleClearSelection() : handleSelectAll();
                }}
              />
              <span className="text-sm text-muted-foreground">
                {selectedCount > 0 ? `${selectedCount} seleccionadas` : 'Seleccionar todo'}
              </span>
            </div>
            <ColumnVisibilityMenu columns={columns} onToggle={toggleColumnVisibility} />
          </div>

          <div className="overflow-x-auto">
            {/* Header as flex container to match virtualized body */}
            <div className="flex border-b bg-muted/50 sticky top-0 z-10">
              {visibleColumns.map((column) => (
                <div
                  key={column.key}
                  className="relative group border-r last:border-r-0"
                  style={{ width: column.width, minWidth: column.minWidth || 80 }}
                >
                  <div className="flex items-center gap-2 px-4 py-3">
                    <span className="font-medium text-sm">{column.title}</span>
                  </div>
                  {column.key !== 'select' && column.key !== 'logo' && column.key !== 'actions' && (
                    <div
                      className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-primary/20 group-hover:bg-primary/10 z-10"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        const startX = e.clientX;
                        const startWidth = column.width;

                        const handleMouseMove = (moveEvent: MouseEvent) => {
                          const delta = moveEvent.clientX - startX;
                          handleResize(column.key, delta);
                        };

                        const handleMouseUp = () => {
                          document.removeEventListener('mousemove', handleMouseMove);
                          document.removeEventListener('mouseup', handleMouseUp);
                        };

                        document.addEventListener('mousemove', handleMouseMove);
                        document.addEventListener('mouseup', handleMouseUp);
                      }}
                    />
                  )}
                </div>
              ))}
            </div>

            {isLoading && operations.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm text-muted-foreground">Cargando operaciones...</span>
                </div>
              </div>
            ) : operations.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No se encontraron operaciones
              </div>
            ) : (
              <div className="w-full">
                {operations.map((operation, index) => renderRow(operation, index))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {selectedCount > 0 && (
        <BulkActionsToolbar
          selectedCount={selectedCount}
          onClearSelection={handleClearSelection}
          onExport={() => onBulkAction?.('export', selectedIds)}
          onActivate={() => onBulkAction?.('activate', selectedIds)}
          onDeactivate={() => onBulkAction?.('deactivate', selectedIds)}
          onFeature={() => onBulkAction?.('feature', selectedIds)}
          onUnfeature={() => onBulkAction?.('unfeature', selectedIds)}
          onChangeDisplayLocations={() => onBulkAction?.('change_location', selectedIds)}
          onDelete={() => onBulkAction?.('delete', selectedIds)}
        />
      )}

      {selectedOperation && (
        <OperationDetailsModal
          operation={selectedOperation}
          isOpen={!!selectedOperation}
          onClose={() => setSelectedOperation(null)}
        />
      )}
    </>
  );
};
