// ============= CR FUNDS TABLE =============
// Tabla de fondos de Capital Riesgo estilo Apollo

import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, ExternalLink, MoreHorizontal, TrendingUp, Users, ArrowUp, ArrowDown, ArrowUpDown, Building2, Globe } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { CRFund, CRFundStatus, CRFundType, CR_FUND_STATUS_LABELS, CR_FUND_TYPE_LABELS } from '@/types/capitalRiesgo';
import { useDeleteCRFund } from '@/hooks/useCRFunds';
import { CRFavoriteButton } from './CRFavoriteButton';

interface PortfolioCompany {
  company_name: string;
  website: string | null;
}

interface CRFundsTableProps {
  funds: (CRFund & { 
    people_count?: number;
    portfolio_count?: number;
    portfolio_sample?: PortfolioCompany[];
  })[];
  isLoading: boolean;
  showFavorites?: boolean;
  sortBy?: 'name' | 'people_count';
  sortOrder?: 'asc' | 'desc';
  onSort?: (field: 'name' | 'people_count') => void;
}

const statusColors: Record<CRFundStatus, string> = {
  active: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  raising: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  deployed: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  closed: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400',
  inactive: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400',
};

const typeColors: Record<CRFundType, string> = {
  private_equity: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  venture_capital: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400',
  growth_equity: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  family_office: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  corporate: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400',
  fund_of_funds: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400',
};

const formatCurrency = (value: number | null) => {
  if (!value) return '—';
  if (value >= 1000000000) return `${(value / 1000000000).toFixed(1)}B €`;
  if (value >= 1000000) return `${(value / 1000000).toFixed(0)}M €`;
  return new Intl.NumberFormat('es-ES', { 
    style: 'currency', 
    currency: 'EUR',
    maximumFractionDigits: 0 
  }).format(value);
};

