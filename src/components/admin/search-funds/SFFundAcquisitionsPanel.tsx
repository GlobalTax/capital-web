import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Pencil, Trash2, Building2, MapPin, ExternalLink, Calendar, Sparkles, Loader2, Clock, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { SFAcquisition } from '@/types/searchFunds';
import { useSFPortfolioScraper } from '@/hooks/useSFPortfolioScraper';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface SFFundAcquisitionsPanelProps {
  acquisitions: SFAcquisition[];
  fundId: string;
  fundName: string;
  portfolioUrl?: string | null;
  lastScrapedAt?: string | null;
  onAdd: () => void;
  onEdit: (acquisition: SFAcquisition) => void;
  onDelete: (acquisition: SFAcquisition) => void;
  onRefresh?: () => void;
}

const statusLabels: Record<string, { label: string; color: string }> = {
  owned: { label: 'En cartera', color: 'bg-green-500/10 text-green-700 border-green-200' },
  exited: { label: 'Exit', color: 'bg-purple-500/10 text-purple-700 border-purple-200' },
  unknown: { label: 'Desconocido', color: 'bg-muted text-muted-foreground' },
};

const dealTypeLabels: Record<string, string> = {
  majority: 'Mayoría',
  minority: 'Minoría',
  merger: 'Fusión',
  asset: 'Activos',
  unknown: '-',
};

export function SFFundAcquisitionsPanel({ 
  acquisitions, 
  fundId,
  fundName,
  portfolioUrl,
  lastScrapedAt,
  onAdd, 
  onEdit, 
  onDelete,
  onRefresh
}: SFFundAcquisitionsPanelProps) {
  const navigate = useNavigate();
  const [localUrl, setLocalUrl] = useState(portfolioUrl || '');
  const { scrapePortfolio, isScraping } = useSFPortfolioScraper();

  const handleExtract = async () => {
    if (!localUrl || !fundId) return;
    
    await scrapePortfolio({
      fundId,
      customUrl: localUrl
    });
    
    onRefresh?.();
  };

  const handleRowClick = (acquisition: SFAcquisition) => {
    navigate(`/admin/sf-acquisitions/${acquisition.id}`);
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-medium">Adquisiciones</h3>
          <Badge variant="secondary" className="text-xs">
            {acquisitions.length}
          </Badge>
        </div>
        <Button size="sm" variant="outline" className="h-7 text-xs" onClick={onAdd}>
          <Plus className="h-3 w-3 mr-1" />
          Añadir
        </Button>
      </div>

      {/* AI Extraction Section */}
      <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg border">
        <Input
          placeholder="URL de portfolio del search fund..."
          value={localUrl}
          onChange={(e) => setLocalUrl(e.target.value)}
          className="h-8 text-xs flex-1"
        />
        <Button
          size="sm"
          variant="default"
          className="h-8 text-xs gap-1.5"
          onClick={handleExtract}
          disabled={isScraping || !localUrl}
        >
          {isScraping ? (
            <>
              <Loader2 className="h-3 w-3 animate-spin" />
              Extrayendo...
            </>
          ) : (
            <>
              <Sparkles className="h-3 w-3" />
              Extraer con IA
            </>
          )}
        </Button>
      </div>

      {/* Last extraction timestamp */}
      {lastScrapedAt && (
        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>
            Última extracción: {formatDistanceToNow(new Date(lastScrapedAt), { addSuffix: true, locale: es })}
          </span>
        </div>
      )}

      {/* Acquisitions Table */}
      {acquisitions.length > 0 ? (
        <div className="overflow-x-auto rounded-md border">
          <Table density="compact">
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[200px]">EMPRESA</TableHead>
                <TableHead className="min-w-[120px]">FONDO</TableHead>
                <TableHead className="min-w-[100px]">SECTOR</TableHead>
                <TableHead className="w-[60px]">AÑO</TableHead>
                <TableHead className="w-[80px]">TIPO</TableHead>
                <TableHead className="w-[90px]">ESTADO</TableHead>
                <TableHead className="min-w-[180px]">DESCRIPCIÓN</TableHead>
                <TableHead className="w-[60px] text-right">ACCIONES</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {acquisitions.map((acq) => {
                const statusConfig = statusLabels[acq.status] || statusLabels.unknown;
                
                return (
                  <TableRow
                    key={acq.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleRowClick(acq)}
                  >
                    {/* Empresa */}
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1">
                            <span className="text-sm font-medium truncate max-w-[150px]">{acq.company_name}</span>
                            {acq.website && (
                              <a
                                href={acq.website.startsWith('http') ? acq.website : `https://${acq.website}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:text-primary/80"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            )}
                          </div>
                          {acq.country && (
                            <div className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                              <MapPin className="h-2.5 w-2.5" />
                              <span>{acq.country}</span>
                              {acq.region && <span>• {acq.region}</span>}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>

                    {/* Fondo */}
                    <TableCell>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="text-xs text-muted-foreground truncate block max-w-[100px]">
                              {acq.fund_name || '-'}
                            </span>
                          </TooltipTrigger>
                          {acq.fund_name && (
                            <TooltipContent>
                              <p>{acq.fund_name}</p>
                            </TooltipContent>
                          )}
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>

                    {/* Sector */}
                    <TableCell>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="text-xs text-muted-foreground truncate block max-w-[80px]">
                              {acq.sector || '-'}
                            </span>
                          </TooltipTrigger>
                          {acq.sector && (
                            <TooltipContent>
                              <p>{acq.sector}</p>
                            </TooltipContent>
                          )}
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>

                    {/* Año */}
                    <TableCell>
                      {acq.deal_year ? (
                        <div className="flex items-center gap-1 text-xs">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          <span>{acq.deal_year}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">-</span>
                      )}
                    </TableCell>

                    {/* Tipo */}
                    <TableCell>
                      <span className="text-xs text-muted-foreground">
                        {dealTypeLabels[acq.deal_type] || acq.deal_type}
                      </span>
                    </TableCell>

                    {/* Estado */}
                    <TableCell>
                      <Badge className={`${statusConfig.color} text-[10px] font-normal border`}>
                        {statusConfig.label}
                        {acq.status === 'exited' && acq.exit_year && (
                          <span className="ml-1">{acq.exit_year}</span>
                        )}
                      </Badge>
                    </TableCell>

                    {/* Descripción */}
                    <TableCell>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="text-xs text-muted-foreground truncate block max-w-[160px]">
                              {acq.description || '-'}
                            </span>
                          </TooltipTrigger>
                          {acq.description && (
                            <TooltipContent className="max-w-xs">
                              <p className="text-xs">{acq.description}</p>
                            </TooltipContent>
                          )}
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>

                    {/* Acciones */}
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={(e) => {
                            e.stopPropagation();
                            onEdit(acq);
                          }}
                        >
                          <Pencil className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-destructive hover:text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(acq);
                          }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="py-8 text-center">
          <p className="text-sm text-muted-foreground">No hay adquisiciones registradas</p>
          <p className="text-xs text-muted-foreground mt-1">
            Añade una URL de portfolio arriba para extraer automáticamente con IA
          </p>
          <Button size="sm" variant="outline" className="mt-3" onClick={onAdd}>
            <Plus className="h-3 w-3 mr-1" />
            Añadir primera adquisición
          </Button>
        </div>
      )}
    </div>
  );
}
