import React, { useState, useMemo, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Send, Loader2, Mail, CheckCircle2, AlertCircle, Search, Building2, MoreVertical, RefreshCw, Eye, Clock, Users, CalendarCheck, MessageCircle } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useCampaignCompanies } from '@/hooks/useCampaignCompanies';
import { useCampaignEmails } from '@/hooks/useCampaignEmails';
import { ValuationCampaign } from '@/hooks/useCampaigns';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import { SendScheduleConfig, SendScheduleSettings, createSendThrottle } from '@/components/admin/campanas-valoracion/shared/SendScheduleConfig';
import { OutboundQueueMonitor } from '@/components/admin/campanas-valoracion/shared/OutboundQueueMonitor';
import { useOutboundQueue } from '@/hooks/useOutboundQueue';
import { DateRangeFilter, DateRangeFilterValue, matchesDateRange } from '@/components/admin/campanas-valoracion/shared/DateRangeFilter';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

// Seguimiento states loaded from DB
import { useSeguimientoOptions, getSeguimientoOption } from '@/hooks/useSeguimientoOptions';

// ─── Inline Seguimiento Badge Select ────────────────────────────────────
function SeguimientoBadge({ company, campaignId }: { company: any; campaignId: string }) {
  const [saving, setSaving] = useState(false);
  const queryClient = useQueryClient();
  const SEGUIMIENTO_OPTIONS = useSeguimientoOptions();
  const current = getSeguimientoOption(SEGUIMIENTO_OPTIONS, company.seguimiento_estado);

  const handleChange = useCallback(async (newValue: string) => {
    if (newValue === (company.seguimiento_estado || 'sin_respuesta')) return;
    setSaving(true);
    try {
      const { error } = await (supabase as any)
        .from('valuation_campaign_companies')
        .update({ seguimiento_estado: newValue })
        .eq('id', company.id);
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ['valuation-campaign-companies', campaignId] });
    } catch (e: any) {
      toast.error('Error al guardar seguimiento: ' + e.message);
    } finally {
      setSaving(false);
    }
  }, [company.id, company.seguimiento_estado, campaignId, queryClient]);

  return (
    <div className="flex items-center justify-center" onClick={e => e.stopPropagation()}>
      {saving ? (
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      ) : (
        <Select value={company.seguimiento_estado || 'sin_respuesta'} onValueChange={handleChange}>
          <SelectTrigger className={cn(
            "h-7 text-[10px] font-medium px-2 py-0 border rounded-full w-auto min-w-[120px] gap-1",
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

// ─── Notes Popover ──────────────────────────────────────────────────────
function NotasPopover({ company, campaignId }: { company: any; campaignId: string }) {
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

interface Props {
  campaignId: string;
  campaign: ValuationCampaign;
}

type ResendConfirm = 
  | { type: 'single'; emailId: string; companyName: string }
  | { type: 'bulk'; emailIds: string[]; count: number }
  | null;

export const DocumentSendStep: React.FC<Props> = ({ campaignId, campaign }) => {
  const SEGUIMIENTO_OPTIONS = useSeguimientoOptions();
  const { companies } = useCampaignCompanies(campaignId);
  const { emails, sendEmail, sendAllPending, isSendingAll, isLoading } = useCampaignEmails(campaignId);
  const { createJob, hasActiveJob } = useOutboundQueue(campaignId);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [resendConfirm, setResendConfirm] = useState<ResendConfirm>(null);
  const [sendConfig, setSendConfig] = useState<SendScheduleSettings>({ intervalMs: 30000, maxPerHour: null, scheduledAt: null, serverSide: false, includeValuationPdf: true, includeStudyPdf: true });
  const [scheduledCountdown, setScheduledCountdown] = useState<string | null>(null);
  const scheduledTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [filterSentDate, setFilterSentDate] = useState<DateRangeFilterValue>({ from: null, to: null });
  const [filterSeguimiento, setFilterSeguimiento] = useState<string | null>(null);

  const emailMap = useMemo(() => {
    const map = new Map<string, typeof emails[0]>();
    emails.forEach(e => map.set(e.company_id, e));
    return map;
  }, [emails]);

  const filteredCompanies = useMemo(() => {
    return companies.filter(c => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        if (
          !c.client_company?.toLowerCase().includes(q) &&
          !c.client_email?.toLowerCase().includes(q) &&
          !c.client_name?.toLowerCase().includes(q)
        ) return false;
      }
      if (filterSentDate.from || filterSentDate.to) {
        const email = emailMap.get(c.id);
        if (!matchesDateRange(email?.sent_at ?? null, filterSentDate)) return false;
      }
      if (filterSeguimiento) {
        const estado = c.seguimiento_estado || 'sin_respuesta';
        if (estado !== filterSeguimiento) return false;
      }
      return true;
    });
  }, [companies, searchQuery, filterSentDate, emailMap, filterSeguimiento]);

  const pendingEmails = emails.filter(e => e.status === 'pending');
  const sentEmails = emails.filter(e => e.status === 'sent');
  const errorEmails = emails.filter(e => e.status === 'error');
  const openedEmails = emails.filter(e => e.email_opened === true);
  const interesados = companies.filter(c => c.seguimiento_estado === 'interesado');
  const reuniones = companies.filter(c => c.seguimiento_estado === 'reunion_agendada');

  const resetAndResend = async (emailId: string) => {
    setSendingId(emailId);
    try {
      await supabase.from('campaign_emails')
        .update({ status: 'pending', sent_at: null, error_message: null })
        .eq('id', emailId);
      await sendEmail(emailId);
    } catch {
      // error handled by hook
    } finally {
      setSendingId(null);
    }
  };

  const handleResendConfirm = async () => {
    if (!resendConfirm) return;
    if (resendConfirm.type === 'single') {
      await resetAndResend(resendConfirm.emailId);
    } else {
      for (const emailId of resendConfirm.emailIds) {
        await resetAndResend(emailId);
      }
    }
    setResendConfirm(null);
  };

  const handleSendSingle = async (emailId: string) => {
    setSendingId(emailId);
    try {
      await sendEmail(emailId);
    } catch {
      // error handled by hook
    } finally {
      setSendingId(null);
    }
  };

  const executeSendAllLoop = async () => {
    if (pendingEmails.length === 0) {
      toast.info('No hay emails pendientes para enviar');
      return;
    }
    setScheduledCountdown(null);
    const throttle = createSendThrottle(sendConfig);

    for (let i = 0; i < pendingEmails.length; i++) {
      const email = pendingEmails[i];
      setSendingId(email.id);
      try {
        await sendEmail(email.id);
        if (i < pendingEmails.length - 1) {
          await throttle();
        }
      } catch {
        // handled by hook
      } finally {
        setSendingId(null);
      }
    }
  };

  const handleSendAll = async () => {
    if (pendingEmails.length === 0) {
      toast.info('No hay emails pendientes para enviar');
      return;
    }

    // SERVER-SIDE MODE
    if (sendConfig.serverSide) {
      const emailIds = pendingEmails.map(e => e.id);
      await createJob.mutateAsync({
        campaignId,
        sendType: 'document',
        emailIds,
        intervalMs: sendConfig.intervalMs,
        maxPerHour: sendConfig.maxPerHour,
        scheduledAt: sendConfig.scheduledAt || new Date(),
      });
      return;
    }

    // CLIENT-SIDE
    if (sendConfig.scheduledAt && sendConfig.scheduledAt.getTime() > Date.now()) {
      const updateCountdown = () => {
        const diff = (sendConfig.scheduledAt?.getTime() ?? 0) - Date.now();
        if (diff <= 0) {
          setScheduledCountdown(null);
          if (scheduledTimerRef.current) clearInterval(scheduledTimerRef.current);
          executeSendAllLoop();
          return;
        }
        const h = Math.floor(diff / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        const s = Math.floor((diff % 60000) / 1000);
        setScheduledCountdown(`${h > 0 ? `${h}h ` : ''}${m}m ${s}s`);
      };
      updateCountdown();
      scheduledTimerRef.current = setInterval(updateCountdown, 1000);
      toast.success(`Envío programado para ${format(sendConfig.scheduledAt, "dd MMM yyyy 'a las' HH:mm", { locale: es })}`);
      return;
    }

    await executeSendAllLoop();
  };

  const handleCancelSchedule = () => {
    if (scheduledTimerRef.current) clearInterval(scheduledTimerRef.current);
    setScheduledCountdown(null);
    toast.info('Envío programado cancelado');
  };

  const handleBulkResend = () => {
    const sentEmailIds = sentEmails.map(e => e.id);
    if (sentEmailIds.length === 0) return;
    setResendConfirm({ type: 'bulk', emailIds: sentEmailIds, count: sentEmailIds.length });
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedIds.size === filteredCompanies.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredCompanies.map(c => c.id)));
    }
  };

  return (
    <div className="space-y-6">
      {/* Queue Monitor */}
      <OutboundQueueMonitor campaignId={campaignId} />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-7 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Empresas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{companies.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
              <Mail className="h-4 w-4" /> Emails Generados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{emails.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
              <CheckCircle2 className="h-4 w-4" /> Enviados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">{sentEmails.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
              <Eye className="h-4 w-4" /> Abiertos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-blue-600">{openedEmails.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
              <AlertCircle className="h-4 w-4" /> Pendientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-amber-600">{pendingEmails.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
              <Users className="h-4 w-4" /> Interesados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-emerald-600">{interesados.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
              <CalendarCheck className="h-4 w-4" /> Reuniones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-violet-600">{reuniones.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          {/* Schedule config panel */}
          <SendScheduleConfig
            value={sendConfig}
            onChange={setSendConfig}
            disabled={isSendingAll || !!scheduledCountdown}
          />

          {/* Scheduled countdown */}
          {scheduledCountdown && (
            <div className="flex items-center gap-3 p-3 rounded-md bg-muted/50 border">
              <Clock className="h-5 w-5 text-muted-foreground animate-pulse" />
              <div className="flex-1">
                <p className="text-sm font-medium">Envío programado</p>
                <p className="text-xs text-muted-foreground">
                  Comienza en <span className="font-mono font-medium text-foreground">{scheduledCountdown}</span>
                  {sendConfig.scheduledAt && (
                    <> — {format(sendConfig.scheduledAt, "dd MMM yyyy 'a las' HH:mm", { locale: es })}</>
                  )}
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={handleCancelSchedule}>
                Cancelar
              </Button>
            </div>
          )}

          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {pendingEmails.length} pendiente{pendingEmails.length !== 1 ? 's' : ''} · {sentEmails.length} enviado{sentEmails.length !== 1 ? 's' : ''}
            </p>
            <div className="flex items-center gap-2">
              {sentEmails.length > 0 && (
                <Button variant="outline" onClick={handleBulkResend} disabled={isSendingAll || !!scheduledCountdown}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reenviar {sentEmails.length} enviados
                </Button>
              )}
              {pendingEmails.length > 0 && (
                <Button onClick={handleSendAll} disabled={isSendingAll || !!scheduledCountdown}>
                  {isSendingAll ? (
                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Enviando...</>
                  ) : (
                    <><Send className="h-4 w-4 mr-2" />{sendConfig.scheduledAt && !scheduledCountdown ? 'Programar envío' : `Enviar todos (${pendingEmails.length})`}</>
                  )}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Empresas ({filteredCompanies.length})
            </CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-8 text-sm"
                />
              </div>
              <DateRangeFilter label="Fecha envío" value={filterSentDate} onChange={setFilterSentDate} />
              <Select value={filterSeguimiento || 'all'} onValueChange={(v) => setFilterSeguimiento(v === 'all' ? null : v)}>
                <SelectTrigger className="h-8 w-[150px] text-xs">
                  <SelectValue placeholder="Seguimiento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todo seguimiento</SelectItem>
                  {SEGUIMIENTO_OPTIONS.map(opt => (
                    <SelectItem key={opt.value} value={opt.value} className="text-xs">{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="text-center py-10 text-muted-foreground text-sm">Cargando...</div>
          ) : filteredCompanies.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground text-sm">No hay empresas</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">
                    <Checkbox
                      checked={selectedIds.size === filteredCompanies.length && filteredCompanies.length > 0}
                      onCheckedChange={toggleAll}
                    />
                  </TableHead>
                  <TableHead>Empresa</TableHead>
                  <TableHead>Contacto</TableHead>
                  <TableHead>Email</TableHead>
                   <TableHead className="text-center">Estado</TableHead>
                   <TableHead className="text-center">Fecha envío</TableHead>
                   <TableHead className="text-center">Entrega</TableHead>
                   <TableHead className="text-center">Seguimiento</TableHead>
                   <TableHead className="text-center w-[40px]">Notas</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCompanies.map(c => {
                  const email = emailMap.get(c.id);
                  const status = email?.status || 'sin_email';
                  return (
                    <TableRow key={c.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedIds.has(c.id)}
                          onCheckedChange={() => toggleSelect(c.id)}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{c.client_company}</TableCell>
                      <TableCell className="text-sm">{c.client_name || '—'}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{c.client_email || '—'}</TableCell>
                      <TableCell className="text-center">
                        {status === 'sent' && <Badge variant="outline" className="border-green-300 text-green-700">Enviado</Badge>}
                        {status === 'pending' && <Badge variant="secondary">Pendiente</Badge>}
                        {status === 'error' && <Badge variant="destructive">Error</Badge>}
                        {status === 'sin_email' && <Badge variant="outline" className="text-muted-foreground">Sin email</Badge>}
                       </TableCell>
                       <TableCell className="text-center text-xs text-muted-foreground">
                         {email?.sent_at ? new Date(email.sent_at).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}
                       </TableCell>
                       <TableCell className="text-center">
                        {(() => {
                          if (!email || status !== 'sent') return <span className="text-muted-foreground">—</span>;
                          if (email.email_opened) return <Badge variant="outline" className="border-blue-300 bg-blue-50 text-blue-700">📩 Abierto</Badge>;
                          if (email.delivery_status === 'delivered') return <Badge variant="outline" className="border-emerald-300 bg-emerald-50 text-emerald-700">✓ Entregado</Badge>;
                          if (email.delivery_status === 'bounced') return <Badge variant="outline" className="border-red-300 bg-red-50 text-red-700">✗ Rebotado</Badge>;
                          if (email.delivery_status === 'bounced') return <Badge variant="outline" className="border-red-300 bg-red-50 text-red-700">✗ Rebotado</Badge>;
                          return <Badge variant="outline" className="text-muted-foreground">Enviado</Badge>;
                        })()}
                      </TableCell>
                      <TableCell className="text-center">
                        <SeguimientoBadge company={c} campaignId={campaignId} />
                      </TableCell>
                      <TableCell className="text-center">
                        <NotasPopover company={c} campaignId={campaignId} />
                      </TableCell>
                      <TableCell className="text-right">
                        {email && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" disabled={sendingId === email.id}>
                                {sendingId === email.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <MoreVertical className="h-4 w-4" />
                                )}
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {status === 'pending' && (
                                <DropdownMenuItem onClick={() => handleSendSingle(email.id)}>
                                  <Send className="h-4 w-4 mr-2" />
                                  Enviar
                                </DropdownMenuItem>
                              )}
                              {status === 'sent' && (
                                <DropdownMenuItem onClick={() => setResendConfirm({
                                  type: 'single',
                                  emailId: email.id,
                                  companyName: c.client_company || 'esta empresa'
                                })}>
                                  <RefreshCw className="h-4 w-4 mr-2" />
                                  Reenviar email
                                </DropdownMenuItem>
                              )}
                              {status === 'error' && (
                                <DropdownMenuItem onClick={() => setResendConfirm({
                                  type: 'single',
                                  emailId: email.id,
                                  companyName: c.client_company || 'esta empresa'
                                })}>
                                  <RefreshCw className="h-4 w-4 mr-2" />
                                  Reintentar envío
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                        {email?.error_message && (
                          <span className="text-xs text-destructive ml-1" title={email.error_message}>
                            {email.error_message.substring(0, 30)}...
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Resend confirmation dialog */}
      <AlertDialog open={!!resendConfirm} onOpenChange={(open) => { if (!open) setResendConfirm(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              ⚠️ Confirmar reenvío
            </AlertDialogTitle>
            <AlertDialogDescription>
              {resendConfirm?.type === 'single'
                ? `Este email ya fue enviado a "${resendConfirm.companyName}". ¿Estás seguro de que quieres reenviarlo?`
                : `¿Estás seguro de que quieres reenviar ${resendConfirm?.count} emails que ya fueron enviados? Esta acción no se puede deshacer.`
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleResendConfirm}>
              Sí, reenviar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
