import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { 
  Calculator, 
  History, 
  Settings, 
  Plus,
  Home,
  LogOut,
  ExternalLink,
  FileText,
  Activity,
  Euro,
  Building,
  Clock
} from 'lucide-react';

export const CalculatorDashboard: React.FC = () => {
  const { user } = useAuth();

  // Get user's valuations summary
  const { data: valuationsSummary, isLoading } = useQuery({
    queryKey: ['user-valuations-summary', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from('company_valuations')
        .select('id, final_valuation, valuation_status, created_at, company_name')
        .eq('user_id', user.id)
        .eq('is_deleted', false)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const completed = data?.filter(v => v.valuation_status === 'completed') || [];
      const inProgress = data?.filter(v => v.valuation_status === 'in_progress') || [];
      const totalValue = completed.reduce((sum, v) => sum + (v.final_valuation || 0), 0);

      return {
        total: data?.length || 0,
        completed: completed.length,
        inProgress: inProgress.length,
        totalValue,
        recent: data?.slice(0, 5) || []
      };
    },
    enabled: !!user?.id
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-muted rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const stats = [
    {
      title: 'Total Valoraciones',
      value: valuationsSummary?.total || 0,
      icon: Calculator,
      color: 'text-blue-600'
    },
    {
      title: 'Completadas',
      value: valuationsSummary?.completed || 0,
      icon: FileText,
      color: 'text-green-600'
    },
    {
      title: 'En Progreso',
      value: valuationsSummary?.inProgress || 0,
      icon: Activity,
      color: 'text-yellow-600'
    },
    {
      title: 'Valor Total',
      value: new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(valuationsSummary?.totalValue || 0),
      icon: Euro,
      color: 'text-purple-600'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            Bienvenido, {user?.user_metadata?.full_name || 'Usuario'}
          </h1>
          <p className="text-muted-foreground">
            Gestiona tus valoraciones empresariales de forma avanzada
          </p>
        </div>
        <Button asChild>
          <Link to="/nueva-valoracion">
            <Plus className="h-4 w-4 mr-2" />
            Nueva Valoración
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Valuations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Valoraciones Recientes</CardTitle>
            <CardDescription>
              Tus últimas valoraciones empresariales
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {valuationsSummary?.recent.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Calculator className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No tienes valoraciones aún</p>
                <Button asChild className="mt-4">
                  <Link to="/nueva-valoracion">
                    Crear Primera Valoración
                  </Link>
                </Button>
              </div>
            ) : (
              valuationsSummary?.recent.map((valuation) => (
                <div
                  key={valuation.id}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{valuation.company_name}</p>
                      <p className="text-sm text-muted-foreground flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {new Date(valuation.created_at).toLocaleDateString('es-ES')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-xs px-2 py-1 rounded-full ${
                      valuation.valuation_status === 'completed' 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {valuation.valuation_status === 'completed' ? 'Completada' : 'En Progreso'}
                    </div>
                    {valuation.final_valuation && (
                      <p className="text-sm font-medium mt-1">
                        {new Intl.NumberFormat('es-ES', {
                          style: 'currency',
                          currency: 'EUR',
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0
                        }).format(valuation.final_valuation)}
                      </p>
                    )}
                  </div>
                </div>
              ))
            )}
            {valuationsSummary?.recent.length > 0 && (
              <div className="pt-4">
                <Button variant="outline" asChild className="w-full">
                  <Link to="/historial">
                    Ver Todas las Valoraciones
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Acciones Rápidas</CardTitle>
            <CardDescription>
              Herramientas disponibles para ti
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button asChild className="w-full justify-start">
              <Link to="/nueva-valoracion">
                <Plus className="h-4 w-4 mr-2" />
                Nueva Valoración Avanzada
              </Link>
            </Button>
            <Button variant="outline" asChild className="w-full justify-start">
              <Link to="/historial">
                <History className="h-4 w-4 mr-2" />
                Ver Historial Completo
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start"
              onClick={() => window.open('https://capittal.es/contacto', '_blank')}
            >
              <Calculator className="h-4 w-4 mr-2" />
              Consulta Personalizada
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};