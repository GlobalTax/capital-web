import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Building2, Mail, Send, CheckCircle2, Users, CalendarCheck,
  TrendingUp, TrendingDown, MessageCircle, ArrowRight, Target, Eye,
} from 'lucide-react';
import { useCampaignCompanies, CampaignCompany } from '@/hooks/useCampaignCompanies';
import { useCampaignEmails } from '@/hooks/useCampaignEmails';
import { useFollowupSequences, FollowupSend } from '@/hooks/useFollowupSequences';
import { ValuationCampaign } from '@/hooks/useCampaigns';
import { formatCurrencyEUR } from '@/utils/professionalValuationCalculation';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid,
} from 'recharts';
import { cn } from '@/lib/utils';

interface Props {
  campaignId: string;
  campaign: ValuationCampaign;
}

interface StageMetrics {
  label: string;
  total: number;
  sent: number;
  sinRespuesta: number;
  interesado: number;
  noInteresado: number;
  reunionAgendada: number;
  responseRate: number;
  interestRate: number;
}

export function CampaignAnalyticsStep({ campaignId, campaign }: Props) {
  const { companies } = useCampaignCompanies(campaignId);
  const { emails } = useCampaignEmails(campaignId);
  const { sequences, allSends } = useFollowupSequences(campaignId);

  // Build stage metrics
  const stages = useMemo<StageMetrics[]>(() => {
    const result: StageMetrics[] = [];

    // Stage 0: 1r Envío (from global seguimiento_estado for companies that were sent)
    const sentCompanies = companies.filter(c => c.status === 'sent');
    const globalSinRespuesta = sentCompanies.filter(c => (c.seguimiento_estado || 'sin_respuesta') === 'sin_respuesta').length;
    const globalInteresado = sentCompanies.filter(c => c.seguimiento_estado === 'interesado').length;
    const globalNoInteresado = sentCompanies.filter(c => c.seguimiento_estado === 'no_interesado').length;
    const globalReunion = sentCompanies.filter(c => c.seguimiento_estado === 'reunion_agendada').length;
    const globalResponded = globalInteresado + globalNoInteresado + globalReunion;

    result.push({
      label: '1r Envío',
      total: companies.length,
      sent: sentCompanies.length,
      sinRespuesta: globalSinRespuesta,
      interesado: globalInteresado,
      noInteresado: globalNoInteresado,
      reunionAgendada: globalReunion,
      responseRate: sentCompanies.length > 0 ? (globalResponded / sentCompanies.length) * 100 : 0,
      interestRate: sentCompanies.length > 0 ? ((globalInteresado + globalReunion) / sentCompanies.length) * 100 : 0,
    });

    // Follow-up stages
    const sortedSeqs = [...sequences].sort((a, b) => a.sequence_number - b.sequence_number);
    for (const seq of sortedSeqs) {
      const roundSends = allSends.filter(s => s.sequence_id === seq.id);
      const sentSends = roundSends.filter(s => s.status === 'sent');
      const sinResp = sentSends.filter(s => !s.seguimiento_estado || s.seguimiento_estado === 'sin_respuesta').length;
      const inter = sentSends.filter(s => s.seguimiento_estado === 'interesado').length;
      const noInter = sentSends.filter(s => s.seguimiento_estado === 'no_interesado').length;
      const reunion = sentSends.filter(s => s.seguimiento_estado === 'reunion_agendada').length;
      const responded = inter + noInter + reunion;

      result.push({
        label: seq.label || `Follow up ${seq.sequence_number}`,
        total: roundSends.length,
        sent: sentSends.length,
        sinRespuesta: sinResp,
        interesado: inter,
        noInteresado: noInter,
        reunionAgendada: reunion,
        responseRate: sentSends.length > 0 ? (responded / sentSends.length) * 100 : 0,
        interestRate: sentSends.length > 0 ? ((inter + reunion) / sentSends.length) * 100 : 0,
      });
    }

    return result;
  }, [companies, sequences, allSends]);

  // Totals across all stages
  const totals = useMemo(() => {
    const totalInteresado = stages.reduce((s, st) => s + st.interesado, 0);
    const totalReunion = stages.reduce((s, st) => s + st.reunionAgendada, 0);
    const totalNoInteresado = stages.reduce((s, st) => s + st.noInteresado, 0);
    const totalSent = stages.reduce((s, st) => s + st.sent, 0);
    const totalResponded = totalInteresado + totalReunion + totalNoInteresado;
    return { totalInteresado, totalReunion, totalNoInteresado, totalSent, totalResponded };
  }, [stages]);

  // Chart data for funnel
  const funnelData = useMemo(() => {
    return stages.map(s => ({
      name: s.label,
      Enviados: s.sent,
      Interesados: s.interesado,
      Reuniones: s.reunionAgendada,
      'Sin respuesta': s.sinRespuesta,
      'No interesado': s.noInteresado,
    }));
  }, [stages]);

  // Per-company timeline
  const companyTimeline = useMemo(() => {
    return companies.map(c => {
      const email = emails.find(e => e.company_id === c.id);
      const companySends = allSends.filter(s => s.company_id === c.id && s.status === 'sent');
      const fuLabels = companySends
        .map(s => {
          const seq = sequences.find(sq => sq.id === s.sequence_id);
          return seq ? { num: seq.sequence_number, estado: s.seguimiento_estado } : null;
        })
        .filter(Boolean)
        .sort((a, b) => a!.num - b!.num);

      return {
        company: c,
        emailSent: !!email?.sent_at,
        globalEstado: c.seguimiento_estado || 'sin_respuesta',
        followups: fuLabels as { num: number; estado: string | null }[],
      };
    });
  }, [companies, emails, allSends, sequences]);

  const CHART_COLORS = {
    sent: 'hsl(var(--primary))',
    interested: 'hsl(142, 71%, 45%)',
    meeting: 'hsl(263, 70%, 50%)',
    noInterest: 'hsl(0, 84%, 60%)',
    noResponse: 'hsl(var(--muted-foreground))',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Target className="h-5 w-5 text-primary" />
        <div>
          <h2 className="text-lg font-bold">Análisis de Campaña</h2>
          <p className="text-sm text-muted-foreground">{campaign.name} — {stages.length} etapa(s) de contacto</p>
        </div>
      </div>

      {/* Global KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="pt-4 text-center">
            <Building2 className="h-5 w-5 mx-auto text-muted-foreground" />
            <p className="text-2xl font-bold mt-1">{companies.length}</p>
            <p className="text-xs text-muted-foreground">Empresas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <Mail className="h-5 w-5 mx-auto text-blue-500" />
            <p className="text-2xl font-bold mt-1">{totals.totalSent}</p>
            <p className="text-xs text-muted-foreground">Emails enviados</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <MessageCircle className="h-5 w-5 mx-auto text-orange-500" />
            <p className="text-2xl font-bold mt-1">{totals.totalResponded}</p>
            <p className="text-xs text-muted-foreground">Respuestas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <Users className="h-5 w-5 mx-auto text-emerald-500" />
            <p className="text-2xl font-bold mt-1">{totals.totalInteresado}</p>
            <p className="text-xs text-muted-foreground">Interesados</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <CalendarCheck className="h-5 w-5 mx-auto text-violet-500" />
            <p className="text-2xl font-bold mt-1">{totals.totalReunion}</p>
            <p className="text-xs text-muted-foreground">Reuniones</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <TrendingUp className="h-5 w-5 mx-auto text-primary" />
            <p className="text-2xl font-bold mt-1">
              {totals.totalSent > 0 ? ((totals.totalInteresado + totals.totalReunion) / totals.totalSent * 100).toFixed(1) : 0}%
            </p>
            <p className="text-xs text-muted-foreground">Tasa éxito</p>
          </CardContent>
        </Card>
      </div>

      {/* Funnel Chart */}
      {funnelData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Funnel por etapa</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={funnelData} margin={{ left: 10, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="Enviados" fill={CHART_COLORS.sent} radius={[2, 2, 0, 0]} />
                <Bar dataKey="Interesados" fill={CHART_COLORS.interested} radius={[2, 2, 0, 0]} />
                <Bar dataKey="Reuniones" fill={CHART_COLORS.meeting} radius={[2, 2, 0, 0]} />
                <Bar dataKey="No interesado" fill={CHART_COLORS.noInterest} radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Stage-by-stage breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Desglose por etapa</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Etapa</TableHead>
                <TableHead className="text-center">Enviados</TableHead>
                <TableHead className="text-center">Sin respuesta</TableHead>
                <TableHead className="text-center">Interesados</TableHead>
                <TableHead className="text-center">No interesados</TableHead>
                <TableHead className="text-center">Reuniones</TableHead>
                <TableHead className="text-center">% Respuesta</TableHead>
                <TableHead className="text-center">% Éxito</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stages.map((s, i) => (
                <TableRow key={i}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {i === 0 ? <Mail className="h-4 w-4 text-primary" /> : <Send className="h-4 w-4 text-muted-foreground" />}
                      {s.label}
                    </div>
                  </TableCell>
                  <TableCell className="text-center font-bold">{s.sent}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant="secondary" className="text-[10px] bg-muted text-muted-foreground">{s.sinRespuesta}</Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="secondary" className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200">{s.interesado}</Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="secondary" className="text-[10px] bg-red-50 text-red-600 border-red-200">{s.noInteresado}</Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="secondary" className="text-[10px] bg-violet-50 text-violet-700 border-violet-200">{s.reunionAgendada}</Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className={cn("text-sm font-medium", s.responseRate > 0 ? 'text-foreground' : 'text-muted-foreground')}>
                      {s.responseRate.toFixed(1)}%
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className={cn("text-sm font-bold", s.interestRate > 20 ? 'text-emerald-600' : s.interestRate > 0 ? 'text-foreground' : 'text-muted-foreground')}>
                      {s.interestRate.toFixed(1)}%
                    </span>
                  </TableCell>
                </TableRow>
              ))}
              {/* Totals row */}
              <TableRow className="bg-muted/30 font-bold">
                <TableCell>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    Total acumulado
                  </div>
                </TableCell>
                <TableCell className="text-center">{totals.totalSent}</TableCell>
                <TableCell className="text-center">—</TableCell>
                <TableCell className="text-center">
                  <Badge variant="secondary" className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200">{totals.totalInteresado}</Badge>
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant="secondary" className="text-[10px] bg-red-50 text-red-600 border-red-200">{totals.totalNoInteresado}</Badge>
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant="secondary" className="text-[10px] bg-violet-50 text-violet-700 border-violet-200">{totals.totalReunion}</Badge>
                </TableCell>
                <TableCell className="text-center">
                  {totals.totalSent > 0 ? ((totals.totalResponded / totals.totalSent) * 100).toFixed(1) : 0}%
                </TableCell>
                <TableCell className="text-center text-emerald-600">
                  {totals.totalSent > 0 ? (((totals.totalInteresado + totals.totalReunion) / totals.totalSent) * 100).toFixed(1) : 0}%
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Per-company detail */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Detalle por empresa</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-auto max-h-[50vh]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Empresa</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="text-right">Valoración</TableHead>
                  <TableHead className="text-center">1r Envío</TableHead>
                  {sequences.sort((a, b) => a.sequence_number - b.sequence_number).map(seq => (
                    <TableHead key={seq.id} className="text-center text-xs">
                      FU{seq.sequence_number}
                    </TableHead>
                  ))}
                  <TableHead className="text-center">Estado final</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {companyTimeline.map(ct => {
                  const estadoOpt = getEstadoOption(ct.globalEstado);
                  return (
                    <TableRow key={ct.company.id}>
                      <TableCell className="font-medium text-sm max-w-[180px] truncate">{ct.company.client_company}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{ct.company.client_email || '—'}</TableCell>
                      <TableCell className="text-right text-sm">{ct.company.valuation_central ? formatCurrencyEUR(ct.company.valuation_central) : '—'}</TableCell>
                      <TableCell className="text-center">
                        {ct.emailSent ? (
                          <CheckCircle2 className="h-4 w-4 mx-auto text-emerald-500" />
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      {sequences.sort((a, b) => a.sequence_number - b.sequence_number).map(seq => {
                        const fu = ct.followups.find(f => f.num === seq.sequence_number);
                        if (!fu) return <TableCell key={seq.id} className="text-center text-xs text-muted-foreground">—</TableCell>;
                        const fuEstado = fu.estado || 'sin_respuesta';
                        const fuOpt = getEstadoOption(fuEstado);
                        return (
                          <TableCell key={seq.id} className="text-center">
                            <Badge variant="secondary" className={cn("text-[10px]", fuOpt.className)}>
                              {fuOpt.short}
                            </Badge>
                          </TableCell>
                        );
                      })}
                      <TableCell className="text-center">
                        <Badge variant="secondary" className={cn("text-[10px]", estadoOpt.className)}>
                          {estadoOpt.label}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Helper for estado badges
function getEstadoOption(value: string) {
  const map: Record<string, { label: string; short: string; className: string }> = {
    sin_respuesta: { label: 'Sin respuesta', short: '—', className: 'bg-muted text-muted-foreground' },
    interesado: { label: 'Interesado', short: '✓', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    no_interesado: { label: 'No interesado', short: '✗', className: 'bg-red-50 text-red-600 border-red-200' },
    reunion_agendada: { label: 'Reunión', short: '📅', className: 'bg-violet-50 text-violet-700 border-violet-200' },
  };
  return map[value] || map.sin_respuesta;
}
