import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { LoadingState } from '@/components/admin/shared/LoadingState';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import {
  Building2, Mail, MailOpen, MailX, CheckCircle2,
  Users, CalendarCheck, MessageCircleX, HelpCircle, Percent,
  Filter, CheckSquare, Square, CalendarIcon
} from 'lucide-react';
import { OutboundPipelineSection } from './OutboundPipelineSection';
import { OutboundStagesEditor } from './OutboundStagesEditor';
import { FollowUpAlertsPanel } from './FollowUpAlertsPanel';
import { FollowUpReminderConfig } from './FollowUpReminderConfig';

interface CampaignSummary {
  id: string;
  name: string;
  sector: string | null;
  campaign_type: string;
  total_companies: number;
  sent: number;
  delivered: number;
  bounced: number;
  opened: number;
  sin_respuesta: number;
  interesado: number;
  reunion_agendada: number;
  no_interesado: number;
}

interface RawData {
  campaigns: Array<{ id: string; name: string; sector: string | null; campaign_type: string; total_companies: number; followup_reminder_days: number | null }>;
  emails: Array<{ campaign_id: string; status: string; delivery_status: string; email_opened: boolean; sent_at: string | null; company_id: string | null }>;
  companies: Array<{ campaign_id: string; seguimiento_estado: string | null; id: string }>;
}

type DatePreset = 'all' | '7d' | '30d' | '90d' | 'custom';

const DATE_PRESETS: { key: DatePreset; label: string }[] = [
  { key: 'all', label: 'Todo' },
  { key: '7d', label: '7 días' },
  { key: '30d', label: '30 días' },
  { key: '90d', label: '90 días' },
  { key: 'custom', label: 'Personalizado' },
];

const fmt = (n: number) => n.toLocaleString('es-ES');

const getDateThreshold = (preset: DatePreset): Date | null => {
  if (preset === 'all' || preset === 'custom') return null;
  const days = preset === '7d' ? 7 : preset === '30d' ? 30 : 90;
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d;
};

