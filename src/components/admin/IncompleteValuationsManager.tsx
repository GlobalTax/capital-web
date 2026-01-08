import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Download, 
  Search, 
  AlertCircle, 
  Clock, 
  TrendingDown,
  FileText,
  Mail,
  Phone,
  Building2,
  MapPin,
  User,
  BarChart3
} from 'lucide-react';
import { formatDistance } from 'date-fns';
import { es } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';

interface IncompleteValuation {
  id: string;
  contact_name: string;
  company_name: string;
  email: string;
  phone: string | null;
  industry: string;
  employee_range: string;
  revenue: number | null;
  ebitda: number | null;
  location: string | null;
  ownership_participation: string | null;
  competitive_advantage: string | null;
  current_step: number | null;
  completion_percentage: number | null;
  last_modified_field: string | null;
  time_spent_seconds: number | null;
  created_at: string;
  last_activity_at: string | null;
}

interface AbandonmentStats {
  total_incomplete: number;
  avg_completion: number;
  avg_time_spent: number;
  abandonment_by_step: { step: number; count: number }[];
}

const IncompleteValuationsManager: React.FC = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [stepFilter, setStepFilter] = useState<string>('all');
  const [selectedValuation, setSelectedValuation] = useState<IncompleteValuation | null>(null);

  // Fetch incomplete valuations (sin valoración final = abandonado)
  const { data: valuations, isLoading } = useQuery({
    queryKey: ['incomplete-valuations', stepFilter],
    queryFn: async () => {
      let query = supabase
        .from('company_valuations')
        .select('*')
        .is('final_valuation', null)
        .or('is_deleted.is.null,is_deleted.eq.false')
        .order('created_at', { ascending: false });

      if (stepFilter !== 'all') {
        query = query.eq('current_step', parseInt(stepFilter));
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as IncompleteValuation[];
    },
  });

  // Obtener total de valoraciones para calcular tasa de abandono
  const { data: totalValuations } = useQuery({
    queryKey: ['total-valuations'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('company_valuations')
        .select('*', { count: 'exact', head: true })
        .or('is_deleted.is.null,is_deleted.eq.false');
      
      if (error) throw error;
      return count || 0;
    },
  });

  // Fetch abandonment statistics
  const { data: stats } = useQuery({
    queryKey: ['abandonment-stats', totalValuations],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_abandonment_stats' as any);
      
      // Fallback: calcular stats manualmente si la función no existe
      if (error) {
        const { data: allIncomplete } = await supabase
          .from('company_valuations')
          .select('current_step, completion_percentage, time_spent_seconds')
          .is('final_valuation', null)
          .or('is_deleted.is.null,is_deleted.eq.false');

        if (!allIncomplete) return null;

        const total = allIncomplete.length;
        const avgCompletion = allIncomplete.reduce((sum, v) => sum + (v.completion_percentage || 0), 0) / (total || 1);
        const avgTime = allIncomplete.reduce((sum, v) => sum + (v.time_spent_seconds || 0), 0) / (total || 1);
        
        const stepCounts = allIncomplete.reduce((acc, v) => {
          const step = v.current_step || 1;
          acc[step] = (acc[step] || 0) + 1;
          return acc;
        }, {} as Record<number, number>);

        return {
          total_incomplete: total,
          total_valuations: totalValuations || 0,
          abandonment_rate: totalValuations ? (total / totalValuations) * 100 : 0,
          avg_completion: Math.round(avgCompletion),
          avg_time_spent: Math.round(avgTime),
          abandonment_by_step: Object.entries(stepCounts).map(([step, count]) => ({
            step: parseInt(step),
            count
          }))
        } as AbandonmentStats & { total_valuations: number; abandonment_rate: number };
      }

      return data as AbandonmentStats;
    },
    enabled: !!totalValuations,
  });

  // Filter valuations by search term
  const filteredValuations = valuations?.filter(v => 
    v.contact_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.email?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  // Export to CSV
  const handleExport = () => {
    if (!filteredValuations.length) {
      toast({
        title: "No hay datos",
        description: "No hay valoraciones incompletas para exportar",
        variant: "destructive"
      });
      return;
    }

    const headers = [
      'Nombre Contacto',
      'Empresa',
      'Email',
      'Teléfono',
      'Sector',
      'Rango Empleados',
      'Ingresos',
      'EBITDA',
      'Ubicación',
      'Paso Abandonado',
      '% Completitud',
      'Último Campo',
      'Tiempo (seg)',
      'Fecha Creación',
      'Última Actividad'
    ];

    const rows = filteredValuations.map(v => [
      v.contact_name || '',
      v.company_name || '',
      v.email || '',
      v.phone || '',
      v.industry || '',
      v.employee_range || '',
      v.revenue || '',
      v.ebitda || '',
      v.location || '',
      v.current_step || '',
      v.completion_percentage || '',
      v.last_modified_field || '',
      v.time_spent_seconds || '',
      new Date(v.created_at).toLocaleString('es-ES'),
      v.last_activity_at ? new Date(v.last_activity_at).toLocaleString('es-ES') : ''
    ]);

    const csv = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `valoraciones_incompletas_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();

    toast({
      title: "Exportación exitosa",
      description: `${filteredValuations.length} registros exportados`
    });
  };

  const getStepLabel = (step: number | null) => {
    if (!step) return 'No iniciado';
    switch (step) {
      case 1: return 'Paso 1: Datos Básicos';
      case 2: return 'Paso 2: Datos Financieros';
      case 3: return 'Paso 3: Características';
      default: return `Paso ${step}`;
    }
  };

  const getCompletionColor = (percentage: number | null) => {
    if (!percentage) return 'bg-gray-200';
    if (percentage < 30) return 'bg-red-500';
    if (percentage < 60) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-normal mb-2">Formularios Incompletos</h1>
        <p className="text-muted-foreground mb-4">
          Análisis de usuarios que abandonaron el proceso de valoración
        </p>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-900 mb-1">
                Nota sobre la captura de abandonos
              </p>
              <p className="text-sm text-blue-800">
                Solo se registran abandonos de usuarios que iniciaron el formulario y llenaron al menos un campo. 
                Los abandonos muy tempranos (apertura sin interacción) no generan registro en la base de datos, 
                por lo que la tasa real de abandono podría ser mayor.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-orange-500" />
                Total Incompletos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.total_incomplete}</div>
              <p className="text-xs text-muted-foreground mt-1">
                de {(stats as any).total_valuations || totalValuations} totales 
                ({((stats as any).abandonment_rate || 0).toFixed(2)}% tasa)
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-blue-500" />
                Completitud Promedio
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.avg_completion}%</div>
              <p className="text-xs text-muted-foreground mt-1">
                De los campos completados
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Clock className="h-4 w-4 text-purple-500" />
                Tiempo Promedio
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {Math.floor(stats.avg_time_spent / 60)}m {stats.avg_time_spent % 60}s
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Antes de abandonar
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-red-500" />
                Paso Crítico
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                Paso {stats.abandonment_by_step.reduce((max, curr) => 
                  curr.count > max.count ? curr : max, 
                  stats.abandonment_by_step[0]
                )?.step || 1}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Mayor tasa de abandono
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Abandonment by Step Chart */}
      {stats?.abandonment_by_step && stats.abandonment_by_step.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Distribución de Abandono por Paso</CardTitle>
            <CardDescription>
              Análisis de en qué etapa del formulario abandonan los usuarios
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.abandonment_by_step.map(({ step, count }) => (
                <div key={step} className="flex items-center gap-4">
                  <div className="w-32 text-sm font-medium">
                    {getStepLabel(step)}
                  </div>
                  <div className="flex-1">
                    <div className="h-8 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-red-400 to-red-600 flex items-center justify-end px-3 text-white text-xs font-medium"
                        style={{ 
                          width: `${(count / stats.total_incomplete) * 100}%`,
                          minWidth: count > 0 ? '40px' : '0'
                        }}
                      >
                        {count}
                      </div>
                    </div>
                  </div>
                  <div className="w-16 text-sm text-muted-foreground text-right">
                    {Math.round((count / stats.total_incomplete) * 100)}%
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters and Actions */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>Registros Incompletos ({filteredValuations.length})</CardTitle>
              <CardDescription>
                Datos capturados antes de abandonar el formulario
              </CardDescription>
            </div>
            <Button onClick={handleExport} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Exportar CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre, empresa o email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={stepFilter} onValueChange={setStepFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filtrar por paso" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los pasos</SelectItem>
                <SelectItem value="1">Paso 1</SelectItem>
                <SelectItem value="2">Paso 2</SelectItem>
                <SelectItem value="3">Paso 3</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Contacto</TableHead>
                  <TableHead>Empresa</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Sector</TableHead>
                  <TableHead className="text-right">Facturación</TableHead>
                  <TableHead className="text-right">EBITDA</TableHead>
                  <TableHead>Paso</TableHead>
                  <TableHead>Completitud</TableHead>
                  <TableHead>Tiempo</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredValuations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={11} className="text-center py-8 text-muted-foreground">
                      No se encontraron valoraciones incompletas
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredValuations.map((valuation) => (
                    <TableRow key={valuation.id}>
                      <TableCell className="font-medium">
                        {valuation.contact_name || '-'}
                      </TableCell>
                      <TableCell>{valuation.company_name || '-'}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Mail className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm">{valuation.email}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {valuation.industry || 'Sin especificar'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm">
                        {valuation.revenue 
                          ? new Intl.NumberFormat('es-ES', { 
                              style: 'currency', 
                              currency: 'EUR',
                              maximumFractionDigits: 0
                            }).format(valuation.revenue)
                          : '-'
                        }
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm">
                        {valuation.ebitda 
                          ? new Intl.NumberFormat('es-ES', { 
                              style: 'currency', 
                              currency: 'EUR',
                              maximumFractionDigits: 0
                            }).format(valuation.ebitda)
                          : '-'
                        }
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-xs">
                          Paso {valuation.current_step || 1}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${getCompletionColor(valuation.completion_percentage)}`}
                              style={{ width: `${valuation.completion_percentage || 0}%` }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {valuation.completion_percentage || 0}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {valuation.time_spent_seconds 
                          ? `${Math.floor(valuation.time_spent_seconds / 60)}m`
                          : '-'
                        }
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDistance(new Date(valuation.created_at), new Date(), {
                          addSuffix: true,
                          locale: es
                        })}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedValuation(valuation)}
                        >
                          <FileText className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Detail Modal */}
      <Dialog open={!!selectedValuation} onOpenChange={() => setSelectedValuation(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalle de Valoración Incompleta</DialogTitle>
            <DialogDescription>
              Información capturada antes de abandonar el formulario
            </DialogDescription>
          </DialogHeader>

          {selectedValuation && (
            <div className="space-y-6">
              {/* Contacto */}
              <div>
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Información de Contacto
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Nombre:</span>
                    <p className="font-medium">{selectedValuation.contact_name || '-'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Email:</span>
                    <p className="font-medium">{selectedValuation.email}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Teléfono:</span>
                    <p className="font-medium">{selectedValuation.phone || '-'}</p>
                  </div>
                </div>
              </div>

              {/* Empresa */}
              <div>
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Información de Empresa
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Empresa:</span>
                    <p className="font-medium">{selectedValuation.company_name || '-'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Sector:</span>
                    <p className="font-medium">{selectedValuation.industry || '-'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Empleados:</span>
                    <p className="font-medium">{selectedValuation.employee_range || '-'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Ubicación:</span>
                    <p className="font-medium">{selectedValuation.location || '-'}</p>
                  </div>
                </div>
              </div>

              {/* Financiero */}
              <div>
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Datos Financieros
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Facturación:</span>
                    <p className="font-medium">
                      {selectedValuation.revenue 
                        ? new Intl.NumberFormat('es-ES', {
                            style: 'currency',
                            currency: 'EUR',
                            minimumFractionDigits: 0
                          }).format(selectedValuation.revenue)
                        : '-'
                      }
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">EBITDA:</span>
                    <p className="font-medium">
                      {selectedValuation.ebitda 
                        ? new Intl.NumberFormat('es-ES', {
                            style: 'currency',
                            currency: 'EUR',
                            minimumFractionDigits: 0
                          }).format(selectedValuation.ebitda)
                        : '-'
                      }
                    </p>
                  </div>
                </div>
              </div>

              {/* Progreso */}
              <div>
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Progreso del Formulario
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Paso abandonado:</span>
                    <Badge variant="secondary">
                      {getStepLabel(selectedValuation.current_step)}
                    </Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Completitud:</span>
                    <span className="font-medium">{selectedValuation.completion_percentage || 0}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tiempo invertido:</span>
                    <span className="font-medium">
                      {selectedValuation.time_spent_seconds 
                        ? `${Math.floor(selectedValuation.time_spent_seconds / 60)} minutos`
                        : '-'
                      }
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Último campo modificado:</span>
                    <span className="font-medium">
                      {selectedValuation.last_modified_field || '-'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Última actividad:</span>
                    <span className="font-medium">
                      {selectedValuation.last_activity_at
                        ? formatDistance(new Date(selectedValuation.last_activity_at), new Date(), {
                            addSuffix: true,
                            locale: es
                          })
                        : '-'
                      }
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default IncompleteValuationsManager;
