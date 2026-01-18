import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, ExternalLink, MoreHorizontal } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { SFFund, SFStatus } from '@/types/searchFunds';
import { useDeleteSFFund } from '@/hooks/useSFFunds';
import { SFFavoriteButton } from './SFFavoriteButton';

interface SFFundsTableProps {
  funds: SFFund[];
  isLoading: boolean;
  showFavoriteColumn?: boolean;
}

const statusColors: Record<SFStatus, string> = {
  searching: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  acquired: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  holding: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  exited: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  inactive: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400',
};

const statusLabels: Record<SFStatus, string> = {
  searching: 'Buscando',
  acquired: 'Adquirido',
  holding: 'En cartera',
  exited: 'Salido',
  inactive: 'Inactivo',
};

const formatCurrency = (value: number | null) => {
  if (!value) return '—';
  return new Intl.NumberFormat('es-ES', { 
    style: 'currency', 
    currency: 'EUR',
    maximumFractionDigits: 0 
  }).format(value);
};

export const SFFundsTable: React.FC<SFFundsTableProps> = ({ funds, isLoading, showFavoriteColumn = false }) => {
  const deleteMutation = useDeleteSFFund();

  if (isLoading) {
    return (
      <div className="space-y-1">
        {[...Array(10)].map((_, i) => (
          <Skeleton key={i} className="h-11 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="border border-border/50 rounded-lg overflow-hidden bg-background">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/30 border-b border-border/50 hover:bg-muted/30">
            {showFavoriteColumn && (
              <TableHead className="w-10 h-10"></TableHead>
            )}
            <TableHead className="h-10 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Nombre
            </TableHead>
            <TableHead className="h-10 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              País
            </TableHead>
            <TableHead className="h-10 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Sectores
            </TableHead>
            <TableHead className="h-10 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              EBITDA Target
            </TableHead>
            <TableHead className="h-10 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Estado
            </TableHead>
            <TableHead className="w-10"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {funds.length === 0 ? (
            <TableRow>
              <TableCell colSpan={showFavoriteColumn ? 7 : 6} className="text-center py-12 text-muted-foreground">
                No se encontraron Search Funds
              </TableCell>
            </TableRow>
          ) : (
            funds.map((fund) => (
              <TableRow key={fund.id} className="h-11 hover:bg-muted/50 border-b border-border/30">
                {showFavoriteColumn && (
                  <TableCell className="py-2" onClick={(e) => e.stopPropagation()}>
                    <SFFavoriteButton entityType="fund" entityId={fund.id} />
                  </TableCell>
                )}
                <TableCell className="py-2">
                  <div>
                    <Link 
                      to={`/admin/sf-directory/${fund.id}`}
                      className="font-medium text-sm hover:underline"
                    >
                      {fund.name}
                    </Link>
                    {fund.description && (
                      <div className="text-xs text-muted-foreground truncate max-w-[250px]">
                        {fund.description}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell className="py-2">
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    {fund.country_base || '—'}
                  </div>
                </TableCell>
                <TableCell className="py-2">
                  <div className="flex flex-wrap gap-1">
                    {fund.sector_focus?.slice(0, 2).map((sector, i) => (
                      <Badge key={i} variant="outline" className="text-[10px] h-5">
                        {sector}
                      </Badge>
                    ))}
                    {(fund.sector_focus?.length || 0) > 2 && (
                      <Badge variant="outline" className="text-[10px] h-5">
                        +{(fund.sector_focus?.length || 0) - 2}
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className="py-2">
                  <span className="text-sm">
                    {fund.ebitda_min || fund.ebitda_max ? (
                      <>
                        {formatCurrency(fund.ebitda_min)} - {formatCurrency(fund.ebitda_max)}
                      </>
                    ) : (
                      '—'
                    )}
                  </span>
                </TableCell>
                <TableCell className="py-2">
                  <Badge className={`text-[10px] h-5 ${statusColors[fund.status] || 'bg-gray-100'}`}>
                    {statusLabels[fund.status] || fund.status}
                  </Badge>
                </TableCell>
                <TableCell className="py-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link to={`/admin/sf-directory/${fund.id}`}>
                          Ver detalle
                        </Link>
                      </DropdownMenuItem>
                      {fund.website && (
                        <DropdownMenuItem asChild>
                          <a href={fund.website} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="mr-2 h-4 w-4" />
                            Sitio web
                          </a>
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem 
                        className="text-destructive"
                        onClick={() => {
                          if (confirm('¿Eliminar este Search Fund?')) {
                            deleteMutation.mutate(fund.id);
                          }
                        }}
                      >
                        Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default SFFundsTable;
