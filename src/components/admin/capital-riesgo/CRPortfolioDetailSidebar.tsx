// ============= CR PORTFOLIO DETAIL SIDEBAR =============
// Sidebar con información estructurada de la empresa participada

import React from 'react';
import { 
  Building2, 
  Globe, 
  MapPin, 
  Calendar, 
  Briefcase, 
  DollarSign,
  TrendingUp,
  FileText,
  ChevronDown
} from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import type { CRPortfolio } from '@/types/capitalRiesgo';

interface CRPortfolioDetailSidebarProps {
  company: CRPortfolio & { fund?: { id: string; name: string; fund_type: string; website?: string; status: string } };
}

interface SidebarSectionProps {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

function SidebarSection({ title, defaultOpen = true, children }: SidebarSectionProps) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className="flex items-center justify-between w-full py-2 px-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground hover:bg-muted/50 rounded">
        <span>{title}</span>
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </CollapsibleTrigger>
      <CollapsibleContent className="px-3 pb-3 space-y-3">
        {children}
      </CollapsibleContent>
    </Collapsible>
  );
}

interface InfoRowProps {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}

function InfoRow({ icon, label, value }: InfoRowProps) {
  return (
    <div className="flex items-start gap-2">
      <div className="text-muted-foreground mt-0.5">{icon}</div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
        <div className="text-sm">{value || <span className="text-muted-foreground">-</span>}</div>
      </div>
    </div>
  );
}

export function CRPortfolioDetailSidebar({ company }: CRPortfolioDetailSidebarProps) {
  return (
    <aside className="w-72 border-r bg-muted/30 overflow-y-auto shrink-0">
      <div className="divide-y">
        {/* Company Info */}
        <SidebarSection title="Datos Empresa">
          <InfoRow
            icon={<Building2 className="h-3.5 w-3.5" />}
            label="Nombre"
            value={company.company_name}
          />
          <InfoRow
            icon={<Globe className="h-3.5 w-3.5" />}
            label="Website"
            value={
              company.website ? (
                <a 
                  href={company.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline truncate block"
                >
                  {company.website.replace(/^https?:\/\//, '')}
                </a>
              ) : null
            }
          />
          <InfoRow
            icon={<MapPin className="h-3.5 w-3.5" />}
            label="País"
            value={company.country}
          />
          <InfoRow
            icon={<Briefcase className="h-3.5 w-3.5" />}
            label="Sector"
            value={company.sector}
          />
        </SidebarSection>

        {/* Investment Info */}
        <SidebarSection title="Datos Inversión">
          <InfoRow
            icon={<DollarSign className="h-3.5 w-3.5" />}
            label="Fondo"
            value={
              <div className="flex flex-col gap-1">
                {company.fund?.name && (
                  <Badge variant="outline" className="w-fit text-xs">
                    {company.fund.name}
                  </Badge>
                )}
                {company.fund_name && (
                  <span className="text-xs text-muted-foreground">{company.fund_name}</span>
                )}
              </div>
            }
          />
          <InfoRow
            icon={<Calendar className="h-3.5 w-3.5" />}
            label="Año inversión"
            value={company.investment_year}
          />
          <InfoRow
            icon={<TrendingUp className="h-3.5 w-3.5" />}
            label="Estado"
            value={
              <Badge 
                variant="outline" 
                className={`text-xs ${
                  company.status === 'active' 
                    ? 'bg-green-500/10 text-green-700 border-green-200'
                    : company.status === 'exited'
                    ? 'bg-purple-500/10 text-purple-700 border-purple-200'
                    : 'bg-red-500/10 text-red-700 border-red-200'
                }`}
              >
                {company.status === 'active' ? 'Activo' : company.status === 'exited' ? 'Exit' : 'Write-off'}
                {company.status === 'exited' && company.exit_year && (
                  <span className="ml-1">({company.exit_year})</span>
                )}
              </Badge>
            }
          />
          {company.exit_year && (
            <InfoRow
              icon={<Calendar className="h-3.5 w-3.5" />}
              label="Año exit"
              value={company.exit_year}
            />
          )}
        </SidebarSection>

      </div>
    </aside>
  );
}
