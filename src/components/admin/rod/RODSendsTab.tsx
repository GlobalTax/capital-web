import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Plus, Send, Save, Loader2, Mail, Edit3, Pen, Users, MailCheck, Eye, Clock,
  CheckCircle2, XCircle, AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { RODMailTemplate } from './RODMailTemplate';
import { RODMailList } from './RODMailList';
import { RODSendTracking } from './RODSendTracking';
import { useEmailSignature, DEFAULT_SIGNATURE, generateSignatureHtml } from '@/hooks/useEmailSignature';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { useActiveEmailRecipients } from '@/hooks/useEmailRecipientsConfig';
import { useTeamAdvisors } from '@/hooks/useTeamAdvisors';

interface RODSend {
  id: string;
  subject: string;
  body_html: string;
  body_text: string;
  target_language: string;
  status: string;
  scheduled_at: string | null;
  sent_at: string | null;
  total_recipients: number | null;
  sent_count: number | null;
  failed_count: number | null;
  attachment_ids: string[] | null;
  cc_recipient_ids: string[] | null;
  signature_html: string | null;
  sender_name: string | null;
  sender_email: string | null;
  error_message: string | null;
  created_at: string;
}

const STATUS_CONFIG: Record<string, { label: string; icon: React.ReactNode; className: string }> = {
  draft: { label: 'Borrador', icon: <Save className="h-3 w-3" />, className: 'bg-muted text-muted-foreground' },
  sending: { label: 'Enviando…', icon: <Loader2 className="h-3 w-3 animate-spin" />, className: 'bg-amber-100 text-amber-800' },
  sent: { label: 'Enviado', icon: <CheckCircle2 className="h-3 w-3" />, className: 'bg-green-100 text-green-800' },
  failed: { label: 'Error', icon: <XCircle className="h-3 w-3" />, className: 'bg-red-100 text-red-800' },
};

