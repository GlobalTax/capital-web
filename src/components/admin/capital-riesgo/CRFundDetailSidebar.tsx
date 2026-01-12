// ============= CR FUND DETAIL SIDEBAR =============
// Sidebar con información del fund de Capital Riesgo

import React from 'react';
import { 
  Globe, 
  MapPin, 
  Calendar, 
  Link2, 
  ChevronDown,
  Building2,
  ExternalLink,
  DollarSign,
  TrendingUp
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { CRFund, CR_FUND_STATUS_LABELS, CR_FUND_TYPE_LABELS, CR_INVESTMENT_STAGE_LABELS, CR_DEAL_TYPE_LABELS } from '@/types/capitalRiesgo';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface CRFundDetailSidebarProps {
  fund: CRFund;
}

const statusColors: Record<string, string> = {
  active: 'bg-green-500/10 text-green-700 border-green-200',
  raising: 'bg-blue-500/10 text-blue-700 border-blue-200',
  deployed: 'bg-amber-500/10 text-amber-700 border-amber-200',
  closed: 'bg-muted text-muted-foreground border-border',
};

function formatCurrency(value: number | null): string {
  if (value === null) return '-';
  if (value >= 1000000000) return `${(value / 1000000000).toFixed(1)}B €`;
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M €`;
  if (value >= 1000) return `${(value / 1000).toFixed(0)}K €`;
  return `${value} €`;
}

function formatRange(min: number | null, max: number | null): string {
  if (min === null && max === null) return 'No especificado';
  if (min !== null && max !== null) return `${formatCurrency(min)} - ${formatCurrency(max)}`;
  if (min !== null) return `> ${formatCurrency(min)}`;
  return `< ${formatCurrency(max)}`;
}

export function CRFundDetailSidebar({ fund }: CRFundDetailSidebarProps) {
  const statusColor = statusColors[fund.status] || statusColors.closed;

  return (
    <div className="w-72 border-r bg-muted/30 overflow-y-auto h-full">
      <div className="p-4 space-y-4">
        {/* Header con logo y nombre */}
        <div className="flex items-start gap-3">
          <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Building2 className="h-6 w-6 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="font-semibold text-base truncate">{fund.name}</h2>
            {fund.country_base && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="h-3 w-3" />
                <span>{fund.country_base}</span>
                {fund.cities && fund.cities.length > 0 && (
                  <span className="truncate">, {fund.cities[0]}</span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Badges de estado y tipo */}
        <div className="flex flex-wrap gap-2">
          <Badge className={`${statusColor} border`}>
            {CR_FUND_STATUS_LABELS[fund.status as keyof typeof CR_FUND_STATUS_LABELS] || fund.status}
          </Badge>
          <Badge variant="outline">
            {CR_FUND_TYPE_LABELS[fund.fund_type as keyof typeof CR_FUND_TYPE_LABELS] || fund.fund_type}
          </Badge>
        </div>

        {/* AUM y Fund Size */}
        {(fund.aum || fund.current_fund_size) && (
          <div className="grid grid-cols-2 gap-3">
            {fund.aum && (
              <div>
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">AUM</span>
                <p className="text-sm font-medium flex items-center gap-1">
                  <DollarSign className="h-3 w-3 text-muted-foreground" />
                  {formatCurrency(fund.aum)}
                </p>
              </div>
            )}
            {fund.current_fund_size && (
              <div>
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">FUND {fund.current_fund_number || ''}</span>
                <p className="text-sm font-medium flex items-center gap-1">
                  <TrendingUp className="h-3 w-3 text-muted-foreground" />
                  {formatCurrency(fund.current_fund_size)}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Enlaces externos */}
        {(fund.website || fund.source_url) && (
          <div className="flex flex-wrap gap-2">
            {fund.website && (
              <Button variant="outline" size="sm" className="h-7 text-xs" asChild>
                <a href={fund.website} target="_blank" rel="noopener noreferrer">
                  <Globe className="h-3 w-3 mr-1" />
                  Website
                </a>
              </Button>
            )}
            {fund.source_url && (
              <Button variant="outline" size="sm" className="h-7 text-xs" asChild>
                <a href={fund.source_url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Fuente
                </a>
              </Button>
            )}
          </div>
        )}

        <Separator />

        {/* Descripción */}
        {fund.description && (
          <Collapsible defaultOpen>
            <CollapsibleTrigger className="flex items-center justify-between w-full group">
              <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                DESCRIPCIÓN
              </span>
              <ChevronDown className="h-3 w-3 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-2">
              <p className="text-sm text-muted-foreground leading-relaxed line-clamp-4">
                {fund.description}
              </p>
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* Investment Stages */}
        {fund.investment_stage && fund.investment_stage.length > 0 && (
          <Collapsible defaultOpen>
            <CollapsibleTrigger className="flex items-center justify-between w-full group">
              <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                ETAPAS DE INVERSIÓN
              </span>
              <ChevronDown className="h-3 w-3 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-2">
              <div className="flex flex-wrap gap-1">
                {fund.investment_stage.map((stage, i) => (
                  <Badge key={i} variant="secondary" className="text-xs font-normal">
                    {CR_INVESTMENT_STAGE_LABELS[stage as keyof typeof CR_INVESTMENT_STAGE_LABELS] || stage}
                  </Badge>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* Sectores */}
        {fund.sector_focus && fund.sector_focus.length > 0 && (
          <Collapsible defaultOpen>
            <CollapsibleTrigger className="flex items-center justify-between w-full group">
              <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                INDUSTRIAS
              </span>
              <ChevronDown className="h-3 w-3 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-2">
              <div className="flex flex-wrap gap-1">
                {fund.sector_focus.map((sector, i) => (
                  <Badge key={i} variant="secondary" className="text-xs font-normal">
                    {sector}
                  </Badge>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* Geografía */}
        {fund.geography_focus && fund.geography_focus.length > 0 && (
          <Collapsible defaultOpen>
            <CollapsibleTrigger className="flex items-center justify-between w-full group">
              <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                GEOGRAFÍA
              </span>
              <ChevronDown className="h-3 w-3 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-2">
              <div className="flex flex-wrap gap-1">
                {fund.geography_focus.map((geo, i) => (
                  <Badge key={i} variant="outline" className="text-xs font-normal">
                    {geo}
                  </Badge>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}

        <Separator />

        {/* Criterios de inversión */}
        <Collapsible defaultOpen>
          <CollapsibleTrigger className="flex items-center justify-between w-full group">
            <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              CRITERIOS DE INVERSIÓN
            </span>
            <ChevronDown className="h-3 w-3 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-3 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">TICKET</span>
                <p className="text-sm font-medium">{formatRange(fund.ticket_min, fund.ticket_max)}</p>
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">EBITDA</span>
                <p className="text-sm font-medium">{formatRange(fund.ebitda_min, fund.ebitda_max)}</p>
              </div>
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">REVENUE</span>
              <p className="text-sm font-medium">{formatRange(fund.revenue_min, fund.revenue_max)}</p>
            </div>
            {fund.deal_types && fund.deal_types.length > 0 && (
              <div>
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">TIPOS DE DEAL</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {fund.deal_types.map((type, i) => (
                    <Badge key={i} variant="outline" className="text-xs font-normal">
                      {CR_DEAL_TYPE_LABELS[type as keyof typeof CR_DEAL_TYPE_LABELS] || type}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CollapsibleContent>
        </Collapsible>

        {/* Exclusiones */}
        {fund.sector_exclusions && fund.sector_exclusions.length > 0 && (
          <Collapsible>
            <CollapsibleTrigger className="flex items-center justify-between w-full group">
              <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                EXCLUSIONES
              </span>
              <ChevronDown className="h-3 w-3 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-2">
              <div className="flex flex-wrap gap-1">
                {fund.sector_exclusions.map((exc, i) => (
                  <Badge key={i} variant="outline" className="text-xs font-normal text-destructive border-destructive/30">
                    {exc}
                  </Badge>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}

        <Separator />

        {/* Detalles del registro */}
        <Collapsible defaultOpen>
          <CollapsibleTrigger className="flex items-center justify-between w-full group">
            <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              DETALLES DEL REGISTRO
            </span>
            <ChevronDown className="h-3 w-3 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-3 space-y-2">
            {fund.founded_year && (
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-muted-foreground">Fundado:</span>
                <span>{fund.founded_year}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-muted-foreground">Creado:</span>
              <span>{format(new Date(fund.created_at), 'dd MMM yyyy', { locale: es })}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-muted-foreground">Modificado:</span>
              <span>{format(new Date(fund.updated_at), 'dd MMM yyyy', { locale: es })}</span>
            </div>
            {fund.source_last_verified_at && (
              <div className="flex items-center gap-2 text-sm">
                <Link2 className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-muted-foreground">Verificado:</span>
                <span>{format(new Date(fund.source_last_verified_at), 'dd MMM yyyy', { locale: es })}</span>
              </div>
            )}
          </CollapsibleContent>
        </Collapsible>

        {/* Notas internas */}
        {fund.notes_internal && (
          <>
            <Separator />
            <Collapsible>
              <CollapsibleTrigger className="flex items-center justify-between w-full group">
                <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                  NOTAS INTERNAS
                </span>
                <ChevronDown className="h-3 w-3 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-2">
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {fund.notes_internal}
                </p>
              </CollapsibleContent>
            </Collapsible>
          </>
        )}
      </div>
    </div>
  );
}
