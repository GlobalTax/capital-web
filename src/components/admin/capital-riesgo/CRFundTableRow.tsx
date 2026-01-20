// ============= CR FUND TABLE ROW - Memoized for virtualization =============
import React, { memo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, ExternalLink, MoreHorizontal, TrendingUp, Users, Building2, Globe } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { CRFund, CRFundStatus, CRFundType, CR_FUND_STATUS_LABELS, CR_FUND_TYPE_LABELS } from '@/types/capitalRiesgo';
import { CRFavoriteButton } from './CRFavoriteButton';
import { EditableSelect, SelectOption } from '@/components/admin/shared/EditableSelect';

// Portfolio company interface
interface PortfolioCompany {
  company_name: string;
  website: string | null;
}

// Extended fund type with computed fields
export interface CRFundWithCounts extends CRFund {
  people_count?: number;
  portfolio_count?: number;
  portfolio_sample?: PortfolioCompany[];
}

export interface CRFundRowProps {
  fund: CRFundWithCounts;
  showFavorites: boolean;
  fundTypeOptions: SelectOption[];
  statusOptions: SelectOption[];
  onUpdateFundType: (fundId: string, newType: string) => Promise<void>;
  onUpdateStatus: (fundId: string, newStatus: string) => Promise<void>;
  onDelete: (fundId: string) => void;
  style?: React.CSSProperties;
  isLast?: boolean;
}

// Column styles with flex for proper expansion
export const COL_STYLES = {
  favorite: { minWidth: 36, flex: '0 0 36px' },
  name: { minWidth: 200, flex: '2.5 0 200px' },
  type: { minWidth: 100, flex: '1 0 100px' },
  country: { minWidth: 80, flex: '0.8 0 80px' },
  financials: { minWidth: 140, flex: '1.5 0 140px' },
  portfolio: { minWidth: 70, flex: '0 0 70px' },
  contacts: { minWidth: 70, flex: '0 0 70px' },
  actions: { minWidth: 40, flex: '0 0 40px' },
};

// Status colors
const statusColors: Record<CRFundStatus, string> = {
  active: 'bg-green-500/10 text-green-600 border-green-500/20',
  raising: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  deployed: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  closed: 'bg-gray-500/10 text-gray-600 border-gray-500/20',
  inactive: 'bg-slate-500/10 text-slate-600 border-slate-500/20',
};

// Type colors
const typeColors: Record<CRFundType, string> = {
  private_equity: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
  venture_capital: 'bg-teal-500/10 text-teal-600 border-teal-500/20',
  growth_equity: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
  family_office: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  corporate: 'bg-slate-500/10 text-slate-600 border-slate-500/20',
  fund_of_funds: 'bg-pink-500/10 text-pink-600 border-pink-500/20',
};

// Format currency helper
const formatCurrency = (value: number | null) => {
  if (!value) return null;
  if (value >= 1000000000) return `${(value / 1000000000).toFixed(1)}B€`;
  if (value >= 1000000) return `${(value / 1000000).toFixed(0)}M€`;
  if (value >= 1000) return `${(value / 1000).toFixed(0)}K€`;
  return `${value}€`;
};

