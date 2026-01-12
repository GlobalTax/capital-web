// ============= CR FUND PORTFOLIO PANEL =============
// Panel de empresas participadas de un fund de Capital Riesgo

import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Building2, MapPin, ExternalLink, Calendar, Globe, Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { CRPortfolio, CRFund, CR_PORTFOLIO_STATUS_LABELS, CR_OWNERSHIP_TYPE_LABELS } from '@/types/capitalRiesgo';
import { useCRPortfolioScraper } from '@/hooks/useCRPortfolioScraper';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface CRFundPortfolioPanelProps {
  portfolio: CRPortfolio[];
  fundId: string;
  fundName: string;
  fundWebsite?: string | null;
  portfolioUrl?: string | null;
  lastScrapedAt?: string | null;
  onAdd: () => void;
  onEdit: (company: CRPortfolio) => void;
  onDelete: (company: CRPortfolio) => void;
  onRefresh?: () => void;
}

const statusColors: Record<string, string> = {
  active: 'bg-green-500/10 text-green-700 border-green-200',
  exited: 'bg-purple-500/10 text-purple-700 border-purple-200',
  write_off: 'bg-red-500/10 text-red-700 border-red-200',
};

export function CRFundPortfolioPanel({ 
  portfolio, 
  fundId,
  fundName,
  fundWebsite,
  portfolioUrl: initialPortfolioUrl,
  lastScrapedAt,
  onAdd, 
  onEdit, 
  onDelete,
  onRefresh 
}: CRFundPortfolioPanelProps) {
  const [portfolioUrl, setPortfolioUrl] = useState(initialPortfolioUrl || fundWebsite || '');
  const { scrapePortfolio, isScraping } = useCRPortfolioScraper();

  // Update local state when props change
  useEffect(() => {
    if (initialPortfolioUrl) {
      setPortfolioUrl(initialPortfolioUrl);
    } else if (fundWebsite && !portfolioUrl) {
      setPortfolioUrl(fundWebsite);
    }
  }, [initialPortfolioUrl, fundWebsite]);

  const handleExtract = async () => {
    if (!portfolioUrl.trim()) {
      toast.error('Introduce una URL de portfolio');
      return;
    }

    try {
      // First, save the portfolio URL to the fund
      const { error: updateError } = await supabase
        .from('cr_funds')
        .update({ 
          portfolio_url: portfolioUrl.trim(),
          updated_at: new Date().toISOString()
        })
        .eq('id', fundId);

      if (updateError) {
        console.error('Error saving portfolio URL:', updateError);
        toast.error('Error al guardar la URL');
        return;
      }

      // Then trigger the scraping
      const result = await scrapePortfolio({ 
        fundId, 
        customUrl: portfolioUrl.trim() 
      });

      if (result.success) {
        // Update last_portfolio_scraped_at
        await supabase
          .from('cr_funds')
          .update({ 
            last_portfolio_scraped_at: new Date().toISOString()
          })
          .eq('id', fundId);
        
        onRefresh?.();
      }
    } catch (error) {
      console.error('Error extracting portfolio:', error);
    }
  };

  return (
    <div className="space-y-3">
      {/* Header with URL input */}
      <div className="space-y-3">
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

        {/* Portfolio URL input */}
        <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg border">
          <Globe className="h-4 w-4 text-muted-foreground shrink-0" />
          <Input
            placeholder="https://fondo.com/portfolio"
            value={portfolioUrl}
            onChange={(e) => setPortfolioUrl(e.target.value)}
            className="h-8 text-sm flex-1"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleExtract();
              }
            }}
          />
          <Button 
            size="sm" 
            onClick={handleExtract}
            disabled={isScraping || !portfolioUrl.trim()}
            className="h-8 gap-1.5"
          >
            {isScraping ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Extrayendo...
              </>
            ) : (
              <>
                <Sparkles className="h-3.5 w-3.5" />
                Extraer con IA
              </>
            )}
          </Button>
        </div>

        {/* Last scraped info */}
        {lastScrapedAt && (
          <p className="text-xs text-muted-foreground px-1">
            Última extracción: {format(new Date(lastScrapedAt), "d MMM yyyy 'a las' HH:mm", { locale: es })}
          </p>
        )}
      </div>

      {/* Table header */}
      <div className="grid grid-cols-[1fr_80px_60px_100px_1fr_80px_60px] gap-2 px-3 py-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground border-b">
        <div>EMPRESA</div>
        <div>FONDO</div>
        <div>AÑO</div>
        <div>SECTOR</div>
        <div>DESCRIPCIÓN</div>
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
                className="grid grid-cols-[1fr_80px_60px_100px_1fr_80px_60px] gap-2 items-center px-3 py-2 hover:bg-muted/50 group transition-colors"
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

                {/* Fondo */}
                <div>
                  {company.fund_name ? (
                    <Badge variant="outline" className="text-[10px] font-normal">
                      {company.fund_name}
                    </Badge>
                  ) : (
                    <span className="text-xs text-muted-foreground">-</span>
                  )}
                </div>

                {/* Año */}
                <div>
                  {company.investment_year ? (
                    <span className="text-xs">{company.investment_year}</span>
                  ) : (
                    <span className="text-xs text-muted-foreground">-</span>
                  )}
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

                {/* Descripción */}
                <div className="min-w-0">
                  {company.description ? (
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {company.description}
                    </p>
                  ) : (
                    <span className="text-xs text-muted-foreground">-</span>
                  )}
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
          <p className="text-xs text-muted-foreground mt-1">
            Introduce una URL de portfolio arriba para extraer automáticamente
          </p>
          <Button size="sm" variant="outline" className="mt-3" onClick={onAdd}>
            <Plus className="h-3 w-3 mr-1" />
            Añadir manualmente
          </Button>
        </div>
      )}
    </div>
  );
}