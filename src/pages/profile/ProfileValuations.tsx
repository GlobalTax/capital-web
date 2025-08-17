import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { Loader2, Plus, Search, Building2, Calendar, TrendingUp, Eye, Copy, Trash2, Play, Download, PlayCircle, XCircle, CheckCircle2 } from 'lucide-react';

type CompanyValuation = Database['public']['Tables']['company_valuations']['Row'];

export const ProfileValuations: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [valuations, setValuations] = useState<CompanyValuation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('updated_at');

  const fetchValuations = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      let query = supabase
        .from('company_valuations')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_deleted', false);

      if (statusFilter !== 'all') {
        if (statusFilter === 'in_progress') {
          query = query.in('valuation_status', ['started', 'in_progress']);
        } else if (statusFilter === 'abandoned') {
          // Para abandonadas, filtramos después en el cliente
        } else {
          query = query.eq('valuation_status', statusFilter);
        }
      }

      // Ordenamiento  
      const [field, direction] = sortBy.split('_');
      const ascending = direction === 'asc';
      if (field === 'updated_at') {
        query = query.order('created_at', { ascending });
      } else {
        query = query.order(field, { ascending });
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching valuations:', error);
        toast({
          title: "Error",
          description: "No se pudieron cargar las valoraciones",
          variant: "destructive",
        });
        return;
      }

      setValuations(data || []);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Error inesperado al cargar las valoraciones",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchValuations();
  }, [user, statusFilter, sortBy]);

  const handleNewValuation = () => {
    navigate('/lp/calculadora');
  };

  const handleViewValuation = (valuation: CompanyValuation) => {
    navigate(`/perfil/valoraciones/${valuation.id}`);
  };

  const handleResumeValuation = (valuation: CompanyValuation) => {
    if (valuation.unique_token) {
      navigate(`/lp/calculadora?token=${valuation.unique_token}`);
    } else {
      toast({
        title: "Error",
        description: "No se puede reanudar esta valoración",
        variant: "destructive",
      });
    }
  };

  const handleDuplicateValuation = async (valuation: CompanyValuation) => {
    try {
      const { data, error } = await supabase
        .from('company_valuations')
        .insert({
          user_id: user?.id,
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

  const handleDownloadPDF = async (valuation: CompanyValuation) => {
    try {
      const { downloadValuationPDF } = await import('@/utils/pdfManager');
      
      await downloadValuationPDF({
        valuationId: valuation.id,
        pdfType: 'auto',
        userId: user?.id,
        language: 'es'
      });

      toast({
        title: "PDF descargado",
        description: "El informe se ha descargado correctamente",
      });
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast({
        title: "Error",
        description: "No se pudo descargar el PDF",
        variant: "destructive",
      });
    }
  };

  const handleDeleteValuation = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta valoración?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('company_valuations')
        .update({ is_deleted: true })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Éxito",
        description: "Valoración eliminada correctamente",
      });

      fetchValuations();
    } catch (error) {
      console.error('Error deleting valuation:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar la valoración",
        variant: "destructive",
      });
    }
  };

  // Función para detectar valoraciones abandonadas (started sin final_valuation y + 7 días inactivas)
  const getAbandonedValuations = () => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    return valuations.filter(v => 
      (v.valuation_status === 'started' || v.valuation_status === 'in_progress') &&
      !v.final_valuation &&
      new Date(v.last_activity_at || v.created_at) < sevenDaysAgo
    );
  };

  // Función para obtener valoraciones en progreso (started/in_progress activas)
  const getInProgressValuations = () => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    return valuations.filter(v => 
      (v.valuation_status === 'started' || v.valuation_status === 'in_progress') &&
      !v.final_valuation &&
      new Date(v.last_activity_at || v.created_at) >= sevenDaysAgo
    );
  };

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'started':
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'abandoned':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusLabel = (status: string | null) => {
    switch (status) {
      case 'completed':
        return 'Completada';
      case 'started':
      case 'in_progress':
        return 'En progreso';
      case 'draft':
        return 'Borrador';
      case 'abandoned':
        return 'Abandonada';
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

  const filteredValuations = valuations.filter(valuation => {
    // Filtro por texto de búsqueda
    const matchesSearch = valuation.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (valuation.industry && valuation.industry.toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (!matchesSearch) return false;

    // Filtro por estado
    if (statusFilter === 'all') return true;
    
    if (statusFilter === 'abandoned') {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      return (valuation.valuation_status === 'started' || valuation.valuation_status === 'in_progress') &&
             !valuation.final_valuation &&
             new Date(valuation.last_activity_at || valuation.created_at) < sevenDaysAgo;
    }
    
    if (statusFilter === 'in_progress') {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      return (valuation.valuation_status === 'started' || valuation.valuation_status === 'in_progress') &&
             !valuation.final_valuation &&
             new Date(valuation.last_activity_at || valuation.created_at) >= sevenDaysAgo;
    }
    
    return valuation.valuation_status === statusFilter;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mis Valoraciones</h1>
          <p className="text-muted-foreground">
            Gestiona y consulta todas tus valoraciones de empresas
          </p>
        </div>
        <Button onClick={handleNewValuation}>
          <Plus className="h-4 w-4 mr-2" />
          Nueva Valoración
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-2xl font-bold">
                  {valuations.filter(v => v.valuation_status === 'completed').length}
                </p>
                <p className="text-sm text-muted-foreground">Completadas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <PlayCircle className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">
                  {getInProgressValuations().length}
                </p>
                <p className="text-sm text-muted-foreground">En progreso</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-2xl font-bold">
                  {getAbandonedValuations().length}
                </p>
                <p className="text-sm text-muted-foreground">Abandonadas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">{valuations.length}</p>
                <p className="text-sm text-muted-foreground">Total valoraciones</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros y búsqueda */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre de empresa o sector..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filtrar por estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            <SelectItem value="completed">Completadas</SelectItem>
            <SelectItem value="in_progress">En progreso</SelectItem>
            <SelectItem value="abandoned">Abandonadas</SelectItem>
            <SelectItem value="draft">Borradores</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Ordenar por" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="updated_at_desc">Más recientes</SelectItem>
            <SelectItem value="updated_at_asc">Más antiguas</SelectItem>
            <SelectItem value="company_name_asc">Nombre A-Z</SelectItem>
            <SelectItem value="company_name_desc">Nombre Z-A</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Lista de valoraciones */}
      {filteredValuations.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No hay valoraciones</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm ? 'No se encontraron valoraciones que coincidan con tu búsqueda.' : 'Aún no has creado ninguna valoración.'}
            </p>
            {!searchTerm && (
              <Button onClick={handleNewValuation}>
                <Plus className="h-4 w-4 mr-2" />
                Crear mi primera valoración
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredValuations.map((valuation) => (
            <Card key={valuation.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{valuation.company_name}</CardTitle>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{valuation.industry || 'Sin sector'}</span>
                      <span>•</span>
                      <span>
                        Creada: {new Date(valuation.created_at).toLocaleDateString('es-ES')}
                      </span>
                    </div>
                  </div>
                  <Badge className={getStatusColor(valuation.valuation_status)}>
                    {getStatusLabel(valuation.valuation_status)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Facturación</p>
                    <p className="font-semibold">{formatCurrency(valuation.revenue)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">EBITDA</p>
                    <p className="font-semibold">{formatCurrency(valuation.ebitda)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Valoración estimada</p>
                    <p className="font-semibold text-primary">{formatCurrency(valuation.final_valuation)}</p>
                  </div>
                </div>
                
                <div className="flex gap-2 flex-wrap">
                  {(valuation.valuation_status === 'started' || valuation.valuation_status === 'in_progress') && valuation.unique_token && (
                    <Button 
                      size="sm"
                      onClick={() => handleResumeValuation(valuation)}
                      className="bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Reanudar
                    </Button>
                  )}
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleViewValuation(valuation)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Ver detalle
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleDownloadPDF(valuation)}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    PDF
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleDuplicateValuation(valuation)}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Duplicar
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleDeleteValuation(valuation.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Eliminar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProfileValuations;