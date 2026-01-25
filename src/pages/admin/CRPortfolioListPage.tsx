// ============= CR PORTFOLIO LIST PAGE =============
// Listado centralizado de empresas de Capital Riesgo

import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, 
  Search, 
  ExternalLink, 
  Download,
  Plus,
  X,
  Sparkles,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Card, CardContent } from '@/components/ui/card';
import { useCRPortfolioList, useCRPortfolioFilterOptions, CRPortfolioListFilters } from '@/hooks/useCRPortfolioList';
import { useEnrichPortfolio, useEnrichSinglePortfolio } from '@/hooks/useDataEnrichment';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const STATUS_LABELS: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  active: { label: 'Activo', variant: 'default' },
  exited: { label: 'Desinvertida', variant: 'secondary' },
  write_off: { label: 'Fallida', variant: 'destructive' }
};

const CRPortfolioListPage = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<CRPortfolioListFilters>({});
  const [searchInput, setSearchInput] = useState('');
  const [enrichingId, setEnrichingId] = useState<string | null>(null);

  const { data: portfolio, isLoading } = useCRPortfolioList(filters);
  const { data: filterOptions } = useCRPortfolioFilterOptions();
  const enrichBatch = useEnrichPortfolio();
  const enrichSingle = useEnrichSinglePortfolio();

  // Calculate enrichment stats from current data
  const enrichmentStats = useMemo(() => {
    if (!portfolio) return { enriched: 0, pending: 0, noWebsite: 0 };
    return {
      enriched: portfolio.filter(p => p.enriched_at).length,
      pending: portfolio.filter(p => !p.enriched_at && p.website).length,
      noWebsite: portfolio.filter(p => !p.website).length
    };
  }, [portfolio]);

  const handleSearch = () => {
    setFilters(prev => ({ ...prev, search: searchInput }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  const clearFilters = () => {
    setFilters({});
    setSearchInput('');
  };

  const hasActiveFilters = Object.values(filters).some(v => v);

  const handleEnrichBatch = (limit: number) => {
    enrichBatch.mutate({ limit });
  };

  const handleEnrichSingle = async (e: React.MouseEvent, companyId: string) => {
    e.stopPropagation();
    setEnrichingId(companyId);
    try {
      await enrichSingle.mutateAsync(companyId);
    } finally {
      setEnrichingId(null);
    }
  };

  const handleExport = () => {
    if (!portfolio?.length) return;
    
    const csvContent = [
      ['Empresa', 'Fondo', 'Sector', 'País', 'Año', 'Estado', 'Website', 'Enriquecido'].join(','),
      ...portfolio.map(p => [
        `"${p.company_name}"`,
        `"${p.fund_name || ''}"`,
        `"${p.sector || ''}"`,
        `"${p.country || ''}"`,
        p.investment_year || '',
        STATUS_LABELS[p.status || '']?.label || p.status || '',
        p.website || '',
        p.enriched_at ? 'Sí' : 'No'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `portfolio-cr-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Building2 className="h-6 w-6" />
            Portfolio Capital Riesgo
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {portfolio?.length || 0} empresas en cartera de fondos PE/VC
            {enrichmentStats.pending > 0 && (
              <span className="ml-2 text-amber-600">
                • {enrichmentStats.pending} pendientes de enriquecer
              </span>
            )}
          </p>
        </div>
        <div className="flex gap-2">
          {/* Enrichment Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                size="sm"
                disabled={enrichBatch.isPending}
              >
                {enrichBatch.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4 mr-2" />
                )}
                Enriquecer
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel className="text-xs text-muted-foreground">
                {enrichmentStats.pending} empresas pendientes
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleEnrichBatch(10)}>
                Enriquecer 10 empresas
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleEnrichBatch(25)}>
                Enriquecer 25 empresas
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleEnrichBatch(50)}>
                Enriquecer 50 empresas
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/admin/data-enrichment')}>
                Panel completo →
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="outline" size="sm" onClick={handleExport} disabled={!portfolio?.length}>
            <Download className="h-4 w-4 mr-2" />
            Excel
          </Button>
          <Button size="sm" onClick={() => navigate('/admin/cr-directory')}>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-wrap gap-3 items-end">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar empresa..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="pl-9"
                />
              </div>
            </div>
            
            <Select
              value={filters.fundId || 'all'}
              onValueChange={(v) => setFilters(prev => ({ ...prev, fundId: v === 'all' ? undefined : v }))}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Fondo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los fondos</SelectItem>
                {filterOptions?.funds.map((fund) => (
                  <SelectItem key={fund.id} value={fund.id}>{fund.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.status || 'all'}
              onValueChange={(v) => setFilters(prev => ({ ...prev, status: v === 'all' ? undefined : v }))}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="active">Activo</SelectItem>
                <SelectItem value="exited">Desinvertida</SelectItem>
                <SelectItem value="write_off">Fallida</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.sectorPe || 'all'}
              onValueChange={(v) => setFilters(prev => ({ ...prev, sectorPe: v === 'all' ? undefined : v, sector: undefined }))}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sector PE" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los sectores</SelectItem>
                {filterOptions?.peSectors.map((sector) => (
                  <SelectItem key={sector.id} value={sector.id}>{sector.name_es}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.country || 'all'}
              onValueChange={(v) => setFilters(prev => ({ ...prev, country: v === 'all' ? undefined : v }))}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="País" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {filterOptions?.countries.map((country) => (
                  <SelectItem key={country} value={country}>{country}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Enrichment Status Filter */}
            <Select
              value={filters.enrichmentStatus || 'all'}
              onValueChange={(v) => setFilters(prev => ({ 
                ...prev, 
                enrichmentStatus: v === 'all' ? undefined : v as 'enriched' | 'pending' | 'no_website'
              }))}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Enriquecimiento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="enriched">✓ Enriquecidas</SelectItem>
                <SelectItem value="pending">⏳ Pendientes</SelectItem>
                <SelectItem value="no_website">⊘ Sin website</SelectItem>
              </SelectContent>
            </Select>

            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="h-4 w-4 mr-1" />
                Limpiar
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Empresa</TableHead>
                  <TableHead>Fondo</TableHead>
                  <TableHead>Sector</TableHead>
                  <TableHead>País</TableHead>
                  <TableHead>Año</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="w-[50px]">Web</TableHead>
                  <TableHead className="w-[60px]">Datos</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 8 }).map((_, j) => (
                        <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : portfolio?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No se encontraron empresas
                    </TableCell>
                  </TableRow>
                ) : (
                  portfolio?.map((company) => (
                    <TableRow 
                      key={company.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => navigate(`/admin/cr-portfolio/${company.id}`)}
                    >
                      <TableCell className="font-medium">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="truncate max-w-[200px] block">
                                {company.company_name}
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{company.company_name}</p>
                              {company.description && (
                                <p className="text-xs text-muted-foreground max-w-[300px]">
                                  {company.description}
                                </p>
                              )}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </TableCell>
                      <TableCell>
                        <span 
                          className="text-primary hover:underline cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (company.fund_id) navigate(`/admin/cr-directory/${company.fund_id}`);
                          }}
                        >
                          {company.fund_name || '-'}
                        </span>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {company.sector_pe_name || company.sector || '-'}
                        {company.sector_pe && (
                          <span className="ml-1 text-xs text-green-600">✓</span>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {company.country || '-'}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {company.investment_year || '-'}
                      </TableCell>
                      <TableCell>
                        {company.status && STATUS_LABELS[company.status] ? (
                          <Badge variant={STATUS_LABELS[company.status].variant}>
                            {STATUS_LABELS[company.status].label}
                          </Badge>
                        ) : (
                          <Badge variant="outline">-</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {company.website && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(company.website!, '_blank');
                            }}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        )}
                      </TableCell>
                      {/* Enrichment Status Column */}
                      <TableCell>
                        {enrichingId === company.id ? (
                          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                        ) : company.enriched_at ? (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="text-xs">
                                  Enriquecido: {format(new Date(company.enriched_at), 'dd MMM yyyy', { locale: es })}
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        ) : company.website ? (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={(e) => handleEnrichSingle(e, company.id)}
                                >
                                  <Sparkles className="h-4 w-4 text-muted-foreground hover:text-amber-500" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="text-xs">Click para enriquecer</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        ) : (
                          <span className="text-muted-foreground text-sm">-</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CRPortfolioListPage;
