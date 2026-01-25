// ============= EMPRESAS TABLE VIRTUALIZED =============
// Tabla de alto rendimiento con react-window (~30ms para 1000+ filas)
// Soporta columnas dinámicas, ordenación y configuración desde DB
// v2: Scroll horizontal sincronizado + anchos numéricos

import React, { memo, useCallback, useMemo, useState, useRef, useEffect } from 'react';
import { FixedSizeList as List, ListChildComponentProps } from 'react-window';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Building2,
  Edit,
  Trash2,
  ExternalLink,
  Star,
  MoreHorizontal,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  Users,
  Calendar,
  Hash,
  Target,
  Landmark,
  Calculator,
  Clock,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Empresa } from '@/hooks/useEmpresas';
import { EmpresaFavoriteButton } from './EmpresaFavoriteButton';
import { cn } from '@/lib/utils';
import { EmpresaTableColumn, useEmpresasTableColumns } from '@/hooks/useEmpresasTableColumns';

interface EmpresasTableVirtualizedProps {
  empresas: Empresa[];
  isLoading: boolean;
  showFavorites?: boolean;
  emptyMessage?: string;
  emptyAction?: () => void;
  emptyActionLabel?: string;
  onEdit: (empresa: Empresa) => void;
  onDelete: (empresa: Empresa) => void;
  height?: number;
}

export type SortConfig = {
  key: string;
  direction: 'asc' | 'desc';
} | null;

interface RowData {
  empresas: Empresa[];
  onEdit: (empresa: Empresa) => void;
  onDelete: (empresa: Empresa) => void;
  onNavigate: (id: string) => void;
  showFavorites: boolean;
  visibleColumns: EmpresaTableColumn[];
  columnWidths: Record<string, number>;
}

const ROW_HEIGHT = 52;

// ========== COLUMN WIDTHS (pixels) ==========
const COLUMN_WIDTHS: Record<string, number> = {
  favorito: 48,
  nombre: 220,
  sector: 120,
  ubicacion: 110,
  empleados: 85,
  facturacion: 100,
  ebitda: 100,
  margen: 80,
  deuda: 100,
  valoracion: 115,
  fecha_valoracion: 110,
  ultima_actividad: 110,
  founded_year: 85,
  cnae_codigo: 90,
  apollo_intent: 85,
  apollo_score: 75,
  estado: 100,
  acciones: 56,
};

const getColumnWidth = (columnKey: string): number => {
  return COLUMN_WIDTHS[columnKey] || 100;
};

// Calculate total width of visible columns
const calculateTotalWidth = (visibleColumns: EmpresaTableColumn[]): number => {
  return visibleColumns.reduce((sum, col) => sum + getColumnWidth(col.column_key), 0);
};

// ========== FORMATTERS ==========
const formatTableCurrency = (amount: number | null | undefined): string => {
  if (!amount || amount <= 0) return '—';
  
  if (amount >= 1_000_000) {
    return `€${(amount / 1_000_000).toFixed(1)}M`;
  }
  if (amount >= 1_000) {
    return `€${Math.round(amount / 1_000)}K`;
  }
  return `€${Math.round(amount)}`;
};

// ========== CELL RENDERERS ==========
const renderCellContent = (
  empresa: Empresa,
  columnKey: string,
  onEdit: (empresa: Empresa) => void,
  onDelete: (empresa: Empresa) => void
) => {
  const calculateMargin = (emp: Empresa) => {
    if (!emp.ebitda || !emp.facturacion) return null;
    return ((emp.ebitda / emp.facturacion) * 100).toFixed(1);
  };

  // Empty placeholder with subtle styling
  const EmptyCell = () => <span className="text-muted-foreground/40">—</span>;

  switch (columnKey) {
    case 'favorito':
      return (
        <div onClick={(e) => e.stopPropagation()}>
          <EmpresaFavoriteButton empresaId={empresa.id} size="sm" />
        </div>
      );

    case 'nombre':
      return (
        <div className="min-w-0">
          <div className="font-medium text-sm truncate">{empresa.nombre}</div>
          {empresa.sector && (
            <div className="flex items-center gap-1 mt-0.5 min-w-0">
              <span className="text-xs text-muted-foreground truncate">
                {empresa.sector}
              </span>
              {empresa.subsector && (
                <span className="text-xs text-muted-foreground/60 truncate hidden sm:inline">
                  / {empresa.subsector}
                </span>
              )}
            </div>
          )}
        </div>
      );

    case 'sector':
      return empresa.sector ? (
        <span className="text-xs text-muted-foreground truncate block">
          {empresa.sector}
        </span>
      ) : <EmptyCell />;

    case 'ubicacion':
      return empresa.ubicacion ? (
        <span className="text-xs text-muted-foreground truncate block">
          {empresa.ubicacion}
        </span>
      ) : <EmptyCell />;

    case 'empleados':
      return empresa.empleados ? (
        <div className="flex items-center gap-1 text-xs">
          <Users className="h-3 w-3 text-muted-foreground flex-shrink-0" />
          <span>{empresa.empleados}</span>
        </div>
      ) : <EmptyCell />;

    case 'facturacion':
      return (
        <div className="text-sm font-medium text-right tabular-nums">
          {empresa.facturacion ? formatTableCurrency(empresa.facturacion) : <EmptyCell />}
        </div>
      );

    case 'ebitda':
      return (
        <div className="text-sm text-right tabular-nums">
          {empresa.ebitda ? formatTableCurrency(empresa.ebitda) : <EmptyCell />}
        </div>
      );

    case 'margen':
      const margin = calculateMargin(empresa);
      return (
        <div className="text-sm text-right tabular-nums">
          {margin ? (
            <span className={cn(
              parseFloat(margin) >= 15 ? 'text-green-600' : 
              parseFloat(margin) >= 10 ? 'text-yellow-600' : 'text-muted-foreground'
            )}>
              {margin}%
            </span>
          ) : <EmptyCell />}
        </div>
      );

    case 'deuda':
      return empresa.deuda ? (
        <div className="flex items-center gap-1 text-xs">
          <Landmark className="h-3 w-3 text-muted-foreground flex-shrink-0" />
          <span>{formatTableCurrency(empresa.deuda)}</span>
        </div>
      ) : <EmptyCell />;

    case 'founded_year':
      return (empresa as any).founded_year ? (
        <div className="flex items-center gap-1 text-xs">
          <Calendar className="h-3 w-3 text-muted-foreground flex-shrink-0" />
          <span>{(empresa as any).founded_year}</span>
        </div>
      ) : <EmptyCell />;

    case 'cnae_codigo':
      return (empresa as any).cnae_codigo ? (
        <div className="flex items-center gap-1 text-xs">
          <Hash className="h-3 w-3 text-muted-foreground flex-shrink-0" />
          <span className="font-mono">{(empresa as any).cnae_codigo}</span>
        </div>
      ) : <EmptyCell />;

    case 'apollo_intent':
      const intentLevel = (empresa as any).apollo_intent_level;
      if (!intentLevel) return <EmptyCell />;
      return (
        <Badge 
          variant="outline" 
          className={cn(
            "text-[10px] px-1.5 py-0",
            intentLevel === 'High' && 'bg-red-50 text-red-700 border-red-200',
            intentLevel === 'Medium' && 'bg-yellow-50 text-yellow-700 border-yellow-200',
            intentLevel === 'Low' && 'bg-gray-50 text-gray-600 border-gray-200'
          )}
        >
          {intentLevel}
        </Badge>
      );

    case 'apollo_score':
      const score = (empresa as any).apollo_score;
      return score ? (
        <div className="flex items-center gap-1 text-xs">
          <Target className="h-3 w-3 text-muted-foreground flex-shrink-0" />
          <span>{score}</span>
        </div>
      ) : <EmptyCell />;

    case 'valoracion':
      return empresa.valoracion ? (
        <div className="flex items-center justify-end gap-1 text-sm font-medium text-green-600 tabular-nums">
          <Calculator className="h-3 w-3 flex-shrink-0" />
          <span>{formatTableCurrency(empresa.valoracion)}</span>
        </div>
      ) : <EmptyCell />;

    case 'fecha_valoracion':
      if (!empresa.fecha_valoracion) return <EmptyCell />;
      const date = new Date(empresa.fecha_valoracion);
      return (
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Calendar className="h-3 w-3 flex-shrink-0" />
          <span>{date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
        </div>
      );

    case 'ultima_actividad':
      if (!empresa.ultima_actividad) return <EmptyCell />;
      const activityDate = new Date(empresa.ultima_actividad);
      const now = new Date();
      const diffDays = Math.floor((now.getTime() - activityDate.getTime()) / (1000 * 60 * 60 * 24));
      
      // Color coding por recencia: verde ≤7 días, amarillo ≤30 días, gris >30 días
      const colorClass = diffDays <= 7 ? 'text-green-600' : 
                         diffDays <= 30 ? 'text-yellow-600' : 
                         'text-muted-foreground';
      
      // Formateo relativo
      const getRelativeTimeText = (days: number) => {
        if (days === 0) return 'Hoy';
        if (days === 1) return 'Ayer';
        if (days < 7) return `Hace ${days}d`;
        if (days < 30) return `Hace ${Math.floor(days / 7)}sem`;
        if (days < 365) return `Hace ${Math.floor(days / 30)}m`;
        return `Hace ${Math.floor(days / 365)}a`;
      };
      
      return (
        <div className={cn("flex items-center gap-1 text-xs", colorClass)}>
          <Clock className="h-3 w-3 flex-shrink-0" />
          <span>{getRelativeTimeText(diffDays)}</span>
        </div>
      );

    case 'estado':
      const hasStatus = empresa.es_target || empresa.potencial_search_fund;
      return hasStatus ? (
        <div className="flex flex-wrap gap-1">
          {empresa.es_target && (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-green-50 text-green-700 border-green-200">
              Target
            </Badge>
          )}
          {empresa.potencial_search_fund && (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-purple-50 text-purple-700 border-purple-200">
              SF
            </Badge>
          )}
        </div>
      ) : <EmptyCell />;

    case 'acciones':
      return (
        <div onClick={(e) => e.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40 bg-background">
              {empresa.sitio_web && (
                <DropdownMenuItem
                  onClick={() => {
                    const url = empresa.sitio_web?.startsWith('http')
                      ? empresa.sitio_web
                      : `https://${empresa.sitio_web}`;
                    window.open(url, '_blank');
                  }}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Sitio web
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => onEdit(empresa)}>
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete(empresa)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );

    default:
      return <EmptyCell />;
  }
};

// ========== ROW COMPONENT ==========
const EmpresaRow = memo(({ index, style, data }: ListChildComponentProps<RowData>) => {
  const { empresas, onEdit, onDelete, onNavigate, visibleColumns, columnWidths } = data;
  const empresa = empresas[index];

  return (
    <div
      style={style}
      className={cn(
        "flex items-center border-b border-border/50 hover:bg-muted/50 cursor-pointer transition-colors",
        index % 2 === 0 ? "bg-background" : "bg-muted/20"
      )}
      onClick={() => onNavigate(empresa.id)}
    >
      {visibleColumns.map((column) => (
        <div
          key={column.column_key}
          style={{ width: columnWidths[column.column_key] || 100, minWidth: columnWidths[column.column_key] || 100 }}
          className={cn(
            "px-2 py-1 flex-shrink-0 overflow-hidden",
            column.column_key === 'nombre' && 'px-3',
            ['facturacion', 'ebitda', 'margen', 'valoracion'].includes(column.column_key) && 'text-right'
          )}
        >
          {renderCellContent(empresa, column.column_key, onEdit, onDelete)}
        </div>
      ))}
    </div>
  );
});

EmpresaRow.displayName = 'EmpresaRow';

// ========== HEADER COMPONENTS ==========
const SortableHeader = memo(({ 
  column, 
  sortConfig, 
  onSort,
  width
}: { 
  column: EmpresaTableColumn; 
  sortConfig: SortConfig;
  onSort: (key: string) => void;
  width: number;
}) => {
  const isSorted = sortConfig?.key === column.column_key;
  const isAsc = isSorted && sortConfig?.direction === 'asc';

  if (!column.is_sortable || column.column_key === 'acciones' || column.column_key === 'favorito') {
    return (
      <div
        style={{ width, minWidth: width }}
        className={cn(
          "px-2 flex-shrink-0 text-xs font-medium text-muted-foreground",
          column.column_key === 'nombre' && 'px-3',
          ['facturacion', 'ebitda', 'margen', 'valoracion'].includes(column.column_key) && 'text-right'
        )}
      >
        {column.label}
      </div>
    );
  }

  return (
    <button
      onClick={() => onSort(column.column_key)}
      style={{ width, minWidth: width }}
      className={cn(
        "px-2 flex-shrink-0 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors",
        "flex items-center gap-1 group",
        column.column_key === 'nombre' && 'px-3',
        ['facturacion', 'ebitda', 'margen', 'valoracion'].includes(column.column_key) && 'justify-end',
        isSorted && 'text-foreground'
      )}
    >
      <span className="truncate">{column.label}</span>
      <span className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
        {isSorted ? (
          isAsc ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
        ) : (
          <ChevronsUpDown className="h-3 w-3" />
        )}
      </span>
    </button>
  );
});

SortableHeader.displayName = 'SortableHeader';

const TableHeader = memo(({ 
  visibleColumns, 
  sortConfig, 
  onSort,
  columnWidths,
  totalWidth
}: { 
  visibleColumns: EmpresaTableColumn[];
  sortConfig: SortConfig;
  onSort: (key: string) => void;
  columnWidths: Record<string, number>;
  totalWidth: number;
}) => (
  <div 
    className="flex items-center bg-muted/50 border-b border-border py-2"
    style={{ width: totalWidth, minWidth: totalWidth }}
  >
    {visibleColumns.map((column) => (
      <SortableHeader 
        key={column.column_key} 
        column={column} 
        sortConfig={sortConfig}
        onSort={onSort}
        width={columnWidths[column.column_key] || 100}
      />
    ))}
  </div>
));

TableHeader.displayName = 'TableHeader';

// ========== EMPTY & LOADING STATES ==========
const EmptyState = memo(({ 
  message, 
  action, 
  actionLabel 
}: { 
  message: string; 
  action?: () => void; 
  actionLabel?: string;
}) => (
  <div className="text-center py-16 bg-muted/10 rounded-lg border border-dashed border-border/50">
    <Star className="h-10 w-10 text-yellow-400/40 mx-auto mb-4" />
    <p className="text-muted-foreground font-medium">{message}</p>
    <p className="text-sm text-muted-foreground/70 mt-1">
      Añade empresas con ⭐ desde la pestaña "Todas"
    </p>
    {action && (
      <Button variant="outline" size="sm" className="mt-4" onClick={action}>
        <Building2 className="h-4 w-4 mr-2" />
        {actionLabel || 'Ver todas las empresas'}
      </Button>
    )}
  </div>
));

EmptyState.displayName = 'EmptyState';

const LoadingState = memo(() => (
  <div className="flex items-center justify-center py-16">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
));

LoadingState.displayName = 'LoadingState';

// ========== MAIN COMPONENT ==========
export const EmpresasTableVirtualized: React.FC<EmpresasTableVirtualizedProps> = ({
  empresas,
  isLoading: isLoadingData,
  showFavorites = true,
  emptyMessage = 'No se encontraron empresas',
  emptyAction,
  emptyActionLabel = 'Crear empresa',
  onEdit,
  onDelete,
  height = 500,
}) => {
  const navigate = useNavigate();
  const { visibleColumns, isLoading: isLoadingColumns } = useEmpresasTableColumns();
  const [sortConfig, setSortConfig] = useState<SortConfig>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<List>(null);

  const handleNavigate = useCallback((id: string) => {
    navigate(`/admin/empresas/${id}`);
  }, [navigate]);

  const handleSort = useCallback((key: string) => {
    setSortConfig(current => {
      if (current?.key === key) {
        if (current.direction === 'asc') {
          return { key, direction: 'desc' };
        }
        return null;
      }
      return { key, direction: 'asc' };
    });
  }, []);

  // Calculate column widths and total width
  const columnWidths = useMemo(() => {
    const widths: Record<string, number> = {};
    visibleColumns.forEach(col => {
      widths[col.column_key] = getColumnWidth(col.column_key);
    });
    return widths;
  }, [visibleColumns]);

  const totalWidth = useMemo(() => calculateTotalWidth(visibleColumns), [visibleColumns]);

  // Sort empresas
  const sortedEmpresas = useMemo(() => {
    if (!sortConfig) return empresas;

    return [...empresas].sort((a, b) => {
      const key = sortConfig.key as keyof Empresa;
      let aVal = a[key];
      let bVal = b[key];

      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return 1;
      if (bVal == null) return -1;

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
      }

      const aStr = String(aVal).toLowerCase();
      const bStr = String(bVal).toLowerCase();
      if (sortConfig.direction === 'asc') {
        return aStr.localeCompare(bStr);
      }
      return bStr.localeCompare(aStr);
    });
  }, [empresas, sortConfig]);

  const itemData = useMemo<RowData>(() => ({
    empresas: sortedEmpresas,
    onEdit,
    onDelete,
    onNavigate: handleNavigate,
    showFavorites,
    visibleColumns,
    columnWidths,
  }), [sortedEmpresas, onEdit, onDelete, handleNavigate, showFavorites, visibleColumns, columnWidths]);

  const isLoading = isLoadingData || isLoadingColumns;

  if (isLoading) {
    return <LoadingState />;
  }

  if (empresas.length === 0) {
    return (
      <EmptyState
        message={emptyMessage}
        action={emptyAction}
        actionLabel={emptyActionLabel}
      />
    );
  }

  const listHeight = Math.min(height, empresas.length * ROW_HEIGHT);

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      {/* Scroll container for synchronized horizontal scroll */}
      <div 
        ref={scrollContainerRef}
        className="overflow-x-auto"
      >
        {/* Inner container with fixed width */}
        <div style={{ minWidth: totalWidth }}>
          {/* Header */}
          <TableHeader 
            visibleColumns={visibleColumns} 
            sortConfig={sortConfig}
            onSort={handleSort}
            columnWidths={columnWidths}
            totalWidth={totalWidth}
          />
          
          {/* Virtualized List */}
          <List
            ref={listRef}
            height={listHeight}
            width={totalWidth}
            itemCount={sortedEmpresas.length}
            itemSize={ROW_HEIGHT}
            itemData={itemData}
            overscanCount={5}
            style={{ overflow: 'hidden' }}
          >
            {EmpresaRow}
          </List>
        </div>
      </div>
      
      {/* Footer */}
      <div className="px-4 py-2 bg-muted/30 border-t border-border text-xs text-muted-foreground flex items-center justify-between">
        <span>Mostrando {empresas.length} empresa{empresas.length !== 1 ? 's' : ''}</span>
        {sortConfig && (
          <span className="flex items-center gap-1">
            Ordenado por {visibleColumns.find(c => c.column_key === sortConfig.key)?.label}
            {sortConfig.direction === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </span>
        )}
      </div>
    </div>
  );
};

export default EmpresasTableVirtualized;
