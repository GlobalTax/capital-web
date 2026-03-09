import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useNavigate } from 'react-router-dom';
import {
  Building2, Mail, TrendingUp, CheckCircle2, Percent, DollarSign,
  Calendar, MessageSquarePlus, Users, CalendarCheck, MessageCircle, Loader2
} from 'lucide-react';
import { useCampaignCompanies, CampaignCompany } from '@/hooks/useCampaignCompanies';
import { useCampaignEmails } from '@/hooks/useCampaignEmails';
import { useFollowupSequences } from '@/hooks/useFollowupSequences';
import { ValuationCampaign } from '@/hooks/useCampaigns';
import { formatCurrencyEUR } from '@/utils/professionalValuationCalculation';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useMemo, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { cn } from '@/lib/utils';

interface Props {
  campaignId: string;
  campaign: ValuationCampaign;
}

const VALUATION_RANGES = [
  { label: '< 500K€', min: 0, max: 500000 },
  { label: '500K€ - 1M€', min: 500000, max: 1000000 },
  { label: '1M€ - 2M€', min: 1000000, max: 2000000 },
  { label: '2M€ - 5M€', min: 2000000, max: 5000000 },
  { label: '5M€ - 10M€', min: 5000000, max: 10000000 },
  { label: '> 10M€', min: 10000000, max: Infinity },
];

const CHART_COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--primary) / 0.85)',
  'hsl(var(--primary) / 0.7)',
  'hsl(var(--primary) / 0.55)',
  'hsl(var(--primary) / 0.4)',
  'hsl(var(--primary) / 0.25)',
];

