import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, Plus, Search, Filter, SortDesc } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ValuationCard from '@/components/my-valuations/ValuationCard';
import ValuationFilters from '@/components/my-valuations/ValuationFilters';
import { CompanyValuation } from '@/core/types';

const MyValuations: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [valuations, setValuations] = useState<CompanyValuation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchValuations();
  }, [user, navigate, statusFilter, sortBy, sortOrder]);

  const fetchValuations = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('company_valuations')
        .select('*')
        .eq('user_id', user!.id);

      // Apply status filter
      if (statusFilter !== 'all') {
        query = query.eq('valuation_status', statusFilter);
      }

      // Apply sorting
      query = query.order(sortBy, { ascending: sortOrder === 'asc' });

      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching valuations:', error);
        toast.error('Error al cargar las valoraciones');
        return;
      }

      setValuations((data || []) as CompanyValuation[]);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al cargar las valoraciones');
    } finally {
      setLoading(false);
    }
  };

  const handleDuplicate = async (valuation: CompanyValuation) => {
    try {
      const { user_id, id, created_at, updated_at, unique_token, 
             final_valuation, valuation_status, current_step, 
             completion_percentage, time_spent_seconds, last_activity_at,
             email_sent, hubspot_sent, whatsapp_sent, v4_link_sent,
             recovery_link_sent, abandonment_detected_at, immediate_alert_sent,
             email_opened, form_submitted_at, email_sent_at, hubspot_sent_at,
             whatsapp_sent_at, v4_link_sent_at, recovery_link_sent_at,
             immediate_alert_sent_at, email_opened_at, v4_accessed_at,
             email_message_id, ...cleanData } = valuation;

      const duplicatedData = {
        ...cleanData,
        user_id: user!.id,
        company_name: `${cleanData.company_name} (Copia)`,
        valuation_status: 'started',
        current_step: 1,
        completion_percentage: 0,
        time_spent_seconds: 0,
        final_valuation: null,
        ebitda_multiple_used: null,
        valuation_range_min: null,
        valuation_range_max: null,
        email_sent: false,
        hubspot_sent: false,
        whatsapp_sent: false,
        v4_link_sent: false,
        recovery_link_sent: false,
        immediate_alert_sent: false,
        email_opened: false,
        v4_accessed: false
      };

      const { data: newValuation, error } = await supabase
        .from('company_valuations')
        .insert(duplicatedData)
        .select()
        .single();

      if (error) throw error;

      toast.success('Valoración duplicada exitosamente');
      navigate(`/calculadora-valoracion/${newValuation.unique_token}`);
    } catch (error) {
      console.error('Error duplicating valuation:', error);
      toast.error('Error al duplicar la valoración');
    }
  };

  const handleResume = (valuation: CompanyValuation) => {
    if (valuation.unique_token) {
      navigate(`/calculadora-valoracion/${valuation.unique_token}`);
    } else {
      toast.error('No se puede reanudar esta valoración');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta valoración?')) return;

    try {
      const { error } = await supabase
        .from('company_valuations')
        .delete()
        .eq('id', id)
        .eq('user_id', user!.id);

      if (error) throw error;

      toast.success('Valoración eliminada');
      fetchValuations();
    } catch (error) {
      console.error('Error deleting valuation:', error);
      toast.error('Error al eliminar la valoración');
    }
  };

  const filteredValuations = valuations.filter(valuation =>
    valuation.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    valuation.contact_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600';
      case 'in_progress': return 'text-blue-600';
      case 'abandoned': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed': return 'Completada';
      case 'in_progress': return 'En progreso';
      case 'abandoned': return 'Abandonada';
      case 'started': return 'Iniciada';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Cargando valoraciones...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Mis Valoraciones</h1>
              <p className="text-muted-foreground mt-2">
                Gestiona todas tus valoraciones de empresa en un solo lugar
              </p>
            </div>
            <Button onClick={() => navigate('/calculadora-valoracion')} className="gap-2">
              <Plus className="w-4 h-4" />
              Nueva Valoración
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-card p-4 rounded-lg border">
              <div className="text-2xl font-bold text-foreground">{valuations.length}</div>
              <div className="text-sm text-muted-foreground">Total valoraciones</div>
            </div>
            <div className="bg-card p-4 rounded-lg border">
              <div className="text-2xl font-bold text-green-600">
                {valuations.filter(v => v.valuation_status === 'completed').length}
              </div>
              <div className="text-sm text-muted-foreground">Completadas</div>
            </div>
            <div className="bg-card p-4 rounded-lg border">
              <div className="text-2xl font-bold text-blue-600">
                {valuations.filter(v => v.valuation_status === 'in_progress').length}
              </div>
              <div className="text-sm text-muted-foreground">En progreso</div>
            </div>
            <div className="bg-card p-4 rounded-lg border">
              <div className="text-2xl font-bold text-primary">
                {valuations.filter(v => v.final_valuation).reduce((sum, v) => sum + (v.final_valuation || 0), 0).toLocaleString('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })}
              </div>
              <div className="text-sm text-muted-foreground">Valor total</div>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Buscar por empresa o contacto..."
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
                <SelectItem value="started">Iniciadas</SelectItem>
                <SelectItem value="abandoned">Abandonadas</SelectItem>
              </SelectContent>
            </Select>

            <Select value={`${sortBy}-${sortOrder}`} onValueChange={(value) => {
              const [field, order] = value.split('-');
              setSortBy(field);
              setSortOrder(order as 'asc' | 'desc');
            }}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="created_at-desc">Más reciente</SelectItem>
                <SelectItem value="created_at-asc">Más antiguo</SelectItem>
                <SelectItem value="company_name-asc">Empresa A-Z</SelectItem>
                <SelectItem value="company_name-desc">Empresa Z-A</SelectItem>
                <SelectItem value="final_valuation-desc">Mayor valor</SelectItem>
                <SelectItem value="final_valuation-asc">Menor valor</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Valuations List */}
        {filteredValuations.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Filter className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">
              {searchTerm || statusFilter !== 'all' ? 'No se encontraron valoraciones' : 'Aún no tienes valoraciones'}
            </h3>
            <p className="text-muted-foreground mb-6">
              {searchTerm || statusFilter !== 'all' 
                ? 'Intenta ajustar los filtros de búsqueda'
                : 'Comienza creando tu primera valoración de empresa'
              }
            </p>
            {(!searchTerm && statusFilter === 'all') && (
              <Button onClick={() => navigate('/calculadora-valoracion')} className="gap-2">
                <Plus className="w-4 h-4" />
                Crear Primera Valoración
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredValuations.map((valuation) => (
              <ValuationCard
                key={valuation.id}
                valuation={valuation}
                onResume={handleResume}
                onDuplicate={handleDuplicate}
                onDelete={handleDelete}
                getStatusColor={getStatusColor}
                getStatusLabel={getStatusLabel}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyValuations;