import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Send, Loader2, Pause, FileDown, Eye, Download, Mail, RefreshCw, MoreVertical, Archive, X, MessageSquarePlus, Upload, Building2, FileText, CheckCircle2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCampaignCompanies, CampaignCompany } from '@/hooks/useCampaignCompanies';
import { useCampaignPresentations, CampaignPresentation } from '@/hooks/useCampaignPresentations';
import { useCampaignEmails } from '@/hooks/useCampaignEmails';
import { CampaignCompanyInteractionDialog } from '@/components/admin/campanas-valoracion/CampaignCompanyInteractionDialog';
import { FOLLOW_UP_STATUSES } from '@/hooks/useCampaignCompanyInteractions';
import { ValuationCampaign, useCampaigns } from '@/hooks/useCampaigns';
import { supabase } from '@/integrations/supabase/client';
import { formatCurrencyEUR } from '@/utils/professionalValuationCalculation';
import { buildCampaignPresentationPath, normalizeCampaignPresentationPath, isValidCampaignPresentationPath, safeStorageUpload, safeCreateSignedUrl, CAMPAIGN_PRESENTATIONS_BUCKET } from '@/utils/campaignPresentationStorage';
import { toast } from 'sonner';
import { ProfessionalValuationData } from '@/types/professionalValuation';
import { useNavigate } from 'react-router-dom';

function estimateZipSize(count: number): string {
  const estimatedBytes = count * 200 * 1024 * 0.75;
  if (estimatedBytes >= 1024 * 1024) {
    return `~${(estimatedBytes / (1024 * 1024)).toFixed(0)} MB`;
  }
  return `~${(estimatedBytes / 1024).toFixed(0)} KB`;
}

interface Props {
  campaignId: string;
  campaign: ValuationCampaign;
}

function mapToPdfData(c: CampaignCompany, campaign: ValuationCampaign): ProfessionalValuationData {
  const isRevenue = campaign.valuation_type === 'revenue_multiple';
  const baseValue = isRevenue
    ? (c.normalized_ebitda || c.revenue || 0)
    : (c.normalized_ebitda || c.ebitda);
  const multipleUsed = c.multiple_used || 6;
  const effectiveLow = campaign.multiple_low || (multipleUsed - 1);
  const effectiveHigh = campaign.multiple_high || (multipleUsed + 1);

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
    normalizedEbitda: baseValue,
    ebitdaMultipleUsed: multipleUsed,
    ebitdaMultipleLow: effectiveLow,
    ebitdaMultipleHigh: effectiveHigh,
    valuationCentral: baseValue * multipleUsed,
    valuationLow: baseValue * effectiveLow,
    valuationHigh: baseValue * effectiveHigh,
    valuationMethod: campaign.valuation_type || 'ebitda_multiple',
    strengths: c.ai_strengths || campaign.strengths_template || undefined,
    weaknesses: c.ai_weaknesses || campaign.weaknesses_template || undefined,
    valuationContext: c.ai_context || campaign.valuation_context || undefined,
    comparablesFormattedText: campaign.comparables_text || undefined,
    includeComparables: campaign.include_comparables,
    status: 'generated',
  };
}

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
// PDF Preview Modal (Valuation)
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
          <Button variant="outline" size="sm" onClick={handleClose}>Cerrar</Button>
          <Button variant="outline" size="sm" onClick={handleDownload} disabled={!previewUrl}>
            <Download className="h-4 w-4 mr-1.5" />Descargar
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
// Study PDF Viewer Modal
// ─────────────────────────────────────────────
interface StudyPdfViewerModalProps {
  companyName: string;
  storagePath: string;
  onClose: () => void;
}

