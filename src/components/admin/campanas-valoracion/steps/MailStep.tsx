import { useState, useRef, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Send, Loader2, Eye, Mail, MoreVertical, FileText, CheckCircle2, Clock, AlertCircle,
  Edit3, RotateCcw, Building2, Save, Upload, Pen,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCampaignCompanies, CampaignCompany } from '@/hooks/useCampaignCompanies';
import { useCampaignPresentations } from '@/hooks/useCampaignPresentations';
import { useCampaignEmails, CampaignEmail } from '@/hooks/useCampaignEmails';
import { ValuationCampaign } from '@/hooks/useCampaigns';
import { getAvailableVariables, replaceVariables } from '@/utils/campaignEmailTemplateEngine';
import { useEmailSignature, DEFAULT_SIGNATURE, generateSignatureHtml, EmailSignatureData } from '@/hooks/useEmailSignature';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface Props {
  campaignId: string;
  campaign: ValuationCampaign;
}

// ─── Template Editor Tab ────────────────────────────────────────────────
function TemplateEditorSection({
  campaignId,
  campaign,
  companies,
  emails,
  isGenerating,
  onSaveTemplate,
  onGenerateEmails,
  signatureHtml,
  signature,
}: {
  campaignId: string;
  campaign: ValuationCampaign;
  companies: CampaignCompany[];
  emails: CampaignEmail[];
  isGenerating: boolean;
  onSaveTemplate: (subject: string, body: string) => Promise<void>;
  onGenerateEmails: (subject: string, body: string, overwriteManual: boolean) => Promise<void>;
  signatureHtml: string | null;
  signature: EmailSignatureData | null;
}) {
  const [subject, setSubject] = useState((campaign as any).email_subject_template || '');
  const [body, setBody] = useState((campaign as any).email_body_template || '');
  const [showOverwriteWarning, setShowOverwriteWarning] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const subjectRef = useRef<HTMLInputElement>(null);
  const [lastFocused, setLastFocused] = useState<'subject' | 'body'>('body');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-save template with debounce
  const triggerAutoSave = useCallback((newSubject: string, newBody: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      if (!newSubject.trim() && !newBody.trim()) return;
      setSaveStatus('saving');
      try {
        await onSaveTemplate(newSubject, newBody);
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 2000);
      } catch {
        setSaveStatus('idle');
      }
    }, 1500);
  }, [onSaveTemplate]);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, []);

  const handleSubjectChange = useCallback((val: string) => {
    setSubject(val);
    triggerAutoSave(val, body);
  }, [body, triggerAutoSave]);

  const handleBodyChange = useCallback((val: string) => {
    setBody(val);
    triggerAutoSave(subject, val);
  }, [subject, triggerAutoSave]);

  const variables = getAvailableVariables();
  const manuallyEdited = emails.filter(e => e.is_manually_edited).length;

  const insertVariable = useCallback((key: string) => {
    const tag = `{{${key}}}`;
    if (lastFocused === 'subject' && subjectRef.current) {
      const el = subjectRef.current;
      const start = el.selectionStart || 0;
      const end = el.selectionEnd || 0;
      const newVal = subject.slice(0, start) + tag + subject.slice(end);
      setSubject(newVal);
      setTimeout(() => {
        el.focus();
        el.setSelectionRange(start + tag.length, start + tag.length);
      }, 0);
    } else if (bodyRef.current) {
      const el = bodyRef.current;
      const start = el.selectionStart || 0;
      const end = el.selectionEnd || 0;
      const newVal = body.slice(0, start) + tag + body.slice(end);
      setBody(newVal);
      setTimeout(() => {
        el.focus();
        el.setSelectionRange(start + tag.length, start + tag.length);
      }, 0);
    }
  }, [lastFocused, subject, body]);

  const handleGenerate = async () => {
    if (!subject.trim() && !body.trim()) {
      toast.error('Escribe al menos un asunto o cuerpo');
      return;
    }
    if (manuallyEdited > 0) {
      setShowOverwriteWarning(true);
    } else {
      await onGenerateEmails(subject, body, true);
    }
  };

  // Resolve preview with signature data for firmante variables
  const previewCompany = companies[0];
  const resolvePreview = useCallback((tpl: string) => {
    if (!tpl) return '';
    let r = previewCompany ? replaceVariables(tpl, previewCompany, campaign) : tpl;
    if (signature) {
      r = r.replace(/\{\{firmante_nombre\}\}/g, signature.full_name || '');
      r = r.replace(/\{\{firmante_cargo\}\}/g, signature.job_title || '');
      r = r.replace(/\{\{firmante_telefono\}\}/g, signature.phone || '');
    }
    return r;
  }, [previewCompany, campaign, signature]);

  const resolvedSubject = resolvePreview(subject);
  const resolvedBody = resolvePreview(body);

  // Group variables by category
  const categories = variables.reduce((acc, v) => {
    if (!acc[v.category]) acc[v.category] = [];
    acc[v.category].push(v);
    return acc;
  }, {} as Record<string, typeof variables>);

  return (
    <div className="space-y-4">
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

      {/* Side-by-side: Editor + Live Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left: Editor */}
        <div className="space-y-3">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Asunto</label>
            <Input
              ref={subjectRef}
              value={subject}
              onChange={e => handleSubjectChange(e.target.value)}
              onFocus={() => setLastFocused('subject')}
              placeholder="Análisis de mercado para {{company}} — {{sector}}"
              className="font-mono text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Cuerpo del email</label>
            <textarea
              ref={bodyRef}
              value={body}
              onChange={e => handleBodyChange(e.target.value)}
              onFocus={() => setLastFocused('body')}
              rows={14}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm font-mono ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-y"
              placeholder={`Hola {{first_name}},\n\nMe llamo {{firmante_nombre}} y...\n\nUn abrazo,\n{{firmante_nombre}}\n{{firmante_cargo}}`}
            />
          </div>

          <div className="flex items-center gap-2">
            <Button onClick={handleGenerate} disabled={isGenerating}>
              {isGenerating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Mail className="h-4 w-4 mr-2" />}
              Generar emails
            </Button>
            {saveStatus === 'saving' && (
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Loader2 className="h-3 w-3 animate-spin" /> Guardando...
              </span>
            )}
            {saveStatus === 'saved' && (
              <span className="text-xs text-green-600 flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" /> Guardado
              </span>
            )}
          </div>
        </div>

        {/* Right: Live Preview */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium flex items-center gap-1.5">
            <Eye className="h-3.5 w-3.5 text-muted-foreground" />
            Vista previa en tiempo real
            {previewCompany && (
              <span className="text-xs font-normal text-muted-foreground">— {previewCompany.client_company}</span>
            )}
          </label>
          <div className="border rounded-md bg-white overflow-hidden">
            <div className="px-4 py-2.5 border-b bg-muted/30">
              <span className="text-xs text-muted-foreground">Asunto:</span>
              <p className="text-sm font-medium truncate">{resolvedSubject || <span className="text-muted-foreground italic">Sin asunto</span>}</p>
            </div>
            <div className="p-4 max-h-[400px] overflow-y-auto">
              {resolvedBody ? (
                <pre className="text-sm whitespace-pre-wrap font-sans leading-relaxed">{resolvedBody}</pre>
              ) : (
                <p className="text-sm text-muted-foreground italic">Escribe el cuerpo del email para ver la vista previa...</p>
              )}
              {signatureHtml && (
                <>
                  <hr className="my-4 border-t border-gray-200" />
                  <div dangerouslySetInnerHTML={{ __html: signatureHtml }} />
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Overwrite warning */}
      <AlertDialog open={showOverwriteWarning} onOpenChange={setShowOverwriteWarning}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Emails editados manualmente</AlertDialogTitle>
            <AlertDialogDescription>
              Hay {manuallyEdited} empresa(s) con emails editados manualmente.
              ¿Deseas regenerar todos los emails o mantener los editados?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <Button
              variant="outline"
              onClick={async () => {
                setShowOverwriteWarning(false);
                await onGenerateEmails(subject, body, false);
              }}
            >
              Mantener editados
            </Button>
            <AlertDialogAction onClick={async () => {
              setShowOverwriteWarning(false);
              await onGenerateEmails(subject, body, true);
            }}>
              Regenerar todos
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ─── Edit Email Dialog ──────────────────────────────────────────────────
function EditEmailDialog({
  email,
  company,
  campaign,
  open,
  onOpenChange,
  onSave,
  onRestore,
  onSend,
}: {
  email: CampaignEmail;
  company: CampaignCompany;
  campaign: ValuationCampaign;
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onSave: (id: string, subject: string, body: string) => Promise<void>;
  onRestore: (emailId: string, company: CampaignCompany) => Promise<void>;
  onSend: (id: string) => Promise<void>;
}) {
  const [subject, setSubject] = useState(email.subject);
  const [body, setBody] = useState(email.body);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setSubject(email.subject);
    setBody(email.body);
  }, [email]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            {company.client_company}
          </DialogTitle>
          <DialogDescription>Editar email personalizado</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Asunto</label>
            <Input value={subject} onChange={e => setSubject(e.target.value)} className="text-sm" />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Cuerpo</label>
            <textarea
              value={body}
              onChange={e => setBody(e.target.value)}
              rows={12}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-y"
            />
          </div>
          {email.is_manually_edited && (
            <p className="text-xs text-amber-600">⚠ Este email fue editado manualmente</p>
          )}
        </div>
        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={async () => {
              await onRestore(email.id, company);
              onOpenChange(false);
            }}
          >
            <RotateCcw className="h-3.5 w-3.5 mr-1.5" />Restaurar template
          </Button>
          <div className="flex-1" />
          <Button
            variant="outline"
            size="sm"
            onClick={async () => {
              setSaving(true);
              await onSave(email.id, subject, body);
              setSaving(false);
              onOpenChange(false);
            }}
            disabled={saving}
          >
            {saving ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : null}
            Guardar cambios
          </Button>
          <Button
            size="sm"
            onClick={async () => {
              await onSave(email.id, subject, body);
              await onSend(email.id);
              onOpenChange(false);
            }}
            disabled={email.status === 'sent'}
          >
            <Send className="h-3.5 w-3.5 mr-1.5" />Enviar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Mail List Tab ──────────────────────────────────────────────────────
function MailListSection({
  companies,
  emails,
  campaign,
  presentations,
  onEditEmail,
  onSendEmail,
  onSendAll,
  isSendingAll,
}: {
  companies: CampaignCompany[];
  emails: CampaignEmail[];
  campaign: ValuationCampaign;
  presentations: any[];
  onEditEmail: (email: CampaignEmail, company: CampaignCompany) => void;
  onSendEmail: (id: string) => Promise<void>;
  onSendAll: () => Promise<void>;
  isSendingAll: boolean;
}) {
  const [showSendAllConfirm, setShowSendAllConfirm] = useState(false);
  const emailMap = new Map(emails.map(e => [e.company_id, e]));
  const presMap = new Map(presentations.map((p: any) => [p.company_id, p]));

  const totalEmails = emails.length;
  const sentCount = emails.filter(e => e.status === 'sent').length;
  const pendingCount = emails.filter(e => e.status === 'pending').length;
  const errorCount = emails.filter(e => e.status === 'error').length;

  return (
    <div className="space-y-4">
      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card><CardContent className="p-3 text-center">
          <p className="text-2xl font-bold">{companies.length}</p>
          <p className="text-xs text-muted-foreground">Empresas</p>
        </CardContent></Card>
        <Card><CardContent className="p-3 text-center">
          <p className="text-2xl font-bold">{totalEmails}</p>
          <p className="text-xs text-muted-foreground">Emails generados</p>
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
          Enviar todos los pendientes ({pendingCount})
        </Button>
      )}

      {/* Table */}
      <div className="border rounded-lg overflow-auto max-h-[55vh]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">#</TableHead>
              <TableHead>Empresa</TableHead>
              <TableHead>Contacto</TableHead>
              <TableHead>Email</TableHead>
              <TableHead className="text-center">PDF Val.</TableHead>
              <TableHead className="text-center">PDF Est.</TableHead>
              <TableHead className="text-center">Estado</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {companies.map((c, i) => {
              const email = emailMap.get(c.id);
              const pres = presMap.get(c.id);
              const hasValuation = ['calculated', 'sent'].includes(c.status);
              const hasStudy = !!pres;

              return (
                <TableRow key={c.id}>
                  <TableCell className="text-xs text-muted-foreground">{i + 1}</TableCell>
                  <TableCell className="font-medium text-sm max-w-[200px] truncate">{c.client_company}</TableCell>
                  <TableCell className="text-sm">{c.client_name || '—'}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{c.client_email || '—'}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant={hasValuation ? 'default' : 'secondary'} className={cn('text-xs', hasValuation && 'bg-green-100 text-green-800 hover:bg-green-100')}>
                      {hasValuation ? 'Listo' : 'Pendiente'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="secondary" className={cn('text-xs', hasStudy ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800')}>
                      {hasStudy ? 'Listo' : 'Sin estudio'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    {email ? (
                      <Badge variant="secondary" className={cn('text-xs',
                        email.status === 'sent' && 'bg-green-100 text-green-800',
                        email.status === 'pending' && 'bg-blue-100 text-blue-800',
                        email.status === 'error' && 'bg-red-100 text-red-800',
                      )}>
                        {email.status === 'sent' ? 'Enviado' : email.status === 'error' ? 'Error' : 'Pendiente'}
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-xs">Sin email</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                          <MoreVertical className="h-3.5 w-3.5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {email && (
                          <>
                            <DropdownMenuItem onClick={() => onEditEmail(email, c)}>
                              <Edit3 className="h-3.5 w-3.5 mr-2" />Editar email
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => onSendEmail(email.id)}
                              disabled={email.status === 'sent'}
                            >
                              <Send className="h-3.5 w-3.5 mr-2" />Enviar
                            </DropdownMenuItem>
                          </>
                        )}
                        {!email && (
                          <DropdownMenuItem disabled>
                            <Mail className="h-3.5 w-3.5 mr-2" />Sin email generado
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Send all confirm */}
      <AlertDialog open={showSendAllConfirm} onOpenChange={setShowSendAllConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Enviar {pendingCount} emails pendientes</AlertDialogTitle>
            <AlertDialogDescription>
              Se marcarán como enviados todos los emails pendientes. Esta acción no se puede deshacer.
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

// ─── Inline Signature Editor ────────────────────────────────────────────
type SignatureFormData = Omit<EmailSignatureData, 'id' | 'user_id' | 'html_preview'>;

function SignatureEditorSection() {
  const { user } = useAdminAuth();
  const { signature, isLoading, saveSignature, isSaving, uploadLogo, isUploadingLogo } = useEmailSignature();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getDefaults = (): SignatureFormData => ({
    ...DEFAULT_SIGNATURE,
    full_name: user?.user_metadata?.full_name || user?.email?.split('@')[0] || '',
  });

  const [form, setForm] = useState<SignatureFormData>(getDefaults());

  useEffect(() => {
    if (signature) {
      setForm({
        full_name: signature.full_name || '',
        job_title: signature.job_title || '',
        phone: signature.phone || '',
        website_url: signature.website_url || '',
        linkedin_url: signature.linkedin_url || '',
        logo_url: signature.logo_url || null,
        confidentiality_note: signature.confidentiality_note || '',
        privacy_note: signature.privacy_note || '',
        extra_note: signature.extra_note || '',
      });
    } else if (!isLoading) {
      setForm(getDefaults());
    }
  }, [signature, isLoading]);

  const update = (field: keyof SignatureFormData, value: string | null) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { toast.error('Máximo 2MB'); return; }
    const url = await uploadLogo(file);
    if (url) update('logo_url', url);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const previewHtml = generateSignatureHtml(form);

  if (isLoading) {
    return <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Form */}
      <div className="space-y-4">
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm font-medium">Datos personales</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div><Label className="text-xs">Nombre completo</Label><Input value={form.full_name} onChange={e => update('full_name', e.target.value)} className="h-8 text-sm" /></div>
            <div><Label className="text-xs">Cargo</Label><Input value={form.job_title} onChange={e => update('job_title', e.target.value)} className="h-8 text-sm" /></div>
            <div><Label className="text-xs">Teléfono</Label><Input value={form.phone} onChange={e => update('phone', e.target.value)} className="h-8 text-sm" /></div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm font-medium">Empresa</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div><Label className="text-xs">URL Web</Label><Input value={form.website_url} onChange={e => update('website_url', e.target.value)} className="h-8 text-sm" /></div>
            <div><Label className="text-xs">URL LinkedIn</Label><Input value={form.linkedin_url} onChange={e => update('linkedin_url', e.target.value)} className="h-8 text-sm" /></div>
            <div>
              <Label className="text-xs">Logo</Label>
              <div className="flex items-center gap-2 mt-1">
                {form.logo_url && <img src={form.logo_url} alt="Logo" className="h-10 border rounded" />}
                <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => fileInputRef.current?.click()} disabled={isUploadingLogo}>
                  {isUploadingLogo ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Upload className="h-3 w-3 mr-1" />}
                  {form.logo_url ? 'Cambiar' : 'Subir'}
                </Button>
                {form.logo_url && <Button variant="ghost" size="sm" className="h-7 text-xs text-destructive" onClick={() => update('logo_url', null)}>Quitar</Button>}
              </div>
              <input ref={fileInputRef} type="file" accept="image/png,image/jpeg" className="hidden" onChange={handleLogoUpload} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm font-medium">Textos legales</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div><Label className="text-xs">Nota de confidencialidad</Label><Textarea value={form.confidentiality_note} onChange={e => update('confidentiality_note', e.target.value)} rows={3} className="text-xs" /></div>
            <div><Label className="text-xs">Política de privacidad</Label><Textarea value={form.privacy_note} onChange={e => update('privacy_note', e.target.value)} rows={3} className="text-xs" /></div>
            <div><Label className="text-xs">Nota ambiental</Label><Input value={form.extra_note} onChange={e => update('extra_note', e.target.value)} className="h-8 text-sm" /></div>
          </CardContent>
        </Card>

        <div className="flex gap-2">
          <Button onClick={async () => { await saveSignature(form); }} disabled={isSaving} size="sm">
            {isSaving ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <Save className="h-3.5 w-3.5 mr-1.5" />}
            Guardar firma
          </Button>
          <Button variant="outline" size="sm" onClick={() => setForm(getDefaults())}>
            <RotateCcw className="h-3.5 w-3.5 mr-1.5" />Restaurar valores
          </Button>
        </div>
      </div>

      {/* Live preview */}
      <div className="lg:sticky lg:top-4">
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm font-medium">Vista previa de la firma</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border rounded-md p-4 bg-white">
              <div className="text-sm text-muted-foreground italic mb-3">[...cuerpo del email...]</div>
              <hr className="my-3 border-t border-gray-200" />
              <div dangerouslySetInnerHTML={{ __html: previewHtml }} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ─── Main MailStep ──────────────────────────────────────────────────────
export function MailStep({ campaignId, campaign }: Props) {
  const { companies } = useCampaignCompanies(campaignId);
  const { presentations } = useCampaignPresentations(campaignId);
  const {
    emails, isLoading, saveTemplate, generateEmails, isGenerating,
    updateEmail, restoreTemplate, sendEmail, sendAllPending, isSendingAll,
  } = useCampaignEmails(campaignId);
  const { signature } = useEmailSignature();

  const [editingEmail, setEditingEmail] = useState<{ email: CampaignEmail; company: CampaignCompany } | null>(null);

  // Get current signature HTML for preview
  const signatureHtml = signature?.html_preview || generateSignatureHtml({
    ...DEFAULT_SIGNATURE,
    full_name: signature?.full_name || '',
  });

  const handleSaveAndGenerate = async (subject: string, body: string, overwriteManual: boolean) => {
    try {
      await saveTemplate({ subject, body });
    } catch (error: any) {
      const message = error?.message || 'No se pudo guardar el template';
      toast.error(`${message}. Continuamos con la generación...`);
    }

    try {
      await generateEmails({
        subjectTemplate: subject,
        bodyTemplate: body,
        companies,
        campaign,
        overwriteManual,
      });
    } catch (error: any) {
      const message = error?.message || 'No se pudo generar emails';
      toast.error(message);
    }
  };

  const handleRestore = async (emailId: string, company: CampaignCompany) => {
    const subjectTemplate = (campaign as any).email_subject_template || '';
    const bodyTemplate = (campaign as any).email_body_template || '';
    await restoreTemplate({ emailId, company, campaign, subjectTemplate, bodyTemplate });
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
          <Mail className="h-3.5 w-3.5 mr-1.5" />Lista de emails
          {emails.length > 0 && (
            <Badge variant="secondary" className="ml-1.5 text-xs">{emails.length}</Badge>
          )}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="template">
        <TemplateEditorSection
          campaignId={campaignId}
          campaign={campaign}
          companies={companies}
          emails={emails}
          isGenerating={isGenerating}
          onSaveAndGenerate={handleSaveAndGenerate}
          signatureHtml={signatureHtml}
          signature={signature || null}
        />
      </TabsContent>

      <TabsContent value="signature">
        <SignatureEditorSection />
      </TabsContent>

      <TabsContent value="list">
        <MailListSection
          companies={companies}
          emails={emails}
          campaign={campaign}
          presentations={presentations}
          onEditEmail={(email, company) => setEditingEmail({ email, company })}
          onSendEmail={sendEmail}
          onSendAll={async () => { await sendAllPending(); }}
          isSendingAll={isSendingAll}
        />
      </TabsContent>

      {/* Edit dialog */}
      {editingEmail && (
        <EditEmailDialog
          email={editingEmail.email}
          company={editingEmail.company}
          campaign={campaign}
          open={!!editingEmail}
          onOpenChange={o => { if (!o) setEditingEmail(null); }}
          onSave={async (id, subject, body) => { await updateEmail({ id, subject, body }); }}
          onRestore={handleRestore}
          onSend={sendEmail}
        />
      )}
    </Tabs>
  );
}