export default function RODSendsTab() {
  const queryClient = useQueryClient();
  const [currentSendId, setCurrentSendId] = useState<string | null>(null);
  const [subject, setSubject] = useState('');
  const [bodyText, setBodyText] = useState('');
  const [language, setLanguage] = useState('es');
  const [attachmentIds, setAttachmentIds] = useState<string[]>([]);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { signature } = useEmailSignature();

  // Fetch existing sends
  const { data: sends = [], isLoading: sendsLoading } = useQuery({
    queryKey: ['rod-sends'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rod_sends')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []) as RODSend[];
    },
  });

  // Load a send into the editor
  const loadSend = (send: RODSend) => {
    setCurrentSendId(send.id);
    setSubject(send.subject || '');
    setBodyText(send.body_text || '');
    setLanguage(send.target_language || 'es');
    setAttachmentIds(send.attachment_ids || []);
  };

  const createNew = () => {
    setCurrentSendId(null);
    setSubject('');
    setBodyText('');
    setLanguage('es');
    setAttachmentIds([]);
  };

  // Auto-load first draft if exists
  useEffect(() => {
    if (sends.length > 0 && !currentSendId) {
      const draft = sends.find(s => s.status === 'draft');
      if (draft) loadSend(draft);
    }
  }, [sends]);

  // Auto-save with debounce
  const saveDraft = useCallback(async () => {
    if (!subject.trim() && !bodyText.trim()) return;
    setSaveStatus('saving');

    const signatureHtml = signature?.html_preview || generateSignatureHtml({
      ...DEFAULT_SIGNATURE,
      full_name: signature?.full_name || '',
    });

    try {
      const payload = {
        subject,
        body_html: bodyText.replace(/\n/g, '<br/>'),
        body_text: bodyText,
        target_language: language,
        attachment_ids: attachmentIds,
        signature_html: signatureHtml,
        status: 'draft' as const,
      };

      if (currentSendId) {
        const { error } = await supabase.from('rod_sends').update(payload).eq('id', currentSendId);
        if (error) throw error;
      } else {
        const { data, error } = await supabase.from('rod_sends').insert(payload).select('id').single();
        if (error) throw error;
        setCurrentSendId(data.id);
      }

      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
      queryClient.invalidateQueries({ queryKey: ['rod-sends'] });
    } catch (e: any) {
      setSaveStatus('idle');
      toast.error('Error guardando: ' + e.message);
    }
  }, [subject, bodyText, language, attachmentIds, currentSendId, signature, queryClient]);

  // Debounced auto-save
  const triggerAutoSave = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(saveDraft, 1500);
  }, [saveDraft]);

  useEffect(() => {
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, []);

  const handleSubjectChange = (v: string) => { setSubject(v); triggerAutoSave(); };
  const handleBodyChange = (v: string) => { setBodyText(v); triggerAutoSave(); };
  const handleLanguageChange = (v: string) => { setLanguage(v); triggerAutoSave(); };
  const handleAttachmentsChange = (v: string[]) => { setAttachmentIds(v); triggerAutoSave(); };

  const currentSend = sends.find(s => s.id === currentSendId);
  const isEditable = !currentSend || currentSend.status === 'draft';

  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        {/* Header with send selector */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium">Envíos ROD</h3>
            <p className="text-xs text-muted-foreground">
              Gestión completa de envíos de la Relación de Oportunidades
            </p>
          </div>
          <div className="flex items-center gap-2">
            {sends.filter(s => s.status !== 'draft').length > 0 && (
              <select
                className="h-8 text-xs border rounded-md px-2 bg-background"
                value={currentSendId || ''}
                onChange={e => {
                  const send = sends.find(s => s.id === e.target.value);
                  if (send) loadSend(send);
                }}
              >
                {sends.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.subject || '(sin asunto)'} — {STATUS_CONFIG[s.status]?.label || s.status}
                    {s.sent_at ? ` (${format(new Date(s.sent_at), 'dd/MM/yy')})` : ''}
                  </option>
                ))}
              </select>
            )}
            <Button size="sm" variant="outline" onClick={createNew}>
              <Plus className="h-4 w-4 mr-1" /> Nuevo
            </Button>
          </div>
        </div>

        <Separator />

        {/* Main tabs: Mail / Envío y seguimiento */}
        <Tabs defaultValue="mail" className="space-y-4">
          <TabsList>
            <TabsTrigger value="mail" className="text-xs">
              <Mail className="h-3.5 w-3.5 mr-1.5" />Mail
            </TabsTrigger>
            <TabsTrigger value="tracking" className="text-xs">
              <Send className="h-3.5 w-3.5 mr-1.5" />Envío y seguimiento
            </TabsTrigger>
          </TabsList>

          {/* ── Mail sub-tab ── */}
          <TabsContent value="mail">
            <Tabs defaultValue="template" className="space-y-4">
              <TabsList>
                <TabsTrigger value="template" className="text-xs">
                  <Edit3 className="h-3.5 w-3.5 mr-1.5" />Template
                </TabsTrigger>
                <TabsTrigger value="signature" className="text-xs">
                  <Pen className="h-3.5 w-3.5 mr-1.5" />Firma
                </TabsTrigger>
                <TabsTrigger value="list" className="text-xs">
                  <Mail className="h-3.5 w-3.5 mr-1.5" />Lista de emails
                </TabsTrigger>
                <TabsTrigger value="cc" className="text-xs">
                  <Users className="h-3.5 w-3.5 mr-1.5" />Copias (CC)
                </TabsTrigger>
              </TabsList>

              <TabsContent value="template">
                <RODMailTemplate
                  sendId={currentSendId}
                  subject={subject}
                  bodyText={bodyText}
                  language={language}
                  attachmentIds={attachmentIds}
                  onSubjectChange={handleSubjectChange}
                  onBodyChange={handleBodyChange}
                  onLanguageChange={handleLanguageChange}
                  onAttachmentsChange={handleAttachmentsChange}
                  onSaveDraft={saveDraft}
                  saveStatus={saveStatus}
                />
              </TabsContent>

              <TabsContent value="signature">
                <SignatureSection />
              </TabsContent>

              <TabsContent value="list">
                <RODMailList
                  sendId={currentSendId}
                  language={language}
                  subjectTemplate={subject}
                  bodyTemplate={bodyText}
                />
              </TabsContent>

              <TabsContent value="cc">
                <CcRecipientsSection
                  sendId={currentSendId}
                  ccIds={currentSend?.cc_recipient_ids || []}
                />
              </TabsContent>
            </Tabs>
          </TabsContent>

          {/* ── Envío y seguimiento sub-tab ── */}
          <TabsContent value="tracking">
            <RODSendTracking
              sendId={currentSendId}
              language={language}
              onSendComplete={() => {
                queryClient.invalidateQueries({ queryKey: ['rod-sends'] });
              }}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

// ─── Signature Section (reuses existing hook) ────────────────────────────
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Upload, RotateCcw } from 'lucide-react';
import type { EmailSignatureData } from '@/hooks/useEmailSignature';

type SignatureFormData = Omit<EmailSignatureData, 'id' | 'user_id' | 'html_preview'>;

function SignatureSection() {
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

  if (isLoading) return <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="space-y-4">
        <Card>
          <CardContent className="p-4 space-y-3">
            <h4 className="text-sm font-medium">Datos personales</h4>
            <div><Label className="text-xs">Nombre completo</Label><Input value={form.full_name} onChange={e => update('full_name', e.target.value)} className="h-8 text-sm" /></div>
            <div><Label className="text-xs">Cargo</Label><Input value={form.job_title} onChange={e => update('job_title', e.target.value)} className="h-8 text-sm" /></div>
            <div><Label className="text-xs">Teléfono</Label><Input value={form.phone} onChange={e => update('phone', e.target.value)} className="h-8 text-sm" /></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 space-y-3">
            <h4 className="text-sm font-medium">Empresa</h4>
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
          <CardContent className="p-4 space-y-3">
            <h4 className="text-sm font-medium">Textos legales</h4>
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
            <RotateCcw className="h-3.5 w-3.5 mr-1.5" />Restaurar
          </Button>
        </div>
      </div>
      <div className="lg:sticky lg:top-4">
        <Card>
          <CardContent className="p-4">
            <h4 className="text-sm font-medium mb-3">Vista previa de la firma</h4>
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

// ─── CC Recipients Section ──────────────────────────────────────────────
function CcRecipientsSection({ sendId, ccIds }: { sendId: string | null; ccIds: string[] }) {
  const { data: allRecipients, isLoading } = useActiveEmailRecipients();
  const [selectedIds, setSelectedIds] = useState<string[]>(ccIds || []);
  const [initialized, setInitialized] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initialized || !allRecipients) return;
    if (!ccIds || ccIds.length === 0) {
      setSelectedIds(allRecipients.filter(r => r.is_default_copy).map(r => r.id));
    } else {
      setSelectedIds(ccIds);
    }
    setInitialized(true);
  }, [allRecipients, ccIds, initialized]);

  const saveToDb = async (ids: string[]) => {
    if (!sendId) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from('rod_sends')
        .update({ cc_recipient_ids: ids })
        .eq('id', sendId);
      if (error) throw error;
      toast.success(`CC actualizado: ${ids.length} destinatario(s)`);
    } catch {
      toast.error('Error al guardar CC');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = (id: string) => {
    setSelectedIds(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
      saveToDb(next);
      return next;
    });
  };

  if (isLoading) return <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>;

  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        <div>
          <h4 className="text-sm font-medium flex items-center gap-2">
            <Users className="h-4 w-4" />
            Destinatarios en copia (CC)
          </h4>
          <p className="text-xs text-muted-foreground mt-1">
            Selecciona quién recibirá copia de cada email ROD enviado.
          </p>
        </div>
        <div className="space-y-2">
          {(allRecipients || []).map(recipient => (
            <label
              key={recipient.id}
              className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
            >
              <Checkbox
                checked={selectedIds.includes(recipient.id)}
                onCheckedChange={() => handleToggle(recipient.id)}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{recipient.name}</span>
                  <Badge variant="outline" className="text-[10px]">{recipient.role}</Badge>
                  {recipient.is_default_copy && (
                    <Badge variant="secondary" className="text-[10px]">CC por defecto</Badge>
                  )}
                </div>
                <span className="text-xs text-muted-foreground">{recipient.email}</span>
              </div>
            </label>
          ))}
          {(!allRecipients || allRecipients.length === 0) && (
            <p className="text-sm text-muted-foreground py-4 text-center">
              No hay destinatarios configurados. Añádelos en Configuración → Email.
            </p>
          )}
        </div>
        <Separator />
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            {selectedIds.length === 0
              ? 'Sin CC — los emails se enviarán solo al destinatario principal'
              : `${selectedIds.length} persona(s) recibirán copia de cada email`}
          </p>
          {saving && <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />}
        </div>
      </CardContent>
    </Card>
  );
}
