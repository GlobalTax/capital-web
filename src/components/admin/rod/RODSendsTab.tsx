import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Send, Save, Loader2, Mail, Eye, Clock, CheckCircle2, XCircle, AlertCircle, TestTube } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

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
  error_message: string | null;
  created_at: string;
}

interface RODDocument {
  id: string;
  title: string;
  file_type: string;
  language: string;
  is_active: boolean;
}

const STATUS_CONFIG: Record<string, { label: string; icon: React.ReactNode; className: string }> = {
  draft: { label: 'Borrador', icon: <Save className="h-3 w-3" />, className: 'bg-muted text-muted-foreground' },
  scheduled: { label: 'Programado', icon: <Clock className="h-3 w-3" />, className: 'bg-blue-100 text-blue-800' },
  sending: { label: 'Enviando…', icon: <Loader2 className="h-3 w-3 animate-spin" />, className: 'bg-amber-100 text-amber-800' },
  sent: { label: 'Enviado', icon: <CheckCircle2 className="h-3 w-3" />, className: 'bg-green-100 text-green-800' },
  failed: { label: 'Error', icon: <XCircle className="h-3 w-3" />, className: 'bg-red-100 text-red-800' },
  cancelled: { label: 'Cancelado', icon: <AlertCircle className="h-3 w-3" />, className: 'bg-muted text-muted-foreground' },
};

