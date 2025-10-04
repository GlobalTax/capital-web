import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Pencil, Building2, DollarSign, FileText, Calendar, MapPin, Settings, Loader2 } from 'lucide-react';
import { formatCurrency } from '@/utils/formatters';
import { useToast } from '@/hooks/use-toast';

interface Operation {
  id: string;
  company_name: string;
  sector: string;
  description: string;
  short_description: string | null;
  valuation_amount: number;
  valuation_currency: string;
  revenue_amount: number | null;
  ebitda_amount: number | null;
  ebitda_multiple: number | null;
  growth_percentage: number | null;
  year: number;
  deal_type: string;
  status: string;
  company_size_employees: string | null;
  logo_url: string | null;
  featured_image_url: string | null;
  highlights: string[] | null;
  display_locations: string[];
  is_active: boolean;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

const OperationDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [operation, setOperation] = useState<Operation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOperation = async () => {
      if (!id) return;

      try {
        const { data, error } = await supabase
          .from('company_operations')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        setOperation(data);
      } catch (error) {
        console.error('Error fetching operation:', error);
        toast({
          title: 'Error',
          description: 'No se pudo cargar la operación',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchOperation();
  }, [id, toast]);

  const getStatusBadgeClass = (status: string) => {
    const statusMap: Record<string, string> = {
      available: 'bg-green-100 text-green-700 border-green-200',
      negotiation: 'bg-amber-100 text-amber-700 border-amber-200',
      sold: 'bg-blue-100 text-blue-700 border-blue-200',
      withdrawn: 'bg-gray-100 text-gray-700 border-gray-200',
    };
    return statusMap[status] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      available: 'Disponible',
      negotiation: 'En Negociación',
      sold: 'Vendida',
      withdrawn: 'Retirada',
    };
    return statusMap[status] || status;
  };

  const getDealTypeText = (dealType: string) => {
    const dealTypeMap: Record<string, string> = {
      sale: 'Venta',
      acquisition: 'Adquisición',
      merger: 'Fusión',
      partnership: 'Asociación',
    };
    return dealTypeMap[dealType] || dealType;
  };

  const calculateEbitdaMargin = () => {
    if (!operation?.revenue_amount || !operation?.ebitda_amount) return null;
    return ((operation.ebitda_amount / operation.revenue_amount) * 100).toFixed(1);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-sm text-gray-500">Cargando operación...</p>
        </div>
      </div>
    );
  }

  if (!operation) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Building2 className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Operación no encontrada</h3>
          <Button onClick={() => navigate('/admin/operations')} variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a Operaciones
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            onClick={() => navigate('/admin/operations')}
            variant="ghost"
            size="sm"
            className="hover:bg-gray-100"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a Operaciones
          </Button>
          <div className="h-6 w-px bg-gray-200" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">#{operation.id.substring(0, 8).toUpperCase()}</h1>
            <p className="text-sm text-gray-500">Creada el {new Date(operation.created_at).toLocaleDateString('es-ES')}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge className={getStatusBadgeClass(operation.status)}>
            {getStatusText(operation.status)}
          </Badge>
          <Button
            onClick={() => navigate('/admin/operations')}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Pencil className="h-4 w-4 mr-2" />
            Editar
          </Button>
        </div>
      </div>

      <Separator />

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* General Information */}
          <Card className="bg-white border border-gray-100">
            <CardHeader className="border-b border-gray-100">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Building2 className="h-5 w-5 text-gray-600" />
                Información General
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Empresa</p>
                  <p className="text-sm font-medium text-gray-900">{operation.company_name}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Sector</p>
                  <p className="text-sm font-medium text-gray-900">{operation.sector}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Tamaño</p>
                  <p className="text-sm font-medium text-gray-900">{operation.company_size_employees || 'No especificado'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Año</p>
                  <p className="text-sm font-medium text-gray-900">{operation.year}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Tipo de Deal</p>
                  <p className="text-sm font-medium text-gray-900">{getDealTypeText(operation.deal_type)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Financial Information */}
          <Card className="bg-white border border-gray-100">
            <CardHeader className="border-b border-gray-100">
              <CardTitle className="flex items-center gap-2 text-lg">
                <DollarSign className="h-5 w-5 text-gray-600" />
                Información Financiera
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Valoración</p>
                  <p className="text-lg font-bold text-gray-900">
                    {formatCurrency(operation.valuation_amount, operation.valuation_currency)}
                  </p>
                </div>
                {operation.revenue_amount && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Facturación</p>
                    <p className="text-lg font-bold text-gray-900">
                      {formatCurrency(operation.revenue_amount, operation.valuation_currency)}
                    </p>
                  </div>
                )}
                {operation.ebitda_amount && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">EBITDA</p>
                    <p className="text-lg font-bold text-gray-900">
                      {formatCurrency(operation.ebitda_amount, operation.valuation_currency)}
                    </p>
                  </div>
                )}
                {calculateEbitdaMargin() && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Margen EBITDA</p>
                    <p className="text-lg font-bold text-gray-900">{calculateEbitdaMargin()}%</p>
                  </div>
                )}
                {operation.ebitda_multiple && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Múltiplo EBITDA</p>
                    <p className="text-lg font-bold text-gray-900">{operation.ebitda_multiple}x</p>
                  </div>
                )}
                {operation.growth_percentage && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Crecimiento</p>
                    <p className="text-lg font-bold text-green-600">+{operation.growth_percentage}%</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Description */}
          <Card className="bg-white border border-gray-100">
            <CardHeader className="border-b border-gray-100">
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="h-5 w-5 text-gray-600" />
                Descripción
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                {operation.description}
              </p>
            </CardContent>
          </Card>

          {/* Highlights */}
          {operation.highlights && operation.highlights.length > 0 && (
            <Card className="bg-white border border-gray-100">
              <CardHeader className="border-b border-gray-100">
                <CardTitle className="text-lg">🎯 Highlights</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <ul className="space-y-2">
                  {operation.highlights.map((highlight, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                      <span className="text-blue-600 mt-1">•</span>
                      <span>{highlight}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Timeline */}
          <Card className="bg-white border border-gray-100">
            <CardHeader className="border-b border-gray-100">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Calendar className="h-5 w-5 text-gray-600" />
                Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-3">
              <div>
                <p className="text-xs text-gray-500 mb-1">Creada</p>
                <p className="text-sm font-medium text-gray-900">
                  {new Date(operation.created_at).toLocaleDateString('es-ES', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Última actualización</p>
                <p className="text-sm font-medium text-gray-900">
                  {new Date(operation.updated_at).toLocaleDateString('es-ES', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Display Locations */}
          <Card className="bg-white border border-gray-100">
            <CardHeader className="border-b border-gray-100">
              <CardTitle className="flex items-center gap-2 text-lg">
                <MapPin className="h-5 w-5 text-gray-600" />
                Ubicaciones de Display
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="flex flex-wrap gap-2">
                {operation.display_locations.map((location) => (
                  <Badge key={location} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    {location}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Configuration */}
          <Card className="bg-white border border-gray-100">
            <CardHeader className="border-b border-gray-100">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Settings className="h-5 w-5 text-gray-600" />
                Configuración
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Activa</span>
                <Badge variant={operation.is_active ? 'default' : 'secondary'} className={operation.is_active ? 'bg-green-100 text-green-700' : ''}>
                  {operation.is_active ? 'Sí' : 'No'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Destacada</span>
                <Badge variant={operation.is_featured ? 'default' : 'secondary'} className={operation.is_featured ? 'bg-amber-100 text-amber-700' : ''}>
                  {operation.is_featured ? 'Sí' : 'No'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default OperationDetails;
