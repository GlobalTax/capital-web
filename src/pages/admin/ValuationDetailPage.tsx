import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Building2, Mail, Phone, Calendar, Euro } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useValuationLogs } from '@/hooks/useValuationLogs';
import CommunicationStatus from '@/components/admin/valuation/CommunicationStatus';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';

const ValuationDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: valuation, isLoading, error } = useQuery({
    queryKey: ['valuation-detail', id],
    queryFn: async () => {
      if (!id) throw new Error('ID de valoración requerido');
      
      const { data, error } = await supabase
        .from('company_valuations')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        console.error('Error fetching valuation:', error);
        throw error;
      }
      
      return data;
    },
    enabled: !!id,
  });

  const { data: logs } = useValuationLogs(id || '');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando valoración...</p>
        </div>
      </div>
    );
  }

  if (error || !valuation) {
    toast({
      title: "Error",
      description: "No se pudo cargar la valoración solicitada",
      variant: "destructive",
    });
    navigate('/admin/');
    return null;
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="success">Completada</Badge>;
      case 'in_progress':
        return <Badge variant="warning">En Progreso</Badge>;
      case 'abandoned':
        return <Badge variant="destructive">Abandonada</Badge>;
      default:
        return <Badge variant="outline">Iniciada</Badge>;
    }
  };

  const formatCurrency = (amount: number | null) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return format(new Date(dateString), "dd 'de' MMMM 'de' yyyy 'a las' HH:mm", { 
      locale: es 
    });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/admin/')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al Dashboard
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Detalle de Valoración</h1>
          <p className="text-muted-foreground">{valuation.company_name}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Información Principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Datos Básicos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Información Básica
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Empresa</p>
                  <p className="text-base font-semibold">{valuation.company_name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Contacto</p>
                  <p className="text-base">{valuation.contact_name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Email</p>
                  <p className="text-base flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    {valuation.email}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Teléfono</p>
                  <p className="text-base flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    {valuation.phone || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Sector</p>
                  <p className="text-base">{valuation.industry}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Empleados</p>
                  <p className="text-base">{valuation.employee_range}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Datos Financieros */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Euro className="w-5 h-5" />
                Datos Financieros
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Facturación</p>
                  <p className="text-xl font-bold text-primary">
                    {formatCurrency(valuation.revenue)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">EBITDA</p>
                  <p className="text-xl font-bold text-primary">
                    {formatCurrency(valuation.ebitda)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Valoración Final</p>
                  <p className="text-2xl font-bold text-success">
                    {formatCurrency(valuation.final_valuation)}
                  </p>
                </div>
              </div>
              
              {valuation.valuation_range_min && valuation.valuation_range_max && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Rango de Valoración</p>
                  <p className="text-base">
                    {formatCurrency(valuation.valuation_range_min)} - {formatCurrency(valuation.valuation_range_max)}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Panel Lateral */}
        <div className="space-y-6">
          {/* Estado General */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Estado General
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Estado</p>
                {getStatusBadge(valuation.valuation_status || 'started')}
              </div>
              
              <Separator />
              
              <div>
                <p className="text-sm font-medium text-muted-foreground">Progreso</p>
                <p className="text-base font-semibold">
                  {valuation.completion_percentage || 0}%
                </p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-muted-foreground">Creada</p>
                <p className="text-sm">{formatDate(valuation.created_at)}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-muted-foreground">Última actividad</p>
                <p className="text-sm">{formatDate(valuation.last_activity_at)}</p>
              </div>
            </CardContent>
          </Card>

          {/* Estados de Comunicación con logs */}
          {logs && (
            <CommunicationStatus
              valuation={valuation}
              latestWhatsapp={logs.latestWhatsapp}
              latestEmail={logs.latestEmail}
              latestHubspot={logs.latestHubspot}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ValuationDetailPage;