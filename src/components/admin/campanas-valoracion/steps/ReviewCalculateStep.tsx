import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calculator, Sparkles, Loader2, Building2, Mail, TrendingUp, DollarSign } from 'lucide-react';
import { useCampaignCompanies, CampaignCompany } from '@/hooks/useCampaignCompanies';
import { ValuationCampaign } from '@/hooks/useCampaigns';
import { calculateProfessionalValuation, formatCurrencyEUR } from '@/utils/professionalValuationCalculation';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Props {
  campaignId: string;
  campaign: ValuationCampaign;
}

export function ReviewCalculateStep({ campaignId, campaign }: Props) {
  const { companies, stats, bulkUpdateCompanies, refetch } = useCampaignCompanies(campaignId);
  const [calculating, setCalculating] = useState(false);
  const [enriching, setEnriching] = useState(false);
  const [enrichProgress, setEnrichProgress] = useState({ current: 0, total: 0, name: '' });

  const handleCalculateAll = async () => {
    setCalculating(true);
    try {
      const pending = companies.filter(c => c.status === 'pending');
      const updates: { id: string; data: Partial<CampaignCompany> }[] = [];

      for (const c of pending) {
        const result = calculateProfessionalValuation(
          [{ year: c.financial_year, revenue: c.revenue || 0, ebitda: c.ebitda }],
          [],
          campaign.sector,
          c.custom_multiple || campaign.custom_multiple || undefined
        );

        updates.push({
          id: c.id,
          data: {
            valuation_low: result.valuationLow,
            valuation_central: result.valuationCentral,
            valuation_high: result.valuationHigh,
            normalized_ebitda: result.normalizedEbitda,
            multiple_used: result.multipleUsed,
            status: 'calculated',
          },
        });
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
    const toEnrich = companies.filter(c => !c.ai_enriched && c.status !== 'excluded');
    if (toEnrich.length === 0) {
      toast.info('Todas las empresas ya están enriquecidas');
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

  const pendingCount = companies.filter(c => c.status === 'pending').length;
  const calculatedCount = companies.filter(c => ['calculated', 'created', 'sent'].includes(c.status)).length;
  const avgValuation = calculatedCount > 0 ? stats.totalValuation / calculatedCount : 0;

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
      <div className="flex items-center gap-3">
        {pendingCount > 0 && (
          <Button onClick={handleCalculateAll} disabled={calculating}>
            {calculating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Calculator className="h-4 w-4 mr-2" />}
            Calcular {pendingCount} pendientes
          </Button>
        )}
        <Button variant="outline" onClick={handleEnrichAll} disabled={enriching || !campaign.ai_personalize}>
          {enriching ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
          Enriquecer con IA
        </Button>
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>Empresa</TableHead>
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
              {companies.map((c, i) => (
                <TableRow key={c.id}>
                  <TableCell className="text-muted-foreground text-xs">{i + 1}</TableCell>
                  <TableCell className="font-medium">{c.client_company}</TableCell>
                  <TableCell className="text-right">{formatCurrencyEUR(c.ebitda)}</TableCell>
                  <TableCell className="text-center">{c.multiple_used?.toFixed(1) || '—'}</TableCell>
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
                      c.status === 'failed' ? 'destructive' : 'secondary'
                    } className="text-xs">
                      {c.status === 'pending' ? 'Pendiente' :
                       c.status === 'calculated' ? 'Calculada' :
                       c.status === 'created' ? 'Creada' :
                       c.status === 'sent' ? 'Enviada' :
                       c.status === 'failed' ? 'Error' : c.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
