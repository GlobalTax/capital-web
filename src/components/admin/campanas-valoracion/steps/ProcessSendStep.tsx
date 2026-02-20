import { useState, useRef, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Send, Loader2, Pause, FileDown, Eye, Download, Mail, RefreshCw, MoreVertical, Archive,
} from 'lucide-react';
import { useCampaignCompanies, CampaignCompany } from '@/hooks/useCampaignCompanies';
import { ValuationCampaign, useCampaigns } from '@/hooks/useCampaigns';
import { supabase } from '@/integrations/supabase/client';
import { formatCurrencyEUR } from '@/utils/professionalValuationCalculation';
import { toast } from 'sonner';
import { ProfessionalValuationData } from '@/types/professionalValuation';
import { useNavigate } from 'react-router-dom';

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
async function generatePdfBlob(c: CampaignCompany, campaign: ValuationCampaign): Promise<Blob> {
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

  const data = mapToPdfData(c, campaign);
  const element = <ProfessionalValuationPDF data={data} advisorInfo={advisorInfo} />;
  return await pdf(element).toBlob();
}

/**
 * Generate PDF as base64 string (for email sending).
 */
async function generatePdfBase64(data: ProfessionalValuationData, campaign: ValuationCampaign): Promise<string> {
  const blob = await generatePdfBlob({ ...data } as unknown as CampaignCompany, campaign);
  const arrayBuffer = await blob.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Trigger browser download from a Blob.
 */
function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ─────────────────────────────────────────────
// PDF Preview Modal
// ─────────────────────────────────────────────
interface PDFPreviewModalProps {
  company: CampaignCompany;
  campaign: ValuationCampaign;
  onClose: () => void;
  onSend: (company: CampaignCompany) => void;
  isSending: boolean;
}

function PDFPreviewModal({ company, campaign, onClose, onSend, isSending }: PDFPreviewModalProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const blobRef = useRef<Blob | null>(null);

  // Generate PDF on mount and cleanup Object URL on unmount
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const blob = await generatePdfBlob(company, campaign);
        if (cancelled) return;
        blobRef.current = blob;
        setPreviewUrl(URL.createObjectURL(blob));
      } catch (e: any) {
        if (!cancelled) setError(e?.message || 'Error generando PDF');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleClose = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    onClose();
  };

  const handleDownload = () => {
    if (!blobRef.current) return;
    downloadBlob(blobRef.current, `valoracion_${company.client_company.replace(/\s+/g, '_')}.pdf`);
  };

  return (
    <Dialog open onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl h-[85vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-3 border-b shrink-0">
          <DialogTitle className="text-base font-medium truncate">
            Vista previa — {company.client_company}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden px-4 py-3">
          {loading && (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="text-sm">Generando PDF…</span>
            </div>
          )}
          {error && (
            <div className="flex items-center justify-center h-full text-destructive text-sm">
              Error: {error}
            </div>
          )}
          {previewUrl && !loading && (
            <iframe
              src={previewUrl}
              className="w-full h-full rounded border"
              title={`Vista previa ${company.client_company}`}
            />
          )}
        </div>

        <DialogFooter className="px-6 pb-4 pt-3 border-t shrink-0 gap-2">
          <Button variant="outline" size="sm" onClick={handleClose}>
            Cerrar
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownload} disabled={!previewUrl}>
            <Download className="h-4 w-4 mr-1.5" />
            Descargar
          </Button>
          {company.client_email && (
            <Button size="sm" onClick={() => onSend(company)} disabled={isSending || !previewUrl}>
              {isSending ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <Mail className="h-4 w-4 mr-1.5" />}
              Enviar email
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────
export function ProcessSendStep({ campaignId, campaign }: Props) {
  const navigate = useNavigate();
  const { companies, refetch } = useCampaignCompanies(campaignId);
  const { updateCampaign } = useCampaigns();

  // Send progress
  const [sendingProgress, setSendingProgress] = useState({ active: false, current: 0, total: 0, name: '', phase: '' });
  const pauseRef = useRef(false);

  // Download progress
  const [downloadProgress, setDownloadProgress] = useState({ active: false, current: 0, total: 0, name: '' });

  // Per-row loading states
  const [rowDownloading, setRowDownloading] = useState<string | null>(null);
  const [rowSending, setRowSending] = useState<string | null>(null);

  // Preview modal
  const [previewCompany, setPreviewCompany] = useState<CampaignCompany | null>(null);

  const readyToSend = companies.filter(c => c.status === 'calculated' && c.client_email);
  const sentCompanies = companies.filter(c => c.status === 'sent');
  const failedCompanies = companies.filter(c => c.status === 'failed');
  const downloadableCompanies = companies.filter(c => ['calculated', 'sent', 'created'].includes(c.status));

  // ── Individual send (used from row dropdown and preview modal) ──
  const sendSingle = useCallback(async (c: CampaignCompany) => {
    if (!c.client_email) { toast.error('Esta empresa no tiene email'); return; }
    setRowSending(c.id);

    let pdfBase64: string | undefined;
    try {
      const blob = await generatePdfBlob(c, campaign);
      const arrayBuffer = await blob.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      let binary = '';
      for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
      pdfBase64 = btoa(binary);
    } catch (pdfErr: any) {
      console.error('[SINGLE_SEND PDF ERROR]', c.client_company, pdfErr);
      toast.error(`PDF falló para ${c.client_company}. Email se enviará sin adjunto.`);
    }

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
      const pdfUrl = responseData?.pdfUrl || responseData?.pdf_url;
      await (supabase as any)
        .from('valuation_campaign_companies')
        .update({ status: 'sent', ...(pdfUrl ? { pdf_url: pdfUrl } : {}) })
        .eq('id', c.id);
      await refetch();
      toast.success(`Email enviado a ${c.client_company}`);
    } catch (e: any) {
      console.error('[SINGLE_SEND EMAIL ERROR]', c.client_company, e);
      await (supabase as any)
        .from('valuation_campaign_companies')
        .update({ status: 'failed', error_message: e.message })
        .eq('id', c.id);
      await refetch();
      toast.error(`Error enviando a ${c.client_company}`);
    } finally {
      setRowSending(null);
    }
  }, [campaign, refetch]);

  // ── Individual download ──
  const downloadSingle = useCallback(async (c: CampaignCompany) => {
    setRowDownloading(c.id);
    try {
      const blob = await generatePdfBlob(c, campaign);
      downloadBlob(blob, `valoracion_${c.client_company.replace(/\s+/g, '_')}.pdf`);
      toast.success(`PDF descargado: ${c.client_company}`);
    } catch (e: any) {
      console.error('[DOWNLOAD_PDF ERROR]', c.client_company, e);
      toast.error(`Error generando PDF de ${c.client_company}`);
    } finally {
      setRowDownloading(null);
    }
  }, [campaign]);

  // ── Bulk download ──
  const handleDownloadAll = useCallback(async () => {
    if (downloadableCompanies.length === 0) return;
    setDownloadProgress({ active: true, current: 0, total: downloadableCompanies.length, name: '' });

    for (let i = 0; i < downloadableCompanies.length; i++) {
      const c = downloadableCompanies[i];
      setDownloadProgress(p => ({ ...p, current: i + 1, name: c.client_company }));
      try {
        const blob = await generatePdfBlob(c, campaign);
        downloadBlob(blob, `${String(i + 1).padStart(3, '0')}_${c.client_company.replace(/\s+/g, '_')}.pdf`);
        await new Promise(r => setTimeout(r, 600)); // avoid tab flood
      } catch (e: any) {
        console.error('[BULK_DOWNLOAD ERROR]', c.client_company, e);
        toast.error(`PDF falló: ${c.client_company}`);
      }
    }

    setDownloadProgress(p => ({ ...p, active: false }));
    toast.success(`${downloadableCompanies.length} PDFs descargados`);
  }, [downloadableCompanies, campaign]);

  // ── Bulk send (existing logic, preserved) ──
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
        toast.error(`PDF falló para ${c.client_company}. El email se enviará sin adjunto.`);
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

        const pdfUrl = responseData?.pdfUrl || responseData?.pdf_url;
        await (supabase as any)
          .from('valuation_campaign_companies')
          .update({ status: 'sent', ...(pdfUrl ? { pdf_url: pdfUrl } : {}) })
          .eq('id', c.id);

        sent++;
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

  // ── Retry failed ──
  const handleRetryFailed = async () => {
    if (failedCompanies.length === 0) return;
    // Reset failed → calculated so they appear in readyToSend again
    for (const c of failedCompanies) {
      await (supabase as any)
        .from('valuation_campaign_companies')
        .update({ status: 'calculated', error_message: null })
        .eq('id', c.id);
    }
    await refetch();
    toast.info(`${failedCompanies.length} empresas listas para reenviar`);
  };

  const handlePause = () => { pauseRef.current = true; };

  const isBusy = sendingProgress.active || downloadProgress.active;

  return (
    <div className="space-y-6">
      {/* PDF Preview Modal */}
      {previewCompany && (
        <PDFPreviewModal
          company={previewCompany}
          campaign={campaign}
          onClose={() => setPreviewCompany(null)}
          onSend={(c) => { setPreviewCompany(null); sendSingle(c); }}
          isSending={rowSending === previewCompany.id}
        />
      )}

      {/* Send emails card */}
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

          <div className="flex flex-wrap gap-2">
            <Button
              onClick={handleSendEmails}
              disabled={isBusy || readyToSend.length === 0}
            >
              {sendingProgress.active
                ? <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                : <Send className="h-4 w-4 mr-2" />}
              Enviar {readyToSend.length} emails
            </Button>

            <Button
              variant="outline"
              onClick={handleDownloadAll}
              disabled={isBusy || downloadableCompanies.length === 0}
            >
              {downloadProgress.active
                ? <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                : <Archive className="h-4 w-4 mr-2" />}
              Descargar {downloadableCompanies.length} PDFs
            </Button>

            {failedCompanies.length > 0 && (
              <Button
                variant="outline"
                onClick={handleRetryFailed}
                disabled={isBusy}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Reenviar {failedCompanies.length} errores
              </Button>
            )}
          </div>

          {/* Send progress */}
          {sendingProgress.active && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{sendingProgress.phase}: <span className="text-foreground font-medium">{sendingProgress.name}</span></span>
                <span>{sendingProgress.current}/{sendingProgress.total}</span>
              </div>
              <Progress value={(sendingProgress.current / sendingProgress.total) * 100} />
              <Button variant="destructive" size="sm" onClick={handlePause}>
                <Pause className="h-4 w-4 mr-1" />Pausar
              </Button>
            </div>
          )}

          {/* Download progress */}
          {downloadProgress.active && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Descargando: <span className="text-foreground font-medium">{downloadProgress.name}</span></span>
                <span>{downloadProgress.current}/{downloadProgress.total}</span>
              </div>
              <Progress value={(downloadProgress.current / downloadProgress.total) * 100} className="h-2" />
            </div>
          )}

          {sentCompanies.length > 0 && (
            <p className="text-sm text-foreground/70">{sentCompanies.length} enviados correctamente</p>
          )}
          {failedCompanies.length > 0 && (
            <p className="text-sm text-destructive">{failedCompanies.length} con errores — usa "Reenviar errores" para reintentar</p>
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
                <TableHead className="text-center w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {companies.map(c => {
                const isRowDownloading = rowDownloading === c.id;
                const isRowSending = rowSending === c.id;
                const canSend = !!c.client_email && c.status !== 'sent';
                const isFailed = c.status === 'failed';

                return (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">
                      {c.professional_valuation_id ? (
                        <span
                          className="text-primary hover:underline cursor-pointer"
                          onClick={() => navigate(`/admin/valoraciones-pro/${c.professional_valuation_id}`)}
                        >
                          {c.client_company}
                        </span>
                      ) : c.client_company}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{c.client_email || '—'}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {c.valuation_central ? formatCurrencyEUR(c.valuation_central) : '—'}
                    </TableCell>
                    <TableCell className="text-center">
                      {c.pdf_url ? (
                        <a href={c.pdf_url} target="_blank" rel="noopener noreferrer" title="Abrir PDF guardado">
                          <FileDown className="h-4 w-4 inline text-primary hover:text-primary/80" />
                        </a>
                      ) : (
                        <span className="text-muted-foreground text-xs">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant={
                          c.status === 'sent' ? 'outline' :
                          c.status === 'failed' ? 'destructive' :
                          c.status === 'calculated' ? 'default' : 'secondary'
                        }
                        className="text-xs"
                      >
                        {c.status === 'sent' ? 'Enviado' :
                         c.status === 'failed' ? 'Error' :
                         c.status === 'calculated' ? 'Listo' :
                         c.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7" disabled={isRowDownloading || isRowSending}>
                            {(isRowDownloading || isRowSending) ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <MoreVertical className="h-3.5 w-3.5" />
                            )}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44">
                          <DropdownMenuItem onClick={() => setPreviewCompany(c)}>
                            <Eye className="h-4 w-4 mr-2" />
                            Previsualizar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => downloadSingle(c)} disabled={isRowDownloading}>
                            <Download className="h-4 w-4 mr-2" />
                            Descargar PDF
                          </DropdownMenuItem>
                          {canSend && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => sendSingle(c)} disabled={isRowSending}>
                                <Mail className="h-4 w-4 mr-2" />
                                Enviar email
                              </DropdownMenuItem>
                            </>
                          )}
                          {isFailed && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => sendSingle(c)}
                                disabled={isRowSending}
                                className="text-destructive focus:text-destructive"
                              >
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Reenviar
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
