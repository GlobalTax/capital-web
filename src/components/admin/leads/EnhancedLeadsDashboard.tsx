import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Target, 
  Users, 
  TrendingUp, 
  AlertTriangle, 
  RefreshCw,
  Search,
  Filter,
  Calendar,
  Eye
} from 'lucide-react';
import { useAdvancedLeadScoring } from '@/hooks/useAdvancedLeadScoring';
import { useLeadActivity } from '@/hooks/useLeadActivity';
import { supabase } from '@/integrations/supabase/client';
import LeadActivityTimeline from './LeadActivityTimeline';

interface DashboardLead {
  id: string;
  visitor_id: string;
  company_name?: string;
  company_domain?: string;
  contact_name?: string;
  email?: string;
  total_score: number;
  last_activity: string;
  first_visit: string;
  visit_count: number;
  lead_status: string;
  is_hot_lead: boolean;
  industry?: string;
  location?: string;
}

const EnhancedLeadsDashboard = () => {
  const [leads, setLeads] = useState<DashboardLead[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<DashboardLead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  const { getLeadStats } = useAdvancedLeadScoring();
  const { 
    activities, 
    fetchRecentActivity, 
    isLoading: isLoadingActivity 
  } = useLeadActivity();

  // Cargar leads desde la base de datos
  const fetchLeads = async () => {
    try {
      setIsLoading(true);
      
      const { data: leadsData, error } = await supabase
        .from('lead_scores')
        .select('*')
        .order('total_score', { ascending: false })
        .limit(100);

      if (error) throw error;

      setLeads(leadsData || []);
      setFilteredLeads(leadsData || []);
      
      // También cargar actividad reciente
      fetchRecentActivity(50);
      
    } catch (error) {
      console.error('Error fetching leads:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Filtrar leads
  useEffect(() => {
    let filtered = leads;

    // Filtro por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(lead => 
        lead.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.contact_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.company_domain?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtro por estado
    if (statusFilter !== 'all') {
      filtered = filtered.filter(lead => {
        switch (statusFilter) {
          case 'hot':
            return lead.is_hot_lead || lead.total_score >= 70;
          case 'warm':
            return lead.total_score >= 40 && lead.total_score < 70;
          case 'cold':
            return lead.total_score < 40;
          case 'active':
            return lead.lead_status === 'active';
          default:
            return true;
        }
      });
    }

    setFilteredLeads(filtered);
  }, [leads, searchTerm, statusFilter]);

  // Cargar datos al montar
  useEffect(() => {
    fetchLeads();
  }, []);

  const stats = getLeadStats();
  const hotLeads = leads.filter(l => l.is_hot_lead || l.total_score >= 70);
  const recentLeads = leads.filter(l => {
    const lastActivity = new Date(l.last_activity);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return lastActivity >= yesterday;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Hace menos de 1h';
    } else if (diffInHours < 24) {
      return `Hace ${diffInHours}h`;
    } else {
      return date.toLocaleDateString('es-ES');
    }
  };

  const getScoreBadge = (score: number, isHot: boolean) => {
    if (isHot) return <Badge className="bg-red-500 animate-pulse">🔥 {score}</Badge>;
    if (score >= 70) return <Badge variant="destructive">{score}</Badge>;
    if (score >= 40) return <Badge variant="default">{score}</Badge>;
    return <Badge variant="secondary">{score}</Badge>;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p>Cargando dashboard de leads...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">🎯 Dashboard de Leads</h1>
          <p className="text-muted-foreground">Visualización completa de datos de leads</p>
        </div>
        <Button onClick={fetchLeads} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Actualizar
        </Button>
      </div>

      {/* KPIs Mejorados */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-red-200 bg-red-50/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600">Leads Calientes</p>
                <p className="text-3xl font-bold text-red-700">{hotLeads.length}</p>
                <p className="text-xs text-red-500">Score ≥ 70</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Leads</p>
                <p className="text-3xl font-bold">{leads.length}</p>
                <p className="text-xs text-muted-foreground">En seguimiento</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Activos Hoy</p>
                <p className="text-3xl font-bold text-green-600">{recentLeads.length}</p>
                <p className="text-xs text-muted-foreground">Últimas 24h</p>
              </div>
              <Calendar className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Score Promedio</p>
                <p className="text-3xl font-bold text-orange-600">
                  {leads.length > 0 ? Math.round(leads.reduce((sum, l) => sum + l.total_score, 0) / leads.length) : 0}
                </p>
                <p className="text-xs text-muted-foreground">Calidad general</p>
              </div>
              <Target className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por empresa, contacto, email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select 
              className="px-3 py-2 border rounded-md"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Todos los leads</option>
              <option value="hot">Leads calientes</option>
              <option value="warm">Leads tibios</option>
              <option value="cold">Leads fríos</option>
              <option value="active">Activos</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Layout principal */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lista de leads */}
        <Card>
          <CardHeader>
            <CardTitle>
              Leads ({filteredLeads.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {filteredLeads.map((lead) => (
                <div key={lead.id} className="p-4 border rounded-lg hover:bg-muted/50 cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-sm">
                          {lead.company_name || lead.company_domain || 'Empresa desconocida'}
                        </h4>
                        {getScoreBadge(lead.total_score, lead.is_hot_lead)}
                      </div>
                      <div className="text-xs text-muted-foreground space-y-1">
                        {lead.contact_name && <div>👤 {lead.contact_name}</div>}
                        {lead.email && <div>📧 {lead.email}</div>}
                        {lead.location && <div>📍 {lead.location}</div>}
                        <div>🕐 {formatDate(lead.last_activity)} • {lead.visit_count} visitas</div>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Timeline de actividad */}
        <LeadActivityTimeline 
          activities={activities}
          isLoading={isLoadingActivity}
          onRefresh={() => fetchRecentActivity(50)}
          showVisitorInfo={true}
        />
      </div>
    </div>
  );
};

export default EnhancedLeadsDashboard;