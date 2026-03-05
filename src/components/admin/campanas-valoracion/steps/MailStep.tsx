import { useState, useRef, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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
  Edit3, RotateCcw, Building2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCampaignCompanies, CampaignCompany } from '@/hooks/useCampaignCompanies';
import { useCampaignPresentations } from '@/hooks/useCampaignPresentations';
import { useCampaignEmails, CampaignEmail } from '@/hooks/useCampaignEmails';
import { ValuationCampaign } from '@/hooks/useCampaigns';
import { getAvailableVariables, replaceVariables } from '@/utils/campaignEmailTemplateEngine';
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
  onSaveAndGenerate,
}: {
  campaignId: string;
  campaign: ValuationCampaign;
  companies: CampaignCompany[];
  emails: CampaignEmail[];
  isGenerating: boolean;
  onSaveAndGenerate: (subject: string, body: string, overwriteManual: boolean) => Promise<void>;
}) {
  const [subject, setSubject] = useState((campaign as any).email_subject_template || '');
  const [body, setBody] = useState((campaign as any).email_body_template || '');
  const [showPreview, setShowPreview] = useState(false);
  const [showOverwriteWarning, setShowOverwriteWarning] = useState(false);
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const subjectRef = useRef<HTMLInputElement>(null);
  const [lastFocused, setLastFocused] = useState<'subject' | 'body'>('body');

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

  const handleSave = async () => {
    if (!subject.trim() && !body.trim()) {
      toast.error('Escribe al menos un asunto o cuerpo');
      return;
    }
    if (manuallyEdited > 0) {
      setShowOverwriteWarning(true);
    } else {
      await onSaveAndGenerate(subject, body, true);
    }
  };

  const previewCompany = companies[0];
  const previewSubject = previewCompany ? replaceVariables(subject, previewCompany, campaign) : subject;
  const previewBody = previewCompany ? replaceVariables(body, previewCompany, campaign) : body;

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

      {/* Subject */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium">Asunto</label>
        <Input
          ref={subjectRef}
          value={subject}
          onChange={e => setSubject(e.target.value)}
          onFocus={() => setLastFocused('subject')}
          placeholder="Análisis de mercado para {{company}} — {{sector}}"
          className="font-mono text-sm"
        />
      </div>

      {/* Body */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium">Cuerpo del email</label>
        <textarea
          ref={bodyRef}
          value={body}
          onChange={e => setBody(e.target.value)}
          onFocus={() => setLastFocused('body')}
          rows={14}
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm font-mono ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-y"
          placeholder={`Hola {{first_name}},\n\nMe llamo {{firmante_nombre}} y...\n\nUn abrazo,\n{{firmante_nombre}}\n{{firmante_cargo}}`}
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <Button onClick={handleSave} disabled={isGenerating}>
          {isGenerating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Mail className="h-4 w-4 mr-2" />}
          Guardar template y generar emails
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
            <DialogDescription>Vista previa con datos de la primera empresa</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <span className="text-xs font-medium text-muted-foreground">Asunto:</span>
              <p className="text-sm font-medium">{previewSubject}</p>
            </div>
            <div className="border rounded-md p-4 bg-muted/30">
              <pre className="text-sm whitespace-pre-wrap font-sans">{previewBody}</pre>
            </div>
          </div>
        </DialogContent>
      </Dialog>

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
                await onSaveAndGenerate(subject, body, false);
              }}
            >
              Mantener editados
            </Button>
            <AlertDialogAction onClick={async () => {
              setShowOverwriteWarning(false);
              await onSaveAndGenerate(subject, body, true);
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

// ─── Main MailStep ──────────────────────────────────────────────────────
export function MailStep({ campaignId, campaign }: Props) {
  const { companies } = useCampaignCompanies(campaignId);
  const { presentations } = useCampaignPresentations(campaignId);
  const {
    emails, isLoading, saveTemplate, generateEmails, isGenerating,
    updateEmail, restoreTemplate, sendEmail, sendAllPending, isSendingAll,
  } = useCampaignEmails(campaignId);

  const [editingEmail, setEditingEmail] = useState<{ email: CampaignEmail; company: CampaignCompany } | null>(null);

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
        />
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
