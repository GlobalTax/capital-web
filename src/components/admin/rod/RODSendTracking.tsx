import { useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Send, Loader2, TestTube, Mail, CheckCircle2, XCircle, AlertCircle,
  Search, Clock, MailCheck, CalendarClock, Trash2, Ban, Timer,
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface Props {
  sendId: string | null;
  language: string;
  onSendComplete: () => void;
}

interface RODSendEmail {
  id: string;
  email: string;
  full_name: string | null;
  company: string | null;
  subject: string;
  status: string;
  sent_at: string | null;
  error_message: string | null;
  is_manually_edited: boolean;
}

interface ScheduledBatch {
  id: string;
  send_id: string;
  scheduled_at: string;
  batch_size: number;
  delay_seconds: number;
  email_ids: string[] | null;
  status: string;
  sent_count: number;
  failed_count: number;
  started_at: string | null;
  completed_at: string | null;
  error_message: string | null;
  created_at: string;
}

export function RODSendTracking({ sendId, language, onSendComplete }: Props) {
  const queryClient = useQueryClient();
  const [testEmail, setTestEmail] = useState('');
  const [testSending, setTestSending] = useState(false);
  const [sendingAll, setSendingAll] = useState(false);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  // Schedule state
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('09:00');
  const [batchSize, setBatchSize] = useState('20');
  const [delaySeconds, setDelaySeconds] = useState('30');
  const [scheduling, setScheduling] = useState(false);

  // Fetch emails with status
  const { data: emails = [], isLoading } = useQuery({
    queryKey: ['rod-send-emails-tracking', sendId],
    queryFn: async () => {
      if (!sendId) return [];
      const { data, error } = await supabase
        .from('rod_send_emails' as any)
        .select('id, email, full_name, company, subject, status, sent_at, error_message, is_manually_edited')
        .eq('send_id', sendId)
        .order('status', { ascending: true });
      if (error) throw error;
      return (data || []) as unknown as RODSendEmail[];
    },
    enabled: !!sendId,
    refetchInterval: sendingAll ? 3000 : false,
  });

  // Fetch scheduled batches
  const { data: batches = [] } = useQuery({
    queryKey: ['rod-scheduled-batches', sendId],
    queryFn: async () => {
      if (!sendId) return [];
      const { data, error } = await supabase
        .from('rod_scheduled_batches' as any)
        .select('*')
        .eq('send_id', sendId)
        .order('scheduled_at', { ascending: true });
      if (error) throw error;
      return (data || []) as unknown as ScheduledBatch[];
    },
    enabled: !!sendId,
    refetchInterval: 10000,
  });

  const filtered = useMemo(() => {
    if (!search.trim()) return emails;
    const q = search.toLowerCase();
    return emails.filter(e =>
      (e.full_name || '').toLowerCase().includes(q) ||
      (e.email || '').toLowerCase().includes(q) ||
      (e.company || '').toLowerCase().includes(q)
    );
  }, [emails, search]);

  const pendingCount = emails.filter(e => e.status === 'pending').length;
  const sentCount = emails.filter(e => e.status === 'sent').length;
  const failedCount = emails.filter(e => e.status === 'failed').length;

  const pendingBatches = batches.filter(b => b.status === 'pending');
  const scheduledEmailCount = pendingBatches.reduce((sum, b) => sum + b.batch_size, 0);

  // Test send
  const sendTest = async () => {
    if (!testEmail.trim()) { toast.error('Introduce un email'); return; }
    if (!sendId) { toast.error('Guarda el borrador primero'); return; }
    setTestSending(true);
    try {
      const { error } = await supabase.functions.invoke('send-rod-email', {
        body: { send_id: sendId, test_mode: true, test_email: testEmail.trim() },
      });
      if (error) throw error;
      toast.success(`Prueba enviada a ${testEmail}`);
    } catch (e: any) {
      toast.error('Error: ' + e.message);
    } finally {
      setTestSending(false);
    }
  };

  // Send all pending (immediate)
  const sendAll = async () => {
    if (!sendId) return;
    if (pendingCount === 0) { toast.error('No hay emails pendientes'); return; }
    if (!confirm(`¿Enviar ${pendingCount} emails pendientes AHORA?`)) return;

    setSendingAll(true);
    try {
      const { error } = await supabase.functions.invoke('send-rod-email', {
        body: { send_id: sendId, use_generated_emails: true },
      });
      if (error) throw error;
      toast.success('Envío masivo iniciado');
      queryClient.invalidateQueries({ queryKey: ['rod-send-emails-tracking', sendId] });
      onSendComplete();
    } catch (e: any) {
      toast.error('Error: ' + e.message);
    } finally {
      setSendingAll(false);
    }
  };

  // Send individual
  const sendIndividual = async (emailId: string) => {
    if (!sendId) return;
    setSendingId(emailId);
    try {
      const { error } = await supabase.functions.invoke('send-rod-email', {
        body: { send_id: sendId, use_generated_emails: true, email_ids: [emailId] },
      });
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ['rod-send-emails-tracking', sendId] });
      toast.success('Email enviado');
    } catch (e: any) {
      toast.error('Error: ' + e.message);
    } finally {
      setSendingId(null);
    }
  };

  // Schedule a batch
  const scheduleBatch = async () => {
    if (!sendId) { toast.error('Guarda el borrador primero'); return; }
    if (!scheduleDate) { toast.error('Selecciona una fecha'); return; }
    if (pendingCount === 0) { toast.error('No hay emails pendientes para programar'); return; }

    const size = parseInt(batchSize) || 20;
    const delay = parseInt(delaySeconds) || 30;
    const scheduledAt = new Date(`${scheduleDate}T${scheduleTime}:00`);

    if (scheduledAt <= new Date()) {
      toast.error('La fecha debe ser futura');
      return;
    }

    setScheduling(true);
    try {
      const { error } = await supabase
        .from('rod_scheduled_batches' as any)
        .insert({
          send_id: sendId,
          scheduled_at: scheduledAt.toISOString(),
          batch_size: size,
          delay_seconds: delay,
          status: 'pending',
        });
      if (error) throw error;
      toast.success(`Lote de ${size} emails programado para ${format(scheduledAt, "dd/MM/yyyy HH:mm", { locale: es })}`);
      queryClient.invalidateQueries({ queryKey: ['rod-scheduled-batches', sendId] });
      setScheduleDate('');
    } catch (e: any) {
      toast.error('Error: ' + e.message);
    } finally {
      setScheduling(false);
    }
  };

  // Cancel a batch
  const cancelBatch = async (batchId: string) => {
    try {
      const { error } = await supabase
        .from('rod_scheduled_batches' as any)
        .update({ status: 'cancelled' })
        .eq('id', batchId);
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ['rod-scheduled-batches', sendId] });
      toast.success('Lote cancelado');
    } catch (e: any) {
      toast.error('Error: ' + e.message);
    }
  };

  const batchStatusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: any }> = {
    pending: { label: 'Programado', variant: 'secondary', icon: Clock },
    processing: { label: 'Enviando...', variant: 'default', icon: Loader2 },
    completed: { label: 'Completado', variant: 'default', icon: CheckCircle2 },
    failed: { label: 'Error', variant: 'destructive', icon: XCircle },
    cancelled: { label: 'Cancelado', variant: 'outline', icon: Ban },
  };

  return (
    <div className="space-y-6">
      {/* Test send section */}
      <Card>
        <CardHeader className="py-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <TestTube className="h-4 w-4" />
            Envío de prueba
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground mb-3">
            Envía una prueba a cualquier dirección para verificar cómo llega el email. Puedes reenviar tantas veces como quieras.
          </p>
          <div className="flex items-end gap-2">
            <div className="flex-1 max-w-sm">
              <Label className="text-xs">Email de prueba</Label>
              <Input
                value={testEmail}
                onChange={e => setTestEmail(e.target.value)}
                placeholder="test@ejemplo.com"
                className="h-9"
                type="email"
              />
            </div>
            <Button size="sm" onClick={sendTest} disabled={testSending || !sendId}>
              {testSending ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Send className="h-4 w-4 mr-1" />}
              Enviar prueba
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Schedule send section */}
      <Card>
        <CardHeader className="py-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <CalendarClock className="h-4 w-4" />
            Programar envío por lotes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-xs text-muted-foreground">
            Programa el envío para una fecha y hora específica. Define cuántos emails enviar y el intervalo entre cada uno para evitar spam.
          </p>

          {/* Stats */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{pendingCount}</span>
              <span className="text-muted-foreground">pendientes</span>
            </div>
            <div className="flex items-center gap-1.5 text-sm">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span className="font-medium">{sentCount}</span>
              <span className="text-muted-foreground">enviados</span>
            </div>
            {failedCount > 0 && (
              <div className="flex items-center gap-1.5 text-sm">
                <XCircle className="h-4 w-4 text-red-500" />
                <span className="font-medium">{failedCount}</span>
                <span className="text-muted-foreground">fallidos</span>
              </div>
            )}
            {scheduledEmailCount > 0 && (
              <div className="flex items-center gap-1.5 text-sm">
                <CalendarClock className="h-4 w-4 text-blue-500" />
                <span className="font-medium">~{scheduledEmailCount}</span>
                <span className="text-muted-foreground">programados</span>
              </div>
            )}
          </div>

          <Separator />

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <Label className="text-xs">Fecha</Label>
              <Input
                type="date"
                value={scheduleDate}
                onChange={e => setScheduleDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="h-9 text-sm"
              />
            </div>
            <div>
              <Label className="text-xs">Hora</Label>
              <Input
                type="time"
                value={scheduleTime}
                onChange={e => setScheduleTime(e.target.value)}
                className="h-9 text-sm"
              />
            </div>
            <div>
              <Label className="text-xs">Emails en este lote</Label>
              <Select value={batchSize} onValueChange={setBatchSize}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 emails</SelectItem>
                  <SelectItem value="10">10 emails</SelectItem>
                  <SelectItem value="20">20 emails</SelectItem>
                  <SelectItem value="30">30 emails</SelectItem>
                  <SelectItem value="50">50 emails</SelectItem>
                  <SelectItem value="100">100 emails</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Espera entre emails</Label>
              <Select value={delaySeconds} onValueChange={setDelaySeconds}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10 seg</SelectItem>
                  <SelectItem value="20">20 seg</SelectItem>
                  <SelectItem value="30">30 seg</SelectItem>
                  <SelectItem value="45">45 seg</SelectItem>
                  <SelectItem value="60">1 min</SelectItem>
                  <SelectItem value="120">2 min</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button onClick={scheduleBatch} disabled={scheduling || !sendId || !scheduleDate || pendingCount === 0} size="sm">
              {scheduling ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <CalendarClock className="h-4 w-4 mr-1.5" />}
              Programar lote
            </Button>
            <span className="text-xs text-muted-foreground">
              {scheduleDate && scheduleTime && (
                <>~{Math.ceil(parseInt(batchSize) * parseInt(delaySeconds) / 60)} min de envío estimado</>
              )}
            </span>
          </div>

          {/* Scheduled batches list */}
          {batches.length > 0 && (
            <>
              <Separator />
              <div>
                <h4 className="text-xs font-medium mb-2 flex items-center gap-1.5">
                  <Timer className="h-3.5 w-3.5" />
                  Lotes programados
                </h4>
                <div className="space-y-2">
                  {batches.map(batch => {
                    const config = batchStatusConfig[batch.status] || batchStatusConfig.pending;
                    const Icon = config.icon;
                    return (
                      <div key={batch.id} className="flex items-center justify-between p-3 border rounded-lg text-sm">
                        <div className="flex items-center gap-3">
                          <Badge variant={config.variant} className="text-[10px]">
                            <Icon className={`h-3 w-3 mr-0.5 ${batch.status === 'processing' ? 'animate-spin' : ''}`} />
                            {config.label}
                          </Badge>
                          <span className="text-muted-foreground">
                            {format(new Date(batch.scheduled_at), "dd/MM/yyyy HH:mm", { locale: es })}
                          </span>
                          <span className="font-medium">{batch.batch_size} emails</span>
                          <span className="text-xs text-muted-foreground">
                            ({batch.delay_seconds}s entre envíos)
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {batch.status === 'completed' && (
                            <span className="text-xs text-green-600">
                              ✓ {batch.sent_count} enviados{batch.failed_count > 0 && `, ${batch.failed_count} fallidos`}
                            </span>
                          )}
                          {batch.status === 'pending' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 text-xs text-destructive hover:text-destructive"
                              onClick={() => cancelBatch(batch.id)}
                            >
                              <Ban className="h-3 w-3 mr-1" />
                              Cancelar
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          <Separator />

          {/* Immediate send - secondary option */}
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={sendAll} disabled={sendingAll || pendingCount === 0 || !sendId} size="sm">
              {sendingAll ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <Send className="h-4 w-4 mr-1.5" />}
              Enviar todo ahora ({pendingCount})
            </Button>
            <span className="text-xs text-muted-foreground">
              ⚠️ Envío inmediato sin programación
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Tracking table */}
      {emails.length > 0 && (
        <Card>
          <CardHeader className="py-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Seguimiento de envíos</CardTitle>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar..."
                  className="pl-9 h-8 text-xs"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Contacto</TableHead>
                    <TableHead className="text-xs">Email</TableHead>
                    <TableHead className="text-xs">Empresa</TableHead>
                    <TableHead className="text-xs">Estado</TableHead>
                    <TableHead className="text-xs">Fecha envío</TableHead>
                    <TableHead className="text-xs w-20" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map(email => (
                    <TableRow key={email.id}>
                      <TableCell className="text-xs font-medium">{email.full_name || '—'}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{email.email}</TableCell>
                      <TableCell className="text-xs">{email.company || '—'}</TableCell>
                      <TableCell>
                        <Badge
                          variant={email.status === 'sent' ? 'default' : email.status === 'failed' ? 'destructive' : 'secondary'}
                          className="text-[10px]"
                          title={email.error_message || ''}
                        >
                          {email.status === 'pending' && <Clock className="h-3 w-3 mr-0.5" />}
                          {email.status === 'sent' && <CheckCircle2 className="h-3 w-3 mr-0.5" />}
                          {email.status === 'failed' && <XCircle className="h-3 w-3 mr-0.5" />}
                          {email.status === 'pending' ? 'Pendiente' : email.status === 'sent' ? 'Enviado' : 'Error'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {email.sent_at ? format(new Date(email.sent_at), 'dd/MM/yy HH:mm') : '—'}
                      </TableCell>
                      <TableCell>
                        {email.status === 'pending' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs"
                            disabled={sendingId === email.id}
                            onClick={() => sendIndividual(email.id)}
                          >
                            {sendingId === email.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />}
                          </Button>
                        )}
                        {email.status === 'failed' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs text-amber-600"
                            disabled={sendingId === email.id}
                            onClick={() => sendIndividual(email.id)}
                          >
                            Reintentar
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
