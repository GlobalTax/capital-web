import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useNavigate } from 'react-router-dom';
import { Building2, Mail, TrendingUp, CheckCircle2, Percent, DollarSign, Calendar } from 'lucide-react';
import { useCampaignCompanies } from '@/hooks/useCampaignCompanies';
import { ValuationCampaign } from '@/hooks/useCampaigns';
import { formatCurrencyEUR } from '@/utils/professionalValuationCalculation';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useMemo } from 'react';

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

export function CampaignSummaryStep({ campaignId, campaign }: Props) {
  const navigate = useNavigate();
  const { companies, stats } = useCampaignCompanies(campaignId);

  const sentCount = companies.filter(c => c.status === 'sent').length;
  const createdCount = companies.filter(c => ['created', 'sent'].includes(c.status)).length;
  const failedCount = companies.filter(c => c.status === 'failed').length;
  const successRate = stats.total > 0 ? ((sentCount / stats.total) * 100).toFixed(0) : '0';
  const avgValuation = createdCount > 0 ? stats.totalValuation / createdCount : 0;

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
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
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
