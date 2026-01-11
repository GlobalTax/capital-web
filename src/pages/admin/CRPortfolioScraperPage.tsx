import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCRPortfolioScraper } from '@/hooks/useCRPortfolioScraper';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Globe, 
  Search, 
  Play, 
  Square, 
  CheckCircle2, 
  XCircle, 
  Building2,
  Loader2,
  ArrowLeft,
  RefreshCw
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface FundWithPortfolio {
  id: string;
  name: string;
  website: string | null;
  country_base: string | null;
  fund_type: string | null;
  portfolio_count: number;
  last_scraped_at: string | null;
}

export default function CRPortfolioScraperPage() {
  const [selectedFunds, setSelectedFunds] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [showOnlyWithoutPortfolio, setShowOnlyWithoutPortfolio] = useState(true);

  const { scrapeBatch, isBatchRunning, batchProgress, cancelBatch } = useCRPortfolioScraper();

  // Fetch funds with portfolio count
  const { data: funds = [], isLoading, refetch } = useQuery({
    queryKey: ['cr-funds-for-scraping'],
    queryFn: async () => {
      // Get all funds with websites
      const { data: fundsData, error: fundsError } = await supabase
        .from('cr_funds')
        .select('id, name, website, country_base, fund_type, last_scraped_at')
        .eq('is_deleted', false)
        .not('website', 'is', null)
        .order('name');

      if (fundsError) throw fundsError;

      // Get portfolio counts for each fund
      const { data: portfolioCounts, error: portfolioError } = await supabase
        .from('cr_portfolio')
        .select('fund_id')
        .eq('is_deleted', false);

      if (portfolioError) throw portfolioError;

      // Count portfolio items per fund
      const countMap = new Map<string, number>();
      portfolioCounts?.forEach(p => {
        countMap.set(p.fund_id, (countMap.get(p.fund_id) || 0) + 1);
      });

      return (fundsData || []).map(fund => ({
        ...fund,
        portfolio_count: countMap.get(fund.id) || 0
      })) as FundWithPortfolio[];
    }
  });

  // Filter funds
  const filteredFunds = useMemo(() => {
    return funds.filter(fund => {
      const matchesSearch = !searchTerm || 
        fund.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        fund.website?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesPortfolioFilter = !showOnlyWithoutPortfolio || fund.portfolio_count === 0;
      
      return matchesSearch && matchesPortfolioFilter;
    });
  }, [funds, searchTerm, showOnlyWithoutPortfolio]);

  // Stats
  const stats = useMemo(() => ({
    total: funds.length,
    withWebsite: funds.filter(f => f.website).length,
    withoutPortfolio: funds.filter(f => f.portfolio_count === 0).length,
    selected: selectedFunds.size
  }), [funds, selectedFunds]);

  // Handlers
  const handleSelectAll = () => {
    if (selectedFunds.size === filteredFunds.length) {
      setSelectedFunds(new Set());
    } else {
      setSelectedFunds(new Set(filteredFunds.map(f => f.id)));
    }
  };

  const handleToggleFund = (fundId: string) => {
    const newSelected = new Set(selectedFunds);
    if (newSelected.has(fundId)) {
      newSelected.delete(fundId);
    } else {
      newSelected.add(fundId);
    }
    setSelectedFunds(newSelected);
  };

  const handleStartScraping = async () => {
    if (selectedFunds.size === 0) return;
    await scrapeBatch(Array.from(selectedFunds));
    setSelectedFunds(new Set());
    refetch();
  };

  // Progress percentage
  const progressPercent = batchProgress 
    ? Math.round((batchProgress.current / batchProgress.total) * 100)
    : 0;

  // Results summary
  const resultsSummary = useMemo(() => {
    if (!batchProgress?.results.length) return null;
    
    const success = batchProgress.results.filter(r => r.success && (r.extracted || 0) > 0);
    const noData = batchProgress.results.filter(r => r.success && (r.extracted || 0) === 0);
    const failed = batchProgress.results.filter(r => !r.success);
    const totalExtracted = batchProgress.results.reduce((sum, r) => sum + (r.inserted || 0), 0);

    return { success, noData, failed, totalExtracted };
  }, [batchProgress?.results]);

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/admin/cr-directory">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Extractor de Participadas</h1>
            <p className="text-sm text-muted-foreground">
              Extrae automáticamente las empresas participadas desde las webs de los fondos
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Actualizar
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Fondos totales</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{stats.withWebsite}</div>
            <p className="text-xs text-muted-foreground">Con website</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-orange-600">{stats.withoutPortfolio}</div>
            <p className="text-xs text-muted-foreground">Sin participadas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-primary">{stats.selected}</div>
            <p className="text-xs text-muted-foreground">Seleccionados</p>
          </CardContent>
        </Card>
      </div>

      {/* Progress Panel (when running) */}
      {isBatchRunning && batchProgress && (
        <Card className="border-primary">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              Extracción en progreso
            </CardTitle>
            <CardDescription>
              Procesando {batchProgress.current} de {batchProgress.total} fondos
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Progress value={progressPercent} className="h-2" />
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{progressPercent}% completado</span>
              <Button variant="destructive" size="sm" onClick={cancelBatch}>
                <Square className="h-4 w-4 mr-1" />
                Cancelar
              </Button>
            </div>

            {/* Live Results */}
            {resultsSummary && (
              <div className="grid grid-cols-4 gap-2 text-sm">
                <div className="p-2 bg-green-500/10 rounded flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span>{resultsSummary.success.length} con datos</span>
                </div>
                <div className="p-2 bg-yellow-500/10 rounded flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-yellow-600" />
                  <span>{resultsSummary.noData.length} sin datos</span>
                </div>
                <div className="p-2 bg-red-500/10 rounded flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-red-600" />
                  <span>{resultsSummary.failed.length} errores</span>
                </div>
                <div className="p-2 bg-primary/10 rounded flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-primary" />
                  <span>{resultsSummary.totalExtracted} empresas</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Controls */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar fondos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <Checkbox
            checked={showOnlyWithoutPortfolio}
            onCheckedChange={(checked) => setShowOnlyWithoutPortfolio(checked === true)}
          />
          Solo sin participadas
        </label>

        <div className="flex-1" />

        <Button
          variant="outline"
          size="sm"
          onClick={handleSelectAll}
          disabled={isBatchRunning}
        >
          {selectedFunds.size === filteredFunds.length ? 'Deseleccionar todos' : 'Seleccionar todos'}
        </Button>

        <Button
          onClick={handleStartScraping}
          disabled={selectedFunds.size === 0 || isBatchRunning}
        >
          <Play className="h-4 w-4 mr-2" />
          Iniciar extracción ({selectedFunds.size})
        </Button>
      </div>

      {/* Funds List */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Fondos disponibles</CardTitle>
          <CardDescription>
            {filteredFunds.length} fondos mostrados de {funds.length} totales
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <ScrollArea className="h-[500px]">
              <div className="space-y-1">
                {filteredFunds.map(fund => (
                  <div
                    key={fund.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedFunds.has(fund.id) 
                        ? 'bg-primary/5 border-primary/30' 
                        : 'hover:bg-muted/50 border-transparent'
                    }`}
                    onClick={() => handleToggleFund(fund.id)}
                  >
                    <Checkbox
                      checked={selectedFunds.has(fund.id)}
                      onCheckedChange={() => handleToggleFund(fund.id)}
                      onClick={(e) => e.stopPropagation()}
                    />
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium truncate">{fund.name}</span>
                        {fund.fund_type && (
                          <Badge variant="outline" className="text-[10px]">
                            {fund.fund_type}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Globe className="h-3 w-3" />
                        <span className="truncate">{fund.website}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      {fund.country_base && (
                        <span className="text-xs text-muted-foreground">{fund.country_base}</span>
                      )}
                      
                      <Badge variant={fund.portfolio_count > 0 ? 'default' : 'secondary'}>
                        {fund.portfolio_count} participadas
                      </Badge>

                      {fund.last_scraped_at && (
                        <span className="text-[10px] text-muted-foreground">
                          Último: {new Date(fund.last_scraped_at).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                ))}

                {filteredFunds.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    No se encontraron fondos con los filtros aplicados
                  </div>
                )}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
