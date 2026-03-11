import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calculator, Sparkles, Loader2, Building2, Mail, TrendingUp, DollarSign, X, RefreshCw, Search } from 'lucide-react';
import { FINANCIAL_RANGES, parseRangeFilter, matchesRange } from '@/components/admin/campanas-valoracion/shared/financialRangeFilters';
import { useCampaignCompanies, CampaignCompany } from '@/hooks/useCampaignCompanies';
import { ValuationCampaign } from '@/hooks/useCampaigns';
import { calculateProfessionalValuation, formatCurrencyEUR } from '@/utils/professionalValuationCalculation';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { fetchCampaignRanges, findMatchingRange, ValuationRange } from '@/utils/assignMultiplesFromRanges';

interface Props {
  campaignId: string;
  campaign: ValuationCampaign;
}

export function ReviewCalculateStep({ campaignId, campaign }: Props) {
  const { companies, stats, bulkUpdateCompanies, updateCompany, refetch } = useCampaignCompanies(campaignId);
  const [calculating, setCalculating] = useState(false);
  const [enriching, setEnriching] = useState(false);
  const [enrichProgress, setEnrichProgress] = useState({ current: 0, total: 0, name: '' });
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set(companies.map(c => c.id)));
  const [detailCompany, setDetailCompany] = useState<CampaignCompany | null>(null);
  const [detailMultiple, setDetailMultiple] = useState<number>(5);
  const [detailStrengths, setDetailStrengths] = useState('');
  const [detailWeaknesses, setDetailWeaknesses] = useState('');
  const [enrichingSingle, setEnrichingSingle] = useState(false);

  // Sync selectedIds when companies change
  useMemo(() => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      companies.forEach(c => {
        if (c.status !== 'excluded' && !prev.has(c.id) && prev.size === 0) {
          newSet.add(c.id);
        }
      });
      return newSet.size === 0 ? new Set(companies.filter(c => c.status !== 'excluded').map(c => c.id)) : prev;
    });
  }, [companies.length]);

  const activeCompanies = companies.filter(c => c.status !== 'excluded');

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => setSelectedIds(new Set(activeCompanies.map(c => c.id)));
  const deselectAll = () => setSelectedIds(new Set());
  const isRevenue = campaign.valuation_type === 'revenue_multiple';
  const baseValueLabel = isRevenue ? 'Facturación' : 'EBITDA';

  const excludeWithoutBaseValue = () => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      companies.filter(c => isRevenue ? !c.revenue : !c.ebitda).forEach(c => next.delete(c.id));
      return next;
    });
  };
  const excludeWithoutEmail = () => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      companies.filter(c => !c.client_email).forEach(c => next.delete(c.id));
      return next;
    });
  };

  const handleCalculateAll = async () => {
    setCalculating(true);
    try {
      const pending = companies.filter(c => c.status === 'pending' && selectedIds.has(c.id));
      const updates: { id: string; data: Partial<CampaignCompany> }[] = [];

      // Fetch ranges once
      const ranges = await fetchCampaignRanges(campaignId);

      for (const c of pending) {
        const financialYears = c.financial_years_data?.length
          ? c.financial_years_data
          : [{ year: c.financial_year, revenue: c.revenue || 0, ebitda: c.ebitda }];

        let updateData: Partial<CampaignCompany>;

        if (isRevenue) {
          const latestRevenue = financialYears[0]?.revenue || c.revenue || 0;
          const rangeMatch = ranges.length > 0 ? findMatchingRange(latestRevenue, ranges) : null;
          const multipleUsed = rangeMatch ? rangeMatch.multiple_mid : (c.custom_multiple || campaign.custom_multiple || 2.0);
          const effectiveLow = rangeMatch ? rangeMatch.multiple_low : (campaign.multiple_low || (multipleUsed - 1));
          const effectiveHigh = rangeMatch ? rangeMatch.multiple_high : (campaign.multiple_high || (multipleUsed + 1));
          updateData = {
            valuation_low: latestRevenue * effectiveLow,
            valuation_central: latestRevenue * multipleUsed,
            valuation_high: latestRevenue * effectiveHigh,
            normalized_ebitda: latestRevenue,
            multiple_used: multipleUsed,
            status: 'calculated',
            ...(rangeMatch ? { range_label: rangeMatch.range_label, is_auto_assigned: true } : {}),
          };
        } else {
          const baseValue = financialYears[0]?.ebitda || c.ebitda || 0;
          const rangeMatch = ranges.length > 0 ? findMatchingRange(baseValue, ranges) : null;

          if (rangeMatch) {
            updateData = {
              valuation_low: baseValue * rangeMatch.multiple_low,
              valuation_central: baseValue * rangeMatch.multiple_mid,
              valuation_high: baseValue * rangeMatch.multiple_high,
              normalized_ebitda: baseValue,
              multiple_used: rangeMatch.multiple_mid,
              status: 'calculated',
              range_label: rangeMatch.range_label,
              is_auto_assigned: true,
            };
          } else {
            const result = calculateProfessionalValuation(
              financialYears, [], campaign.sector,
              c.custom_multiple || campaign.custom_multiple || undefined,
              campaign.multiple_low || undefined,
              campaign.multiple_high || undefined
            );
            updateData = {
              valuation_low: result.valuationLow,
              valuation_central: result.valuationCentral,
              valuation_high: result.valuationHigh,
              normalized_ebitda: result.normalizedEbitda,
              multiple_used: result.multipleUsed,
              status: 'calculated',
            };
          }
        }

        updates.push({ id: c.id, data: updateData });
      }

      if (updates.length > 0) {
        await bulkUpdateCompanies(updates);
        toast.success(`${updates.length} valoraciones calculadas`);
      }
      await refetch();
    } catch (e: any) {
      toast.error('Error en cálculo: ' + e.message);
    } finally {
      setCalculating(false);
    }
  };

  const handleEnrichAll = async () => {
    const toEnrich = companies.filter(c => !c.ai_enriched && c.status !== 'excluded' && selectedIds.has(c.id));
    if (toEnrich.length === 0) {
      toast.info('Todas las empresas seleccionadas ya están enriquecidas');
      return;
    }

    setEnriching(true);
    setEnrichProgress({ current: 0, total: toEnrich.length, name: '' });

    let enriched = 0;
    for (const c of toEnrich) {
      setEnrichProgress({ current: enriched + 1, total: toEnrich.length, name: c.client_company });

      try {
        const { data: result, error } = await supabase.functions.invoke('enrich-campaign-company', {
          body: {
            companyName: c.client_company,
            sector: campaign.sector,
            revenue: c.revenue,
            ebitda: c.ebitda,
            financialYear: c.financial_year,
            valuationCentral: c.valuation_central,
            campaignStrengthsTemplate: campaign.strengths_template,
            campaignWeaknessesTemplate: campaign.weaknesses_template,
            campaignContextTemplate: campaign.valuation_context,
          },
        });

        if (error) throw error;

        await (supabase as any)
          .from('valuation_campaign_companies')
          .update({
            ai_strengths: result.strengths,
            ai_weaknesses: result.weaknesses,
            ai_context: result.context,
            ai_enriched: true,
          })
          .eq('id', c.id);

        enriched++;
      } catch (e: any) {
        console.error('Error enriching:', c.client_company, e);
        if (e.message?.includes('429') || e.message?.includes('Rate')) {
          toast.error('Límite de peticiones. Espera unos segundos...');
          await new Promise(r => setTimeout(r, 5000));
        }
      }
    }

    await refetch();
    setEnriching(false);
    toast.success(`${enriched} empresas enriquecidas`);
  };

  const handleExcludeCompany = async (id: string) => {
    await updateCompany({ id, data: { status: 'excluded' } });
    setSelectedIds(prev => { const next = new Set(prev); next.delete(id); return next; });
    setDetailCompany(null);
    toast.success('Empresa excluida del lote');
  };

  // Detail Sheet
  const openDetail = (c: CampaignCompany) => {
    setDetailCompany(c);
    setDetailMultiple(c.custom_multiple || c.multiple_used || campaign.custom_multiple || 5);
    setDetailStrengths(c.ai_strengths || campaign.strengths_template || '');
    setDetailWeaknesses(c.ai_weaknesses || campaign.weaknesses_template || '');
  };

  const detailValuation = useMemo(() => {
    if (!detailCompany) return null;
    const financialYears = detailCompany.financial_years_data?.length
      ? detailCompany.financial_years_data
      : [{ year: detailCompany.financial_year, revenue: detailCompany.revenue || 0, ebitda: detailCompany.ebitda }];
    return calculateProfessionalValuation(
      financialYears,
      [],
      campaign.sector,
      detailMultiple
    );
  }, [detailCompany, detailMultiple, campaign.sector]);

  const handleSaveDetail = async () => {
    if (!detailCompany) return;
    await updateCompany({
      id: detailCompany.id,
      data: {
        custom_multiple: detailMultiple,
        ai_strengths: detailStrengths,
        ai_weaknesses: detailWeaknesses,
        ...(detailValuation ? {
          valuation_low: detailValuation.valuationLow,
          valuation_central: detailValuation.valuationCentral,
          valuation_high: detailValuation.valuationHigh,
          multiple_used: detailValuation.multipleUsed,
          normalized_ebitda: detailValuation.normalizedEbitda,
          status: 'calculated',
        } : {}),
      },
    });
    setDetailCompany(null);
    toast.success('Cambios guardados');
  };

  const handleEnrichSingle = async () => {
    if (!detailCompany) return;
    setEnrichingSingle(true);
    try {
      const { data: result, error } = await supabase.functions.invoke('enrich-campaign-company', {
        body: {
          companyName: detailCompany.client_company,
          sector: campaign.sector,
          revenue: detailCompany.revenue,
          ebitda: detailCompany.ebitda,
          financialYear: detailCompany.financial_year,
          valuationCentral: detailCompany.valuation_central,
          campaignStrengthsTemplate: campaign.strengths_template,
          campaignWeaknessesTemplate: campaign.weaknesses_template,
          campaignContextTemplate: campaign.valuation_context,
        },
      });
      if (error) throw error;
      setDetailStrengths(result.strengths || '');
      setDetailWeaknesses(result.weaknesses || '');
      toast.success('Empresa enriquecida con IA');
    } catch (e: any) {
      toast.error('Error al enriquecer: ' + (e.message || 'Error desconocido'));
    } finally {
      setEnrichingSingle(false);
    }
  };

  const [recalculating, setRecalculating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRevenue, setFilterRevenue] = useState<string | null>(null);
  const [filterEbitda, setFilterEbitda] = useState<string | null>(null);

  const filteredCompanies = useMemo(() => {
    let result = companies;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(c => c.client_company?.toLowerCase().includes(q));
    }
    const revenueRange = parseRangeFilter(filterRevenue);
    if (revenueRange) result = result.filter(c => matchesRange(c.revenue, revenueRange));
    const ebitdaRange = parseRangeFilter(filterEbitda);
    if (ebitdaRange) result = result.filter(c => matchesRange(c.ebitda, ebitdaRange));
    return result;
  }, [companies, searchQuery, filterRevenue, filterEbitda]);
  const hasFinancialFilters = !!filterRevenue || !!filterEbitda;

  const handleRecalculateAll = async () => {
    setRecalculating(true);
    try {
      const toRecalc = companies.filter(c => c.status !== 'excluded' && selectedIds.has(c.id) && (isRevenue ? c.revenue : c.ebitda));
      const updates: { id: string; data: Partial<CampaignCompany> }[] = [];

      // Fetch ranges once
      const ranges = await fetchCampaignRanges(campaignId);

      for (const c of toRecalc) {
        const financialYears = c.financial_years_data?.length
          ? c.financial_years_data
          : [{ year: c.financial_year, revenue: c.revenue || 0, ebitda: c.ebitda }];

        let updateData: Partial<CampaignCompany>;

        if (isRevenue) {
          const latestRevenue = financialYears[0]?.revenue || c.revenue || 0;
          const rangeMatch = ranges.length > 0 ? findMatchingRange(latestRevenue, ranges) : null;
          const multipleUsed = rangeMatch ? rangeMatch.multiple_mid : (c.custom_multiple || campaign.custom_multiple || 2.0);
          const effectiveLow = rangeMatch ? rangeMatch.multiple_low : (campaign.multiple_low || (multipleUsed - 1));
          const effectiveHigh = rangeMatch ? rangeMatch.multiple_high : (campaign.multiple_high || (multipleUsed + 1));
          updateData = {
            valuation_low: latestRevenue * effectiveLow,
            valuation_central: latestRevenue * multipleUsed,
            valuation_high: latestRevenue * effectiveHigh,
            normalized_ebitda: latestRevenue,
            multiple_used: multipleUsed,
            status: c.status === 'pending' ? 'calculated' : c.status,
            ...(rangeMatch ? { range_label: rangeMatch.range_label, is_auto_assigned: true } : {}),
          };
        } else {
          const baseValue = financialYears[0]?.ebitda || c.ebitda || 0;
          const rangeMatch = ranges.length > 0 ? findMatchingRange(baseValue, ranges) : null;

          if (rangeMatch) {
            updateData = {
              valuation_low: baseValue * rangeMatch.multiple_low,
              valuation_central: baseValue * rangeMatch.multiple_mid,
              valuation_high: baseValue * rangeMatch.multiple_high,
              normalized_ebitda: baseValue,
              multiple_used: rangeMatch.multiple_mid,
              status: c.status === 'pending' ? 'calculated' : c.status,
              range_label: rangeMatch.range_label,
              is_auto_assigned: true,
            };
          } else {
            const result = calculateProfessionalValuation(
              financialYears, [], campaign.sector,
              c.custom_multiple || campaign.custom_multiple || undefined,
              campaign.multiple_low || undefined,
              campaign.multiple_high || undefined
            );
            updateData = {
              valuation_low: result.valuationLow,
              valuation_central: result.valuationCentral,
              valuation_high: result.valuationHigh,
              normalized_ebitda: result.normalizedEbitda,
              multiple_used: result.multipleUsed,
              status: c.status === 'pending' ? 'calculated' : c.status,
            };
          }
        }

        updates.push({ id: c.id, data: updateData });
      }

      if (updates.length > 0) {
        await bulkUpdateCompanies(updates);
        toast.success(`${updates.length} valoraciones recalculadas`);
      }
      await refetch();
    } catch (e: any) {
      toast.error('Error al recalcular: ' + e.message);
    } finally {
      setRecalculating(false);
    }
  };

  const pendingCount = companies.filter(c => c.status === 'pending' && selectedIds.has(c.id)).length;
  const calculatedCount = companies.filter(c => ['calculated', 'created', 'sent'].includes(c.status)).length;
  const avgValuation = calculatedCount > 0 ? stats.totalValuation / calculatedCount : 0;
  const allSelected = activeCompanies.length > 0 && activeCompanies.every(c => selectedIds.has(c.id));

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground"><Building2 className="h-4 w-4" />Empresas</div>
            <p className="text-2xl font-bold mt-1">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground"><Mail className="h-4 w-4" />Con email</div>
            <p className="text-2xl font-bold mt-1">{stats.withEmail}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground"><TrendingUp className="h-4 w-4" />Valor total</div>
            <p className="text-2xl font-bold mt-1">{formatCurrencyEUR(stats.totalValuation)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground"><DollarSign className="h-4 w-4" />Promedio</div>
            <p className="text-2xl font-bold mt-1">{formatCurrencyEUR(avgValuation)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-2">
        {pendingCount > 0 && (
          <Button onClick={handleCalculateAll} disabled={calculating}>
            {calculating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Calculator className="h-4 w-4 mr-2" />}
            Calcular {pendingCount} pendientes
          </Button>
        )}
        <Button variant="outline" onClick={handleRecalculateAll} disabled={recalculating}>
          {recalculating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
          Recalcular todas ({selectedIds.size})
        </Button>
        <Button variant="outline" onClick={handleEnrichAll} disabled={enriching || !campaign.ai_personalize}>
          {enriching ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
          Enriquecer con IA ({selectedIds.size})
        </Button>
        <div className="ml-auto flex gap-1">
          <Button variant="ghost" size="sm" onClick={selectAll}>Seleccionar todo</Button>
          <Button variant="ghost" size="sm" onClick={deselectAll}>Deseleccionar</Button>
          <Button variant="ghost" size="sm" onClick={excludeWithoutBaseValue}>Excluir sin {baseValueLabel}</Button>
          <Button variant="ghost" size="sm" onClick={excludeWithoutEmail}>Excluir sin email</Button>
        </div>
      </div>

      {enriching && (
        <Card>
          <CardContent className="pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span>Enriqueciendo: {enrichProgress.name}</span>
              <span>{enrichProgress.current}/{enrichProgress.total}</span>
            </div>
            <Progress value={(enrichProgress.current / enrichProgress.total) * 100} />
          </CardContent>
        </Card>
      )}

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {/* Search + financial filters */}
          <div className="p-4 pb-0 flex flex-col sm:flex-row items-start sm:items-center gap-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={`Buscar entre ${companies.length} empresas...`}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-10 pr-10"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                  onClick={() => setSearchQuery('')}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
            <Select value={filterRevenue || 'all'} onValueChange={v => setFilterRevenue(v === 'all' ? null : v)}>
              <SelectTrigger className="h-8 w-[150px] text-xs">
                <SelectValue placeholder="Facturación" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toda facturación</SelectItem>
                {FINANCIAL_RANGES.map(r => (
                  <SelectItem key={r.value} value={r.value} className="text-xs">{r.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterEbitda || 'all'} onValueChange={v => setFilterEbitda(v === 'all' ? null : v)}>
              <SelectTrigger className="h-8 w-[140px] text-xs">
                <SelectValue placeholder="EBITDA" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todo EBITDA</SelectItem>
                {FINANCIAL_RANGES.map(r => (
                  <SelectItem key={r.value} value={r.value} className="text-xs">{r.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {(searchQuery || hasFinancialFilters) && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {filteredCompanies.length} {filteredCompanies.length === 1 ? 'resultado' : 'resultados'}
                </span>
                {hasFinancialFilters && (
                  <Button variant="ghost" size="sm" className="h-7 text-xs px-2" onClick={() => { setFilterRevenue(null); setFilterEbitda(null); }}>
                    <X className="h-3 w-3 mr-1" />Limpiar filtros
                  </Button>
                )}
              </div>
            )}
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">
                  <Checkbox
                    checked={allSelected}
                    onCheckedChange={() => allSelected ? deselectAll() : selectAll()}
                  />
                </TableHead>
                <TableHead>#</TableHead>
                <TableHead>Empresa</TableHead>
                <TableHead className="text-right">Facturación</TableHead>
                <TableHead className="text-right">EBITDA</TableHead>
                <TableHead className="text-center">Múltiplo</TableHead>
                <TableHead className="text-right">Val. Baja</TableHead>
                <TableHead className="text-right">Val. Central</TableHead>
                <TableHead className="text-right">Val. Alta</TableHead>
                <TableHead className="text-center">Email</TableHead>
                <TableHead className="text-center">IA</TableHead>
                <TableHead className="text-center">Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCompanies.length === 0 && searchQuery ? (
                <TableRow>
                  <TableCell colSpan={12} className="text-center py-8 text-muted-foreground">
                    No se encontraron empresas para "{searchQuery}"
                  </TableCell>
                </TableRow>
              ) : filteredCompanies.map((c, i) => (
                <TableRow
                  key={c.id}
                  className={`cursor-pointer hover:bg-muted/50 ${c.status === 'excluded' ? 'opacity-40' : ''}`}
                  onClick={() => openDetail(c)}
                >
                  <TableCell onClick={e => e.stopPropagation()}>
                    <Checkbox
                      checked={selectedIds.has(c.id)}
                      onCheckedChange={() => toggleSelect(c.id)}
                    />
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs">{i + 1}</TableCell>
                  <TableCell className="font-medium">{c.client_company}</TableCell>
                  <TableCell className="text-right">
                    {c.revenue ? (
                      <span className={isRevenue ? 'font-semibold' : ''}>{formatCurrencyEUR(c.revenue)}</span>
                    ) : <span className="text-muted-foreground">---</span>}
                  </TableCell>
                  <TableCell className="text-right">
                    {c.ebitda ? (
                      <span className={!isRevenue ? 'font-semibold' : ''}>{formatCurrencyEUR(c.ebitda)}</span>
                    ) : <span className="text-muted-foreground">---</span>}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <span>{c.multiple_used?.toFixed(1) || '—'}</span>
                      {c.is_auto_assigned && c.range_label && (
                        <Badge variant="secondary" className="text-[10px]">{c.range_label}</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">{c.valuation_low ? formatCurrencyEUR(c.valuation_low) : '—'}</TableCell>
                  <TableCell className="text-right font-medium">{c.valuation_central ? formatCurrencyEUR(c.valuation_central) : '—'}</TableCell>
                  <TableCell className="text-right">{c.valuation_high ? formatCurrencyEUR(c.valuation_high) : '—'}</TableCell>
                  <TableCell className="text-center">{c.client_email ? '✓' : '—'}</TableCell>
                  <TableCell className="text-center">
                    <Sparkles className={`h-4 w-4 mx-auto ${c.ai_enriched ? 'text-green-500' : 'text-muted-foreground/30'}`} />
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant={
                      c.status === 'calculated' ? 'default' :
                      c.status === 'sent' ? 'outline' :
                      c.status === 'failed' ? 'destructive' :
                      c.status === 'excluded' ? 'secondary' : 'secondary'
                    } className="text-xs">
                      {c.status === 'pending' ? 'Pendiente' :
                       c.status === 'calculated' ? 'Calculada' :
                       c.status === 'created' ? 'Creada' :
                       c.status === 'sent' ? 'Enviada' :
                       c.status === 'failed' ? 'Error' :
                       c.status === 'excluded' ? 'Excluida' : c.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Detail Sheet */}
      <Sheet open={!!detailCompany} onOpenChange={(open) => !open && setDetailCompany(null)}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          {detailCompany && (
            <>
              <SheetHeader>
                <SheetTitle>{detailCompany.client_company}</SheetTitle>
              </SheetHeader>
              <div className="space-y-5 mt-4">
                {/* Company info */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><span className="text-muted-foreground">Contacto:</span> {detailCompany.client_name || '—'}</div>
                  <div><span className="text-muted-foreground">Email:</span> {detailCompany.client_email || '—'}</div>
                  <div><span className="text-muted-foreground">CIF:</span> {detailCompany.client_cif || '—'}</div>
                  <div><span className="text-muted-foreground">Facturación:</span> {detailCompany.revenue ? formatCurrencyEUR(detailCompany.revenue) : '—'}</div>
                  <div><span className="text-muted-foreground">EBITDA:</span> {formatCurrencyEUR(detailCompany.ebitda)}</div>
                  <div><span className="text-muted-foreground">Año:</span> {detailCompany.financial_year}</div>
                </div>

                {/* Multiple override */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Múltiplo {baseValueLabel}</Label>
                  <div className="flex items-center gap-3">
                    <Slider
                      value={[detailMultiple]}
                      onValueChange={([v]) => setDetailMultiple(v)}
                      min={1}
                      max={20}
                      step={0.1}
                      className="flex-1"
                    />
                    <Input
                      type="number"
                      step="0.1"
                      value={detailMultiple}
                      onChange={e => setDetailMultiple(parseFloat(e.target.value) || 1)}
                      className="w-20"
                    />
                  </div>
                  {detailValuation && (
                    <div className="grid grid-cols-3 gap-2 text-center text-sm mt-2">
                      <div className="bg-muted rounded p-2">
                        <p className="text-xs text-muted-foreground">Baja</p>
                        <p className="font-medium">{formatCurrencyEUR(detailValuation.valuationLow)}</p>
                      </div>
                      <div className="bg-primary/10 rounded p-2">
                        <p className="text-xs text-muted-foreground">Central</p>
                        <p className="font-bold">{formatCurrencyEUR(detailValuation.valuationCentral)}</p>
                      </div>
                      <div className="bg-muted rounded p-2">
                        <p className="text-xs text-muted-foreground">Alta</p>
                        <p className="font-medium">{formatCurrencyEUR(detailValuation.valuationHigh)}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Strengths / Weaknesses */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Fortalezas</Label>
                    {detailCompany.ai_enriched && <Badge variant="outline" className="text-xs">IA</Badge>}
                  </div>
                  <Textarea
                    rows={4}
                    value={detailStrengths}
                    onChange={e => setDetailStrengths(e.target.value)}
                    readOnly={!detailCompany.ai_enriched && !detailStrengths}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Debilidades</Label>
                  <Textarea
                    rows={4}
                    value={detailWeaknesses}
                    onChange={e => setDetailWeaknesses(e.target.value)}
                    readOnly={!detailCompany.ai_enriched && !detailWeaknesses}
                  />
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2">
                  <Button variant="outline" onClick={handleEnrichSingle} disabled={enrichingSingle}>
                    {enrichingSingle ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
                    Enriquecer esta empresa con IA
                  </Button>
                  <Button onClick={handleSaveDetail}>Guardar cambios</Button>
                  <Button variant="destructive" size="sm" onClick={() => handleExcludeCompany(detailCompany.id)}>
                    <X className="h-4 w-4 mr-1" />Excluir del lote
                  </Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
