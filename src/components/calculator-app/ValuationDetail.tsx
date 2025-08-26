import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Building, Calendar, Euro, FileText, Download, Edit } from 'lucide-react';

export const ValuationDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  const { data: valuation, isLoading } = useQuery({
    queryKey: ['valuation-detail', id, user?.id],
    queryFn: async () => {
      if (!id || !user?.id) return null;

      const { data, error } = await supabase
        .from('company_valuations')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .eq('is_deleted', false)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id && !!user?.id
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
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/historial">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Link>
          </Button>
        </div>
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-4 bg-muted rounded w-1/2"></div>
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="h-4 bg-muted rounded"></div>
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!valuation) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/historial">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Link>
          </Button>
        </div>
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-semibold mb-2">Valoración no encontrada</h3>
            <p className="text-muted-foreground">
              La valoración que buscas no existe o no tienes permisos para verla.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/historial">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{valuation.company_name}</h1>
            <p className="text-muted-foreground">
              Valoración creada el {new Date(valuation.created_at).toLocaleDateString('es-ES')}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {getStatusBadge(valuation.valuation_status)}
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Exportar PDF
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Company Information */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building className="h-5 w-5 mr-2" />
                Información de la Empresa
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Nombre</label>
                  <p className="text-lg">{valuation.company_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Sector</label>
                  <p className="text-lg">{valuation.industry || 'No especificado'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Empleados</label>
                  <p className="text-lg">{valuation.employee_range || 'No especificado'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Ubicación</label>
                  <p className="text-lg">{valuation.location || 'No especificada'}</p>
                </div>
                {valuation.cif && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">CIF</label>
                    <p className="text-lg">{valuation.cif}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Financial Data */}
          {(valuation.revenue || valuation.ebitda) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Euro className="h-5 w-5 mr-2" />
                  Datos Financieros
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {valuation.revenue && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Facturación</label>
                      <p className="text-lg font-semibold">
                        {new Intl.NumberFormat('es-ES', {
                          style: 'currency',
                          currency: 'EUR',
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0
                        }).format(valuation.revenue)}
                      </p>
                    </div>
                  )}
                  {valuation.ebitda && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">EBITDA</label>
                      <p className="text-lg font-semibold">
                        {new Intl.NumberFormat('es-ES', {
                          style: 'currency',
                          currency: 'EUR',
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0
                        }).format(valuation.ebitda)}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Valuation Result */}
          {valuation.final_valuation && (
            <Card>
              <CardHeader>
                <CardTitle>Valoración Final</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <p className="text-3xl font-bold text-primary">
                    {new Intl.NumberFormat('es-ES', {
                      style: 'currency',
                      currency: 'EUR',
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0
                    }).format(valuation.final_valuation)}
                  </p>
                  {valuation.ebitda_multiple_used && (
                    <p className="text-sm text-muted-foreground mt-2">
                      Múltiplo EBITDA: {valuation.ebitda_multiple_used}x
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Progress */}
          {valuation.completion_percentage !== null && (
            <Card>
              <CardHeader>
                <CardTitle>Progreso</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Completado</span>
                    <span>{valuation.completion_percentage}%</span>
                  </div>
                  <div className="bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${valuation.completion_percentage}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Información de Contacto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Contacto</label>
                <p>{valuation.contact_name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Email</label>
                <p>{valuation.email}</p>
              </div>
              {valuation.phone && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Teléfono</label>
                  <p>{valuation.phone}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};