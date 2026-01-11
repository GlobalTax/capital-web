// ============= CR FUND PORTFOLIO PANEL =============
// Panel de empresas participadas de un fund de Capital Riesgo

import React from 'react';
import { Plus, Pencil, Trash2, Building2, MapPin, ExternalLink, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CRPortfolio, CR_PORTFOLIO_STATUS_LABELS, CR_INVESTMENT_TYPE_LABELS, CR_OWNERSHIP_TYPE_LABELS } from '@/types/capitalRiesgo';

interface CRFundPortfolioPanelProps {
  portfolio: CRPortfolio[];
  onAdd: () => void;
  onEdit: (company: CRPortfolio) => void;
  onDelete: (company: CRPortfolio) => void;
}

const statusColors: Record<string, string> = {
  active: 'bg-green-500/10 text-green-700 border-green-200',
  exited: 'bg-purple-500/10 text-purple-700 border-purple-200',
  write_off: 'bg-red-500/10 text-red-700 border-red-200',
};

export function CRFundPortfolioPanel({ portfolio, onAdd, onEdit, onDelete }: CRFundPortfolioPanelProps) {
  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-medium">Participadas</h3>
          <Badge variant="secondary" className="text-xs">
            {portfolio.length}
          </Badge>
        </div>
        <Button size="sm" variant="outline" className="h-7 text-xs" onClick={onAdd}>
          <Plus className="h-3 w-3 mr-1" />
          Añadir
        </Button>
      </div>

      {/* Table header */}
      <div className="grid grid-cols-[1fr_100px_80px_80px_80px_60px] gap-2 px-3 py-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground border-b">
        <div>EMPRESA</div>
        <div>SECTOR</div>
        <div>AÑO</div>
        <div>TIPO</div>
        <div>ESTADO</div>
        <div className="text-right">ACCIONES</div>
      </div>

      {/* Portfolio list */}
      {portfolio.length > 0 ? (
        <div className="divide-y">
          {portfolio.map((company) => {
            const statusConfig = statusColors[company.status] || {};
            
            return (
              <div
                key={company.id}
                className="grid grid-cols-[1fr_100px_80px_80px_80px_60px] gap-2 items-center px-3 py-2 hover:bg-muted/50 group transition-colors"
              >
                {/* Empresa */}
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-medium truncate">{company.company_name}</span>
                        {company.website && (
                          <a
                            href={company.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:text-primary/80"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                      {company.country && (
                        <div className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                          <MapPin className="h-2.5 w-2.5" />
                          <span>{company.country}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Sector */}
                <div>
                  {company.sector ? (
                    <span className="text-xs text-muted-foreground truncate block">
                      {company.sector}
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground">-</span>
                  )}
                </div>

                {/* Año */}
                <div>
                  {company.investment_year ? (
                    <div className="flex items-center gap-1 text-xs">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      <span>{company.investment_year}</span>
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">-</span>
                  )}
                </div>

                {/* Tipo */}
                <div>
                  <span className="text-xs text-muted-foreground">
                    {CR_OWNERSHIP_TYPE_LABELS[company.ownership_type as keyof typeof CR_OWNERSHIP_TYPE_LABELS] || company.ownership_type}
                  </span>
                </div>

                {/* Estado */}
                <div>
                  <Badge className={`${statusConfig} text-[10px] font-normal border`}>
                    {CR_PORTFOLIO_STATUS_LABELS[company.status as keyof typeof CR_PORTFOLIO_STATUS_LABELS] || company.status}
                    {company.status === 'exited' && company.exit_year && (
                      <span className="ml-1">{company.exit_year}</span>
                    )}
                  </Badge>
                </div>

                {/* Acciones */}
                <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => onEdit(company)}
                  >
                    <Pencil className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-destructive hover:text-destructive"
                    onClick={() => onDelete(company)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-8 text-center">
          <p className="text-sm text-muted-foreground">No hay empresas participadas</p>
          <Button size="sm" variant="outline" className="mt-3" onClick={onAdd}>
            <Plus className="h-3 w-3 mr-1" />
            Añadir primera participada
          </Button>
        </div>
      )}
    </div>
  );
}
