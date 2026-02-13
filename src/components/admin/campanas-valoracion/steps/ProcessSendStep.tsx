import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileText, Send, Loader2, Pause, CheckCircle2, XCircle, Minus } from 'lucide-react';
import { useCampaignCompanies, CampaignCompany } from '@/hooks/useCampaignCompanies';
import { ValuationCampaign, useCampaigns } from '@/hooks/useCampaigns';
import { supabase } from '@/integrations/supabase/client';
import { mapProfessionalValuationToDb, ProfessionalValuationData } from '@/types/professionalValuation';
import { formatCurrencyEUR } from '@/utils/professionalValuationCalculation';
import { toast } from 'sonner';

interface Props {
  campaignId: string;
  campaign: ValuationCampaign;
}

export function ProcessSendStep({ campaignId, campaign }: Props) {
  const { companies, refetch } = useCampaignCompanies(campaignId);
  const { updateCampaign } = useCampaigns();
  const [creatingProgress, setCreatingProgress] = useState({ active: false, current: 0, total: 0, name: '' });
  const [sendingProgress, setSendingProgress] = useState({ active: false, current: 0, total: 0, name: '' });
  const pauseRef = useRef(false);

  const calculatedCompanies = companies.filter(c => c.status === 'calculated');
  const createdCompanies = companies.filter(c => c.status === 'created' && c.client_email);
  const sentCompanies = companies.filter(c => c.status === 'sent');
  const failedCompanies = companies.filter(c => c.status === 'failed');

  const handleCreateValuations = async () => {
    if (calculatedCompanies.length === 0) return;
    setCreatingProgress({ active: true, current: 0, total: calculatedCompanies.length, name: '' });
    pauseRef.current = false;

    let created = 0;
    for (const c of calculatedCompanies) {
      if (pauseRef.current) break;
      setCreatingProgress(p => ({ ...p, current: created + 1, name: c.client_company }));

      try {
        const valData: Partial<ProfessionalValuationData> = {
          clientName: c.client_name || '',
          clientCompany: c.client_company,
          clientEmail: c.client_email || undefined,
          clientPhone: c.client_phone || undefined,
          clientCif: c.client_cif || undefined,
          sector: campaign.sector,
          financialYears: [{ year: c.financial_year, revenue: c.revenue || 0, ebitda: c.ebitda }],
          normalizationAdjustments: [],
          normalizedEbitda: c.normalized_ebitda || c.ebitda,
          ebitdaMultipleUsed: c.multiple_used || undefined,
          valuationLow: c.valuation_low || undefined,
          valuationCentral: c.valuation_central || undefined,
          valuationHigh: c.valuation_high || undefined,
          strengths: c.ai_strengths || campaign.strengths_template || undefined,
          weaknesses: c.ai_weaknesses || campaign.weaknesses_template || undefined,
          valuationContext: c.ai_context || campaign.valuation_context || undefined,
          comparablesFormattedText: campaign.comparables_text || undefined,
          includeComparables: campaign.include_comparables,
          advisorName: campaign.advisor_name || undefined,
          advisorEmail: campaign.advisor_email || undefined,
          advisorPhone: campaign.advisor_phone || undefined,
          advisorRole: campaign.advisor_role || undefined,
          useCustomAdvisor: campaign.use_custom_advisor,
          leadSource: campaign.lead_source,
          serviceType: campaign.service_type as any,
          status: 'draft',
          syncToContacts: true,
        };

        const dbData = mapProfessionalValuationToDb(valData);
        const { data: { user } } = await supabase.auth.getUser();
        if (user) dbData.created_by = user.id;

        const { data: pvResult, error: pvError } = await supabase
          .from('professional_valuations')
          .insert([dbData] as any)
          .select('id')
          .single();

        if (pvError) throw pvError;

        await (supabase as any)
          .from('valuation_campaign_companies')
          .update({ professional_valuation_id: pvResult.id, status: 'created' })
          .eq('id', c.id);

        created++;
      } catch (e: any) {
        console.error('Error creating:', c.client_company, e);
        await (supabase as any)
          .from('valuation_campaign_companies')
          .update({ status: 'failed', error_message: e.message })
          .eq('id', c.id);
      }
    }

    await updateCampaign({ id: campaignId, data: { total_created: created } });
    await refetch();
    setCreatingProgress(p => ({ ...p, active: false }));
    toast.success(`${created} valoraciones creadas`);
  };

  const handleSendEmails = async () => {
    const toSend = companies.filter(c => c.status === 'created' && c.client_email && c.professional_valuation_id);
    if (toSend.length === 0) return;

    setSendingProgress({ active: true, current: 0, total: toSend.length, name: '' });
    pauseRef.current = false;

    let sent = 0;
    for (const c of toSend) {
      if (pauseRef.current) break;
      setSendingProgress(p => ({ ...p, current: sent + 1, name: c.client_company }));

      try {
        // Call existing send-professional-valuation-email edge function
        const { error } = await supabase.functions.invoke('send-professional-valuation-email', {
          body: { valuationId: c.professional_valuation_id },
        });

        if (error) throw error;

        await (supabase as any)
          .from('valuation_campaign_companies')
          .update({ status: 'sent' })
          .eq('id', c.id);

        sent++;
        // Rate limit delay
        await new Promise(r => setTimeout(r, 1500));
      } catch (e: any) {
        console.error('Error sending:', c.client_company, e);
        await (supabase as any)
          .from('valuation_campaign_companies')
          .update({ status: 'failed', error_message: e.message })
          .eq('id', c.id);
      }
    }

    await updateCampaign({ id: campaignId, data: { total_sent: sent, status: pauseRef.current ? 'paused' : 'completed' } });
    await refetch();
    setSendingProgress(p => ({ ...p, active: false }));
    toast.success(`${sent} emails enviados`);
  };

  const handlePause = () => {
    pauseRef.current = true;
  };

  const isProcessing = creatingProgress.active || sendingProgress.active;

  return (
    <div className="space-y-6">
      {/* Phase 1: Create */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Fase 1: Crear Valoraciones ({calculatedCompanies.length} pendientes)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={handleCreateValuations} disabled={isProcessing || calculatedCompanies.length === 0}>
            {creatingProgress.active ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <FileText className="h-4 w-4 mr-2" />}
            Crear {calculatedCompanies.length} valoraciones
          </Button>
          {creatingProgress.active && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Creando: {creatingProgress.name}</span>
                <span>{creatingProgress.current}/{creatingProgress.total}</span>
              </div>
              <Progress value={(creatingProgress.current / creatingProgress.total) * 100} />
              <Button variant="destructive" size="sm" onClick={handlePause}><Pause className="h-4 w-4 mr-1" />Pausar</Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Phase 2: Send */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Send className="h-4 w-4" />
            Fase 2: Enviar Emails ({createdCompanies.length} listos)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={handleSendEmails} disabled={isProcessing || createdCompanies.length === 0}>
            {sendingProgress.active ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
            Enviar {createdCompanies.length} emails
          </Button>
          {sendingProgress.active && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Enviando: {sendingProgress.name}</span>
                <span>{sendingProgress.current}/{sendingProgress.total}</span>
              </div>
              <Progress value={(sendingProgress.current / sendingProgress.total) * 100} />
              <Button variant="destructive" size="sm" onClick={handlePause}><Pause className="h-4 w-4 mr-1" />Pausar</Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results Table */}
      <Card>
        <CardHeader><CardTitle className="text-base">Resultados</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Empresa</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="text-right">Valoración</TableHead>
                <TableHead className="text-center">Creada</TableHead>
                <TableHead className="text-center">Enviada</TableHead>
                <TableHead className="text-center">Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {companies.map(c => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.client_company}</TableCell>
                  <TableCell className="text-sm">{c.client_email || '—'}</TableCell>
                  <TableCell className="text-right">{c.valuation_central ? formatCurrencyEUR(c.valuation_central) : '—'}</TableCell>
                  <TableCell className="text-center">
                    {c.professional_valuation_id ? <CheckCircle2 className="h-4 w-4 text-green-500 mx-auto" /> : <Minus className="h-4 w-4 text-muted-foreground mx-auto" />}
                  </TableCell>
                  <TableCell className="text-center">
                    {c.status === 'sent' ? <CheckCircle2 className="h-4 w-4 text-green-500 mx-auto" /> :
                     c.status === 'failed' ? <XCircle className="h-4 w-4 text-red-500 mx-auto" /> :
                     <Minus className="h-4 w-4 text-muted-foreground mx-auto" />}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant={
                      c.status === 'sent' ? 'outline' :
                      c.status === 'failed' ? 'destructive' :
                      c.status === 'created' ? 'default' : 'secondary'
                    } className="text-xs">
                      {c.status === 'sent' ? 'Enviado' : c.status === 'failed' ? 'Error' : c.status === 'created' ? 'Creada' : c.status}
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
