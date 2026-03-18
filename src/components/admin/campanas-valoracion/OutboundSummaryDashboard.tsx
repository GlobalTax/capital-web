import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { LoadingState } from '@/components/admin/shared/LoadingState';
import { supabase } from '@/integrations/supabase/client';
import {
  Building2, Mail, MailOpen, MailX, CheckCircle2,
  Users, CalendarCheck, MessageCircleX, HelpCircle, Percent
} from 'lucide-react';

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

interface GlobalMetrics {
  totalCompanies: number;
  totalSent: number;
  totalDelivered: number;
  totalBounced: number;
  totalOpened: number;
  openRate: number;
  sinRespuesta: number;
  interesados: number;
  reuniones: number;
  noInteresados: number;
  campaigns: CampaignSummary[];
}

const fmt = (n: number) => n.toLocaleString('es-ES');

export function OutboundSummaryDashboard() {
  const { data, isLoading } = useQuery<GlobalMetrics>({
    queryKey: ['outbound-summary-dashboard'],
    queryFn: async () => {
      // 1. All campaigns
      const { data: campaigns } = await (supabase as any)
        .from('valuation_campaigns')
        .select('id, name, sector, campaign_type, total_companies')
        .order('created_at', { ascending: false });

      if (!campaigns?.length) {
        return {
          totalCompanies: 0, totalSent: 0, totalDelivered: 0, totalBounced: 0,
          totalOpened: 0, openRate: 0, sinRespuesta: 0, interesados: 0,
          reuniones: 0, noInteresados: 0, campaigns: [],
        };
      }

      const ids = campaigns.map((c: any) => c.id);

      // 2. Email metrics (all at once)
      const { data: emails } = await (supabase as any)
        .from('campaign_emails')
        .select('campaign_id, status, delivery_status, email_opened')
        .in('campaign_id', ids);

      // 3. Seguimiento states
      const { data: companies } = await (supabase as any)
        .from('valuation_campaign_companies')
        .select('campaign_id, seguimiento_estado')
        .in('campaign_id', ids);

      // Aggregate per campaign
      const emailMap: Record<string, { sent: number; delivered: number; bounced: number; opened: number }> = {};
      const seguimientoMap: Record<string, Record<string, number>> = {};

      for (const id of ids) {
        emailMap[id] = { sent: 0, delivered: 0, bounced: 0, opened: 0 };
        seguimientoMap[id] = { sin_respuesta: 0, interesado: 0, reunion_agendada: 0, no_interesado: 0 };
      }

      for (const e of (emails || [])) {
        const m = emailMap[e.campaign_id];
        if (!m) continue;
        if (e.status === 'sent') m.sent++;
        if (e.delivery_status === 'delivered') m.delivered++;
        if (e.delivery_status === 'bounced') m.bounced++;
        if (e.email_opened) m.opened++;
      }

      for (const c of (companies || [])) {
        const s = seguimientoMap[c.campaign_id];
        if (!s) continue;
        const estado = c.seguimiento_estado || 'sin_respuesta';
        if (s[estado] !== undefined) s[estado]++;
        else s.sin_respuesta++;
      }

      let totalSent = 0, totalDelivered = 0, totalBounced = 0, totalOpened = 0;
      let sinRespuesta = 0, interesados = 0, reuniones = 0, noInteresados = 0;
      let totalCompanies = 0;

      const summaries: CampaignSummary[] = campaigns.map((c: any) => {
        const em = emailMap[c.id];
        const seg = seguimientoMap[c.id];
        totalSent += em.sent;
        totalDelivered += em.delivered;
        totalBounced += em.bounced;
        totalOpened += em.opened;
        totalCompanies += c.total_companies || 0;
        sinRespuesta += seg.sin_respuesta;
        interesados += seg.interesado;
        reuniones += seg.reunion_agendada;
        noInteresados += seg.no_interesado;

        return {
          id: c.id,
          name: c.name,
          sector: c.sector,
          campaign_type: c.campaign_type,
          total_companies: c.total_companies || 0,
          sent: em.sent,
          delivered: em.delivered,
          bounced: em.bounced,
          opened: em.opened,
          sin_respuesta: seg.sin_respuesta,
          interesado: seg.interesado,
          reunion_agendada: seg.reunion_agendada,
          no_interesado: seg.no_interesado,
        };
      });

      return {
        totalCompanies, totalSent, totalDelivered, totalBounced, totalOpened,
        openRate: totalSent > 0 ? (totalOpened / totalSent) * 100 : 0,
        sinRespuesta, interesados, reuniones, noInteresados,
        campaigns: summaries,
      };
    },
    staleTime: 60_000,
  });

  if (isLoading || !data) return <LoadingState variant="cards" cards={6} />;

  const kpis = [
    { label: 'Empresas', value: fmt(data.totalCompanies), icon: Building2, color: 'text-primary' },
    { label: 'Enviados', value: fmt(data.totalSent), icon: Mail, color: 'text-blue-600' },
    { label: 'Entregados', value: fmt(data.totalDelivered), icon: CheckCircle2, color: 'text-emerald-600' },
    { label: 'Rebotados', value: fmt(data.totalBounced), icon: MailX, color: 'text-destructive' },
    { label: 'Abiertos', value: fmt(data.totalOpened), icon: MailOpen, color: 'text-amber-600' },
    { label: 'Tasa Apertura', value: `${data.openRate.toFixed(1)}%`, icon: Percent, color: 'text-violet-600' },
  ];

  const funnel = [
    { label: 'Sin respuesta', value: data.sinRespuesta, icon: HelpCircle, color: 'text-muted-foreground', bg: 'bg-muted/50' },
    { label: 'Interesados', value: data.interesados, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Reuniones', value: data.reuniones, icon: CalendarCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'No interesados', value: data.noInteresados, icon: MessageCircleX, color: 'text-red-500', bg: 'bg-red-50' },
  ];

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
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
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Campaign breakdown table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Desglose por Campaña</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table density="compact">
            <TableHeader>
              <TableRow>
                <TableHead>Campaña</TableHead>
                <TableHead>Sector</TableHead>
                <TableHead className="text-center">Empresas</TableHead>
                <TableHead className="text-center">Enviados</TableHead>
                <TableHead className="text-center">Abiertos</TableHead>
                <TableHead className="text-center">Tasa</TableHead>
                <TableHead className="text-center">Interesados</TableHead>
                <TableHead className="text-center">Reuniones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.campaigns.map((c) => {
                const rate = c.sent > 0 ? ((c.opened / c.sent) * 100).toFixed(1) : '—';
                return (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium max-w-[200px] truncate">{c.name}</TableCell>
                    <TableCell className="text-muted-foreground text-xs">{c.sector || '—'}</TableCell>
                    <TableCell className="text-center">{c.total_companies}</TableCell>
                    <TableCell className="text-center">{c.sent}</TableCell>
                    <TableCell className="text-center">{c.opened}</TableCell>
                    <TableCell className="text-center">
                      {rate !== '—' ? (
                        <Badge variant={Number(rate) > 30 ? 'default' : 'secondary'} className="text-xs">
                          {rate}%
                        </Badge>
                      ) : '—'}
                    </TableCell>
                    <TableCell className="text-center">
                      {c.interesado > 0 ? <span className="text-blue-600 font-medium">{c.interesado}</span> : '0'}
                    </TableCell>
                    <TableCell className="text-center">
                      {c.reunion_agendada > 0 ? <span className="text-emerald-600 font-medium">{c.reunion_agendada}</span> : '0'}
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