// Portfolio websites tooltip component
const PortfolioWebsTooltip = memo<{ portfolioSample: PortfolioCompany[] }>(({ portfolioSample }) => {
  const companiesWithWebsite = portfolioSample.filter(p => p.website);
  
  if (companiesWithWebsite.length === 0) return null;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="flex items-center gap-0.5 text-xs text-muted-foreground cursor-pointer hover:text-primary">
          <Globe className="h-3 w-3" />
          {companiesWithWebsite.length}
        </span>
      </TooltipTrigger>
      <TooltipContent side="left" className="max-w-xs">
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground mb-1.5">Webs participadas:</p>
          {companiesWithWebsite.slice(0, 8).map((company, i) => (
            <a
              key={i}
              href={company.website!.startsWith('http') ? company.website! : `https://${company.website}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs hover:text-primary"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink className="h-2.5 w-2.5 flex-shrink-0" />
              <span className="truncate">{company.company_name}</span>
            </a>
          ))}
          {companiesWithWebsite.length > 8 && (
            <p className="text-xs text-muted-foreground pt-1">+{companiesWithWebsite.length - 8} más</p>
          )}
        </div>
      </TooltipContent>
    </Tooltip>
  );
});

PortfolioWebsTooltip.displayName = 'PortfolioWebsTooltip';

export const CRFundTableRow = memo<CRFundRowProps>(({
  fund,
  showFavorites,
  fundTypeOptions,
  statusOptions,
  onUpdateFundType,
  onUpdateStatus,
  onDelete,
  style,
  isLast,
}) => {
  // Format financials
  const aum = formatCurrency(fund.aum);
  
  // Handlers
  const handleDelete = useCallback(() => {
    if (confirm('¿Eliminar este fondo de Capital Riesgo?')) {
      onDelete(fund.id);
    }
  }, [fund.id, onDelete]);

  return (
    <div
      style={style}
      className={cn(
        "flex items-center h-11 hover:bg-muted/40 transition-colors",
        !isLast && "border-b border-border/30"
      )}
    >
      {/* Favorite */}
      {showFavorites && (
        <div 
          className="flex items-center justify-center h-full px-1"
          style={{ flex: COL_STYLES.favorite.flex, minWidth: COL_STYLES.favorite.minWidth }}
          onClick={(e) => e.stopPropagation()}
        >
          <CRFavoriteButton entityType="fund" entityId={fund.id} />
        </div>
      )}

      {/* Fund Name + Sectors */}
      <div 
        className="flex flex-col justify-center h-full px-2 min-w-0"
        style={{ flex: COL_STYLES.name.flex, minWidth: COL_STYLES.name.minWidth }}
      >
        <div className="flex items-center gap-1.5">
          <Link 
            to={`/admin/cr-directory/${fund.id}`}
            className="font-medium text-sm hover:underline truncate"
          >
            {fund.name}
          </Link>
          {fund.website && (
            <a
              href={fund.website.startsWith('http') ? fund.website : `https://${fund.website}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary flex-shrink-0"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
        {fund.sector_focus && fund.sector_focus.length > 0 && (
          <div className="flex flex-wrap gap-0.5 mt-0.5">
            {fund.sector_focus.slice(0, 2).map((sector, i) => (
              <Badge key={i} variant="outline" className="text-[9px] h-4 px-1 font-normal">
                {sector}
              </Badge>
            ))}
            {fund.sector_focus.length > 2 && (
              <Badge variant="outline" className="text-[9px] h-4 px-1 font-normal">
                +{fund.sector_focus.length - 2}
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Type (inline editable) */}
      <div 
        className="flex items-center h-full px-1"
        style={{ flex: COL_STYLES.type.flex, minWidth: COL_STYLES.type.minWidth }}
      >
        <EditableSelect
          value={fund.fund_type}
          options={fundTypeOptions}
          onSave={(v) => onUpdateFundType(fund.id, v)}
          placeholder="Tipo..."
          displayClassName="text-[10px] h-6 min-w-[85px]"
        />
      </div>

      {/* Country */}
      <div 
        className="flex items-center gap-1 h-full px-2 text-sm text-muted-foreground"
        style={{ flex: COL_STYLES.country.flex, minWidth: COL_STYLES.country.minWidth }}
      >
        <MapPin className="h-3 w-3 flex-shrink-0" />
        <span className="truncate">{fund.country_base || '—'}</span>
      </div>

      {/* Financials (AUM only) */}
      <div 
        className="flex items-center gap-2 h-full px-2 text-sm"
        style={{ flex: COL_STYLES.financials.flex, minWidth: COL_STYLES.financials.minWidth }}
      >
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-1 cursor-default">
              {aum ? (
                <>
                  <TrendingUp className="h-3 w-3 text-muted-foreground" />
                  <span className="font-medium">{aum}</span>
                </>
              ) : (
                <span className="text-muted-foreground">—</span>
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent side="top">
            <div className="text-xs space-y-0.5">
              <div>AUM: {aum || 'No disponible'}</div>
              {fund.ebitda_min && <div>EBITDA mín: {formatCurrency(fund.ebitda_min)}</div>}
              {fund.revenue_min && <div>Revenue mín: {formatCurrency(fund.revenue_min)}</div>}
            </div>
          </TooltipContent>
        </Tooltip>
      </div>

      {/* Portfolio count */}
      <div 
        className="flex items-center gap-1 h-full px-2"
        style={{ flex: COL_STYLES.portfolio.flex, minWidth: COL_STYLES.portfolio.minWidth }}
      >
        <Link 
          to={`/admin/cr-directory/${fund.id}?tab=portfolio`}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"
        >
          <Building2 className="h-3 w-3" />
          <span>{fund.portfolio_count || 0}</span>
        </Link>
        {fund.portfolio_sample && fund.portfolio_sample.length > 0 && (
          <PortfolioWebsTooltip portfolioSample={fund.portfolio_sample} />
        )}
      </div>

      {/* Contacts count */}
      <div 
        className="flex items-center gap-1 h-full px-2 text-sm text-muted-foreground"
        style={{ flex: COL_STYLES.contacts.flex, minWidth: COL_STYLES.contacts.minWidth }}
      >
        <Users className="h-3 w-3" />
        <span>{fund.people_count || 0}</span>
      </div>

      {/* Actions */}
      <div 
        className="flex items-center justify-center h-full px-1"
        style={{ flex: COL_STYLES.actions.flex, minWidth: COL_STYLES.actions.minWidth }}
      >
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7">
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
                <a 
                  href={fund.website.startsWith('http') ? fund.website : `https://${fund.website}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Sitio web
                </a>
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="text-destructive"
              onClick={handleDelete}
            >
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
});

CRFundTableRow.displayName = 'CRFundTableRow';
