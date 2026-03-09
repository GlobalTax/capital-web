import { useState, useRef, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Send, Loader2, Eye, Mail, Trash2, Plus, CheckCircle2, AlertCircle, MessageCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCampaignCompanies, CampaignCompany } from '@/hooks/useCampaignCompanies';
import { useCampaignEmails } from '@/hooks/useCampaignEmails';
import { useFollowupSequences, FollowupSequence, FollowupSend } from '@/hooks/useFollowupSequences';
import { ValuationCampaign } from '@/hooks/useCampaigns';
import { getAvailableVariables, replaceVariables } from '@/utils/campaignEmailTemplateEngine';
import { useEmailSignature, DEFAULT_SIGNATURE, generateSignatureHtml } from '@/hooks/useEmailSignature';
import { toast } from 'sonner';
import { formatCurrencyEUR } from '@/utils/professionalValuationCalculation';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';

// Seguimiento config (same as CampaignSummaryStep)
const SEGUIMIENTO_OPTIONS = [
  { value: 'sin_respuesta', label: 'Sin respuesta', className: 'bg-muted text-muted-foreground border-border' },
  { value: 'interesado', label: 'Interesado', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { value: 'no_interesado', label: 'No interesado', className: 'bg-red-50 text-red-600 border-red-200' },
  { value: 'reunion_agendada', label: 'Reunión agendada', className: 'bg-violet-50 text-violet-700 border-violet-200' },
] as const;

function getSeguimientoOption(value: string | null) {
  return SEGUIMIENTO_OPTIONS.find(o => o.value === (value || 'sin_respuesta')) || SEGUIMIENTO_OPTIONS[0];
}

interface Props {
  campaignId: string;
  campaign: ValuationCampaign;
}

// ─── Template Editor ────────────────────────────────────────────────────

function TemplateEditor({
  sequence,
  campaign,
  companies,
  emailSentMap,
  onSave,
  signatureHtml,
}: {
  sequence: FollowupSequence;
  campaign: ValuationCampaign;
  companies: CampaignCompany[];
  emailSentMap: Map<string, string | null>;
  onSave: (subject: string, body: string) => Promise<void>;
  signatureHtml: string | null;
}) {
  const [subject, setSubject] = useState(sequence.subject);
  const [body, setBody] = useState(sequence.body_html);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const subjectRef = useRef<HTMLInputElement>(null);
  const [lastFocused, setLastFocused] = useState<'subject' | 'body'>('body');

  // Reset when sequence changes
  const seqIdRef = useRef(sequence.id);
  if (seqIdRef.current !== sequence.id) {
    seqIdRef.current = sequence.id;
    setSubject(sequence.subject);
    setBody(sequence.body_html);
  }

  const variables = [
    ...getAvailableVariables(),
    { key: 'dias_desde_primer_envio', label: 'Días desde 1er envío', category: 'Follow Up' },
    { key: 'numero_followup', label: 'Nº follow up', category: 'Follow Up' },
  ];

  const eligible = companies.filter(c => (c.seguimiento_estado || 'sin_respuesta') === 'sin_respuesta');
  const excluded = companies.length - eligible.length;

  const insertVariable = useCallback((key: string) => {
    const tag = `{{${key}}}`;
    if (lastFocused === 'subject' && subjectRef.current) {
      const el = subjectRef.current;
      const start = el.selectionStart || 0;
      const end = el.selectionEnd || 0;
      setSubject(prev => prev.slice(0, start) + tag + prev.slice(end));
      setTimeout(() => { el.focus(); el.setSelectionRange(start + tag.length, start + tag.length); }, 0);
    } else if (bodyRef.current) {
      const el = bodyRef.current;
      const start = el.selectionStart || 0;
      const end = el.selectionEnd || 0;
      setBody(prev => prev.slice(0, start) + tag + prev.slice(end));
      setTimeout(() => { el.focus(); el.setSelectionRange(start + tag.length, start + tag.length); }, 0);
    }
  }, [lastFocused]);

  // Preview
  const previewCompany = eligible[0];
  const previewSentAt = previewCompany ? emailSentMap.get(previewCompany.id) || null : null;

  function resolvePreview(tpl: string) {
    if (!previewCompany) return tpl;
    let r = replaceVariables(tpl, previewCompany, campaign);
    const dias = previewSentAt
      ? String(Math.max(1, Math.floor((Date.now() - new Date(previewSentAt).getTime()) / 86400000)))
      : 'varios';
    r = r.replace(/\{\{dias_desde_primer_envio\}\}/g, dias);
    r = r.replace(/\{\{numero_followup\}\}/g, String(sequence.sequence_number));
    return r;
  }

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(subject, body);
      toast.success('Template guardado');
    } finally {
      setSaving(false);
    }
  };

  const categories = variables.reduce((acc, v) => {
    if (!acc[v.category]) acc[v.category] = [];
    acc[v.category].push(v);
    return acc;
  }, {} as Record<string, typeof variables>);

  return (
    <div className="space-y-4">
      <div className="p-3 rounded-lg border bg-blue-50 border-blue-200 text-sm">
        <p className="font-medium text-blue-800">
          Se enviará a <strong>{eligible.length}</strong> empresa(s) (sin respuesta).
          Se han excluido <strong>{excluded}</strong> empresa(s).
        </p>
      </div>

      <Card>
        <CardHeader className="py-3">
          <CardTitle className="text-sm font-medium">Variables disponibles</CardTitle>
        </CardHeader>
        <CardContent className="pb-3">
          <div className="space-y-2">
            {Object.entries(categories).map(([cat, vars]) => (
              <div key={cat} className="flex flex-wrap items-center gap-1.5">
                <span className="text-xs text-muted-foreground font-medium w-24">{cat}:</span>
                {vars.map(v => (
                  <Button key={v.key} variant="outline" size="sm"
                    className="h-7 text-xs font-mono bg-amber-50 border-amber-200 hover:bg-amber-100 text-amber-800"
                    onClick={() => insertVariable(v.key)}
                  >
                    {`{{${v.key}}}`}
                  </Button>
                ))}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="space-y-1.5">
        <Label className="text-sm font-medium">Asunto</Label>
        <Input ref={subjectRef} value={subject} onChange={e => setSubject(e.target.value)}
          onFocus={() => setLastFocused('subject')} placeholder="Seguimiento — {{company}}" className="font-mono text-sm" />
      </div>

      <div className="space-y-1.5">
        <Label className="text-sm font-medium">Cuerpo del follow up</Label>
        <textarea ref={bodyRef} value={body} onChange={e => setBody(e.target.value)}
          onFocus={() => setLastFocused('body')} rows={14}
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm font-mono ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-y"
          placeholder={`Hola {{first_name}},\n\nHan pasado {{dias_desde_primer_envio}} días desde nuestro contacto inicial sobre {{company}}...\n\nUn saludo,\n{{firmante_nombre}}`}
        />
      </div>

      <div className="flex items-center gap-2">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Mail className="h-4 w-4 mr-2" />}
          Guardar template
        </Button>
        <Button variant="outline" onClick={() => setShowPreview(true)} disabled={!previewCompany}>
          <Eye className="h-4 w-4 mr-2" />Previsualizar
        </Button>
      </div>

      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Previsualización — {previewCompany?.client_company || 'N/A'}</DialogTitle>
            <DialogDescription>Vista previa del follow up (incluye firma)</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <span className="text-xs font-medium text-muted-foreground">Asunto:</span>
              <p className="text-sm font-medium">{resolvePreview(subject)}</p>
            </div>
            <div className="border rounded-md p-4 bg-white">
              <pre className="text-sm whitespace-pre-wrap font-sans">{resolvePreview(body)}</pre>
              {signatureHtml && (
                <>
                  <hr className="my-4 border-t border-gray-200" />
                  <div dangerouslySetInnerHTML={{ __html: signatureHtml }} />
                </>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Signature Section ──────────────────────────────────────────────────

function SignatureSection() {
  const { signature, isLoading } = useEmailSignature();
  if (isLoading) return <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>;
  const previewHtml = signature?.html_preview || generateSignatureHtml({ ...DEFAULT_SIGNATURE, full_name: signature?.full_name || '' });
  return (
    <Card>
      <CardHeader className="py-3"><CardTitle className="text-sm font-medium">Firma actual</CardTitle></CardHeader>
      <CardContent>
        <div className="border rounded-md p-4 bg-white">
          <div className="text-sm text-muted-foreground italic mb-3">[...cuerpo del follow up...]</div>
          <hr className="my-3 border-t border-gray-200" />
          <div dangerouslySetInnerHTML={{ __html: previewHtml }} />
        </div>
        <p className="text-xs text-muted-foreground mt-3">
          La firma se aplica automáticamente al enviar. Para editarla, ve a{' '}
          <a href="/admin/configuracion/firma" className="text-primary underline">Configuración → Firma</a>.
        </p>
      </CardContent>
    </Card>
  );
}

// ─── Seguimiento Badge for Follow Up ────────────────────────────────────
function FUSeguimientoBadge({
  company,
  campaignId,
  onChanged,
}: {
  company: CampaignCompany;
  campaignId: string;
  onChanged: () => void;
}) {
  const [saving, setSaving] = useState(false);
  const queryClient = useQueryClient();
  const current = getSeguimientoOption(company.seguimiento_estado);

  const handleChange = useCallback(async (newValue: string) => {
    if (newValue === (company.seguimiento_estado || 'sin_respuesta')) return;
    setSaving(true);
    try {
      // 1. Update seguimiento_estado
      const { error } = await (supabase as any)
        .from('valuation_campaign_companies')
        .update({ seguimiento_estado: newValue })
        .eq('id', company.id);
      if (error) throw error;

      // 2. If no longer sin_respuesta, cancel all pending sends for this company
      if (newValue !== 'sin_respuesta') {
        await (supabase as any)
          .from('campaign_followup_sends')
          .update({ status: 'cancelled' })
          .eq('campaign_id', campaignId)
          .eq('company_id', company.id)
          .eq('status', 'pending');
      }

      // 3. Invalidate all relevant caches
      queryClient.invalidateQueries({ queryKey: ['valuation-campaign-companies', campaignId] });
      queryClient.invalidateQueries({ queryKey: ['followup-sends', campaignId] });
      onChanged();
    } catch (e: any) {
      toast.error('Error al guardar seguimiento: ' + e.message);
    } finally {
      setSaving(false);
    }
  }, [company.id, company.seguimiento_estado, campaignId, queryClient, onChanged]);

  return (
    <div className="flex items-center justify-center" onClick={e => e.stopPropagation()}>
      {saving ? (
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      ) : (
        <Select value={company.seguimiento_estado || 'sin_respuesta'} onValueChange={handleChange}>
          <SelectTrigger className={cn(
            "h-7 text-[10px] font-medium px-2 py-0 border rounded-full w-auto min-w-[110px] gap-1",
            current.className
          )}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SEGUIMIENTO_OPTIONS.map(opt => (
              <SelectItem key={opt.value} value={opt.value} className="text-xs">
                <span className="flex items-center gap-1.5">
                  <span className={cn("w-2 h-2 rounded-full", {
                    'bg-muted-foreground': opt.value === 'sin_respuesta',
                    'bg-emerald-500': opt.value === 'interesado',
                    'bg-red-400': opt.value === 'no_interesado',
                    'bg-violet-500': opt.value === 'reunion_agendada',
                  })} />
                  {opt.label}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}

// ─── Notes Popover for Follow Up ────────────────────────────────────────
function FUNotasPopover({ company, campaignId }: { company: CampaignCompany; campaignId: string }) {
  const [open, setOpen] = useState(false);
  const [notes, setNotes] = useState(company.seguimiento_notas || '');
  const [saving, setSaving] = useState(false);
  const queryClient = useQueryClient();
  const hasNotes = !!(company.seguimiento_notas && company.seguimiento_notas.trim());

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      const { error } = await (supabase as any)
        .from('valuation_campaign_companies')
        .update({ seguimiento_notas: notes })
        .eq('id', company.id);
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ['valuation-campaign-companies', campaignId] });
      toast.success('Notas guardadas');
      setOpen(false);
    } catch (e: any) {
      toast.error('Error al guardar notas: ' + e.message);
    } finally {
      setSaving(false);
    }
  }, [notes, company.id, campaignId, queryClient]);

  return (
    <Popover open={open} onOpenChange={(o) => { setOpen(o); if (o) setNotes(company.seguimiento_notas || ''); }}>
      <PopoverTrigger asChild>
        <button
          onClick={e => e.stopPropagation()}
          className="relative p-1 rounded hover:bg-muted/50 transition-colors"
          title={hasNotes ? 'Ver/editar notas' : 'Añadir nota'}
        >
          <MessageCircle className={cn("h-4 w-4", hasNotes ? 'text-primary' : 'text-muted-foreground')} />
          {hasNotes && (
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-primary" />
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-3" align="end" onClick={e => e.stopPropagation()}>
        <p className="text-xs font-medium text-muted-foreground mb-2">Notas — {company.client_company}</p>
        <Textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Escribe notas sobre esta empresa..."
          className="text-sm min-h-[80px] resize-none"
        />
        <div className="flex justify-end mt-2">
          <Button size="sm" onClick={handleSave} disabled={saving} className="text-xs h-7">
            {saving ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : null}
            Guardar notas
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

// ─── Send List ──────────────────────────────────────────────────────────

function SendList({
  sequence,
  campaign,
  campaignId,
  companies,
  sends,
  emailSentMap,
  onSend,
  isSendingOne,
  onSeguimientoChanged,
}: {
  sequence: FollowupSequence;
  campaign: ValuationCampaign;
  campaignId: string;
  companies: CampaignCompany[];
  sends: FollowupSend[];
  emailSentMap: Map<string, string | null>;
  onSend: (company: CampaignCompany) => Promise<void>;
  isSendingOne: boolean;
  onSeguimientoChanged: () => void;
}) {
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [showConfirmAll, setShowConfirmAll] = useState(false);
  const [bulkProgress, setBulkProgress] = useState<{ sent: number; total: number } | null>(null);

  const sendMap = useMemo(() => {
    const m = new Map<string, FollowupSend>();
    for (const s of sends) {
      if (s.sequence_id === sequence.id) m.set(s.company_id, s);
    }
    return m;
  }, [sends, sequence.id]);

  // Visible: sin_respuesta OR has any send record in THIS round (so they stay visible after status change)
  const visible = companies.filter(c => {
    const isSinRespuesta = (c.seguimiento_estado || 'sin_respuesta') === 'sin_respuesta';
    const hasRoundRecord = sendMap.has(c.id);
    return isSinRespuesta || hasRoundRecord;
  });
  const excluded = companies.length - visible.length;

  // Only sin_respuesta AND not yet sent in this round can receive email
  const pendingCompanies = visible.filter(c => {
    const isSinRespuesta = (c.seguimiento_estado || 'sin_respuesta') === 'sin_respuesta';
    const s = sendMap.get(c.id);
    return isSinRespuesta && (!s || s.status !== 'sent');
  });

  const handleSendOne = async (company: CampaignCompany) => {
    setSendingId(company.id);
    try { await onSend(company); } finally { setSendingId(null); }
  };

  const handleSendAll = async () => {
    setShowConfirmAll(false);
    const toSend = [...pendingCompanies];
    setBulkProgress({ sent: 0, total: toSend.length });

    let sentCount = 0;
    let failedCount = 0;

    for (const company of toSend) {
      try {
        await onSend(company);
        sentCount++;
      } catch {
        failedCount++;
      }
      setBulkProgress({ sent: sentCount + failedCount, total: toSend.length });
    }

    setBulkProgress(null);
    if (sentCount > 0) toast.success(`${sentCount} follow ups enviados`);
    if (failedCount > 0) toast.error(`${failedCount} fallaron`);
  };

  return (
    <div className="space-y-4">
      <div className="p-3 rounded-lg border bg-blue-50 border-blue-200 text-sm">
        <p className="font-medium text-blue-800">
          Se enviará este follow up a <strong>{pendingCompanies.length}</strong> empresa(s) pendiente(s).
          Se han excluido <strong>{excluded}</strong> empresa(s) que ya respondieron.
        </p>
      </div>

      {bulkProgress && (
        <div className="p-3 rounded-lg border bg-amber-50 border-amber-200 text-sm">
          <p className="font-medium text-amber-800 flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Enviando... {bulkProgress.sent} de {bulkProgress.total}
          </p>
        </div>
      )}

      {pendingCompanies.length > 0 && !bulkProgress && (
        <Button onClick={() => setShowConfirmAll(true)} disabled={isSendingOne}>
          <Send className="h-4 w-4 mr-2" />
          Enviar todos los pendientes de "{sequence.label}" ({pendingCompanies.length})
        </Button>
      )}

      {visible.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground text-sm">No hay empresas elegibles (sin respuesta).</div>
      ) : (
        <div className="border rounded-lg overflow-auto max-h-[55vh]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">#</TableHead>
                <TableHead>Empresa</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Valoración</TableHead>
                <TableHead className="text-center">Seguimiento</TableHead>
                <TableHead className="text-center">Estado envío</TableHead>
                <TableHead className="w-[100px]">Acción</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visible.map((c, i) => {
                const send = sendMap.get(c.id);
                const isSent = send?.status === 'sent';
                const isError = send?.status === 'error';
                const isSending = sendingId === c.id;
                const isSinRespuesta = (c.seguimiento_estado || 'sin_respuesta') === 'sin_respuesta';
                const canSend = isSinRespuesta && !isSent;
                return (
                  <TableRow key={c.id}>
                    <TableCell className="text-xs text-muted-foreground">{i + 1}</TableCell>
                    <TableCell className="font-medium text-sm max-w-[180px] truncate">{c.client_company}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{c.client_email || '—'}</TableCell>
                    <TableCell className="text-sm">{c.valuation_central ? formatCurrencyEUR(c.valuation_central) : '—'}</TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-1">
                        <FUSeguimientoBadge company={c} campaignId={campaignId} onChanged={onSeguimientoChanged} />
                        <FUNotasPopover company={c} campaignId={campaignId} />
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      {isSent ? (
                        <div>
                          <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">Enviado</Badge>
                          {send?.sent_at && <p className="text-[10px] text-muted-foreground mt-0.5">{new Date(send.sent_at).toLocaleDateString('es-ES')}</p>}
                        </div>
                      ) : isError ? (
                        <Badge variant="secondary" className="text-xs bg-red-100 text-red-800" title={send?.error_message || ''}>Error</Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs bg-muted text-muted-foreground">Pendiente</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button size="sm" variant={isSent ? 'ghost' : 'outline'} className="h-7 text-xs"
                        disabled={isSent || isSending || !!bulkProgress} onClick={() => handleSendOne(c)}>
                        {isSending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3 mr-1" />}
                        {isSent ? 'Enviado' : 'Enviar'}
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      <AlertDialog open={showConfirmAll} onOpenChange={setShowConfirmAll}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Enviar {pendingCompanies.length} follow ups</AlertDialogTitle>
            <AlertDialogDescription>
              Se enviará "{sequence.label}" a {pendingCompanies.length} empresas sin respuesta. ¿Continuar?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleSendAll}>Enviar todos</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────

export function FollowUpStep({ campaignId, campaign }: Props) {
  const { companies } = useCampaignCompanies(campaignId);
  const { emails } = useCampaignEmails(campaignId);
  const {
    sequences, allSends, loadingSeqs, addSequence, isAdding,
    updateSequence, deleteSequence, sendOne, isSendingOne, invalidate,
  } = useFollowupSequences(campaignId);

  const { signature } = useEmailSignature();
  const signatureHtml = signature?.html_preview || generateSignatureHtml({ ...DEFAULT_SIGNATURE, full_name: signature?.full_name || '' });

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [subTab, setSubTab] = useState('template');
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [editingLabel, setEditingLabel] = useState<string | null>(null);
  const [labelDraft, setLabelDraft] = useState('');

  // Auto-select first sequence
  const selectedSeq = sequences.find(s => s.id === selectedId) || sequences[0] || null;
  const activeId = selectedSeq?.id || null;

  const emailSentMap = useMemo(() => {
    const m = new Map<string, string | null>();
    for (const e of emails) m.set(e.company_id, e.sent_at);
    return m;
  }, [emails]);

  // Status badge per sequence
  function seqStatus(seq: FollowupSequence) {
    const roundSends = allSends.filter(s => s.sequence_id === seq.id);
    if (roundSends.length === 0) return null;
    const eligible = companies.filter(c => (c.seguimiento_estado || 'sin_respuesta') === 'sin_respuesta');
    const sentAll = eligible.every(c => roundSends.some(s => s.company_id === c.id && s.status === 'sent'));
    if (sentAll && eligible.length > 0) return 'done';
    return 'pending';
  }

  function canDelete(seq: FollowupSequence) {
    return !allSends.some(s => s.sequence_id === seq.id && s.status === 'sent');
  }

  const handleAdd = async () => {
    try {
      const newSeq = await addSequence();
      setSelectedId(newSeq.id);
    } catch {}
  };

  const handleSaveTemplate = async (subject: string, body: string) => {
    if (!activeId) return;
    await updateSequence({ id: activeId, subject, body_html: body });
  };

  const handleSendCompany = async (company: CampaignCompany) => {
    if (!selectedSeq) return;
    await sendOne({
      sequence: selectedSeq,
      company,
      campaign,
      emailSentAt: emailSentMap.get(company.id) || null,
    });
    invalidate();
  };

  const handleLabelSave = async (seqId: string) => {
    await updateSequence({ id: seqId, label: labelDraft });
    setEditingLabel(null);
  };

  if (loadingSeqs) {
    return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }

  // Empty state
  if (sequences.length === 0) {
    return (
      <div className="text-center py-16 space-y-4">
        <Mail className="h-12 w-12 mx-auto text-muted-foreground/40" />
        <h3 className="text-lg font-medium">No hay rondas de follow up</h3>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          Crea la primera ronda para empezar a enviar seguimientos a las empresas que no han respondido.
        </p>
        <Button onClick={handleAdd} disabled={isAdding}>
          {isAdding ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
          Crear primer follow up
        </Button>
      </div>
    );
  }

  return (
    <div className="flex gap-4 min-h-[500px]">
      {/* Sidebar */}
      <div className="w-56 shrink-0 border rounded-lg p-2 space-y-1 bg-muted/20">
        <p className="text-xs font-semibold text-muted-foreground px-2 py-1 uppercase tracking-wide">Rondas</p>
        {sequences.map(seq => {
          const status = seqStatus(seq);
          const active = seq.id === activeId;
          return (
            <div key={seq.id}
              className={cn(
                'flex items-center gap-1 px-2 py-1.5 rounded-md cursor-pointer text-sm transition-colors',
                active ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted/50'
              )}
              onClick={() => { setSelectedId(seq.id); setSubTab('template'); }}
            >
              <div className="flex-1 min-w-0">
                {editingLabel === seq.id ? (
                  <Input value={labelDraft} onChange={e => setLabelDraft(e.target.value)}
                    onBlur={() => handleLabelSave(seq.id)}
                    onKeyDown={e => e.key === 'Enter' && handleLabelSave(seq.id)}
                    className="h-6 text-xs px-1" autoFocus
                    onClick={e => e.stopPropagation()} />
                ) : (
                  <span className="truncate block" onDoubleClick={(e) => {
                    e.stopPropagation();
                    setEditingLabel(seq.id);
                    setLabelDraft(seq.label);
                  }}>{seq.label}</span>
                )}
              </div>
              {status === 'done' && <CheckCircle2 className="h-3.5 w-3.5 text-green-600 shrink-0" />}
              {status === 'pending' && <AlertCircle className="h-3.5 w-3.5 text-amber-500 shrink-0" />}
              <button
                className={cn('p-0.5 rounded hover:bg-destructive/10', !canDelete(seq) && 'opacity-30 cursor-not-allowed')}
                onClick={e => { e.stopPropagation(); if (canDelete(seq)) setDeleteTarget(seq.id); }}
                disabled={!canDelete(seq)}
                title={canDelete(seq) ? 'Eliminar ronda' : 'No se puede eliminar (tiene envíos)'}
              >
                <Trash2 className="h-3.5 w-3.5 text-destructive" />
              </button>
            </div>
          );
        })}
        <Button variant="ghost" size="sm" className="w-full justify-start text-xs mt-1" onClick={handleAdd} disabled={isAdding}>
          <Plus className="h-3.5 w-3.5 mr-1" />{isAdding ? 'Creando...' : 'Añadir follow up'}
        </Button>
      </div>

      {/* Main Panel */}
      <div className="flex-1 min-w-0">
        {selectedSeq && (
          <Tabs value={subTab} onValueChange={setSubTab} className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="template">Template</TabsTrigger>
              <TabsTrigger value="firma">Firma</TabsTrigger>
              <TabsTrigger value="lista">Lista de envíos</TabsTrigger>
            </TabsList>

            <TabsContent value="template">
              <TemplateEditor
                sequence={selectedSeq}
                campaign={campaign}
                companies={companies}
                emailSentMap={emailSentMap}
                onSave={handleSaveTemplate}
                signatureHtml={signatureHtml}
              />
            </TabsContent>

            <TabsContent value="firma">
              <SignatureSection />
            </TabsContent>

            <TabsContent value="lista">
              <SendList
                sequence={selectedSeq}
                campaign={campaign}
                campaignId={campaignId}
                companies={companies}
                sends={allSends}
                emailSentMap={emailSentMap}
                onSend={handleSendCompany}
                isSendingOne={isSendingOne}
                onSeguimientoChanged={invalidate}
              />
            </TabsContent>
          </Tabs>
        )}
      </div>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar ronda</AlertDialogTitle>
            <AlertDialogDescription>Se eliminará esta ronda y todos sus registros pendientes. ¿Continuar?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={async () => {
              if (deleteTarget) {
                await deleteSequence(deleteTarget);
                if (selectedId === deleteTarget) setSelectedId(null);
              }
              setDeleteTarget(null);
            }}>Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
