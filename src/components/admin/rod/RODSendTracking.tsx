import { useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Send, Loader2, TestTube, Mail, CheckCircle2, XCircle, AlertCircle,
  Search, Clock, MailCheck,
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

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

export function RODSendTracking({ sendId, language, onSendComplete }: Props) {
  const queryClient = useQueryClient();
  const [testEmail, setTestEmail] = useState('');
  const [testSending, setTestSending] = useState(false);
  const [sendingAll, setSendingAll] = useState(false);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');

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

  // Send all pending
  const sendAll = async () => {
    if (!sendId) return;
    if (pendingCount === 0) { toast.error('No hay emails pendientes'); return; }
    if (!confirm(`¿Enviar ${pendingCount} emails pendientes?`)) return;

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

      {/* Mass send section */}
      <Card>
        <CardHeader className="py-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <MailCheck className="h-4 w-4" />
            Envío masivo
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Stats */}
          <div className="flex items-center gap-4 mb-4">
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
          </div>

          <Button onClick={sendAll} disabled={sendingAll || pendingCount === 0 || !sendId}>
            {sendingAll ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <Send className="h-4 w-4 mr-1.5" />}
            Enviar todos los pendientes ({pendingCount})
          </Button>
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
