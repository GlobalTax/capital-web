import { useState, useRef, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Send, Loader2, Eye, Mail, Edit3, Pen, CheckCircle2, Clock, AlertCircle, RefreshCw,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCampaignCompanies, CampaignCompany } from '@/hooks/useCampaignCompanies';
import { useCampaignEmails, CampaignEmail } from '@/hooks/useCampaignEmails';
import { useCampaignFollowups } from '@/hooks/useCampaignFollowups';
import { ValuationCampaign } from '@/hooks/useCampaigns';
import { getAvailableVariables, replaceVariables } from '@/utils/campaignEmailTemplateEngine';
import { useEmailSignature, DEFAULT_SIGNATURE, generateSignatureHtml } from '@/hooks/useEmailSignature';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { toast } from 'sonner';
import { formatCurrencyEUR } from '@/utils/professionalValuationCalculation';

interface Props {
  campaignId: string;
  campaign: ValuationCampaign;
}

// ─── Follow Up Template Editor ──────────────────────────────────────────
function FollowUpTemplateSection({
  campaignId,
  campaign,
  companies,
  emails,
  followups,
  isGenerating,
  onSaveAndGenerate,
  signatureHtml,
}: {
  campaignId: string;
  campaign: ValuationCampaign;
  companies: CampaignCompany[];
  emails: CampaignEmail[];
  followups: any[];
  isGenerating: boolean;
  onSaveAndGenerate: (subject: string, body: string) => Promise<void>;
  signatureHtml: string | null;
}) {
  const [subject, setSubject] = useState(
    (campaign as any).followup_subject_template || 'Seguimiento — {{company}}'
  );
  const [body, setBody] = useState(
    (campaign as any).followup_body_template || ''
  );
  const [showPreview, setShowPreview] = useState(false);
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const subjectRef = useRef<HTMLInputElement>(null);
  const [lastFocused, setLastFocused] = useState<'subject' | 'body'>('body');

  // All variables including the new one
  const variables = [
    ...getAvailableVariables(),
    { key: 'dias_desde_envio', label: 'Días desde envío', category: 'Follow Up' },
  ];

  const eligibleCompanies = companies.filter(c => {
    const estado = c.seguimiento_estado || 'sin_respuesta';
    return estado === 'sin_respuesta' && !(c as any).followup_enviado;
  });

  const excludedCount = companies.length - eligibleCompanies.length;

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

  // Preview with first eligible company
  const emailMap = new Map(emails.map(e => [e.company_id, e]));
  const previewCompany = eligibleCompanies[0];
  const previewEmailSentAt = previewCompany ? emailMap.get(previewCompany.id)?.sent_at || null : null;

  let previewSubject = subject;
  let previewBody = body;
  if (previewCompany) {
    previewSubject = replaceVariables(subject, previewCompany, campaign)
      .replace(/\{\{dias_desde_envio\}\}/g, previewEmailSentAt
        ? String(Math.max(1, Math.floor((Date.now() - new Date(previewEmailSentAt).getTime()) / 86400000)))
        : 'varios'
      );
    previewBody = replaceVariables(body, previewCompany, campaign)
      .replace(/\{\{dias_desde_envio\}\}/g, previewEmailSentAt
        ? String(Math.max(1, Math.floor((Date.now() - new Date(previewEmailSentAt).getTime()) / 86400000)))
        : 'varios'
      );
  }

  const categories = variables.reduce((acc, v) => {
    if (!acc[v.category]) acc[v.category] = [];
    acc[v.category].push(v);
    return acc;
  }, {} as Record<string, typeof variables>);

  return (
    <div className="space-y-4">
      {/* Eligibility notice */}
      <div className="p-3 rounded-lg border bg-blue-50 border-blue-200 text-sm">
        <p className="font-medium text-blue-800">
          Se enviará el follow up a <strong>{eligibleCompanies.length}</strong> empresa(s).
          Se han excluido <strong>{excludedCount}</strong> empresa(s)
          {' '}(interesadas, no interesadas, con reunión agendada o ya con follow up enviado).
        </p>
      </div>

      {/* Variable buttons */}
      <Card>
        <CardHeader className="py-3">
          <CardTitle className="text-sm font-medium">Variables disponibles</CardTitle>
        </CardHeader>
        <CardContent className="pb-3">
          <div className="space-y-2">
            {Object.entries(categories).map(([cat, vars]) => (
              <div key={cat} className="flex flex-wrap items-center gap-1.5">
                <span className="text-xs text-muted-foreground font-medium w-20">{cat}:</span>
                {vars.map(v => (
                  <Button
                    key={v.key}
                    variant="outline"
                    size="sm"
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

      {/* Subject */}
      <div className="space-y-1.5">
        <Label className="text-sm font-medium">Asunto</Label>
        <Input
          ref={subjectRef}
          value={subject}
          onChange={e => setSubject(e.target.value)}
          onFocus={() => setLastFocused('subject')}
          placeholder="Seguimiento — {{company}}"
          className="font-mono text-sm"
        />
      </div>

      {/* Body */}
      <div className="space-y-1.5">
        <Label className="text-sm font-medium">Cuerpo del follow up</Label>
        <textarea
          ref={bodyRef}
          value={body}
          onChange={e => setBody(e.target.value)}
          onFocus={() => setLastFocused('body')}
          rows={14}
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm font-mono ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-y"
          placeholder={`Hola {{first_name}},\n\nHan pasado {{dias_desde_envio}} días desde que le enviamos nuestra valoración de {{company}}...\n\nQuedamos a su disposición.\n\nUn saludo,\n{{firmante_nombre}}`}
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <Button onClick={() => onSaveAndGenerate(subject, body)} disabled={isGenerating || eligibleCompanies.length === 0}>
          {isGenerating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Mail className="h-4 w-4 mr-2" />}
          Guardar template y generar follow ups ({eligibleCompanies.length})
        </Button>
        <Button variant="outline" onClick={() => setShowPreview(true)} disabled={!previewCompany}>
          <Eye className="h-4 w-4 mr-2" />Previsualizar
        </Button>
      </div>

      {/* Preview modal */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Previsualización — {previewCompany?.client_company || 'N/A'}</DialogTitle>
            <DialogDescription>Vista previa del follow up (incluye firma)</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <span className="text-xs font-medium text-muted-foreground">Asunto:</span>
              <p className="text-sm font-medium">{previewSubject}</p>
            </div>
            <div className="border rounded-md p-4 bg-white">
              <pre className="text-sm whitespace-pre-wrap font-sans">{previewBody}</pre>
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

// ─── Signature Section (read-only, same as Mail) ────────────────────────
function FollowUpSignatureSection() {
  const { signature, isLoading } = useEmailSignature();

  if (isLoading) {
    return <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>;
  }

  const previewHtml = signature?.html_preview || generateSignatureHtml({
    ...DEFAULT_SIGNATURE,
    full_name: signature?.full_name || '',
  });

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="py-3">
          <CardTitle className="text-sm font-medium">Firma actual</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border rounded-md p-4 bg-white">
            <div className="text-sm text-muted-foreground italic mb-3">[...cuerpo del follow up...]</div>
            <hr className="my-3 border-t border-gray-200" />
            <div dangerouslySetInnerHTML={{ __html: previewHtml }} />
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            La firma se aplica automáticamente al enviar. Para editarla, ve al{' '}
            <a href="/admin/campanas-valoracion" className="text-primary underline">tab Mail → Firma</a>.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Follow Up List ─────────────────────────────────────────────────────
function FollowUpListSection({
  companies,
  followups,
  onSendFollowup,
  onSendAll,
  isSendingAll,
}: {
  companies: CampaignCompany[];
  followups: any[];
  onSendFollowup: (id: string) => Promise<void>;
  onSendAll: () => Promise<void>;
  isSendingAll: boolean;
}) {
  const [showSendAllConfirm, setShowSendAllConfirm] = useState(false);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const followupMap = new Map(followups.map((f: any) => [f.company_id, f]));

  const eligibleCompanies = companies.filter(c => {
    const estado = c.seguimiento_estado || 'sin_respuesta';
    return estado === 'sin_respuesta';
  });

  const totalFollowups = followups.length;
  const sentCount = followups.filter((f: any) => f.status === 'sent').length;
  const pendingCount = followups.filter((f: any) => f.status === 'pending').length;
  const errorCount = followups.filter((f: any) => f.status === 'error').length;

  const handleSendOne = async (id: string) => {
    setSendingId(id);
    try {
      await onSendFollowup(id);
    } finally {
      setSendingId(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card><CardContent className="p-3 text-center">
          <p className="text-2xl font-bold">{totalFollowups}</p>
          <p className="text-xs text-muted-foreground">Follow ups generados</p>
        </CardContent></Card>
        <Card><CardContent className="p-3 text-center">
          <p className="text-2xl font-bold text-green-600">{sentCount}</p>
          <p className="text-xs text-muted-foreground">Enviados</p>
        </CardContent></Card>
        <Card><CardContent className="p-3 text-center">
          <p className="text-2xl font-bold text-amber-600">{pendingCount}</p>
          <p className="text-xs text-muted-foreground">Pendientes</p>
        </CardContent></Card>
        <Card><CardContent className="p-3 text-center">
          <p className="text-2xl font-bold text-red-600">{errorCount}</p>
          <p className="text-xs text-muted-foreground">Errores</p>
        </CardContent></Card>
      </div>

      {/* Send all button */}
      {pendingCount > 0 && (
        <Button onClick={() => setShowSendAllConfirm(true)} disabled={isSendingAll}>
          {isSendingAll ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
          Enviar todos los follow ups pendientes ({pendingCount})
        </Button>
      )}

      {totalFollowups === 0 && (
        <div className="text-center py-10 text-muted-foreground">
          <RefreshCw className="h-8 w-8 mx-auto mb-2 opacity-40" />
          <p className="text-sm">No hay follow ups generados todavía.</p>
          <p className="text-xs">Ve al sub-tab "Template" para crear el template y generar los follow ups.</p>
        </div>
      )}

      {/* Table */}
      {totalFollowups > 0 && (
        <div className="border rounded-lg overflow-auto max-h-[55vh]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">#</TableHead>
                <TableHead>Empresa</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Valoración</TableHead>
                <TableHead className="text-center">Seguimiento</TableHead>
                <TableHead>Asunto</TableHead>
                <TableHead className="text-center">Estado</TableHead>
                <TableHead className="w-[100px]">Acción</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {eligibleCompanies.map((c, i) => {
                const followup = followupMap.get(c.id);
                if (!followup) return null;
                const isSent = followup.status === 'sent';
                const isError = followup.status === 'error';
                const isSending = sendingId === followup.id;

                return (
                  <TableRow key={c.id}>
                    <TableCell className="text-xs text-muted-foreground">{i + 1}</TableCell>
                    <TableCell className="font-medium text-sm max-w-[180px] truncate">{c.client_company}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{c.client_email || '—'}</TableCell>
                    <TableCell className="text-sm">{c.valuation_central ? formatCurrencyEUR(c.valuation_central) : '—'}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary" className="text-[10px] bg-muted text-muted-foreground">
                        {c.seguimiento_estado === 'sin_respuesta' || !c.seguimiento_estado ? 'Sin respuesta' : c.seguimiento_estado}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs max-w-[200px] truncate">{followup.subject}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary" className={cn('text-xs',
                        isSent && 'bg-green-100 text-green-800',
                        followup.status === 'pending' && 'bg-blue-100 text-blue-800',
                        isError && 'bg-red-100 text-red-800',
                      )}>
                        {isSent ? 'Enviado' : isError ? 'Error' : 'Pendiente'}
                      </Badge>
                      {isSent && followup.sent_at && (
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          {new Date(followup.sent_at).toLocaleDateString('es-ES')}
                        </p>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant={isSent ? 'ghost' : 'outline'}
                        className="h-7 text-xs"
                        disabled={isSent || isSending}
                        onClick={() => handleSendOne(followup.id)}
                      >
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

      {/* Send all confirm */}
      <AlertDialog open={showSendAllConfirm} onOpenChange={setShowSendAllConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Enviar {pendingCount} follow ups pendientes</AlertDialogTitle>
            <AlertDialogDescription>
              Se enviarán los follow ups a las empresas sin respuesta. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={async () => {
              setShowSendAllConfirm(false);
              await onSendAll();
            }}>
              Enviar todos
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ─── Main FollowUpStep ──────────────────────────────────────────────────
export function FollowUpStep({ campaignId, campaign }: Props) {
  const { companies } = useCampaignCompanies(campaignId);
  const { emails } = useCampaignEmails(campaignId);
  const {
    followups, isLoading, saveTemplate, generateFollowups, isGenerating,
    sendFollowup, sendAllPending, isSendingAll,
  } = useCampaignFollowups(campaignId);
  const { signature } = useEmailSignature();

  const signatureHtml = signature?.html_preview || generateSignatureHtml({
    ...DEFAULT_SIGNATURE,
    full_name: signature?.full_name || '',
  });

  const handleSaveAndGenerate = async (subject: string, body: string) => {
    try {
      await saveTemplate({ subject, body });
    } catch (error: any) {
      toast.error(error?.message || 'Error al guardar template');
    }

    try {
      await generateFollowups({
        subjectTemplate: subject,
        bodyTemplate: body,
        companies,
        campaign,
        emails: emails.map(e => ({ company_id: e.company_id, sent_at: e.sent_at })),
      });
    } catch (error: any) {
      toast.error(error?.message || 'Error al generar follow ups');
    }
  };

  return (
    <Tabs defaultValue="template" className="space-y-4">
      <TabsList>
        <TabsTrigger value="template">
          <Edit3 className="h-3.5 w-3.5 mr-1.5" />Template
        </TabsTrigger>
        <TabsTrigger value="signature">
          <Pen className="h-3.5 w-3.5 mr-1.5" />Firma
        </TabsTrigger>
        <TabsTrigger value="list">
          <Mail className="h-3.5 w-3.5 mr-1.5" />Lista de follow ups
          {followups.length > 0 && (
            <Badge variant="secondary" className="ml-1.5 text-xs">{followups.length}</Badge>
          )}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="template">
        <FollowUpTemplateSection
          campaignId={campaignId}
          campaign={campaign}
          companies={companies}
          emails={emails}
          followups={followups}
          isGenerating={isGenerating}
          onSaveAndGenerate={handleSaveAndGenerate}
          signatureHtml={signatureHtml}
        />
      </TabsContent>

      <TabsContent value="signature">
        <FollowUpSignatureSection />
      </TabsContent>

      <TabsContent value="list">
        <FollowUpListSection
          companies={companies}
          followups={followups}
          onSendFollowup={sendFollowup}
          onSendAll={async () => { await sendAllPending(undefined); }}
          isSendingAll={isSendingAll}
        />
      </TabsContent>
    </Tabs>
  );
}
