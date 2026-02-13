import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Send, Loader2, Pause, FileDown } from 'lucide-react';
import { useCampaignCompanies, CampaignCompany } from '@/hooks/useCampaignCompanies';
import { ValuationCampaign, useCampaigns } from '@/hooks/useCampaigns';
import { supabase } from '@/integrations/supabase/client';
import { formatCurrencyEUR } from '@/utils/professionalValuationCalculation';
import { toast } from 'sonner';
import { ProfessionalValuationData } from '@/types/professionalValuation';

interface Props {
  campaignId: string;
  campaign: ValuationCampaign;
}

/**
 * Map campaign company data to ProfessionalValuationData for PDF generation.
 */
function mapToPdfData(c: CampaignCompany, campaign: ValuationCampaign): ProfessionalValuationData {
  return {
    clientName: c.client_name || '',
    clientCompany: c.client_company,
    clientCif: c.client_cif || undefined,
    clientEmail: c.client_email || undefined,
    sector: campaign.sector || '',
    financialYears: c.financial_years_data?.length
      ? c.financial_years_data
      : [{ year: c.financial_year, revenue: c.revenue || 0, ebitda: c.ebitda }],
    normalizationAdjustments: [],
    normalizedEbitda: c.normalized_ebitda || c.ebitda,
    ebitdaMultipleUsed: c.multiple_used || undefined,
    valuationCentral: c.valuation_central || undefined,
    valuationLow: c.valuation_low || undefined,
    valuationHigh: c.valuation_high || undefined,
    strengths: c.ai_strengths || campaign.strengths_template || undefined,
    weaknesses: c.ai_weaknesses || campaign.weaknesses_template || undefined,
    valuationContext: c.ai_context || campaign.valuation_context || undefined,
    comparablesFormattedText: campaign.comparables_text || undefined,
    includeComparables: campaign.include_comparables,
    status: 'generated',
  };
}

/**
 * Generate PDF blob using dynamic import to avoid loading react-pdf in main bundle.
 */
async function generatePdfBase64(data: ProfessionalValuationData, campaign: ValuationCampaign): Promise<string> {
  const [{ pdf }, { default: ProfessionalValuationPDF }] = await Promise.all([
    import('@react-pdf/renderer'),
    import('@/components/pdf/ProfessionalValuationPDF'),
  ]);

  const advisorInfo = campaign.use_custom_advisor
    ? {
        name: campaign.advisor_name || '',
        role: campaign.advisor_role || '',
        email: campaign.advisor_email || '',
        phone: campaign.advisor_phone || undefined,
      }
    : undefined;

  const element = <ProfessionalValuationPDF data={data} advisorInfo={advisorInfo} />;
  const blob = await pdf(element).toBlob();

  // Convert to base64
  const arrayBuffer = await blob.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export function ProcessSendStep({ campaignId, campaign }: Props) {
  const { companies, refetch } = useCampaignCompanies(campaignId);
  const { updateCampaign } = useCampaigns();
  const [sendingProgress, setSendingProgress] = useState({ active: false, current: 0, total: 0, name: '', phase: '' });
  const pauseRef = useRef(false);

  const readyToSend = companies.filter(c => c.status === 'calculated' && c.client_email);
  const sentCompanies = companies.filter(c => c.status === 'sent');
  const failedCompanies = companies.filter(c => c.status === 'failed');

  const handleSendEmails = async () => {
    if (readyToSend.length === 0) return;

    setSendingProgress({ active: true, current: 0, total: readyToSend.length, name: '', phase: '' });
    pauseRef.current = false;

    let sent = 0;
    for (const c of readyToSend) {
      if (pauseRef.current) break;
      setSendingProgress(p => ({ ...p, current: sent + 1, name: c.client_company, phase: 'Generando PDF' }));

      let pdfBase64: string | undefined;
      try {
        const pdfData = mapToPdfData(c, campaign);
        pdfBase64 = await generatePdfBase64(pdfData, campaign);
      } catch (pdfErr: any) {
        console.error('[CAMPAIGN PDF ERROR]', c.client_company, pdfErr?.message || pdfErr);
        toast.error(`PDF falló para ${c.client_company}: ${pdfErr?.message || 'Error desconocido'}. El email se enviará sin adjunto.`);
        // Continue without PDF (decoupling protocol)
      }

      setSendingProgress(p => ({ ...p, phase: 'Enviando email' }));

      try {
        const { data: responseData, error } = await supabase.functions.invoke('send-professional-valuation-email', {
          body: {
            recipientEmail: c.client_email,
            recipientName: c.client_name,
            pdfBase64,
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

        // Save status + pdf_url if returned
        const pdfUrl = responseData?.pdfUrl || responseData?.pdf_url;
        await (supabase as any)
          .from('valuation_campaign_companies')
          .update({ status: 'sent', ...(pdfUrl ? { pdf_url: pdfUrl } : {}) })
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
            Se generará el PDF y se enviará el email con la valoración a cada empresa.
          </p>
          <Button onClick={handleSendEmails} disabled={sendingProgress.active || readyToSend.length === 0}>
            {sendingProgress.active ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
            Enviar {readyToSend.length} emails
          </Button>
          {sendingProgress.active && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{sendingProgress.phase}: {sendingProgress.name}</span>
                <span>{sendingProgress.current}/{sendingProgress.total}</span>
              </div>
              <Progress value={(sendingProgress.current / sendingProgress.total) * 100} />
              <Button variant="destructive" size="sm" onClick={handlePause}><Pause className="h-4 w-4 mr-1" />Pausar</Button>
            </div>
          )}
          {sentCompanies.length > 0 && (
            <p className="text-sm text-emerald-600 dark:text-emerald-400">{sentCompanies.length} enviados correctamente</p>
          )}
          {failedCompanies.length > 0 && (
            <p className="text-sm text-destructive">{failedCompanies.length} con errores</p>
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
                <TableHead className="text-center">PDF</TableHead>
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
                    {c.pdf_url ? (
                      <a href={c.pdf_url} target="_blank" rel="noopener noreferrer" title="Descargar PDF">
                        <FileDown className="h-4 w-4 inline text-primary hover:text-primary/80" />
                      </a>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
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
