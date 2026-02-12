import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Megaphone, Building2, Mail, TrendingUp, Trash2, Edit } from 'lucide-react';
import { useCampaigns, ValuationCampaign } from '@/hooks/useCampaigns';
import { formatCurrencyEUR } from '@/utils/professionalValuationCalculation';

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  draft: { label: 'Borrador', variant: 'secondary' },
  processing: { label: 'Procesando', variant: 'default' },
  completed: { label: 'Completada', variant: 'outline' },
  paused: { label: 'Pausada', variant: 'destructive' },
};

export default function CampanasValoracion() {
  const navigate = useNavigate();
  const { campaigns, isLoading, deleteCampaign, isDeleting } = useCampaigns();

  const totalCompanies = campaigns.reduce((s, c) => s + c.total_companies, 0);
  const totalSent = campaigns.reduce((s, c) => s + c.total_sent, 0);
  const totalValuation = campaigns.reduce((s, c) => s + c.total_valuation, 0);

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24" />)}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Megaphone className="h-6 w-6" />
            Campañas de Valoración Outbound
          </h1>
          <p className="text-muted-foreground mt-1">Campañas masivas de valoración por sector</p>
        </div>
        <Button onClick={() => navigate('/admin/campanas-valoracion/nueva')}>
          <Plus className="h-4 w-4 mr-2" />
          Nueva Campaña
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Total Campañas</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{campaigns.length}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1"><Building2 className="h-4 w-4" />Empresas</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{totalCompanies}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1"><Mail className="h-4 w-4" />Enviadas</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{totalSent}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1"><TrendingUp className="h-4 w-4" />Valor Total</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{formatCurrencyEUR(totalValuation)}</p></CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {campaigns.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Megaphone className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium">No hay campañas</h3>
              <p className="text-sm text-muted-foreground mt-1">Crea tu primera campaña de valoración outbound</p>
              <Button className="mt-4" onClick={() => navigate('/admin/campanas-valoracion/nueva')}>
                <Plus className="h-4 w-4 mr-2" />Nueva Campaña
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Campaña</TableHead>
                  <TableHead>Sector</TableHead>
                  <TableHead className="text-center">Empresas</TableHead>
                  <TableHead className="text-center">Enviadas</TableHead>
                  <TableHead className="text-right">Valor Total</TableHead>
                  <TableHead className="text-center">Estado</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {campaigns.map((c) => {
                  const st = statusConfig[c.status] || statusConfig.draft;
                  return (
                    <TableRow key={c.id} className="cursor-pointer hover:bg-muted/50" onClick={() => navigate(`/admin/campanas-valoracion/${c.id}`)}>
                      <TableCell className="font-medium">{c.name}</TableCell>
                      <TableCell>{c.sector}</TableCell>
                      <TableCell className="text-center">{c.total_companies}</TableCell>
                      <TableCell className="text-center">{c.total_sent}</TableCell>
                      <TableCell className="text-right">{c.total_valuation > 0 ? formatCurrencyEUR(c.total_valuation) : '—'}</TableCell>
                      <TableCell className="text-center"><Badge variant={st.variant}>{st.label}</Badge></TableCell>
                      <TableCell className="text-sm text-muted-foreground">{new Date(c.created_at).toLocaleDateString('es-ES')}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); navigate(`/admin/campanas-valoracion/${c.id}`); }}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" disabled={isDeleting} onClick={(e) => {
                            e.stopPropagation();
                            if (confirm('¿Eliminar esta campaña y todas sus empresas?')) deleteCampaign(c.id);
                          }}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
