import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Send, Loader2, Plus, Eye, Mail, Clock, CheckCircle2, AlertCircle,
  FileText, FileSpreadsheet, Trash2, Calendar, Users, ChevronDown, ChevronRight,
} from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface RODSend {
  id: string;
  subject: string;
  body_html: string;
  body_text: string;
  target_language: 'es' | 'en' | 'both';
  status: string;
  scheduled_at: string | null;
  sent_at: string | null;
  attachment_urls: Array<{ url: string; filename: string }>;
  total_recipients: number;
  sent_count: number;
  failed_count: number;
  error_message: string | null;
  created_at: string;
}

interface RODDocument {
  id: string;
  title: string;
  file_url: string;
  file_type: 'pdf' | 'excel';
  language: 'es' | 'en';
  is_active: boolean;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: typeof CheckCircle2 }> = {
  draft: { label: 'Borrador', color: 'bg-gray-100 text-gray-700', icon: FileText },
  scheduled: { label: 'Programado', color: 'bg-blue-100 text-blue-700', icon: Clock },
  sending: { label: 'Enviando…', color: 'bg-amber-100 text-amber-700', icon: Loader2 },
  sent: { label: 'Enviado', color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
  failed: { label: 'Error', color: 'bg-red-100 text-red-700', icon: AlertCircle },
  cancelled: { label: 'Cancelado', color: 'bg-gray-100 text-gray-500', icon: AlertCircle },
};

const LANG_LABELS: Record<string, string> = {
  es: '🇪🇸 Castellano',
  en: '🇬🇧 Inglés',
  both: '🇪🇸🇬🇧 Ambos',
};

// ─── Composer Dialog ──────────────────────────────────────────────────
function RODComposer({
  open,
  onOpenChange,
  editingSend,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  editingSend: RODSend | null;
}) {
  const queryClient = useQueryClient();
  const [subject, setSubject] = useState('');
  const [bodyText, setBodyText] = useState('');
  const [targetLang, setTargetLang] = useState<'es' | 'en' | 'both'>('es');
  const [selectedDocs, setSelectedDocs] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  const [showSendConfirm, setShowSendConfirm] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');
  const bodyRef = useRef<HTMLTextAreaElement>(null);

  // Load existing send data
  useEffect(() => {
    if (editingSend) {
      setSubject(editingSend.subject);
      setBodyText(editingSend.body_text);
      setTargetLang(editingSend.target_language);
      const docUrls = editingSend.attachment_urls || [];
      setSelectedDocs(new Set(docUrls.map(d => d.url)));
      setScheduleDate(editingSend.scheduled_at ? editingSend.scheduled_at.slice(0, 16) : '');
    } else {
      setSubject('');
      setBodyText('');
      setTargetLang('es');
      setSelectedDocs(new Set());
      setScheduleDate('');
    }
  }, [editingSend, open]);

  // Fetch ROD documents
  const { data: rodDocs } = useQuery({
    queryKey: ['rod-documents-for-send'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rod_documents')
        .select('id, title, file_url, file_type, language, is_active')
        .eq('is_active', true)
        .eq('is_deleted', false)
        .order('language')
        .order('file_type');
      if (error) throw error;
      return (data || []) as RODDocument[];
    },
  });

  // Fetch recipient counts
  const { data: recipientCounts } = useQuery({
    queryKey: ['rod-recipient-counts'],
    queryFn: async () => {
      const { data: esCount } = await supabase
        .from('rod_list_members')
        .select('id', { count: 'exact', head: true })
        .eq('language', 'es');
      const { data: enCount } = await supabase
        .from('rod_list_members')
        .select('id', { count: 'exact', head: true })
        .eq('language', 'en');
      return { es: esCount?.length ?? 0, en: enCount?.length ?? 0 };
    },
  });

  // Filter docs by target language
  const availableDocs = useMemo(() => {
    if (!rodDocs) return [];
    if (targetLang === 'both') return rodDocs;
    return rodDocs.filter(d => d.language === targetLang);
  }, [rodDocs, targetLang]);

  const recipientTotal = useMemo(() => {
    if (!recipientCounts) return 0;
    if (targetLang === 'es') return recipientCounts.es;
    if (targetLang === 'en') return recipientCounts.en;
    return recipientCounts.es + recipientCounts.en;
  }, [recipientCounts, targetLang]);

  const toggleDoc = (url: string) => {
    setSelectedDocs(prev => {
      const next = new Set(prev);
      if (next.has(url)) next.delete(url); else next.add(url);
      return next;
    });
  };

  const insertVariable = (key: string) => {
    const tag = `{{${key}}}`;
    if (bodyRef.current) {
      const el = bodyRef.current;
      const start = el.selectionStart || 0;
      const end = el.selectionEnd || 0;
      const newVal = bodyText.slice(0, start) + tag + bodyText.slice(end);
      setBodyText(newVal);
      setTimeout(() => {
        el.focus();
        el.setSelectionRange(start + tag.length, start + tag.length);
      }, 0);
    }
  };

  const buildAttachmentUrls = () => {
    return (rodDocs || [])
      .filter(d => selectedDocs.has(d.file_url))
      .map(d => ({ url: d.file_url, filename: d.title }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        subject,
        body_text: bodyText,
        body_html: bodyText.replace(/\n/g, '<br/>'),
        target_language: targetLang,
        attachment_urls: buildAttachmentUrls(),
        scheduled_at: scheduleDate ? new Date(scheduleDate).toISOString() : null,
        status: scheduleDate ? 'scheduled' : 'draft',
      };

      if (editingSend) {
        const { error } = await (supabase as any)
          .from('rod_sends')
          .update(payload)
          .eq('id', editingSend.id);
        if (error) throw error;
      } else {
        const { error } = await (supabase as any)
          .from('rod_sends')
          .insert(payload);
        if (error) throw error;
      }

      queryClient.invalidateQueries({ queryKey: ['rod-sends'] });
      toast.success(scheduleDate ? 'Envío programado guardado' : 'Borrador guardado');
      onOpenChange(false);
    } catch (e: any) {
      toast.error(e.message || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const handleSendNow = async () => {
    setSending(true);
    try {
      // 1. Save/create the send
      const payload: any = {
        subject,
        body_text: bodyText,
        body_html: bodyText.replace(/\n/g, '<br/>'),
        target_language: targetLang,
        attachment_urls: buildAttachmentUrls(),
        status: 'draft',
        total_recipients: recipientTotal,
      };

      let sendId = editingSend?.id;
      if (editingSend) {
        await (supabase as any).from('rod_sends').update(payload).eq('id', editingSend.id);
      } else {
        const { data, error } = await (supabase as any).from('rod_sends').insert(payload).select('id').single();
        if (error) throw error;
        sendId = data.id;
      }

      // 2. Populate recipients from rod_list_members
      const languages = targetLang === 'both' ? ['es', 'en'] : [targetLang];
      for (const lang of languages) {
        const { data: members } = await supabase
          .from('rod_list_members')
          .select('email, full_name, company')
          .eq('language', lang);

        if (members?.length) {
          const BATCH = 50;
          for (let i = 0; i < members.length; i += BATCH) {
            const batch = members.slice(i, i + BATCH).map(m => ({
              send_id: sendId,
              email: m.email,
              full_name: m.full_name,
              company: m.company,
            }));
            await (supabase as any).from('rod_send_recipients').insert(batch);
          }
        }
      }

      // 3. Update total
      await (supabase as any).from('rod_sends').update({ total_recipients: recipientTotal }).eq('id', sendId);

      // 4. Invoke the Edge Function
      const { error: fnError } = await supabase.functions.invoke('send-rod-email', {
        body: { send_id: sendId },
      });
      if (fnError) throw fnError;

      queryClient.invalidateQueries({ queryKey: ['rod-sends'] });
      toast.success(`Envío iniciado a ${recipientTotal} destinatarios`);
      onOpenChange(false);
    } catch (e: any) {
      toast.error(e.message || 'Error al enviar');
    } finally {
      setSending(false);
    }
  };

  const canSend = subject.trim() && bodyText.trim() && recipientTotal > 0;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              {editingSend ? 'Editar envío ROD' : 'Nuevo envío ROD'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-5">
            {/* Config row */}
            <div className="flex flex-wrap gap-4 items-end">
              <div className="space-y-1.5 min-w-[200px]">
                <Label className="text-sm">Lista destino</Label>
                <Select value={targetLang} onValueChange={(v: any) => setTargetLang(v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="es">🇪🇸 Castellano</SelectItem>
                    <SelectItem value="en">🇬🇧 Inglés</SelectItem>
                    <SelectItem value="both">🇪🇸🇬🇧 Ambos idiomas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>{recipientTotal} destinatarios</span>
              </div>
            </div>

            {/* Variables */}
            <div className="flex flex-wrap gap-1.5">
              <span className="text-xs text-muted-foreground font-medium mr-1">Variables:</span>
              {['nombre', 'empresa'].map(v => (
                <Button
                  key={v}
                  variant="outline"
                  size="sm"
                  className="h-6 text-xs font-mono bg-amber-50 border-amber-200 hover:bg-amber-100 text-amber-800"
                  onClick={() => insertVariable(v)}
                >
                  {`{{${v}}}`}
                </Button>
              ))}
            </div>

            {/* Editor + Preview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">Asunto</Label>
                  <Input
                    value={subject}
                    onChange={e => setSubject(e.target.value)}
                    placeholder="Relación de Oportunidades — Abril 2026"
                    className="text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">Cuerpo del email</Label>
                  <textarea
                    ref={bodyRef}
                    value={bodyText}
                    onChange={e => setBodyText(e.target.value)}
                    rows={14}
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-y"
                    placeholder={`Estimado/a {{nombre}},\n\nAdjunto le envío la última Relación de Oportunidades de Capittal.\n\nQuedamos a su disposición.\n\nUn cordial saludo,`}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-medium flex items-center gap-1.5">
                  <Eye className="h-3.5 w-3.5 text-muted-foreground" /> Vista previa
                </Label>
                <div className="border rounded-md bg-white overflow-hidden">
                  <div className="px-4 py-2.5 border-b bg-muted/30">
                    <span className="text-xs text-muted-foreground">Asunto:</span>
                    <p className="text-sm font-medium truncate">{subject || <span className="text-muted-foreground italic">Sin asunto</span>}</p>
                  </div>
                  <div className="p-4 max-h-[350px] overflow-y-auto">
                    {bodyText ? (
                      <pre className="text-sm whitespace-pre-wrap font-sans leading-relaxed">
                        {bodyText.replace(/\{\{nombre\}\}/gi, 'Juan García').replace(/\{\{empresa\}\}/gi, 'Acme S.L.')}
                      </pre>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">Escribe el cuerpo...</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Attachments */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Documentos adjuntos (ROD)</Label>
              {!availableDocs?.length ? (
                <p className="text-sm text-muted-foreground">No hay documentos activos para el idioma seleccionado.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {availableDocs.map(doc => {
                    const checked = selectedDocs.has(doc.file_url);
                    const Icon = doc.file_type === 'pdf' ? FileText : FileSpreadsheet;
                    return (
                      <label
                        key={doc.id}
                        className={`flex items-center gap-3 p-3 rounded-md border cursor-pointer transition-colors ${checked ? 'bg-primary/5 border-primary/30' : 'hover:bg-muted/50'}`}
                      >
                        <Checkbox
                          checked={checked}
                          onCheckedChange={() => toggleDoc(doc.file_url)}
                        />
                        <Icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{doc.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {doc.language === 'es' ? '🇪🇸' : '🇬🇧'} {doc.file_type.toUpperCase()}
                          </p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>

            <Separator />

            {/* Schedule */}
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" /> Programar envío (opcional)
              </Label>
              <Input
                type="datetime-local"
                value={scheduleDate}
                onChange={e => setScheduleDate(e.target.value)}
                className="max-w-xs text-sm"
              />
              {scheduleDate && (
                <Button variant="ghost" size="sm" className="text-xs" onClick={() => setScheduleDate('')}>
                  Quitar programación
                </Button>
              )}
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2 pt-4">
            <Button variant="outline" onClick={handleSave} disabled={saving || !subject.trim()}>
              {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              {scheduleDate ? 'Programar' : 'Guardar borrador'}
            </Button>
            <Button
              onClick={() => setShowSendConfirm(true)}
              disabled={!canSend || sending}
            >
              {sending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
              Enviar ahora ({recipientTotal})
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showSendConfirm} onOpenChange={setShowSendConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar envío masivo</AlertDialogTitle>
            <AlertDialogDescription>
              Se enviará el email a <strong>{recipientTotal} destinatarios</strong> de la lista {LANG_LABELS[targetLang]} con {selectedDocs.size} adjunto(s).
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleSendNow}>
              Confirmar envío
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// ─── Main Tab ──────────────────────────────────────────────────
export function RODSendsTab() {
  const [composerOpen, setComposerOpen] = useState(false);
  const [editingSend, setEditingSend] = useState<RODSend | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: sends, isLoading } = useQuery({
    queryKey: ['rod-sends'],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('rod_sends')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return (data || []) as RODSend[];
    },
  });

  const deleteSend = useMutation({
    mutationFn: async (id: string) => {
      await (supabase as any).from('rod_send_recipients').delete().eq('send_id', id);
      const { error } = await (supabase as any).from('rod_sends').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rod-sends'] });
      toast.success('Envío eliminado');
    },
  });

  const openComposer = (send?: RODSend) => {
    setEditingSend(send || null);
    setComposerOpen(true);
  };

  // Fetch recipients for expanded row
  const { data: expandedRecipients } = useQuery({
    queryKey: ['rod-send-recipients', expandedId],
    queryFn: async () => {
      if (!expandedId) return [];
      const { data } = await (supabase as any)
        .from('rod_send_recipients')
        .select('*')
        .eq('send_id', expandedId)
        .order('status')
        .limit(100);
      return data || [];
    },
    enabled: !!expandedId,
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-medium">Envíos ROD</h3>
          <p className="text-xs text-muted-foreground">Envío masivo de la Relación de Oportunidades a las listas de distribución</p>
        </div>
        <Button onClick={() => openComposer()} size="sm">
          <Plus className="h-4 w-4 mr-1.5" /> Nuevo envío
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : !sends?.length ? (
            <div className="text-center py-12 text-muted-foreground">
              <Mail className="h-10 w-10 mx-auto mb-3 opacity-40" />
              <p className="text-sm">No hay envíos registrados</p>
              <p className="text-xs mt-1">Crea tu primer envío para distribuir la ROD</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs w-6" />
                  <TableHead className="text-xs">Asunto</TableHead>
                  <TableHead className="text-xs">Lista</TableHead>
                  <TableHead className="text-xs text-center">Destinatarios</TableHead>
                  <TableHead className="text-xs text-center">Adjuntos</TableHead>
                  <TableHead className="text-xs">Estado</TableHead>
                  <TableHead className="text-xs">Fecha</TableHead>
                  <TableHead className="text-xs w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {sends.map(send => {
                  const st = STATUS_CONFIG[send.status] || STATUS_CONFIG.draft;
                  const StIcon = st.icon;
                  const isExpanded = expandedId === send.id;
                  const attachCount = (send.attachment_urls || []).length;

                  return (
                    <>
                      <TableRow
                        key={send.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => setExpandedId(isExpanded ? null : send.id)}
                      >
                        <TableCell className="text-xs px-2">
                          {isExpanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                        </TableCell>
                        <TableCell className="text-xs font-medium max-w-[250px] truncate">
                          {send.subject || <span className="text-muted-foreground italic">Sin asunto</span>}
                        </TableCell>
                        <TableCell className="text-xs">{LANG_LABELS[send.target_language]}</TableCell>
                        <TableCell className="text-xs text-center">
                          {send.status === 'sent' || send.status === 'sending' ? (
                            <span>{send.sent_count}/{send.total_recipients}</span>
                          ) : (
                            send.total_recipients || '—'
                          )}
                        </TableCell>
                        <TableCell className="text-xs text-center">{attachCount}</TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${st.color}`}>
                            <StIcon className={`h-3 w-3 ${send.status === 'sending' ? 'animate-spin' : ''}`} />
                            {st.label}
                          </span>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {send.sent_at
                            ? format(new Date(send.sent_at), 'dd MMM yyyy HH:mm', { locale: es })
                            : format(new Date(send.created_at), 'dd MMM yyyy', { locale: es })}
                        </TableCell>
                        <TableCell className="px-2" onClick={e => e.stopPropagation()}>
                          {(send.status === 'draft' || send.status === 'scheduled') && (
                            <div className="flex gap-1">
                              <Button
                                variant="ghost" size="sm" className="h-7 w-7 p-0"
                                onClick={() => openComposer(send)}
                              >
                                <FileText className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                variant="ghost" size="sm" className="h-7 w-7 p-0 text-destructive"
                                onClick={() => deleteSend.mutate(send.id)}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                      {isExpanded && (
                        <TableRow className="bg-muted/20">
                          <TableCell colSpan={8} className="py-3 px-6">
                            <div className="space-y-3">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <p className="text-[10px] uppercase text-muted-foreground font-medium mb-1">Preview del cuerpo</p>
                                  <div className="bg-white rounded border p-3 max-h-[200px] overflow-y-auto">
                                    <pre className="text-xs whitespace-pre-wrap font-sans">{send.body_text}</pre>
                                  </div>
                                </div>
                                <div>
                                  <p className="text-[10px] uppercase text-muted-foreground font-medium mb-1">
                                    Destinatarios ({expandedRecipients?.length ?? '…'})
                                  </p>
                                  <div className="bg-white rounded border max-h-[200px] overflow-y-auto">
                                    {!expandedRecipients?.length ? (
                                      <p className="text-xs text-muted-foreground p-3">Sin destinatarios registrados</p>
                                    ) : (
                                      <table className="w-full text-xs">
                                        <thead>
                                          <tr className="border-b bg-muted/30">
                                            <th className="text-left p-1.5 font-medium">Email</th>
                                            <th className="text-left p-1.5 font-medium">Estado</th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {expandedRecipients.map((r: any) => (
                                            <tr key={r.id} className="border-b last:border-0">
                                              <td className="p-1.5 truncate max-w-[200px]">{r.email}</td>
                                              <td className="p-1.5">
                                                <Badge variant={r.status === 'sent' ? 'default' : r.status === 'failed' ? 'destructive' : 'secondary'} className="text-[10px]">
                                                  {r.status}
                                                </Badge>
                                              </td>
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                    )}
                                  </div>
                                  {send.failed_count > 0 && (
                                    <p className="text-xs text-destructive mt-1">
                                      {send.failed_count} email(s) fallidos
                                    </p>
                                  )}
                                </div>
                              </div>
                              {(send.attachment_urls || []).length > 0 && (
                                <div>
                                  <p className="text-[10px] uppercase text-muted-foreground font-medium mb-1">Adjuntos</p>
                                  <div className="flex flex-wrap gap-2">
                                    {send.attachment_urls.map((a, i) => (
                                      <Badge key={i} variant="outline" className="text-xs gap-1">
                                        <FileText className="h-3 w-3" /> {a.filename}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <RODComposer open={composerOpen} onOpenChange={setComposerOpen} editingSend={editingSend} />
    </div>
  );
}