function StudyPdfViewerModal({ companyName, storagePath, onClose }: StudyPdfViewerModalProps) {
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const normalizedPath = normalizeCampaignPresentationPath(storagePath);
        if (!isValidCampaignPresentationPath(normalizedPath)) {
          throw new Error('Ruta de estudio inválida');
        }
        const { signedUrl, error: signError } = await safeCreateSignedUrl(normalizedPath);
        if (signError) throw signError;
        if (!cancelled && signedUrl) setUrl(encodeURI(signedUrl));
      } catch (e: any) {
        if (!cancelled) setError(e?.message || 'Error obteniendo PDF');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [storagePath]);

  const handleDownload = async () => {
    if (!url) return;
    const a = document.createElement('a');
    a.href = url;
    a.download = storagePath.split('/').pop() || 'estudio.pdf';
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[85vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-3 border-b shrink-0">
          <DialogTitle className="text-base font-medium truncate">
            Estudio — {companyName}
          </DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-hidden px-4 py-3">
          {loading && (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="text-sm">Cargando PDF…</span>
            </div>
          )}
          {error && (
            <div className="flex items-center justify-center h-full text-destructive text-sm">
              Error: {error}
            </div>
          )}
          {url && !loading && (
            <iframe
              src={url}
              className="w-full h-full rounded border"
              title={`Estudio ${companyName}`}
            />
          )}
        </div>
        <DialogFooter className="px-6 pb-4 pt-3 border-t shrink-0 gap-2">
          <Button variant="outline" size="sm" onClick={onClose}>Cerrar</Button>
          <Button variant="outline" size="sm" onClick={handleDownload} disabled={!url}>
            <Download className="h-4 w-4 mr-1.5" />Descargar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─────────────────────────────────────────────
// Reupload Study Modal
// ─────────────────────────────────────────────
interface ReuploadStudyModalProps {
  companyName: string;
  companyId: string;
  campaignId: string;
  currentPresentation: CampaignPresentation | null;
  onClose: () => void;
  onSuccess: () => void;
}

function ReuploadStudyModal({ companyName, companyId, campaignId, currentPresentation, onClose, onSuccess }: ReuploadStudyModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.name.toLowerCase().endsWith('.pdf') || f.type !== 'application/pdf') {
      toast.error('Solo se aceptan archivos en formato PDF');
      e.target.value = '';
      return;
    }
    setFile(f);
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    try {
      const storagePath = buildCampaignPresentationPath(campaignId, file.name);
      const { error: uploadError } = await safeStorageUpload(
        CAMPAIGN_PRESENTATIONS_BUCKET,
        storagePath,
        file,
        { upsert: true, contentType: 'application/pdf' },
      );
      if (uploadError) throw uploadError;

      if (currentPresentation) {
        const { error: dbError } = await supabase
          .from('campaign_presentations' as any)
          .update({
            file_name: file.name,
            storage_path: storagePath,
            updated_at: new Date().toISOString(),
          } as any)
          .eq('id', currentPresentation.id);
        if (dbError) throw new Error(`Error actualizando registro: ${dbError.message}`);
      } else {
        const { error: dbError } = await supabase
          .from('campaign_presentations' as any)
          .insert({
            campaign_id: campaignId,
            company_id: companyId,
            file_name: file.name,
            storage_path: storagePath,
            status: 'assigned',
            assigned_manually: true,
            match_confidence: 1,
          } as any);
        if (dbError) throw new Error(`Error creando registro: ${dbError.message}`);
      }

      toast.success(`Estudio actualizado correctamente para ${companyName}`);
      onSuccess();
      onClose();
    } catch (e: any) {
      toast.error(`Error subiendo estudio: ${e.message}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base">Re-subir estudio</DialogTitle>
          <DialogDescription className="text-sm">
            {companyName}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          {currentPresentation && (
            <div className="text-sm text-muted-foreground bg-muted/50 rounded-md p-3">
              <p><span className="font-medium">Estudio actual:</span> {currentPresentation.file_name}</p>
              <p><span className="font-medium">Subido:</span> {new Date(currentPresentation.updated_at).toLocaleDateString('es-ES')}</p>
            </div>
          )}
          <div className="space-y-2">
            <Input
              type="file"
              accept="application/pdf,.pdf"
              onChange={handleFileChange}
              className="cursor-pointer"
            />
            <p className="text-xs text-muted-foreground">Solo se aceptan archivos en formato PDF</p>
            <p className="text-xs text-destructive">Esto sobrescribirá el estudio actual sin posibilidad de recuperarlo</p>
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" size="sm" onClick={onClose} disabled={uploading}>Cancelar</Button>
          <Button size="sm" onClick={handleUpload} disabled={!file || uploading}>
            {uploading ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <Upload className="h-4 w-4 mr-1.5" />}
            Subir
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─────────────────────────────────────────────
// Floating Action Bar
// ─────────────────────────────────────────────
interface FloatingActionBarProps {
  selectedCount: number;
  onClear: () => void;
  onDownload: () => void;
  onSend: () => void;
  isBusy: boolean;
  estimatedSize: string;
}

function FloatingActionBar({ selectedCount, onClear, onDownload, onSend, isBusy, estimatedSize }: FloatingActionBarProps) {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-4">
      <Card className="shadow-2xl border">
        <CardContent className="flex items-center gap-3 py-3 px-4">
          <span className="text-sm font-medium tabular-nums">
            {selectedCount} seleccionada{selectedCount !== 1 ? 's' : ''}
          </span>
          <div className="h-4 w-px bg-border" />
          <Button size="sm" variant="ghost" onClick={onClear} disabled={isBusy}>
            <X className="h-4 w-4 mr-1.5" />Limpiar
          </Button>
          <Button size="sm" variant="outline" onClick={onDownload} disabled={isBusy}>
            <Download className="h-4 w-4 mr-1.5" />
            Descargar PDFs ({estimatedSize})
          </Button>
          <Button size="sm" onClick={onSend} disabled={isBusy}>
            <Mail className="h-4 w-4 mr-1.5" />
            Enviar emails
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

// ─────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────
export function ProcessSendStep({ campaignId, campaign }: Props) {
  const navigate = useNavigate();
  const { companies, refetch } = useCampaignCompanies(campaignId);
  const queryClient = useQueryClient();
  const { presentations, isLoading: presentationsLoading } = useCampaignPresentations(campaignId);
  const { updateCampaign } = useCampaigns();
  const { emails: campaignEmails } = useCampaignEmails(campaignId);

  // Email tracking map: company_id -> { delivery_status, email_opened }
  const emailTrackingMap = useMemo(() => {
    const m = new Map<string, { delivery_status: string | null; email_opened: boolean }>();
    for (const e of campaignEmails) {
      m.set(e.company_id, { delivery_status: e.delivery_status, email_opened: e.email_opened });
    }
    return m;
  }, [campaignEmails]);

  // Send progress
  const [sendingProgress, setSendingProgress] = useState({ active: false, current: 0, total: 0, name: '', phase: '' });
  const pauseRef = useRef(false);

  // Download progress
  const [downloadProgress, setDownloadProgress] = useState({ active: false, current: 0, total: 0, name: '' });

  // Per-row loading states
  const [rowDownloading, setRowDownloading] = useState<string | null>(null);
  const [rowSending, setRowSending] = useState<string | null>(null);

  // Preview modal (valuation)
  const [previewCompany, setPreviewCompany] = useState<CampaignCompany | null>(null);

  // Study viewer modal
  const [studyViewerData, setStudyViewerData] = useState<{ companyName: string; storagePath: string } | null>(null);

  // Reupload study modal
  const [reuploadData, setReuploadData] = useState<{ companyName: string; companyId: string; presentation: CampaignPresentation | null } | null>(null);

  // Interaction dialog
  const [interactionCompany, setInteractionCompany] = useState<CampaignCompany | null>(null);

  // Multi-selection
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Status filter
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [followUpFilter, setFollowUpFilter] = useState<string>('all');

  const toggleSelection = useCallback((id: string) =>
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]),
  []);

  const readyToSend = companies.filter(c => c.status === 'calculated' && c.client_email);
  const sentCompanies = companies.filter(c => c.status === 'sent');
  const failedCompanies = companies.filter(c => c.status === 'failed');
  const downloadableCompanies = companies.filter(c => ['calculated', 'sent', 'created'].includes(c.status));

  // Helper: get presentation for a company
  const getPresentationForCompany = useCallback((companyId: string): CampaignPresentation | null => {
    return presentations.find(p => p.company_id === companyId && p.status === 'assigned') || null;
  }, [presentations]);

  // Stats
  const valuationReadyCount = companies.filter(c => ['calculated', 'sent'].includes(c.status)).length;
  const studyReadyCount = companies.filter(c => getPresentationForCompany(c.id) !== null).length;
  const studyMissingCount = companies.length - studyReadyCount;

  const filteredCompanies = companies.filter(c => {
    if (statusFilter !== 'all' && c.status !== statusFilter) return false;
    if (followUpFilter !== 'all' && (c as any).follow_up_status !== followUpFilter) return false;
    return true;
  });

  const toggleSelectAll = useCallback(() =>
    setSelectedIds(prev => {
      const filteredIds = filteredCompanies.map(c => c.id);
      const allFilteredSelected = filteredIds.length > 0 && filteredIds.every(id => prev.includes(id));
      if (allFilteredSelected) {
        return prev.filter(id => !filteredIds.includes(id));
      }
      return [...new Set([...prev, ...filteredIds])];
    }),
  [filteredCompanies]);

  const clearSelection = useCallback(() => setSelectedIds([]), []);

  const filteredIds = filteredCompanies.map(c => c.id);
  const isAllSelected = filteredCompanies.length > 0 && filteredIds.every(id => selectedIds.includes(id));
  const isIndeterminate = !isAllSelected && filteredIds.some(id => selectedIds.includes(id));

  // ── Reset campaign_email to pending (for resend) ──
  const resetEmailToPending = useCallback(async (companyId: string) => {
    await (supabase as any)
      .from('campaign_emails')
      .update({ status: 'pending', sent_at: null, error_message: null, updated_at: new Date().toISOString() })
      .eq('campaign_id', campaignId)
      .eq('company_id', companyId);
  }, [campaignId]);

  // ── Individual send (works for both first send and resend) ──
  const sendSingle = useCallback(async (c: CampaignCompany, isResend = false) => {
    if (!c.client_email) { toast.error('Esta empresa no tiene email'); return; }
    setRowSending(c.id);

    try {
      // If resending, reset the email record to pending first
      if (isResend) {
        await resetEmailToPending(c.id);
      }

      // Find the campaign_email record for this company
      const { data: emailRecord, error: emailLookupError } = await (supabase as any)
        .from('campaign_emails')
        .select('id')
        .eq('campaign_id', campaignId)
        .eq('company_id', c.id)
        .maybeSingle();

      if (emailLookupError) throw emailLookupError;
      if (!emailRecord) {
        toast.error(`No hay email generado para ${c.client_company}. Ve al paso Mail primero.`);
        setRowSending(null);
        return;
      }

      const { data: responseData, error } = await supabase.functions.invoke('send-campaign-outbound-email', {
        body: { email_ids: [emailRecord.id] },
      });
      if (error) throw error;
      if (responseData?.failed > 0) throw new Error(responseData.results?.[0]?.error || 'Error al enviar');

      await (supabase as any)
        .from('valuation_campaign_companies')
        .update({ status: 'sent' })
        .eq('id', c.id);
      await refetch();
      toast.success(`Email ${isResend ? 're' : ''}enviado a ${c.client_company}`);
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
  }, [campaignId, refetch, resetEmailToPending]);

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

  // ── Download study ──
  const downloadStudy = useCallback(async (presentation: CampaignPresentation) => {
    try {
      const normalizedPath = normalizeCampaignPresentationPath(presentation.storage_path);
      if (!isValidCampaignPresentationPath(normalizedPath)) {
        throw new Error('Ruta de estudio inválida');
      }

      const { signedUrl, error } = await safeCreateSignedUrl(normalizedPath);
      if (error) throw error;
      const a = document.createElement('a');
      a.href = encodeURI(signedUrl!);
      a.download = presentation.file_name;
      a.target = '_blank';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (e: any) {
      toast.error(e?.message || 'PDF no disponible para esta empresa');
    }
  }, []);

  // ── Bulk download (all) ──
  const handleDownloadAll = useCallback(async () => {
    if (downloadableCompanies.length === 0) return;
    setDownloadProgress({ active: true, current: 0, total: downloadableCompanies.length, name: '' });

    for (let i = 0; i < downloadableCompanies.length; i++) {
      const c = downloadableCompanies[i];
      setDownloadProgress(p => ({ ...p, current: i + 1, name: c.client_company }));
      try {
        const blob = await generatePdfBlob(c, campaign);
        downloadBlob(blob, `${String(i + 1).padStart(3, '0')}_${c.client_company.replace(/\s+/g, '_')}.pdf`);
        await new Promise(r => setTimeout(r, 600));
      } catch (e: any) {
        console.error('[BULK_DOWNLOAD ERROR]', c.client_company, e);
        toast.error(`PDF falló: ${c.client_company}`);
      }
    }

    setDownloadProgress(p => ({ ...p, active: false }));
    toast.success(`${downloadableCompanies.length} PDFs descargados`);
  }, [downloadableCompanies, campaign]);

  // ── Download selected as ZIP ──
  const handleDownloadSelected = useCallback(async (ids: string[]) => {
    const targets = companies.filter(c => ids.includes(c.id));
    if (targets.length === 0) return;
    setDownloadProgress({ active: true, current: 0, total: targets.length, name: '' });

    try {
      const fflate = await import('fflate');
      const files: Record<string, Uint8Array> = {};

      for (let i = 0; i < targets.length; i++) {
        const c = targets[i];
        setDownloadProgress(p => ({ ...p, current: i + 1, name: c.client_company }));
        const blob = await generatePdfBlob(c, campaign);
        const buffer = await blob.arrayBuffer();
        const filename = `${String(i + 1).padStart(3, '0')}_${c.client_company.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
        files[filename] = new Uint8Array(buffer);
      }

      const zipped = fflate.zipSync(files, { level: 6 });
      const zipBlob = new Blob([zipped.buffer as ArrayBuffer], { type: 'application/zip' });
      downloadBlob(zipBlob, `Valoraciones_${targets.length}_empresas.zip`);
      toast.success(`${targets.length} PDFs descargados como ZIP`);
    } catch (err) {
      console.warn('[ZIP] fflate no disponible, fallback secuencial', err);
      for (let i = 0; i < targets.length; i++) {
        const c = targets[i];
        setDownloadProgress(p => ({ ...p, current: i + 1, name: c.client_company }));
        try {
          const blob = await generatePdfBlob(c, campaign);
          downloadBlob(blob, `${String(i + 1).padStart(3, '0')}_${c.client_company.replace(/\s+/g, '_')}.pdf`);
          await new Promise(r => setTimeout(r, 600));
        } catch (e: any) {
          toast.error(`PDF falló: ${c.client_company}`);
        }
      }
      toast.success(`${targets.length} PDFs descargados`);
    } finally {
      setDownloadProgress(p => ({ ...p, active: false }));
    }
  }, [companies, campaign]);

  // ── Send selected (includes resend for sent/failed) ──
  const handleSendSelected = useCallback(async (ids: string[]) => {
    const targets = companies.filter(c => ids.includes(c.id) && !!c.client_email);
    if (targets.length === 0) { toast.info('No hay empresas con email seleccionadas'); return; }
    setSendingProgress({ active: true, current: 0, total: targets.length, name: '', phase: '' });
    pauseRef.current = false;

    let sent = 0;
    for (let i = 0; i < targets.length; i++) {
      if (pauseRef.current) break;
      const c = targets[i];
      const isResend = c.status === 'sent' || c.status === 'failed';
      setSendingProgress(p => ({ ...p, current: i + 1, name: c.client_company, phase: isResend ? 'Reenviando' : 'Enviando' }));
      try {
        await sendSingle(c, isResend);
        sent++;
        await new Promise(r => setTimeout(r, 1000));
      } catch {
        // sendSingle handles its own toast
      }
    }

    setSendingProgress(p => ({ ...p, active: false }));
    if (!pauseRef.current) {
      toast.success(`${sent} emails enviados`);
      clearSelection();
    }
  }, [companies, sendSingle, clearSelection]);

  // ── Keyboard shortcuts ──
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
        e.preventDefault();
        toggleSelectAll();
      }
      if (e.key === 'Escape' && selectedIds.length > 0) clearSelection();
      if ((e.ctrlKey || e.metaKey) && e.key === 'd' && selectedIds.length > 0) {
        e.preventDefault();
        handleDownloadSelected(selectedIds);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selectedIds, toggleSelectAll, clearSelection, handleDownloadSelected]);

  // ── Bulk send ──
  const handleSendEmails = async () => {
    if (readyToSend.length === 0) return;
    setSendingProgress({ active: true, current: 0, total: readyToSend.length, name: '', phase: '' });
    pauseRef.current = false;

    let sent = 0;
    for (const c of readyToSend) {
      if (pauseRef.current) break;
      setSendingProgress(p => ({ ...p, current: sent + 1, name: c.client_company, phase: 'Buscando email' }));

      try {
        // Find campaign_email record for this company
        const { data: emailRecord, error: emailLookupError } = await (supabase as any)
          .from('campaign_emails')
          .select('id')
          .eq('campaign_id', campaignId)
          .eq('company_id', c.id)
          .maybeSingle();

        if (emailLookupError) throw emailLookupError;
        if (!emailRecord) {
          console.warn(`No campaign_email for ${c.client_company}, skipping`);
          await (supabase as any)
            .from('valuation_campaign_companies')
            .update({ status: 'failed', error_message: 'No hay email generado. Ve al paso Mail.' })
            .eq('id', c.id);
          continue;
        }

        setSendingProgress(p => ({ ...p, phase: 'Enviando email' }));

        const { data: responseData, error } = await supabase.functions.invoke('send-campaign-outbound-email', {
          body: { email_ids: [emailRecord.id] },
        });

        if (error) throw error;
        if (responseData?.failed > 0) throw new Error(responseData.results?.[0]?.error || 'Error al enviar');

        await (supabase as any)
          .from('valuation_campaign_companies')
          .update({ status: 'sent' })
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
      {/* Modals */}
      {previewCompany && (
        <PDFPreviewModal
          company={previewCompany}
          campaign={campaign}
          onClose={() => setPreviewCompany(null)}
          onSend={(c) => { setPreviewCompany(null); sendSingle(c); }}
          isSending={rowSending === previewCompany.id}
        />
      )}

      {studyViewerData && (
        <StudyPdfViewerModal
          companyName={studyViewerData.companyName}
          storagePath={studyViewerData.storagePath}
          onClose={() => setStudyViewerData(null)}
        />
      )}

      {reuploadData && (
        <ReuploadStudyModal
          companyName={reuploadData.companyName}
          companyId={reuploadData.companyId}
          campaignId={campaignId}
          currentPresentation={reuploadData.presentation}
          onClose={() => setReuploadData(null)}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['campaign-presentations', campaignId] });
          }}
        />
      )}

      {interactionCompany && (
        <CampaignCompanyInteractionDialog
          open={!!interactionCompany}
          onOpenChange={(open) => { if (!open) { setInteractionCompany(null); refetch(); } }}
          campaignCompanyId={interactionCompany.id}
          companyName={interactionCompany.client_company}
          currentFollowUpStatus={interactionCompany.follow_up_status || 'none'}
        />
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-4 pb-3 px-4">
            <div className="flex items-center gap-2 mb-1">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">Empresas</span>
            </div>
            <p className="text-2xl font-bold tabular-nums">{companies.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3 px-4">
            <div className="flex items-center gap-2 mb-1">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">Valoraciones</span>
            </div>
            <p className="text-2xl font-bold tabular-nums">{valuationReadyCount}</p>
            <p className="text-xs text-muted-foreground">{valuationReadyCount} listas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3 px-4">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">Estudios</span>
            </div>
            <p className="text-2xl font-bold tabular-nums">{studyReadyCount}</p>
            <p className="text-xs text-muted-foreground">
              {studyReadyCount} listos · {studyMissingCount > 0 && <span className="text-orange-500">{studyMissingCount} sin estudio</span>}
              {studyMissingCount === 0 && <span className="text-green-600">completo</span>}
            </p>
          </CardContent>
        </Card>
      </div>

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
            <Button onClick={handleSendEmails} disabled={isBusy || readyToSend.length === 0}>
              {sendingProgress.active
                ? <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                : <Send className="h-4 w-4 mr-2" />}
              Enviar {readyToSend.length} emails
            </Button>

            <Button variant="outline" onClick={handleDownloadAll} disabled={isBusy || downloadableCompanies.length === 0}>
              {downloadProgress.active
                ? <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                : <Archive className="h-4 w-4 mr-2" />}
              Descargar {downloadableCompanies.length} PDFs ({estimateZipSize(downloadableCompanies.length)})
            </Button>

            {sentCompanies.length > 0 && (
              <Button variant="outline" onClick={() => handleSendSelected(sentCompanies.map(c => c.id))} disabled={isBusy}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Reenviar {sentCompanies.length} enviados
              </Button>
            )}

            {failedCompanies.length > 0 && (
              <Button variant="outline" onClick={handleRetryFailed} disabled={isBusy}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Reintentar {failedCompanies.length} errores
              </Button>
            )}
          </div>

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
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-base">Resultados</CardTitle>
          <div className="flex items-center gap-1.5">
            {([
              { key: 'all' as const, label: 'Todos', count: companies.length },
              { key: 'calculated' as const, label: 'Listos', count: companies.filter(c => c.status === 'calculated').length },
              { key: 'sent' as const, label: 'Enviados', count: sentCompanies.length },
              { key: 'failed' as const, label: 'Errores', count: failedCompanies.length },
            ]).map(f => (
              <Button
                key={f.key}
                variant={statusFilter === f.key ? 'default' : 'outline'}
                size="sm"
                className="h-7 text-xs px-2.5"
                onClick={() => setStatusFilter(f.key)}
              >
                {f.label} ({f.count})
              </Button>
            ))}
            <div className="h-4 w-px bg-border mx-1" />
            <Select value={followUpFilter} onValueChange={setFollowUpFilter}>
              <SelectTrigger className="h-7 text-xs w-[140px]">
                <SelectValue placeholder="Seguimiento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-xs">Todos</SelectItem>
                {FOLLOW_UP_STATUSES.map(s => (
                  <SelectItem key={s.value} value={s.value} className="text-xs">{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10 pl-4">
                  <Checkbox
                    checked={isAllSelected || (isIndeterminate ? 'indeterminate' : false)}
                    onCheckedChange={toggleSelectAll}
                    aria-label="Seleccionar todas"
                  />
                </TableHead>
                <TableHead>Empresa</TableHead>
                <TableHead className="text-right">Valoración</TableHead>
                <TableHead className="text-center">PDF Valoración</TableHead>
                <TableHead className="text-center">PDF Estudio</TableHead>
                <TableHead className="text-center">Estado</TableHead>
                <TableHead className="text-center">Seguimiento</TableHead>
                <TableHead className="text-center w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCompanies.map(c => {
                const isRowDownloading = rowDownloading === c.id;
                const isRowSending = rowSending === c.id;
                const canSend = !!c.client_email && c.status !== 'sent';
                const canResend = !!c.client_email && c.status === 'sent';
                const isFailed = c.status === 'failed';
                const isSelected = selectedIds.includes(c.id);
                const hasValuation = ['calculated', 'sent'].includes(c.status);
                const presentation = getPresentationForCompany(c.id);
                const hasStudy = !!presentation;

                // Combined status
                const combinedStatus = hasValuation && hasStudy ? 'complete' : hasValuation && !hasStudy ? 'no_study' : 'no_valuation';

                return (
                  <TableRow key={c.id} className={cn(isSelected && 'bg-primary/5')}>
                    <TableCell className="pl-4 w-10">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => toggleSelection(c.id)}
                        aria-label={`Seleccionar ${c.client_company}`}
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      {c.professional_valuation_id ? (
                        <span
                          className="text-primary hover:underline cursor-pointer"
                          onClick={() => navigate(`/admin/valoraciones-pro/${c.professional_valuation_id}`)}
                        >
                          {c.client_company}
                        </span>
                      ) : c.client_company}
                      <div className="text-xs text-muted-foreground">{c.client_email || '—'}</div>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {c.valuation_central ? formatCurrencyEUR(c.valuation_central) : '—'}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant={hasValuation ? 'default' : 'secondary'}
                        className={cn('text-xs', hasValuation && 'bg-green-600 hover:bg-green-700 text-white')}
                      >
                        {hasValuation ? 'Listo' : 'Pendiente'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant={hasStudy ? 'default' : 'outline'}
                        className={cn(
                          'text-xs',
                          hasStudy && 'bg-green-600 hover:bg-green-700 text-white',
                          !hasStudy && 'border-orange-400 text-orange-600 bg-orange-50'
                        )}
                      >
                        {hasStudy ? 'Listo' : 'Sin estudio'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant="outline"
                        className={cn(
                          'text-xs',
                          combinedStatus === 'complete' && 'border-green-500 text-green-700 bg-green-50',
                          combinedStatus === 'no_study' && 'border-orange-400 text-orange-600 bg-orange-50',
                          combinedStatus === 'no_valuation' && 'border-muted text-muted-foreground',
                        )}
                      >
                        {combinedStatus === 'complete' ? 'Completo' :
                         combinedStatus === 'no_study' ? 'Sin estudio' :
                         'Sin valoración'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      {(() => {
                        const fus = (c as any).follow_up_status || 'none';
                        const fusInfo = FOLLOW_UP_STATUSES.find(s => s.value === fus);
                        const count = (c as any).follow_up_count || 0;
                        if (fus === 'none' && count === 0) return <span className="text-muted-foreground text-xs">—</span>;
                        return (
                          <Badge
                            variant={fusInfo?.variant || 'secondary'}
                            className="text-[10px] cursor-pointer"
                            onClick={() => setInteractionCompany(c)}
                          >
                            {fusInfo?.label || fus}{count > 0 ? ` (${count})` : ''}
                          </Badge>
                        );
                      })()}
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
                        <DropdownMenuContent align="end" className="w-52">
                          {/* Valuation actions */}
                          <DropdownMenuItem onClick={() => setPreviewCompany(c)} disabled={!hasValuation}>
                            <Eye className="h-4 w-4 mr-2" />
                            Ver Valoración
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => downloadSingle(c)} disabled={isRowDownloading || !hasValuation}>
                            <Download className="h-4 w-4 mr-2" />
                            Descargar Valoración
                          </DropdownMenuItem>
                          {c.professional_valuation_id && (
                            <DropdownMenuItem onClick={() => navigate(`/admin/valoraciones-pro/${c.professional_valuation_id}`)}>
                              <FileText className="h-4 w-4 mr-2" />
                              Editar Valoración
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          {/* Study actions */}
                          <DropdownMenuItem
                            disabled={!hasStudy}
                            onClick={() => {
                              if (presentation) {
                                setStudyViewerData({ companyName: c.client_company, storagePath: presentation.storage_path });
                              }
                            }}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Ver Estudio
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            disabled={!hasStudy}
                            onClick={() => {
                              if (presentation) downloadStudy(presentation);
                            }}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Descargar Estudio
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setReuploadData({ companyName: c.client_company, companyId: c.id, presentation })}
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            Re-subir Estudio
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {/* Follow-up */}
                          <DropdownMenuItem onClick={() => setInteractionCompany(c)}>
                            <MessageSquarePlus className="h-4 w-4 mr-2" />
                            Registrar seguimiento
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
                          {canResend && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => sendSingle(c, true)}
                                disabled={isRowSending}
                              >
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Reenviar email
                              </DropdownMenuItem>
                            </>
                          )}
                          {isFailed && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => sendSingle(c, true)}
                                disabled={isRowSending}
                                className="text-destructive focus:text-destructive"
                              >
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Reintentar envío
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

      {/* Floating Action Bar */}
      {selectedIds.length > 0 && (
        <FloatingActionBar
          selectedCount={selectedIds.length}
          onClear={clearSelection}
          onDownload={() => handleDownloadSelected(selectedIds)}
          onSend={() => handleSendSelected(selectedIds)}
          isBusy={isBusy}
          estimatedSize={estimateZipSize(selectedIds.length)}
        />
      )}
    </div>
  );
}