// Component for portfolio websites tooltip
const PortfolioWebsTooltip: React.FC<{ portfolioSample: PortfolioCompany[] }> = ({ portfolioSample }) => {
  const companiesWithWebsite = portfolioSample.filter(p => p.website);
  
  if (companiesWithWebsite.length === 0) {
    return <span className="text-muted-foreground">—</span>;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="flex items-center gap-1 text-sm text-primary cursor-pointer hover:underline">
            <Globe className="h-3 w-3" />
            {companiesWithWebsite.length}
          </span>
        </TooltipTrigger>
        <TooltipContent side="left" className="max-w-xs">
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground mb-2">Webs de participadas:</p>
            {companiesWithWebsite.slice(0, 10).map((company, i) => (
              <a
                key={i}
                href={company.website!.startsWith('http') ? company.website! : `https://${company.website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-xs hover:text-primary"
                onClick={(e) => e.stopPropagation()}
              >
                <ExternalLink className="h-3 w-3 flex-shrink-0" />
                <span className="truncate">{company.company_name}</span>
              </a>
            ))}
            {companiesWithWebsite.length > 10 && (
              <p className="text-xs text-muted-foreground">+{companiesWithWebsite.length - 10} más</p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export const CRFundsTable: React.FC<CRFundsTableProps> = ({ 
  funds, 
  isLoading, 
  showFavorites = false,
  sortBy,
  sortOrder,
  onSort 
}) => {
  const deleteMutation = useDeleteCRFund();

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
            {showFavorites && (
              <TableHead className="w-10 h-10"></TableHead>
            )}
            <TableHead 
              className="h-10 text-[11px] font-medium uppercase tracking-wider text-muted-foreground cursor-pointer hover:bg-muted/50 select-none"
              onClick={() => onSort?.('name')}
            >
              <div className="flex items-center gap-1">
                Nombre
                {sortBy === 'name' ? (
                  sortOrder === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                ) : (
                  <ArrowUpDown className="h-3 w-3 opacity-50" />
                )}
              </div>
            </TableHead>
            <TableHead className="h-10 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Tipo
            </TableHead>
            <TableHead className="h-10 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              País
            </TableHead>
            <TableHead className="h-10 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              AUM
            </TableHead>
            <TableHead className="h-10 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Ticket
            </TableHead>
            <TableHead className="h-10 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Estado
            </TableHead>
            <TableHead className="h-10 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Participadas
            </TableHead>
            <TableHead className="h-10 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Webs Port.
            </TableHead>
            <TableHead 
              className="h-10 text-[11px] font-medium uppercase tracking-wider text-muted-foreground cursor-pointer hover:bg-muted/50 select-none"
              onClick={() => onSort?.('people_count')}
            >
              <div className="flex items-center gap-1">
                Contactos
                {sortBy === 'people_count' ? (
                  sortOrder === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                ) : (
                  <ArrowUpDown className="h-3 w-3 opacity-50" />
                )}
              </div>
            </TableHead>
            <TableHead className="w-10"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {funds.length === 0 ? (
            <TableRow>
              <TableCell colSpan={showFavorites ? 11 : 10} className="text-center py-12 text-muted-foreground">
                No se encontraron fondos de Capital Riesgo
              </TableCell>
            </TableRow>
          ) : (
            funds.map((fund) => (
              <TableRow key={fund.id} className="h-11 hover:bg-muted/50 border-b border-border/30">
                {showFavorites && (
                  <TableCell className="py-2 w-10">
                    <CRFavoriteButton entityType="fund" entityId={fund.id} />
                  </TableCell>
                )}
                <TableCell className="py-2">
                  <div>
                    <Link 
                      to={`/admin/cr-directory/${fund.id}`}
                      className="font-medium text-sm hover:underline"
                    >
                      {fund.name}
                    </Link>
                    {fund.sector_focus && fund.sector_focus.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-0.5">
                        {fund.sector_focus.slice(0, 2).map((sector, i) => (
                          <Badge key={i} variant="outline" className="text-[9px] h-4 px-1">
                            {sector}
                          </Badge>
                        ))}
                        {fund.sector_focus.length > 2 && (
                          <Badge variant="outline" className="text-[9px] h-4 px-1">
                            +{fund.sector_focus.length - 2}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell className="py-2">
                  <Badge className={`text-[10px] h-5 ${typeColors[fund.fund_type as CRFundType] || 'bg-gray-100'}`}>
                    {CR_FUND_TYPE_LABELS[fund.fund_type as keyof typeof CR_FUND_TYPE_LABELS] || fund.fund_type}
                  </Badge>
                </TableCell>
                <TableCell className="py-2">
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    {fund.country_base || '—'}
                  </div>
                </TableCell>
                <TableCell className="py-2">
                  <span className="text-sm flex items-center gap-1">
                    {fund.aum ? (
                      <>
                        <TrendingUp className="h-3 w-3 text-muted-foreground" />
                        {formatCurrency(fund.aum)}
                      </>
                    ) : (
                      '—'
                    )}
                  </span>
                </TableCell>
                <TableCell className="py-2">
                  <span className="text-sm">
                    {fund.ticket_min || fund.ticket_max ? (
                      <>
                        {formatCurrency(fund.ticket_min)} - {formatCurrency(fund.ticket_max)}
                      </>
                    ) : (
                      '—'
                    )}
                  </span>
                </TableCell>
                <TableCell className="py-2">
                  <Badge className={`text-[10px] h-5 ${statusColors[fund.status as CRFundStatus] || 'bg-gray-100'}`}>
                    {CR_FUND_STATUS_LABELS[fund.status as keyof typeof CR_FUND_STATUS_LABELS] || fund.status}
                  </Badge>
                </TableCell>
                <TableCell className="py-2">
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Building2 className="h-3 w-3" />
                    <span>{fund.portfolio_count || 0}</span>
                  </div>
                </TableCell>
                <TableCell className="py-2">
                  <PortfolioWebsTooltip portfolioSample={fund.portfolio_sample || []} />
                </TableCell>
                <TableCell className="py-2">
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Users className="h-3 w-3" />
                    <span>{fund.people_count || 0}</span>
                  </div>
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
                        <Link to={`/admin/cr-directory/${fund.id}`}>
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
                          if (confirm('¿Eliminar este fondo de Capital Riesgo?')) {
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

export default CRFundsTable;