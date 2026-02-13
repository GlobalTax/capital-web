import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Send, Loader2, Pause, CheckCircle2, XCircle, Minus } from 'lucide-react';
import { useCampaignCompanies } from '@/hooks/useCampaignCompanies';
import { ValuationCampaign, useCampaigns } from '@/hooks/useCampaigns';
import { supabase } from '@/integrations/supabase/client';
import { formatCurrencyEUR } from '@/utils/professionalValuationCalculation';
import { toast } from 'sonner';

interface Props {
  campaignId: string;
  campaign: ValuationCampaign;
}

export function ProcessSendStep({ campaignId, campaign }: Props) {
  const { companies, refetch } = useCampaignCompanies(campaignId);
  const { updateCampaign } = useCampaigns();
  const [sendingProgress, setSendingProgress] = useState({ active: false, current: 0, total: 0, name: '' });
  const pauseRef = useRef(false);

  const readyToSend = companies.filter(c => c.status === 'calculated' && c.client_email);
  const sentCompanies = companies.filter(c => c.status === 'sent');
  const failedCompanies = companies.filter(c => c.status === 'failed');

  const handleSendEmails = async () => {
    if (readyToSend.length === 0) return;

    setSendingProgress({ active: true, current: 0, total: readyToSend.length, name: '' });
    pauseRef.current = false;

    let sent = 0;
    for (const c of readyToSend) {
      if (pauseRef.current) break;
      setSendingProgress(p => ({ ...p, current: sent + 1, name: c.client_company }));

      try {
        const { error } = await supabase.functions.invoke('send-professional-valuation-email', {
          body: {
            recipientEmail: c.client_email,
            recipientName: c.client_name,
            valuationData: {
              clientCompany: c.client_company,
              clientName: c.client_name || '',
              clientCif: c.client_cif || undefined,
              valuationCentral: c.valuation_central,
              valuationLow: c.valuation_low,
              valuationHigh: c.valuation_high,
              sector: campaign.sector,
              normalizedEbitda: c.normalized_ebitda || c.ebitda,
              ebitdaMultipleUsed: c.multiple_used,
              financialYears: c.financial_years_data?.length
                ? c.financial_years_data
                : [{ year: c.financial_year, revenue: c.revenue || 0, ebitda: c.ebitda }],
              strengths: c.ai_strengths || campaign.strengths_template || undefined,
              weaknesses: c.ai_weaknesses || campaign.weaknesses_template || undefined,
              valuationContext: c.ai_context || campaign.valuation_context || undefined,
              comparablesFormattedText: campaign.comparables_text || undefined,
              includeComparables: campaign.include_comparables,
            },
            advisorName: campaign.advisor_name || undefined,
            advisorEmail: campaign.advisor_email || undefined,
            advisorPhone: campaign.advisor_phone || undefined,
            advisorRole: campaign.advisor_role || undefined,
            useCustomAdvisor: campaign.use_custom_advisor,
          },
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

  return (
    <div className="space-y-6">
      {/* Send emails directly */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Send className="h-4 w-4" />
            Enviar Valoraciones ({readyToSend.length} listas para enviar)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Se enviará el email con la valoración directamente a cada empresa. Los datos se toman de la campaña sin crear registros adicionales.
          </p>
          <Button onClick={handleSendEmails} disabled={sendingProgress.active || readyToSend.length === 0}>
            {sendingProgress.active ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
            Enviar {readyToSend.length} emails
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
          {sentCompanies.length > 0 && (
            <p className="text-sm text-green-600">{sentCompanies.length} enviados correctamente</p>
          )}
          {failedCompanies.length > 0 && (
            <p className="text-sm text-red-600">{failedCompanies.length} con errores</p>
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
                    <Badge variant={
                      c.status === 'sent' ? 'outline' :
                      c.status === 'failed' ? 'destructive' :
                      c.status === 'calculated' ? 'default' : 'secondary'
                    } className="text-xs">
                      {c.status === 'sent' ? 'Enviado' :
                       c.status === 'failed' ? 'Error' :
                       c.status === 'calculated' ? 'Listo' :
                       c.status}
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
