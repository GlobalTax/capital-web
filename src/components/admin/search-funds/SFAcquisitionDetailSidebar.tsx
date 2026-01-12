import React from 'react';
import { Globe, MapPin, Factory, Building2, Calendar, TrendingUp, Briefcase } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown } from 'lucide-react';
import { SFAcquisition, SFFund } from '@/types/searchFunds';

interface SFAcquisitionDetailSidebarProps {
  acquisition: SFAcquisition;
  fund?: SFFund;
}

const dealTypeLabels: Record<string, string> = {
  majority: 'Mayoría',
  minority: 'Minoría',
  merger: 'Fusión',
  asset: 'Activos',
  unknown: 'Desconocido',
};

const statusLabels: Record<string, string> = {
  owned: 'En cartera',
  exited: 'Exit',
  unknown: 'Desconocido',
};

function SidebarItem({ icon: Icon, label, value, href }: { 
  icon: React.ElementType; 
  label: string; 
  value: string | null | undefined;
  href?: string;
}) {
  if (!value) return null;
  
  return (
    <div className="flex items-start gap-3 py-2">
      <Icon className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
      <div className="min-w-0 flex-1">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
        {href ? (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-primary hover:underline break-all"
          >
            {value}
          </a>
        ) : (
          <div className="text-sm break-words">{value}</div>
        )}
      </div>
    </div>
  );
}

export function SFAcquisitionDetailSidebar({ acquisition, fund }: SFAcquisitionDetailSidebarProps) {
  const [openGeneral, setOpenGeneral] = React.useState(true);
  const [openInvestment, setOpenInvestment] = React.useState(true);

  const websiteUrl = acquisition.website 
    ? (acquisition.website.startsWith('http') ? acquisition.website : `https://${acquisition.website}`)
    : undefined;

  return (
    <div className="w-72 border-r overflow-y-auto bg-muted/30">
      <div className="p-4 space-y-4">
        {/* Datos Generales */}
        <Collapsible open={openGeneral} onOpenChange={setOpenGeneral}>
          <CollapsibleTrigger className="flex items-center justify-between w-full py-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Datos generales
            </span>
            <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${openGeneral ? 'rotate-180' : ''}`} />
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-1">
            <SidebarItem
              icon={Globe}
              label="Sitio web"
              value={acquisition.website}
              href={websiteUrl}
            />
            <SidebarItem
              icon={MapPin}
              label="País"
              value={acquisition.country}
            />
            {acquisition.region && (
              <SidebarItem
                icon={MapPin}
                label="Región"
                value={acquisition.region}
              />
            )}
            <SidebarItem
              icon={Factory}
              label="Sector"
              value={acquisition.sector}
            />
            {acquisition.cnae && (
              <SidebarItem
                icon={Factory}
                label="CNAE"
                value={acquisition.cnae}
              />
            )}
          </CollapsibleContent>
        </Collapsible>

        {/* Inversión */}
        <Collapsible open={openInvestment} onOpenChange={setOpenInvestment}>
          <CollapsibleTrigger className="flex items-center justify-between w-full py-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Inversión
            </span>
            <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${openInvestment ? 'rotate-180' : ''}`} />
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-1">
            <SidebarItem
              icon={Building2}
              label="Search Fund"
              value={fund?.name}
            />
            {acquisition.fund_name && (
              <SidebarItem
                icon={Briefcase}
                label="Fondo específico"
                value={acquisition.fund_name}
              />
            )}
            <SidebarItem
              icon={Calendar}
              label="Año de adquisición"
              value={acquisition.deal_year?.toString()}
            />
            <SidebarItem
              icon={TrendingUp}
              label="Tipo de deal"
              value={dealTypeLabels[acquisition.deal_type]}
            />
            <SidebarItem
              icon={Briefcase}
              label="Estado"
              value={statusLabels[acquisition.status]}
            />
            {acquisition.exit_year && (
              <SidebarItem
                icon={Calendar}
                label="Año de exit"
                value={acquisition.exit_year.toString()}
              />
            )}
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  );
}
