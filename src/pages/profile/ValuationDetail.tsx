import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { 
  Loader2, 
  ArrowLeft, 
  Copy, 
  FileText, 
  Trash2, 
  Edit,
  Building2,
  TrendingUp,
  Calendar
} from 'lucide-react';

type CompanyValuation = Database['public']['Tables']['company_valuations']['Row'];

export const ValuationDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [valuation, setValuation] = useState<CompanyValuation | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchValuation();
  }, [id, user]);

  const fetchValuation = async () => {
    if (!id || !user) return;

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('company_valuations')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .eq('is_deleted', false)
        .single();

      if (error) {
        console.error('Error fetching valuation:', error);
        toast({
          title: "Error",
          description: "No se pudo cargar la valoración",
          variant: "destructive",
        });
        navigate('/perfil/valoraciones');
        return;
      }

      setValuation(data);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Error inesperado al cargar la valoración",
        variant: "destructive",
      });
      navigate('/perfil/valoraciones');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = () => {
    if (valuation) {
      navigate(`/lp/calculadora?valuation=${valuation.id}`);
    }
  };

  const handleDuplicate = async () => {
    if (!valuation || !user) return;

    try {
      const { data, error } = await supabase
        .from('company_valuations')
        .insert({
          user_id: user.id,
          company_name: `${valuation.company_name} (Copia)`,
          contact_name: valuation.contact_name,
          email: valuation.email,
          industry: valuation.industry,
          employee_range: valuation.employee_range,
          valuation_status: 'draft',
          revenue: valuation.revenue,
          ebitda: valuation.ebitda,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Éxito",
        description: "Valoración duplicada correctamente",
      });

      navigate(`/lp/calculadora?valuation=${data.id}`);
    } catch (error) {
      console.error('Error duplicating valuation:', error);
      toast({
        title: "Error",
        description: "No se pudo duplicar la valoración",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (!valuation || !confirm('¿Estás seguro de que deseas eliminar esta valoración?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('company_valuations')
        .update({ is_deleted: true })
        .eq('id', valuation.id);

      if (error) throw error;

      toast({
        title: "Éxito",
        description: "Valoración eliminada correctamente",
      });

      navigate('/perfil/valoraciones');
    } catch (error) {
      console.error('Error deleting valuation:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar la valoración",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusLabel = (status: string | null) => {
    switch (status) {
      case 'completed':
        return 'Completada';
      case 'in_progress':
        return 'En progreso';
      case 'draft':
        return 'Borrador';
      default:
        return status || 'Sin estado';
    }
  };

  const formatCurrency = (value: number | null) => {
    if (!value) return 'N/A';
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!valuation) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">Valoración no encontrada</h2>
        <Button onClick={() => navigate('/perfil/valoraciones')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver a valoraciones
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/perfil/valoraciones')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{valuation.company_name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge className={getStatusColor(valuation.valuation_status)}>
                {getStatusLabel(valuation.valuation_status)}
              </Badge>
              {valuation.industry && (
                <Badge variant="outline">{valuation.industry}</Badge>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleEdit}>
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </Button>
          <Button variant="outline" onClick={handleDuplicate}>
            <Copy className="h-4 w-4 mr-2" />
            Duplicar
          </Button>
          <Button 
            variant="outline" 
            onClick={handleDelete}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Eliminar
          </Button>
        </div>
      </div>

      {/* Información básica */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Información básica
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Empresa</p>
              <p className="font-semibold">{valuation.company_name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Sector</p>
              <p className="font-semibold">{valuation.industry || 'No especificado'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Estado</p>
              <Badge className={getStatusColor(valuation.valuation_status)}>
                {getStatusLabel(valuation.valuation_status)}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Datos financieros
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Facturación anual</p>
              <p className="font-semibold text-lg">{formatCurrency(valuation.revenue)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">EBITDA</p>
              <p className="font-semibold text-lg">{formatCurrency(valuation.ebitda)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Valoración estimada</p>
              <p className="font-semibold text-xl text-primary">{formatCurrency(valuation.final_valuation)}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Fechas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Creada</p>
              <p className="font-semibold">
                {new Date(valuation.created_at).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Última actualización</p>
              <p className="font-semibold">
                {new Date(valuation.created_at).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'long', 
                  day: 'numeric'
                })}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Descripción */}
      {valuation.competitive_advantage && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Ventaja competitiva
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground whitespace-pre-wrap">
              {valuation.competitive_advantage}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Datos adicionales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Información adicional</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Rango de empleados</p>
              <p className="font-semibold">{valuation.employee_range || 'No especificado'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Años de operación</p>
              <p className="font-semibold">{valuation.years_of_operation || 'No especificado'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Múltiplo EBITDA usado</p>
              <p className="font-semibold">{valuation.ebitda_multiple_used || 'No especificado'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tasa de crecimiento</p>
              <p className="font-semibold">{valuation.growth_rate ? `${valuation.growth_rate}%` : 'No especificado'}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Rango de valoración</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Valoración mínima</p>
              <p className="font-semibold">{formatCurrency(valuation.valuation_range_min)}</p>  
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Valoración máxima</p>
              <p className="font-semibold">{formatCurrency(valuation.valuation_range_max)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Margen de beneficio neto</p>
              <p className="font-semibold">{valuation.net_profit_margin ? `${valuation.net_profit_margin}%` : 'No especificado'}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ValuationDetail;