// Seguimiento states config
const SEGUIMIENTO_OPTIONS = [
  { value: 'sin_respuesta', label: 'Sin respuesta', className: 'bg-muted text-muted-foreground border-border' },
  { value: 'interesado', label: 'Interesado', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { value: 'no_interesado', label: 'No interesado', className: 'bg-red-50 text-red-600 border-red-200' },
  { value: 'reunion_agendada', label: 'Reunión agendada', className: 'bg-violet-50 text-violet-700 border-violet-200' },
] as const;

function getSeguimientoOption(value: string | null) {
  return SEGUIMIENTO_OPTIONS.find(o => o.value === (value || 'sin_respuesta')) || SEGUIMIENTO_OPTIONS[0];
}

// ─── Inline Seguimiento Badge Select ────────────────────────────────────
function SeguimientoBadge({ company, campaignId }: { company: CampaignCompany; campaignId: string }) {
  const [saving, setSaving] = useState(false);
  const queryClient = useQueryClient();
  const current = getSeguimientoOption(company.seguimiento_estado);

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
function NotasPopover({ company, campaignId }: { company: CampaignCompany; campaignId: string }) {
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

// ─── Main Component ─────────────────────────────────────────────────────
export function CampaignSummaryStep({ campaignId, campaign }: Props) {
  const navigate = useNavigate();
  const { companies, stats } = useCampaignCompanies(campaignId);
  const { emails } = useCampaignEmails(campaignId);
  const { sequences, allSends } = useFollowupSequences(campaignId);
  const emailSentMap = useMemo(() => {
    const map = new Map<string, string | null>();
    for (const e of emails) {
      map.set(e.company_id, e.sent_at);
    }
    return map;
  }, [emails]);

  // Delivery/open tracking map
  const emailTrackingMap = useMemo(() => {
    const map = new Map<string, { delivery_status: string | null; email_opened: boolean }>();
    for (const e of emails) {
      map.set(e.company_id, {
        delivery_status: (e as any).delivery_status || null,
        email_opened: (e as any).email_opened || false,
      });
    }
    return map;
  }, [emails]);

  // Build followup label per company: "FU1 · FU2" etc
  const followupLabels = useMemo(() => {
    const map = new Map<string, string>();
    for (const c of companies) {
      const sentForCompany = allSends
        .filter(s => s.company_id === c.id && s.status === 'sent')
        .map(s => {
          const seq = sequences.find(sq => sq.id === s.sequence_id);
          return seq ? { num: seq.sequence_number, date: s.sent_at } : null;
        })
        .filter(Boolean)
        .sort((a, b) => a!.num - b!.num);
      if (sentForCompany.length > 0) {
        map.set(c.id, sentForCompany.map(s => `FU${s!.num}`).join(' · '));
      }
    }
    return map;
  }, [companies, allSends, sequences]);

  const sentCount = companies.filter(c => c.status === 'sent').length;
  const createdCount = companies.filter(c => ['created', 'sent'].includes(c.status)).length;
  const failedCount = companies.filter(c => c.status === 'failed').length;
  const successRate = stats.total > 0 ? ((sentCount / stats.total) * 100).toFixed(0) : '0';
  const avgValuation = createdCount > 0 ? stats.totalValuation / createdCount : 0;

  // Seguimiento stats (from new columns)
  const followUpCount = companies.filter(c => (c.seguimiento_estado || 'sin_respuesta') !== 'sin_respuesta').length;
  const interestedCount = companies.filter(c => c.seguimiento_estado === 'interesado').length;
  const meetingCount = companies.filter(c => c.seguimiento_estado === 'reunion_agendada').length;

  const distributionData = useMemo(() => {
    const companiesWithValuation = companies.filter(c => c.valuation_central && c.valuation_central > 0);
    if (companiesWithValuation.length === 0) return [];
    return VALUATION_RANGES.map(range => ({
      name: range.label,
      count: companiesWithValuation.filter(c => c.valuation_central! >= range.min && c.valuation_central! < range.max).length,
    }));
  }, [companies]);

  const hasDistribution = distributionData.some(d => d.count > 0);

  return (
    <div className="space-y-6">
      {/* Years mode badge */}
      <div className="flex items-center gap-2 p-3 rounded-lg border bg-muted/30">
        {campaign.years_mode === '1_year' ? (
          <>
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Valoración con último año disponible</span>
            <Badge variant="secondary" className="text-[10px]">1 año</Badge>
          </>
        ) : (
          <>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Valoración con últimos 3 años</span>
            <Badge variant="secondary" className="text-[10px]">3 años</Badge>
          </>
        )}
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-9 gap-4">
        <Card>
          <CardContent className="pt-4 text-center">
            <Building2 className="h-5 w-5 mx-auto text-muted-foreground" />
            <p className="text-2xl font-bold mt-1">{stats.total}</p>
            <p className="text-xs text-muted-foreground">Empresas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <CheckCircle2 className="h-5 w-5 mx-auto text-green-500" />
            <p className="text-2xl font-bold mt-1">{createdCount}</p>
            <p className="text-xs text-muted-foreground">Creadas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <Mail className="h-5 w-5 mx-auto text-blue-500" />
            <p className="text-2xl font-bold mt-1">{sentCount}</p>
            <p className="text-xs text-muted-foreground">Enviadas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <Percent className="h-5 w-5 mx-auto text-primary" />
            <p className="text-2xl font-bold mt-1">{successRate}%</p>
            <p className="text-xs text-muted-foreground">Tasa éxito</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <TrendingUp className="h-5 w-5 mx-auto text-primary" />
            <p className="text-2xl font-bold mt-1">{formatCurrencyEUR(stats.totalValuation)}</p>
            <p className="text-xs text-muted-foreground">Valor total</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <DollarSign className="h-5 w-5 mx-auto text-primary" />
            <p className="text-2xl font-bold mt-1">{formatCurrencyEUR(avgValuation)}</p>
            <p className="text-xs text-muted-foreground">Promedio</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <MessageSquarePlus className="h-5 w-5 mx-auto text-orange-500" />
            <p className="text-2xl font-bold mt-1">{followUpCount}</p>
            <p className="text-xs text-muted-foreground">Con seguimiento</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <Users className="h-5 w-5 mx-auto text-emerald-500" />
            <p className="text-2xl font-bold mt-1">{interestedCount}</p>
            <p className="text-xs text-muted-foreground">Interesados</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <CalendarCheck className="h-5 w-5 mx-auto text-violet-500" />
            <p className="text-2xl font-bold mt-1">{meetingCount}</p>
            <p className="text-xs text-muted-foreground">Reuniones</p>
          </CardContent>
        </Card>
      </div>

      {/* Distribution Chart */}
      {hasDistribution && (
        <Card>
          <CardHeader><CardTitle className="text-base">Distribución de Valoraciones</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={distributionData} layout="vertical" margin={{ left: 20, right: 20 }}>
                <XAxis type="number" allowDecimals={false} />
                <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value: number) => [`${value} empresas`, 'Cantidad']} />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {distributionData.map((_, index) => (
                    <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Summary Table */}
      <Card>
        <CardHeader><CardTitle className="text-base">Resumen de empresas</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Empresa</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="text-right">Valoración</TableHead>
                <TableHead className="text-center">Estado</TableHead>
                <TableHead className="text-center">Fecha envío</TableHead>
                <TableHead className="text-center">Seguimiento</TableHead>
                <TableHead className="text-center">Follow Up</TableHead>
                <TableHead className="text-center w-[40px]">Notas</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {companies.map(c => (
                <TableRow key={c.id} className={c.professional_valuation_id ? 'cursor-pointer hover:bg-muted/50' : ''}
                  onClick={() => c.professional_valuation_id && navigate(`/admin/valoraciones-pro/${c.professional_valuation_id}`)}>
                  <TableCell className="font-medium">{c.client_company}</TableCell>
                  <TableCell className="text-sm">{c.client_email || '—'}</TableCell>
                  <TableCell className="text-right">{c.valuation_central ? formatCurrencyEUR(c.valuation_central) : '—'}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant={
                      c.status === 'sent' ? 'outline' :
                      c.status === 'failed' ? 'destructive' :
                      c.status === 'created' ? 'default' : 'secondary'
                    } className="text-xs">
                      {c.status === 'sent' ? 'Enviado' : c.status === 'failed' ? 'Error' : c.status === 'created' ? 'Creada' : c.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center text-xs text-muted-foreground">
                    {emailSentMap.get(c.id)
                      ? new Date(emailSentMap.get(c.id)!).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })
                      : '—'}
                  </TableCell>
                  <TableCell className="text-center">
                    <SeguimientoBadge company={c} campaignId={campaignId} />
                  </TableCell>
                  <TableCell className="text-center">
                    {followupLabels.get(c.id) ? (
                      <Badge variant="secondary" className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200">
                        {followupLabels.get(c.id)}
                      </Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    <NotasPopover company={c} campaignId={campaignId} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center gap-3">
        <Button variant="outline" onClick={() => navigate('/admin/valoraciones-pro')}>Ver en Valoraciones Pro</Button>
        <Button variant="outline" onClick={() => navigate('/admin/campanas-valoracion/nueva')}>Nueva Campaña</Button>
        <Button onClick={() => navigate('/admin/campanas-valoracion')}>Volver al listado</Button>
      </div>
    </div>
  );
}
