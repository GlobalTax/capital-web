import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { FileText, Calendar, Euro, Building, Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';

export const UserValuationsHistory: React.FC = () => {
  const { user } = useAuth();

  const { data: valuations, isLoading } = useQuery({
    queryKey: ['user-valuations', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('company_valuations')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_deleted', false)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="bg-green-100 text-green-800">Completada</Badge>;
      case 'in_progress':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">En Progreso</Badge>;
      case 'started':
        return <Badge variant="outline">Iniciada</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Historial de Valoraciones</h1>
        </div>
        <div className="grid gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded w-1/4 mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Historial de Valoraciones</h1>
          <p className="text-muted-foreground">
            Todas tus valoraciones empresariales en un solo lugar
          </p>
        </div>
        <Button asChild>
          <Link to="/nueva-valoracion">
            <FileText className="h-4 w-4 mr-2" />
            Nueva Valoración
          </Link>
        </Button>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
                <Input
                  placeholder="Buscar por empresa..."
                  className="pl-9"
                />
              </div>
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Valuations List */}
      <div className="space-y-4">
        {!valuations || valuations.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No tienes valoraciones aún</h3>
              <p className="text-muted-foreground mb-4">
                Crea tu primera valoración para comenzar a gestionar tu cartera empresarial
              </p>
              <Button asChild>
                <Link to="/nueva-valoracion">
                  Crear Primera Valoración
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          valuations.map((valuation) => (
            <Card key={valuation.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-3">
                      <Building className="h-5 w-5 text-muted-foreground" />
                      <h3 className="text-lg font-semibold">{valuation.company_name}</h3>
                      {getStatusBadge(valuation.valuation_status)}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2" />
                        {new Date(valuation.created_at).toLocaleDateString('es-ES')}
                      </div>
                      
                      {valuation.industry && (
                        <div>
                          <span className="font-medium">Sector:</span> {valuation.industry}
                        </div>
                      )}
                      
                      {valuation.final_valuation && (
                        <div className="flex items-center">
                          <Euro className="h-4 w-4 mr-2" />
                          {new Intl.NumberFormat('es-ES', {
                            style: 'currency',
                            currency: 'EUR',
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0
                          }).format(valuation.final_valuation)}
                        </div>
                      )}
                    </div>

                    {valuation.completion_percentage !== null && (
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 bg-muted rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full transition-all duration-300"
                            style={{ width: `${valuation.completion_percentage}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {valuation.completion_percentage}%
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link to={`/valoracion/${valuation.id}`}>
                        Ver Detalles
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};