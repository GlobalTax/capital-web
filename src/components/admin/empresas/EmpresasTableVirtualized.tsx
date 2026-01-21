// ============= EMPRESAS TABLE VIRTUALIZED =============
// Tabla de alto rendimiento con react-window (~30ms para 1000+ filas)

import React, { memo, useCallback, useMemo } from 'react';
import { FixedSizeList as List, ListChildComponentProps } from 'react-window';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Building2,
  Edit,
  Trash2,
  ExternalLink,
  Plus,
  Star,
  MoreHorizontal,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Empresa } from '@/hooks/useEmpresas';
import { EmpresaFavoriteButton } from './EmpresaFavoriteButton';
import { formatCompactCurrency } from '@/shared/utils/format';
import { cn } from '@/lib/utils';

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

interface RowData {
  empresas: Empresa[];
  onEdit: (empresa: Empresa) => void;
  onDelete: (empresa: Empresa) => void;
  onNavigate: (id: string) => void;
  showFavorites: boolean;
}

const ROW_HEIGHT = 52;

// Memoized row component
const EmpresaRow = memo(({ index, style, data }: ListChildComponentProps<RowData>) => {
  const { empresas, onEdit, onDelete, onNavigate, showFavorites } = data;
  const empresa = empresas[index];

  const calculateMargin = (emp: Empresa) => {
    if (!emp.ebitda || !emp.facturacion) return null;
    return ((emp.ebitda / emp.facturacion) * 100).toFixed(1);
  };

  const margin = calculateMargin(empresa);
  const hasFinancials = empresa.facturacion || empresa.ebitda;

  return (
    <div
      style={style}
      className={cn(
        "flex items-center border-b border-border/50 hover:bg-muted/50 cursor-pointer transition-colors",
        index % 2 === 0 ? "bg-background" : "bg-muted/20"
      )}
      onClick={() => onNavigate(empresa.id)}
    >
      {/* Favorite */}
      {showFavorites && (
        <div className="w-12 px-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
          <EmpresaFavoriteButton empresaId={empresa.id} size="sm" />
        </div>
      )}

      {/* Empresa + Sector */}
      <div className="flex-1 min-w-[200px] px-3 py-1">
        <div className="font-medium text-sm truncate">{empresa.nombre}</div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-muted-foreground truncate">
            {empresa.sector}
          </span>
          {empresa.subsector && (
            <span className="text-xs text-muted-foreground/60 truncate">
              / {empresa.subsector}
            </span>
          )}
        </div>
      </div>

      {/* Ubicación */}
      <div className="w-[100px] px-2 flex-shrink-0 hidden md:block">
        <span className="text-xs text-muted-foreground truncate block">
          {empresa.ubicacion || '-'}
        </span>
      </div>

      {/* Financials (combined) */}
      <div className="w-[150px] px-2 flex-shrink-0 text-right">
        {hasFinancials ? (
          <div>
            <div className="text-sm font-medium">
              {empresa.facturacion ? formatCompactCurrency(empresa.facturacion) : '-'}
            </div>
            <div className="text-xs text-muted-foreground">
              {empresa.ebitda ? (
                <>
                  {formatCompactCurrency(empresa.ebitda)}
                  {margin && <span className="text-green-600 ml-1">({margin}%)</span>}
                </>
              ) : '-'}
            </div>
          </div>
        ) : (
          <span className="text-xs text-muted-foreground">Sin datos</span>
        )}
      </div>

      {/* Estado (badges) */}
      <div className="w-[100px] px-2 flex-shrink-0 hidden lg:block">
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
          {!empresa.es_target && !empresa.potencial_search_fund && (
            <span className="text-muted-foreground text-xs">-</span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="w-[50px] px-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
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
    </div>
  );
});

EmpresaRow.displayName = 'EmpresaRow';

// Header component
const TableHeader = memo(({ showFavorites }: { showFavorites: boolean }) => (
  <div className="flex items-center bg-muted/50 border-b border-border px-0 py-2 text-xs font-medium text-muted-foreground sticky top-0 z-10">
    {showFavorites && <div className="w-12 px-2 flex-shrink-0"></div>}
    <div className="flex-1 min-w-[200px] px-3">Empresa</div>
    <div className="w-[100px] px-2 flex-shrink-0 hidden md:block">Ubicación</div>
    <div className="w-[150px] px-2 flex-shrink-0 text-right">Fact. / EBITDA</div>
    <div className="w-[100px] px-2 flex-shrink-0 hidden lg:block">Estado</div>
    <div className="w-[50px] px-2 flex-shrink-0"></div>
  </div>
));

TableHeader.displayName = 'TableHeader';

// Empty state component
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

// Loading component
const LoadingState = memo(() => (
  <div className="flex items-center justify-center py-16">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
));

LoadingState.displayName = 'LoadingState';

export const EmpresasTableVirtualized: React.FC<EmpresasTableVirtualizedProps> = ({
  empresas,
  isLoading,
  showFavorites = true,
  emptyMessage = 'No se encontraron empresas',
  emptyAction,
  emptyActionLabel = 'Crear empresa',
  onEdit,
  onDelete,
  height = 500,
}) => {
  const navigate = useNavigate();

  const handleNavigate = useCallback((id: string) => {
    navigate(`/admin/empresas/${id}`);
  }, [navigate]);

  const itemData = useMemo<RowData>(() => ({
    empresas,
    onEdit,
    onDelete,
    onNavigate: handleNavigate,
    showFavorites,
  }), [empresas, onEdit, onDelete, handleNavigate, showFavorites]);

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

  // Calculate dynamic height based on content
  const listHeight = Math.min(height, empresas.length * ROW_HEIGHT);

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <TableHeader showFavorites={showFavorites} />
      <List
        height={listHeight}
        width="100%"
        itemCount={empresas.length}
        itemSize={ROW_HEIGHT}
        itemData={itemData}
        overscanCount={5}
      >
        {EmpresaRow}
      </List>
      {/* Footer with count */}
      <div className="px-4 py-2 bg-muted/30 border-t border-border text-xs text-muted-foreground">
        Mostrando {empresas.length} empresa{empresas.length !== 1 ? 's' : ''}
      </div>
    </div>
  );
};

export default EmpresasTableVirtualized;