export function OutboundSummaryDashboard() {
  const [disabledCampaigns, setDisabledCampaigns] = useState<Set<string>>(new Set());
  const [datePreset, setDatePreset] = useState<DatePreset>('all');
  const [customFrom, setCustomFrom] = useState<Date | undefined>();
  const [customTo, setCustomTo] = useState<Date | undefined>();

  const initializedRef = useRef(false);

  const { data: raw, isLoading } = useQuery<RawData>({
    queryKey: ['outbound-summary-raw'],
    queryFn: async () => {
      const { data: campaigns } = await (supabase as any)
        .from('valuation_campaigns')
        .select('id, name, sector, campaign_type, total_companies, followup_reminder_days')
        .order('created_at', { ascending: false });

      if (!campaigns?.length) return { campaigns: [], emails: [], companies: [] };

      const ids = campaigns.map((c: any) => c.id);

      const [{ data: emails }, { data: companies }] = await Promise.all([
        (supabase as any)
          .from('campaign_emails')
          .select('campaign_id, status, delivery_status, email_opened, sent_at, company_id')
          .in('campaign_id', ids),
        (supabase as any)
          .from('valuation_campaign_companies')
          .select('campaign_id, seguimiento_estado, id')
          .in('campaign_id', ids),
      ]);

      return { campaigns, emails: emails || [], companies: companies || [] };
    },
    staleTime: 60_000,
  });

  // Auto-deshabilitar campañas de pruebas en la primera carga
  useEffect(() => {
    if (raw?.campaigns.length && !initializedRef.current) {
      initializedRef.current = true;
      const pruebas = raw.campaigns
        .filter(c => c.sector?.toLowerCase() === 'pruebas')
        .map(c => c.id);
      if (pruebas.length) {
        setDisabledCampaigns(new Set(pruebas));
      }
    }
  }, [raw]);

  const computed = useMemo(() => {
    if (!raw?.campaigns.length) return null;

    const threshold = datePreset === 'custom' ? null : getDateThreshold(datePreset);
    const cFrom = datePreset === 'custom' && customFrom ? customFrom : null;
    const cTo = datePreset === 'custom' && customTo ? new Date(customTo.getTime() + 86400000 - 1) : null;
    const enabledCampaigns = raw.campaigns.filter(c => !disabledCampaigns.has(c.id));
    const enabledIds = new Set(enabledCampaigns.map(c => c.id));

    const filteredEmails = raw.emails.filter(e => {
      if (!enabledIds.has(e.campaign_id)) return false;
      if (threshold) {
        return e.sent_at ? new Date(e.sent_at) >= threshold : false;
      }
      if (cFrom || cTo) {
        if (!e.sent_at) return false;
        const d = new Date(e.sent_at);
        if (cFrom && d < cFrom) return false;
        if (cTo && d > cTo) return false;
      }
      return true;
    });

    // Build set of company IDs active in the period
    const hasDateFilter = threshold || cFrom || cTo;
    const activeCompanyIds = new Set<string>();
    for (const e of filteredEmails) {
      if (e.company_id) activeCompanyIds.add(e.company_id);
    }

    // Aggregate per campaign
    const emailMap: Record<string, { sent: number; delivered: number; bounced: number; opened: number }> = {};
    const seguimientoMap: Record<string, Record<string, number>> = {};
    const companiesPerCampaign: Record<string, Set<string>> = {};

    for (const c of enabledCampaigns) {
      emailMap[c.id] = { sent: 0, delivered: 0, bounced: 0, opened: 0 };
      seguimientoMap[c.id] = { sin_respuesta: 0, interesado: 0, reunion_agendada: 0, no_interesado: 0 };
      companiesPerCampaign[c.id] = new Set();
    }

    for (const e of filteredEmails) {
      const m = emailMap[e.campaign_id];
      if (!m) continue;
      if (e.status === 'sent') m.sent++;
      if (e.delivery_status === 'delivered') m.delivered++;
      if (e.delivery_status === 'bounced') m.bounced++;
      if (e.email_opened) m.opened++;
      if (e.company_id) companiesPerCampaign[e.campaign_id]?.add(e.company_id);
    }

    for (const c of raw.companies) {
      if (!enabledIds.has(c.campaign_id)) continue;
      // If date filter active, only count companies with emails in the period
      if (hasDateFilter && !activeCompanyIds.has(c.id)) continue;
      const s = seguimientoMap[c.campaign_id];
      if (!s) continue;
      const estado = c.seguimiento_estado || 'sin_respuesta';
      if (s[estado] !== undefined) s[estado]++;
      else s.sin_respuesta++;
    }

    let totalSent = 0, totalDelivered = 0, totalBounced = 0, totalOpened = 0;
    let sinRespuesta = 0, interesados = 0, reuniones = 0, noInteresados = 0;
    let totalCompanies = 0;

    const summaries: CampaignSummary[] = enabledCampaigns.map((c) => {
      const em = emailMap[c.id];
      const seg = seguimientoMap[c.id];
      const campCompanies = hasDateFilter ? companiesPerCampaign[c.id].size : (c.total_companies || 0);
      totalSent += em.sent;
      totalDelivered += em.delivered;
      totalBounced += em.bounced;
      totalOpened += em.opened;
      totalCompanies += campCompanies;
      sinRespuesta += seg.sin_respuesta;
      interesados += seg.interesado;
      reuniones += seg.reunion_agendada;
      noInteresados += seg.no_interesado;

      return {
        id: c.id, name: c.name, sector: c.sector,
        campaign_type: c.campaign_type, total_companies: campCompanies,
        sent: em.sent, delivered: em.delivered, bounced: em.bounced, opened: em.opened,
        sin_respuesta: seg.sin_respuesta, interesado: seg.interesado,
        reunion_agendada: seg.reunion_agendada, no_interesado: seg.no_interesado,
      };
    });

    return {
      totalCompanies, totalSent, totalDelivered, totalBounced, totalOpened,
      openRate: totalSent > 0 ? (totalOpened / totalSent) * 100 : 0,
      sinRespuesta, interesados, reuniones, noInteresados,
      campaigns: summaries,
    };
  }, [raw, disabledCampaigns, datePreset, customFrom, customTo]);

  if (isLoading || !raw) return <LoadingState variant="cards" cards={6} />;

  const data = computed ?? {
    totalCompanies: 0, totalSent: 0, totalDelivered: 0, totalBounced: 0,
    totalOpened: 0, openRate: 0, sinRespuesta: 0, interesados: 0,
    reuniones: 0, noInteresados: 0, campaigns: [] as CampaignSummary[],
  };

  const allCampaigns = raw.campaigns;
  const allEnabled = disabledCampaigns.size === 0;
  const noneEnabled = disabledCampaigns.size === allCampaigns.length;

  const toggleCampaign = (id: string) => {
    setDisabledCampaigns(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (allEnabled) {
      setDisabledCampaigns(new Set(allCampaigns.map(c => c.id)));
    } else {
      setDisabledCampaigns(new Set());
    }
  };

  const totalContestados = data.interesados + data.reuniones + data.noInteresados;
  const contestadosRate = data.totalSent > 0 ? (totalContestados / data.totalSent) * 100 : 0;

  const kpis = [
    { label: 'Empresas', value: fmt(data.totalCompanies), icon: Building2, color: 'text-primary' },
    { label: 'Enviados', value: fmt(data.totalSent), icon: Mail, color: 'text-blue-600' },
    { label: 'Entregados', value: fmt(data.totalDelivered), icon: CheckCircle2, color: 'text-emerald-600' },
    { label: 'Rebotados', value: fmt(data.totalBounced), icon: MailX, color: 'text-destructive' },
    { label: 'Abiertos', value: fmt(data.totalOpened), icon: MailOpen, color: 'text-amber-600' },
    { label: 'Tasa Apertura', value: `${data.openRate.toFixed(1)}%`, icon: Percent, color: 'text-violet-600' },
    { label: 'Contestados', value: `${fmt(totalContestados)} (${contestadosRate.toFixed(1)}%)`, icon: MessageCircleX, color: 'text-orange-600' },
  ];

  const funnel = [
    { label: 'Sin respuesta', value: data.sinRespuesta, icon: HelpCircle, color: 'text-muted-foreground', bg: 'bg-muted/50' },
    { label: 'Interesados', value: data.interesados, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Reuniones', value: data.reuniones, icon: CalendarCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'No interesados', value: data.noInteresados, icon: MessageCircleX, color: 'text-red-500', bg: 'bg-red-50' },
  ];

  return (
    <div className="space-y-6">
      {/* Filters bar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Filter className="h-4 w-4" />
          <span className="font-medium">Período:</span>
        </div>
        <div className="flex items-center gap-1">
          {DATE_PRESETS.map(p => (
            <Button
              key={p.key}
              variant={datePreset === p.key ? 'default' : 'outline'}
              size="sm"
              className="h-7 text-xs"
              onClick={() => setDatePreset(p.key)}
            >
              {p.label}
            </Button>
          ))}
        </div>

        {datePreset === 'custom' && (
          <div className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className={cn("h-7 text-xs gap-1.5 w-[130px] justify-start", !customFrom && "text-muted-foreground")}>
                  <CalendarIcon className="h-3.5 w-3.5" />
                  {customFrom ? format(customFrom, 'dd MMM yyyy', { locale: es }) : 'Desde'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={customFrom}
                  onSelect={setCustomFrom}
                  disabled={(date) => date > new Date() || (customTo ? date > customTo : false)}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
            <span className="text-xs text-muted-foreground">—</span>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className={cn("h-7 text-xs gap-1.5 w-[130px] justify-start", !customTo && "text-muted-foreground")}>
                  <CalendarIcon className="h-3.5 w-3.5" />
                  {customTo ? format(customTo, 'dd MMM yyyy', { locale: es }) : 'Hasta'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={customTo}
                  onSelect={setCustomTo}
                  disabled={(date) => date > new Date() || (customFrom ? date < customFrom : false)}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>
        )}

        {disabledCampaigns.size > 0 && (
          <Badge variant="secondary" className="ml-auto text-xs">
            {allCampaigns.length - disabledCampaigns.size} de {allCampaigns.length} campañas activas
          </Badge>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        {kpis.map((k) => (
          <Card key={k.label}>
            <CardContent className="p-4">
              <div className={`flex items-center gap-1.5 ${k.color} mb-1`}>
                <k.icon className="h-4 w-4" />
                <span className="text-xs font-medium uppercase tracking-wider">{k.label}</span>
              </div>
              <p className="text-2xl font-bold">{k.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Funnel */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {funnel.map((f) => (
          <Card key={f.label} className={f.bg}>
            <CardContent className="p-4">
              <div className={`flex items-center gap-1.5 ${f.color} mb-1`}>
                <f.icon className="h-4 w-4" />
                <span className="text-xs font-medium">{f.label}</span>
              </div>
              <p className="text-2xl font-bold">{fmt(f.value)}</p>
              {data.totalSent > 0 && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  {((f.value / data.totalSent) * 100).toFixed(1)}% de enviados
                  {totalContestados > 0 && f.label !== 'Sin respuesta' && (
                    <span className="ml-1">· {((f.value / totalContestados) * 100).toFixed(1)}% de contestados</span>
                  )}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pipeline */}
      <OutboundPipelineSection
        enabledCampaignIds={allCampaigns.filter(c => !disabledCampaigns.has(c.id)).map(c => c.id)}
      />

      {/* Campaign breakdown table */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Desglose por Campaña</CardTitle>
            <div className="flex items-center gap-2">
              <OutboundStagesEditor />
              <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs gap-1.5"
              onClick={toggleAll}
            >
              {allEnabled ? <CheckSquare className="h-3.5 w-3.5" /> : <Square className="h-3.5 w-3.5" />}
              {allEnabled ? 'Deseleccionar todas' : 'Seleccionar todas'}
            </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table density="compact">
            <TableHeader>
              <TableRow>
                <TableHead className="w-10"></TableHead>
                <TableHead>Campaña</TableHead>
                <TableHead>Sector</TableHead>
                <TableHead className="text-center">Empresas</TableHead>
                <TableHead className="text-center">Enviados</TableHead>
                <TableHead className="text-center">Abiertos</TableHead>
                <TableHead className="text-center">Tasa</TableHead>
                <TableHead className="text-center">Contestados</TableHead>
                <TableHead className="text-center">Interesados</TableHead>
                <TableHead className="text-center">Reuniones</TableHead>
                <TableHead className="text-center">No interesados</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allCampaigns.map((raw_c) => {
                const enabled = !disabledCampaigns.has(raw_c.id);
                const c = data.campaigns.find(x => x.id === raw_c.id);
                const rate = c && c.sent > 0 ? ((c.opened / c.sent) * 100).toFixed(1) : '—';
                return (
                  <TableRow
                    key={raw_c.id}
                    className={!enabled ? 'opacity-40' : undefined}
                  >
                    <TableCell className="pr-0">
                      <Checkbox
                        checked={enabled}
                        onCheckedChange={() => toggleCampaign(raw_c.id)}
                      />
                    </TableCell>
                    <TableCell className="font-medium max-w-[200px] truncate">{raw_c.name}</TableCell>
                    <TableCell className="text-muted-foreground text-xs">{raw_c.sector || '—'}</TableCell>
                    <TableCell className="text-center">{c?.total_companies ?? raw_c.total_companies}</TableCell>
                    <TableCell className="text-center">{c?.sent ?? 0}</TableCell>
                    <TableCell className="text-center">{c?.opened ?? 0}</TableCell>
                    <TableCell className="text-center">
                      {enabled && rate !== '—' ? (
                        <Badge variant={Number(rate) > 30 ? 'default' : 'secondary'} className="text-xs">
                          {rate}%
                        </Badge>
                      ) : '—'}
                    </TableCell>
                    <TableCell className="text-center">
                      {(() => {
                        const total = (c?.interesado ?? 0) + (c?.reunion_agendada ?? 0) + (c?.no_interesado ?? 0);
                        return total > 0 ? <span className="text-orange-600 font-medium">{total}</span> : '0';
                      })()}
                    </TableCell>
                    <TableCell className="text-center">
                      {c && c.interesado > 0 ? <span className="text-blue-600 font-medium">{c.interesado}</span> : '0'}
                    </TableCell>
                    <TableCell className="text-center">
                      {c && c.reunion_agendada > 0 ? <span className="text-emerald-600 font-medium">{c.reunion_agendada}</span> : '0'}
                    </TableCell>
                    <TableCell className="text-center">
                      {c && c.no_interesado > 0 ? <span className="text-red-500 font-medium">{c.no_interesado}</span> : '0'}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
