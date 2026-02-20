import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Users, Crown, UserCheck, BarChart3 } from 'lucide-react';

interface WorkloadRow {
  user_id: string;
  full_name: string | null;
  email: string | null;
  role: string;
  mandatos_como_owner: number;
  mandatos_como_miembro: number;
  total_mandatos: number;
}

const ROLE_LABELS: Record<string, string> = {
  super_admin: 'Super Admin',
  admin: 'Admin',
  editor: 'Editor',
  viewer: 'Viewer',
};

const ROLE_COLORS: Record<string, string> = {
  super_admin: 'bg-purple-100 text-purple-700',
  admin: 'bg-blue-100 text-blue-700',
  editor: 'bg-green-100 text-green-700',
  viewer: 'bg-gray-100 text-gray-600',
};

const MandatoWorkloadPage = () => {
  const { data: workload = [], isLoading } = useQuery({
    queryKey: ['mandato-workload'],
    queryFn: async (): Promise<WorkloadRow[]> => {
      const { data, error } = await supabase
        .from('mandato_workload' as any)
        .select('*');

      if (error) throw error;
      return ((data || []) as unknown) as WorkloadRow[];
    },
  });

  const maxTotal = Math.max(...workload.map(w => w.total_mandatos), 1);

  const stats = {
    totalMiembros: workload.length,
    totalMandatosAsignados: workload.reduce((sum, w) => sum + (w.mandatos_como_owner || 0), 0),
    promedioWorkload: workload.length > 0
      ? Math.round(workload.reduce((sum, w) => sum + w.total_mandatos, 0) / workload.length)
      : 0,
    maxWorkload: Math.max(...workload.map(w => w.total_mandatos), 0),
  };

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Workload del Equipo</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Distribución de mandatos por persona del equipo
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Miembros</span>
            </div>
            <p className="text-2xl font-bold mt-1">{stats.totalMiembros}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2">
              <Crown className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Como Owner</span>
            </div>
            <p className="text-2xl font-bold mt-1">{stats.totalMandatosAsignados}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Promedio</span>
            </div>
            <p className="text-2xl font-bold mt-1">{stats.promedioWorkload}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Máx. carga</span>
            </div>
            <p className="text-2xl font-bold mt-1">{stats.maxWorkload}</p>
          </CardContent>
        </Card>
      </div>

      {/* Workload table */}
      <Card>
        <CardHeader className="border-b">
          <CardTitle className="text-base">Distribución por Persona</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-12 bg-muted animate-pulse rounded" />
              ))}
            </div>
          ) : workload.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <Users className="h-8 w-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No hay datos de workload disponibles.</p>
              <p className="text-xs mt-1">Asigna mandatos al equipo para ver la distribución.</p>
            </div>
          ) : (
            <div className="divide-y">
              {/* Header row */}
              <div className="grid grid-cols-[1fr_100px_100px_80px] gap-4 px-4 py-2 bg-muted/40 text-xs font-medium text-muted-foreground">
                <span>Persona</span>
                <span className="text-center">Owner</span>
                <span className="text-center">Miembro</span>
                <span className="text-center">Total</span>
              </div>
              {workload.map((row) => (
                <div key={row.user_id} className="grid grid-cols-[1fr_100px_100px_80px] gap-4 px-4 py-3 items-center hover:bg-muted/20 transition-colors">
                  {/* Person info */}
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-accent/10 flex items-center justify-center text-xs font-medium text-accent-foreground shrink-0">
                        {(row.full_name || row.email || '?').charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{row.full_name || '—'}</p>
                        <p className="text-xs text-muted-foreground truncate">{row.email}</p>
                      </div>
                    </div>
                    {/* Progress bar */}
                    <div className="mt-2 pl-9">
                      <Progress
                        value={maxTotal > 0 ? (row.total_mandatos / maxTotal) * 100 : 0}
                        className="h-1.5"
                      />
                    </div>
                  </div>
                  {/* Owner count */}
                  <div className="text-center">
                    <span className="inline-flex items-center justify-center gap-1 text-sm">
                      <Crown className="h-3 w-3 text-yellow-500" />
                      <span className="font-medium">{row.mandatos_como_owner ?? 0}</span>
                    </span>
                  </div>
                  {/* Member count */}
                  <div className="text-center">
                    <span className="text-sm font-medium text-muted-foreground">
                      {row.mandatos_como_miembro ?? 0}
                    </span>
                  </div>
                  {/* Total */}
                  <div className="text-center">
                    <Badge variant="secondary" className="text-xs font-bold">
                      {row.total_mandatos ?? 0}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MandatoWorkloadPage;