export const RODSendsTab: React.FC = () => {
  const queryClient = useQueryClient();
  const [composerOpen, setComposerOpen] = useState(false);
  const [editingSend, setEditingSend] = useState<RODSend | null>(null);

  // Fetch sends history
  const { data: sends = [], isLoading } = useQuery({
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

  const openComposer = (send?: RODSend) => {
    setEditingSend(send || null);
    setComposerOpen(true);
  };

  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium">Envíos ROD</h3>
            <p className="text-xs text-muted-foreground">Envío masivo de la Relación de Oportunidades</p>
          </div>
          <Button size="sm" onClick={() => openComposer()}>
            <Plus className="h-4 w-4 mr-1" /> Nuevo envío
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : sends.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No hay envíos todavía</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Asunto</TableHead>
                  <TableHead className="text-xs">Idioma</TableHead>
                  <TableHead className="text-xs">Estado</TableHead>
                  <TableHead className="text-xs text-right">Enviados</TableHead>
                  <TableHead className="text-xs">Fecha</TableHead>
                  <TableHead className="text-xs" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {sends.map(s => {
                  const cfg = STATUS_CONFIG[s.status] || STATUS_CONFIG.draft;
                  return (
                    <TableRow key={s.id}>
                      <TableCell className="text-xs font-medium max-w-[200px] truncate">{s.subject || '(sin asunto)'}</TableCell>
                      <TableCell className="text-xs">{s.target_language === 'es' ? '🇪🇸' : s.target_language === 'en' ? '🇬🇧' : '🌐'}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${cfg.className}`}>
                          {cfg.icon} {cfg.label}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs text-right">
                        {s.sent_count ?? 0}/{s.total_recipients ?? 0}
                        {(s.failed_count ?? 0) > 0 && <span className="text-red-500 ml-1">({s.failed_count} err)</span>}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {s.sent_at ? format(new Date(s.sent_at), 'dd/MM/yy HH:mm') : s.created_at ? format(new Date(s.created_at), 'dd/MM/yy HH:mm') : '—'}
                      </TableCell>
                      <TableCell>
                        {s.status === 'draft' && (
                          <Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => openComposer(s)}>
                            Editar
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}

        <RODSendComposer
          open={composerOpen}
          onOpenChange={setComposerOpen}
          existingSend={editingSend}
          onSaved={() => {
            queryClient.invalidateQueries({ queryKey: ['rod-sends'] });
            setComposerOpen(false);
          }}
        />
      </CardContent>
    </Card>
  );
};

// ---------- Composer Dialog ----------

interface ComposerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  existingSend: RODSend | null;
  onSaved: () => void;
}

const RODSendComposer: React.FC<ComposerProps> = ({ open, onOpenChange, existingSend, onSaved }) => {
  const [language, setLanguage] = useState(existingSend?.target_language || 'es');
  const [subject, setSubject] = useState(existingSend?.subject || '');
  const [bodyText, setBodyText] = useState(existingSend?.body_text || '');
  const [selectedAttachments, setSelectedAttachments] = useState<string[]>(existingSend?.attachment_ids || []);
  const [scheduledAt, setScheduledAt] = useState(existingSend?.scheduled_at || '');
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [testSending, setTestSending] = useState(false);

  // Reset form when opening
  React.useEffect(() => {
    if (open) {
      setLanguage(existingSend?.target_language || 'es');
      setSubject(existingSend?.subject || '');
      setBodyText(existingSend?.body_text || '');
      setSelectedAttachments(existingSend?.attachment_ids || []);
      setScheduledAt(existingSend?.scheduled_at || '');
      setTestEmail('');
    }
  }, [open, existingSend]);

  // Fetch list member count for selected language
  const { data: recipientCount = 0 } = useQuery({
    queryKey: ['rod-list-count', language],
    queryFn: async () => {
      const langs = language === 'both' ? ['es', 'en'] : [language];
      let total = 0;
      for (const lang of langs) {
        const { count, error } = await supabase
          .from('rod_list_members' as any)
          .select('id', { count: 'exact', head: true })
          .eq('language', lang)
          .not('email', 'is', null);
        if (!error) total += (count || 0);
      }
      return total;
    },
    enabled: open,
  });

  // Fetch active ROD documents
  const { data: documents = [] } = useQuery({
    queryKey: ['rod-documents-active'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rod_documents')
        .select('id, title, file_type, language, is_active')
        .eq('is_active', true)
        .eq('is_deleted', false)
        .order('language');
      if (error) throw error;
      return (data || []) as RODDocument[];
    },
    enabled: open,
  });

  // Filter docs by language
  const filteredDocs = useMemo(() => {
    if (language === 'both') return documents;
    return documents.filter(d => d.language === language);
  }, [documents, language]);

  const insertVariable = (variable: string) => {
    setBodyText(prev => prev + `{{${variable}}}`);
  };

  const previewBody = bodyText
    .replace(/\{\{nombre\}\}/g, 'Juan Ejemplo')
    .replace(/\{\{empresa\}\}/g, 'Empresa Demo S.L.');

  const saveDraft = async () => {
    setSaving(true);
    try {
      const payload = {
        subject,
        body_html: bodyText.replace(/\n/g, '<br/>'),
        body_text: bodyText,
        target_language: language,
        attachment_ids: selectedAttachments,
        scheduled_at: scheduledAt || null,
        status: 'draft' as const,
      };

      if (existingSend) {
        const { error } = await supabase
          .from('rod_sends')
          .update(payload)
          .eq('id', existingSend.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('rod_sends')
          .insert(payload);
        if (error) throw error;
      }

      toast.success('Borrador guardado');
      onSaved();
    } catch (e: any) {
      toast.error('Error guardando: ' + e.message);
    } finally {
      setSaving(false);
    }
  };

  const sendTestEmail = async () => {
    if (!testEmail.trim()) {
      toast.error('Introduce un email de prueba');
      return;
    }
    if (!subject.trim()) {
      toast.error('El asunto es obligatorio');
      return;
    }

    setTestSending(true);
    try {
      // Save/update the draft first
      let sendId = existingSend?.id;
      const payload = {
        subject,
        body_html: bodyText.replace(/\n/g, '<br/>'),
        body_text: bodyText,
        target_language: language,
        attachment_ids: selectedAttachments,
        status: 'draft' as const,
      };

      if (sendId) {
        await supabase.from('rod_sends').update(payload).eq('id', sendId);
      } else {
        const { data, error } = await supabase
          .from('rod_sends')
          .insert(payload)
          .select('id')
          .single();
        if (error) throw error;
        sendId = data.id;
      }

      // Invoke test send
      const { error } = await supabase.functions.invoke('send-rod-email', {
        body: {
          send_id: sendId,
          test_mode: true,
          test_email: testEmail.trim(),
        },
      });
      if (error) throw error;
      toast.success(`Email de prueba enviado a ${testEmail}`);
    } catch (e: any) {
      toast.error('Error enviando prueba: ' + e.message);
    } finally {
      setTestSending(false);
    }
  };

  const sendNow = async () => {
    if (!subject.trim()) {
      toast.error('El asunto es obligatorio');
      return;
    }
    if (recipientCount === 0) {
      toast.error('No hay destinatarios en el listado seleccionado');
      return;
    }
    if (!confirm(`¿Enviar ahora a ${recipientCount} destinatarios?`)) return;

    setSending(true);
    try {
      // Save first
      let sendId = existingSend?.id;
      const payload = {
        subject,
        body_html: bodyText.replace(/\n/g, '<br/>'),
        body_text: bodyText,
        target_language: language,
        attachment_ids: selectedAttachments,
        total_recipients: recipientCount,
        status: 'sending' as const,
      };

      if (sendId) {
        await supabase.from('rod_sends').update(payload).eq('id', sendId);
      } else {
        const { data, error } = await supabase
          .from('rod_sends')
          .insert(payload)
          .select('id')
          .single();
        if (error) throw error;
        sendId = data.id;
      }

      const { error } = await supabase.functions.invoke('send-rod-email', {
        body: { send_id: sendId },
      });
      if (error) throw error;
      toast.success('Envío iniciado');
      onSaved();
    } catch (e: any) {
      toast.error('Error enviando: ' + e.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            {existingSend ? 'Editar envío ROD' : 'Nuevo envío ROD'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          {/* Language + recipients */}
          <div className="flex items-center gap-4">
            <div>
              <Label className="text-xs">Lista destino</Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="w-[180px] h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="es">🇪🇸 Castellano</SelectItem>
                  <SelectItem value="en">🇬🇧 Inglés</SelectItem>
                  <SelectItem value="both">🌐 Ambas listas</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-5">
              <Mail className="h-4 w-4" />
              <span className="font-medium">{recipientCount}</span> destinatarios
            </div>
          </div>

          {/* Variables */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Variables:</span>
            <Button variant="outline" size="sm" className="h-6 text-xs px-2" onClick={() => insertVariable('nombre')}>
              {'{{nombre}}'}
            </Button>
            <Button variant="outline" size="sm" className="h-6 text-xs px-2" onClick={() => insertVariable('empresa')}>
              {'{{empresa}}'}
            </Button>
          </div>

          {/* Subject + body + preview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div>
                <Label className="text-xs">Asunto</Label>
                <Input
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  placeholder="Relación de Oportunidades Q2 2026 Capittal"
                  className="h-9"
                />
              </div>
              <div>
                <Label className="text-xs">Cuerpo del email</Label>
                <Textarea
                  value={bodyText}
                  onChange={e => setBodyText(e.target.value)}
                  placeholder="Buenos días,&#10;&#10;Le adjuntamos la última Relación de Oportunidades..."
                  className="min-h-[200px] text-sm"
                />
              </div>
            </div>
            <div>
              <Label className="text-xs flex items-center gap-1">
                <Eye className="h-3 w-3" /> Vista previa
              </Label>
              <div className="border rounded-md p-4 bg-muted/30 min-h-[280px]">
                <p className="text-xs text-muted-foreground mb-1">Asunto:</p>
                <p className="text-sm font-medium mb-3">{subject || '(sin asunto)'}</p>
                <div className="text-sm whitespace-pre-line">{previewBody || '(sin contenido)'}</div>
              </div>
            </div>
          </div>

          {/* Attachments */}
          <div>
            <Label className="text-xs">Documentos adjuntos (ROD)</Label>
            {filteredDocs.length === 0 ? (
              <p className="text-xs text-muted-foreground mt-1">No hay documentos activos para este idioma</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                {filteredDocs.map(doc => (
                  <label
                    key={doc.id}
                    className={`flex items-center gap-3 border rounded-md p-3 cursor-pointer transition-colors ${
                      selectedAttachments.includes(doc.id) ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                    }`}
                  >
                    <Checkbox
                      checked={selectedAttachments.includes(doc.id)}
                      onCheckedChange={(checked) => {
                        setSelectedAttachments(prev =>
                          checked ? [...prev, doc.id] : prev.filter(id => id !== doc.id)
                        );
                      }}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium truncate">{doc.title}</p>
                      <p className="text-[10px] text-muted-foreground uppercase">{doc.language} {doc.file_type}</p>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Schedule */}
          <div>
            <Label className="text-xs flex items-center gap-1">
              <Clock className="h-3 w-3" /> Programar envío (opcional)
            </Label>
            <Input
              type="datetime-local"
              value={scheduledAt ? scheduledAt.slice(0, 16) : ''}
              onChange={e => setScheduledAt(e.target.value ? new Date(e.target.value).toISOString() : '')}
              className="w-[280px] h-9 mt-1"
            />
          </div>

          {/* Test send */}
          <div className="border rounded-md p-3 bg-muted/20 space-y-2">
            <Label className="text-xs flex items-center gap-1 font-medium">
              <TestTube className="h-3 w-3" /> Envío de prueba
            </Label>
            <p className="text-[11px] text-muted-foreground">
              Envía una copia de prueba a un email para verificar cómo se ve antes de enviar a toda la lista. Puedes reenviar cuantas veces quieras.
            </p>
            <div className="flex items-center gap-2">
              <Input
                type="email"
                placeholder="tu@email.com"
                value={testEmail}
                onChange={e => setTestEmail(e.target.value)}
                className="h-8 text-sm max-w-[280px]"
              />
              <Button
                size="sm"
                variant="outline"
                className="h-8 text-xs"
                onClick={sendTestEmail}
                disabled={testSending || !testEmail.trim()}
              >
                {testSending ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Send className="h-3 w-3 mr-1" />}
                Enviar prueba
              </Button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2 border-t">
            <Button variant="outline" onClick={saveDraft} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
              Guardar borrador
            </Button>
            <Button onClick={sendNow} disabled={sending || recipientCount === 0}>
              {sending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Send className="h-4 w-4 mr-1" />}
              Enviar ahora ({recipientCount})
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RODSendsTab;
