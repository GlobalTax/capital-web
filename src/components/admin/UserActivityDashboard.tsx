import React, { useState, useEffect } from 'react';
import { Users, Calculator, FileText, Activity, Clock, Eye, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface UserRegistration {
  id: string;
  email: string;
  full_name: string;
  requested_at: string;
  status: 'pending' | 'approved' | 'rejected';
  processed_at?: string;
  processed_by?: string;
}

interface UserValuation {
  id: string;
  contact_name: string;
  company_name: string;
  email: string;
  created_at: string;
  final_valuation?: number;
  valuation_status: string;
  user_id?: string;
}

interface UserActivity {
  registeredUsers: number;
  approvedUsers: number;
  pendingUsers: number;
  totalCalculatorUses: number;
  totalValuations: number;
  completedValuations: number;
  avgValuationAmount: number;
}

const UserActivityDashboard = () => {
  const { toast } = useToast();

  // Fetch user registrations
  const { data: registrations = [], isLoading: loadingRegistrations } = useQuery({
    queryKey: ['userRegistrations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_registration_requests')
        .select('*')
        .order('requested_at', { ascending: false });

      if (error) throw error;
      return data as UserRegistration[];
    }
  });

  // Fetch user valuations (from registered users)
  const { data: userValuations = [], isLoading: loadingValuations } = useQuery({
    queryKey: ['userValuations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('company_valuations')
        .select('*')
        .not('user_id', 'is', null)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      return data as UserValuation[];
    }
  });

  // Fetch lead behavior events for calculator usage
  const { data: calculatorEvents = [] } = useQuery({
    queryKey: ['calculatorEvents'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lead_behavior_events')
        .select('*')
        .eq('event_type', 'calculator_usage')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error && !error.message?.includes('row-level security')) {
        throw error;
      }
      return data || [];
    }
  });

  // Calculate activity stats
  const activityStats: UserActivity = React.useMemo(() => {
    const registeredUsers = registrations.length;
    const approvedUsers = registrations.filter(r => r.status === 'approved').length;
    const pendingUsers = registrations.filter(r => r.status === 'pending').length;
    const totalValuations = userValuations.length;
    const completedValuations = userValuations.filter(v => v.final_valuation !== null).length;
    const totalCalculatorUses = calculatorEvents.length;
    
    const valuationAmounts = userValuations
      .filter(v => v.final_valuation)
      .map(v => v.final_valuation!);
    const avgValuationAmount = valuationAmounts.length > 0 
      ? valuationAmounts.reduce((sum, val) => sum + val, 0) / valuationAmounts.length 
      : 0;

    return {
      registeredUsers,
      approvedUsers,
      pendingUsers,
      totalCalculatorUses,
      totalValuations,
      completedValuations,
      avgValuationAmount
    };
  }, [registrations, userValuations, calculatorEvents]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge variant="default" className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Aprobado</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Rechazado</Badge>;
      case 'pending':
        return <Badge variant="secondary"><AlertCircle className="w-3 h-3 mr-1" />Pendiente</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getValuationStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="bg-blue-100 text-blue-800">Completada</Badge>;
      case 'in_progress':
        return <Badge variant="secondary">En Progreso</Badge>;
      case 'abandoned':
        return <Badge variant="outline">Abandonada</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loadingRegistrations || loadingValuations) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando actividad de usuarios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Actividad de Usuarios Registrados</h1>
          <p className="text-muted-foreground">
            Seguimiento de usuarios en calculadoras.capittal.es
          </p>
        </div>
        <Badge variant="outline" className="px-3 py-1">
          <Activity className="h-4 w-4 mr-1" />
          calculadoras.capittal.es
        </Badge>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuarios Registrados</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activityStats.registeredUsers}</div>
            <p className="text-xs text-muted-foreground">
              {activityStats.approvedUsers} aprobados, {activityStats.pendingUsers} pendientes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usos de Calculadora</CardTitle>
            <Calculator className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activityStats.totalCalculatorUses}</div>
            <p className="text-xs text-muted-foreground">eventos registrados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valoraciones</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activityStats.totalValuations}</div>
            <p className="text-xs text-muted-foreground">
              {activityStats.completedValuations} completadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valoración Promedio</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              €{activityStats.avgValuationAmount > 0 ? Math.round(activityStats.avgValuationAmount).toLocaleString() : '--'}
            </div>
            <p className="text-xs text-muted-foreground">valoraciones completadas</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for different views */}
      <Tabs defaultValue="registrations" className="space-y-4">
        <TabsList>
          <TabsTrigger value="registrations">Solicitudes de Registro</TabsTrigger>
          <TabsTrigger value="valuations">Valoraciones de Usuarios</TabsTrigger>
          <TabsTrigger value="activity">Actividad Reciente</TabsTrigger>
        </TabsList>

        <TabsContent value="registrations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Solicitudes de Registro</CardTitle>
              <CardDescription>
                Usuarios que han solicitado acceso a calculadoras.capittal.es
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuario</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Solicitud</TableHead>
                    <TableHead>Procesada</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {registrations.slice(0, 10).map((registration) => (
                    <TableRow key={registration.id}>
                      <TableCell className="font-medium">{registration.full_name}</TableCell>
                      <TableCell>{registration.email}</TableCell>
                      <TableCell>{getStatusBadge(registration.status)}</TableCell>
                      <TableCell>
                        {formatDistanceToNow(new Date(registration.requested_at), { 
                          addSuffix: true, 
                          locale: es 
                        })}
                      </TableCell>
                      <TableCell>
                        {registration.processed_at ? 
                          formatDistanceToNow(new Date(registration.processed_at), { 
                            addSuffix: true, 
                            locale: es 
                          }) : 
                          '--'
                        }
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="valuations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Valoraciones de Usuarios Registrados</CardTitle>
              <CardDescription>
                Valoraciones creadas por usuarios autenticados en calculadoras.capittal.es
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Contacto</TableHead>
                    <TableHead>Empresa</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Valoración</TableHead>
                    <TableHead>Creada</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {userValuations.slice(0, 10).map((valuation) => (
                    <TableRow key={valuation.id}>
                      <TableCell className="font-medium">{valuation.contact_name}</TableCell>
                      <TableCell>{valuation.company_name}</TableCell>
                      <TableCell>{valuation.email}</TableCell>
                      <TableCell>{getValuationStatusBadge(valuation.valuation_status)}</TableCell>
                      <TableCell>
                        {valuation.final_valuation ? 
                          `€${Math.round(valuation.final_valuation).toLocaleString()}` : 
                          '--'
                        }
                      </TableCell>
                      <TableCell>
                        {formatDistanceToNow(new Date(valuation.created_at), { 
                          addSuffix: true, 
                          locale: es 
                        })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Actividad Reciente</CardTitle>
              <CardDescription>
                Eventos de uso de calculadoras por usuarios registrados
              </CardDescription>
            </CardHeader>
            <CardContent>
              {calculatorEvents.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Visitante</TableHead>
                      <TableHead>Evento</TableHead>
                      <TableHead>Página</TableHead>
                      <TableHead>Puntos</TableHead>
                      <TableHead>Fecha</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {calculatorEvents.slice(0, 10).map((event) => (
                      <TableRow key={event.id}>
                        <TableCell className="font-mono text-xs">{event.visitor_id?.substring(0, 20)}...</TableCell>
                        <TableCell>{event.event_type}</TableCell>
                        <TableCell>{event.page_path || '--'}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{event.points_awarded || 0}</Badge>
                        </TableCell>
                        <TableCell>
                          {formatDistanceToNow(new Date(event.created_at), { 
                            addSuffix: true, 
                            locale: es 
                          })}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8">
                  <Calculator className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">No hay actividad de calculadoras</h3>
                  <p className="text-muted-foreground">Los eventos de uso aparecerán aquí cuando los usuarios usen las calculadoras.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserActivityDashboard;