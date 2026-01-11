import React from 'react';
import { 
  Globe, 
  Linkedin, 
  MapPin, 
  Calendar, 
  Link2, 
  User, 
  ChevronDown,
  Building2,
  ExternalLink
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { SFFund } from '@/types/searchFunds';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface SFFundDetailSidebarProps {
  fund: SFFund;
}

const statusLabels: Record<string, { label: string; color: string }> = {
  searching: { label: 'Buscando', color: 'bg-green-500/10 text-green-700 border-green-200' },
  acquired: { label: 'Adquirido', color: 'bg-blue-500/10 text-blue-700 border-blue-200' },
  holding: { label: 'Holding', color: 'bg-amber-500/10 text-amber-700 border-amber-200' },
  exited: { label: 'Exit', color: 'bg-purple-500/10 text-purple-700 border-purple-200' },
  inactive: { label: 'Inactivo', color: 'bg-muted text-muted-foreground border-border' },
};

const investmentStyleLabels: Record<string, string> = {
  single: 'Single acquisition',
  buy_and_build: 'Buy & Build',
  either: 'Flexible',
};

function formatCurrency(value: number | null): string {
  if (value === null) return '-';
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

export function SFFundDetailSidebar({ fund }: SFFundDetailSidebarProps) {
  const statusConfig = statusLabels[fund.status] || statusLabels.inactive;

  return (
    <div className="w-80 border-r bg-muted/30 overflow-y-auto h-full">
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

        {/* Status badge */}
        <Badge className={`${statusConfig.color} border`}>
          {statusConfig.label}
        </Badge>

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
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">EBITDA</span>
                <p className="text-sm font-medium">{formatRange(fund.ebitda_min, fund.ebitda_max)}</p>
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">REVENUE</span>
                <p className="text-sm font-medium">{formatRange(fund.revenue_min, fund.revenue_max)}</p>
              </div>
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">DEAL SIZE</span>
              <p className="text-sm font-medium">{formatRange(fund.deal_size_min, fund.deal_size_max)}</p>
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">ESTILO</span>
              <p className="text-sm font-medium">{investmentStyleLabels[fund.investment_style] || fund.investment_style}</p>
            </div>
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
