// ============= EXCEL-STYLE COSTS TABLE =============
// Tabla principal tipo spreadsheet para control de costes

import React, { useCallback, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { SpreadsheetCell, SelectOption } from './SpreadsheetCell';
import { useSpreadsheetNavigation } from '@/hooks/useSpreadsheetNavigation';
import { CampaignCost } from '@/hooks/useCampaignCosts';
import { Loader2 } from 'lucide-react';

interface ExcelStyleCostsTableProps {
  data: CampaignCost[];
  onCellUpdate: (id: string, field: string, value: any) => Promise<void>;
  isLoading?: boolean;
}

// Column definitions
const COLUMNS = [
  { key: 'campaign_name', title: 'Campaña', width: 180, editable: false },
  { key: 'delivery_status', title: 'Entrega', width: 90, editable: false },
  { key: 'results', title: 'Resultados', width: 90, editable: true },
  { key: 'cost_per_result', title: 'Coste/Res.', width: 100, editable: false },
  { key: 'amount', title: 'Gastado', width: 110, editable: true },
  { key: 'daily_budget', title: 'Ppto. Diario', width: 110, editable: true },
  { key: 'monthly_budget', title: 'Ppto. Mensual', width: 120, editable: true },
  { key: 'target_cpl', title: 'CPL Objetivo', width: 100, editable: true },
  { key: 'internal_status', title: 'Estado', width: 100, editable: true },
  { key: 'notes', title: 'Notas', width: 200, editable: true },
] as const;

const EDITABLE_COLUMNS = COLUMNS.filter(c => c.editable).map(c => c.key);
const ALL_COLUMN_KEYS = COLUMNS.map(c => c.key);

// Status options
const STATUS_OPTIONS: SelectOption[] = [
  { value: 'ok', label: 'OK', color: 'text-green-700' },
  { value: 'watch', label: 'Vigilar', color: 'text-amber-700' },
  { value: 'stop', label: 'Parar', color: 'text-red-700' },
];

// Delivery status options
const DELIVERY_OPTIONS: SelectOption[] = [
  { value: 'active', label: 'Activa', color: 'text-green-700' },
  { value: 'paused', label: 'Pausada', color: 'text-muted-foreground' },
];

// Calculate suggested status based on CPL
const calculateSuggestedStatus = (
  costPerResult: number | null,
  targetCpl: number | null
): 'ok' | 'watch' | 'stop' => {
  if (!targetCpl || targetCpl === 0 || !costPerResult) return 'ok';
  
  const ratio = costPerResult / targetCpl;
  
  if (ratio <= 1.0) return 'ok';
  if (ratio <= 1.2) return 'watch';
  return 'stop';
};

// Get row background color based on status
const getRowStatusClass = (status: string | null): string => {
  switch (status) {
    case 'ok':
      return 'bg-green-50/50';
    case 'watch':
      return 'bg-amber-50/50';
    case 'stop':
      return 'bg-red-50/50';
    default:
      return '';
  }
};

const ExcelStyleCostsTable: React.FC<ExcelStyleCostsTableProps> = ({
  data,
  onCellUpdate,
  isLoading
}) => {
  // Enhanced data with calculated fields
  const enhancedData = useMemo(() => {
    return data.map(row => {
      const results = row.results || 0;
      const amount = Number(row.amount) || 0;
      const costPerResult = results > 0 ? amount / results : null;
      const suggestedStatus = calculateSuggestedStatus(costPerResult, row.target_cpl);
      
      return {
        ...row,
        cost_per_result: costPerResult,
        suggested_status: suggestedStatus,
        // Use internal_status if set, otherwise use suggested
        effective_status: row.internal_status || suggestedStatus
      };
    });
  }, [data]);

  // Navigation hook
  const { focusCell, navigate, isCellFocused } = useSpreadsheetNavigation({
    rows: enhancedData,
    columns: ALL_COLUMN_KEYS,
    editableColumns: EDITABLE_COLUMNS
  });

  // Handle cell save
  const handleCellSave = useCallback(async (
    rowId: string,
    field: string,
    value: any
  ) => {
    await onCellUpdate(rowId, field, value);
  }, [onCellUpdate]);

  // Handle navigation from cell
  const handleNavigate = useCallback((
    rowIndex: number,
    columnKey: string,
    direction: 'up' | 'down' | 'left' | 'right' | 'tab'
  ) => {
    navigate(direction);
  }, [navigate]);

  // Render cell content
  const renderCell = useCallback((
    row: typeof enhancedData[0],
    rowIndex: number,
    column: typeof COLUMNS[number]
  ) => {
    const isFocused = isCellFocused(rowIndex, column.key);
    const cellId = `${row.id}-${column.key}`;
    
    // Non-editable cells
    if (!column.editable) {
      switch (column.key) {
        case 'campaign_name':
          return (
            <div className="px-2 py-2 text-sm font-medium truncate">
              {row.campaign_name || 'Sin nombre'}
            </div>
          );
        
        case 'delivery_status':
          const deliveryOpt = DELIVERY_OPTIONS.find(o => o.value === row.delivery_status);
          return (
            <div className="px-2 py-2">
              <span className={cn(
                "inline-flex items-center gap-1 text-xs font-medium",
                deliveryOpt?.color
              )}>
                <span className={cn(
                  "w-1.5 h-1.5 rounded-full",
                  row.delivery_status === 'active' ? 'bg-green-500' : 'bg-muted-foreground'
                )} />
                {deliveryOpt?.label || '-'}
              </span>
            </div>
          );
        
        case 'cost_per_result':
          const cpr = row.cost_per_result;
          const targetCpl = row.target_cpl;
          const isOverBudget = targetCpl && cpr && cpr > targetCpl;
          return (
            <div className={cn(
              "px-2 py-2 text-sm text-right tabular-nums font-medium",
              isOverBudget && "text-red-600"
            )}>
              {cpr 
                ? new Intl.NumberFormat('es-ES', { 
                    style: 'currency', 
                    currency: 'EUR',
                    minimumFractionDigits: 2
                  }).format(cpr)
                : '-'
              }
            </div>
          );
        
        default:
          return <div className="px-2 py-2 text-sm">{String(row[column.key as keyof typeof row] || '-')}</div>;
      }
    }

    // Editable cells
    switch (column.key) {
      case 'results':
        return (
          <SpreadsheetCell
            key={cellId}
            value={row.results}
            type="number"
            editable
            isFocused={isFocused}
            onFocus={() => focusCell({ rowIndex, columnKey: column.key })}
            onNavigate={(dir) => handleNavigate(rowIndex, column.key, dir)}
            onSave={(val) => handleCellSave(row.id, column.key, val)}
            className="text-right"
            placeholder="0"
          />
        );
      
      case 'amount':
        return (
          <SpreadsheetCell
            key={cellId}
            value={Number(row.amount) || null}
            type="currency"
            editable
            isFocused={isFocused}
            onFocus={() => focusCell({ rowIndex, columnKey: column.key })}
            onNavigate={(dir) => handleNavigate(rowIndex, column.key, dir)}
            onSave={(val) => handleCellSave(row.id, column.key, val)}
            className="text-right"
          />
        );
      
      case 'daily_budget':
      case 'monthly_budget':
      case 'target_cpl':
        return (
          <SpreadsheetCell
            key={cellId}
            value={row[column.key as keyof typeof row] as number | null}
            type="currency"
            editable
            isFocused={isFocused}
            onFocus={() => focusCell({ rowIndex, columnKey: column.key })}
            onNavigate={(dir) => handleNavigate(rowIndex, column.key, dir)}
            onSave={(val) => handleCellSave(row.id, column.key, val)}
            className="text-right"
          />
        );
      
      case 'internal_status':
        return (
          <SpreadsheetCell
            key={cellId}
            value={row.internal_status || row.suggested_status}
            type="select"
            editable
            options={STATUS_OPTIONS}
            isFocused={isFocused}
            onFocus={() => focusCell({ rowIndex, columnKey: column.key })}
            onNavigate={(dir) => handleNavigate(rowIndex, column.key, dir)}
            onSave={(val) => handleCellSave(row.id, column.key, val)}
          />
        );
      
      case 'notes':
        return (
          <SpreadsheetCell
            key={cellId}
            value={row.notes}
            type="text"
            editable
            isFocused={isFocused}
            onFocus={() => focusCell({ rowIndex, columnKey: column.key })}
            onNavigate={(dir) => handleNavigate(rowIndex, column.key, dir)}
            onSave={(val) => handleCellSave(row.id, column.key, val)}
            placeholder="Añadir nota..."
          />
        );
      
      default:
        return null;
    }
  }, [isCellFocused, focusCell, handleNavigate, handleCellSave]);

  if (isLoading) {
    return (
      <div className="bg-background border rounded-lg overflow-hidden">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-background border rounded-lg overflow-hidden">
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <p className="text-muted-foreground">No hay campañas registradas</p>
          <p className="text-muted-foreground text-sm mt-1">
            Añade gastos de campañas para ver la tabla
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background border rounded-lg overflow-hidden">
      {/* Table container with horizontal scroll */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse min-w-max">
          {/* Header - NOT EDITABLE */}
          <thead className="bg-muted/50 sticky top-0 z-10">
            <tr>
              {COLUMNS.map((column) => (
                <th
                  key={column.key}
                  className={cn(
                    "px-2 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider border-b border-r last:border-r-0",
                    "select-none"
                  )}
                  style={{ width: column.width, minWidth: column.width }}
                >
                  {column.title}
                </th>
              ))}
            </tr>
          </thead>
          
          {/* Body */}
          <tbody>
            {enhancedData.map((row, rowIndex) => (
              <tr
                key={row.id}
                className={cn(
                  "border-b last:border-b-0 transition-colors",
                  getRowStatusClass(row.effective_status),
                  rowIndex % 2 === 1 && !row.internal_status && "bg-muted/20"
                )}
              >
                {COLUMNS.map((column) => (
                  <td
                    key={`${row.id}-${column.key}`}
                    className={cn(
                      "border-r last:border-r-0 p-0",
                      column.editable && "hover:bg-muted/30"
                    )}
                    style={{ width: column.width, minWidth: column.width }}
                  >
                    {renderCell(row, rowIndex, column)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Footer with keyboard hints */}
      <div className="px-3 py-2 bg-muted/30 border-t text-xs text-muted-foreground flex items-center gap-4">
        <span><kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px]">Enter</kbd> Editar / Guardar</span>
        <span><kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px]">Tab</kbd> Siguiente celda</span>
        <span><kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px]">Esc</kbd> Cancelar</span>
        <span><kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px]">↑↓←→</kbd> Navegar</span>
      </div>
    </div>
  );
};

export default ExcelStyleCostsTable;
