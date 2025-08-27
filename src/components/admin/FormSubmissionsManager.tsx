import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Mail, 
  Phone, 
  Building2, 
  Calendar, 
  User, 
  Filter,
  CheckCircle,
  Clock,
  AlertCircle,
  Eye,
  Edit3,
  TrendingUp
} from 'lucide-react';

interface FormSubmission {
  id: string;
  form_type: 'contact' | 'collaborator' | 'newsletter' | 'calendar';
  status: 'new' | 'contacted' | 'processed' | 'closed';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  full_name?: string;
  email: string;
  phone?: string;
  company?: string;
  form_data: any;
  created_at: string;
  notes?: string;
  processed_by?: string;
  processed_at?: string;
  email_sent: boolean;
  email_opened: boolean;
}

const FormSubmissionsManager = () => {
  const [selectedSubmission, setSelectedSubmission] = useState<FormSubmission | null>(null);
  const [filters, setFilters] = useState({
    form_type: '',
    status: '',
    priority: '',
    search: ''
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch form submissions with filters
  const { data: submissions, isLoading } = useQuery({
    queryKey: ['form-submissions', filters],
    queryFn: async () => {
      let query = supabase
        .from('form_submissions')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters.form_type) {
        query = query.eq('form_type', filters.form_type);
      }
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      if (filters.priority) {
        query = query.eq('priority', filters.priority);
      }
      if (filters.search) {
        query = query.or(`email.ilike.%${filters.search}%,full_name.ilike.%${filters.search}%,company.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as FormSubmission[];
    }
  });

  // Fetch statistics
  const { data: stats } = useQuery({
    queryKey: ['form-submissions-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('form_submissions')
        .select('form_type, status, priority, created_at')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      const today = new Date().toISOString().split('T')[0];
      const todaySubmissions = data.filter(s => s.created_at.startsWith(today));
      
      return {
        total: data.length,
        today: todaySubmissions.length,
        new: data.filter(s => s.status === 'new').length,
        processed: data.filter(s => s.status === 'processed').length,
        byType: {
          contact: data.filter(s => s.form_type === 'contact').length,
          collaborator: data.filter(s => s.form_type === 'collaborator').length,
          newsletter: data.filter(s => s.form_type === 'newsletter').length,
          calendar: data.filter(s => s.form_type === 'calendar').length,
        }
      };
    }
  });

  // Update submission mutation
  const updateSubmissionMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<FormSubmission> }) => {
      const { data, error } = await supabase
        .from('form_submissions')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['form-submissions'] });
      queryClient.invalidateQueries({ queryKey: ['form-submissions-stats'] });
      toast({
        title: "Actualizado",
        description: "El submission ha sido actualizado correctamente.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Error al actualizar el submission",
        variant: "destructive",
      });
    }
  });

  const getStatusBadge = (status: string) => {
    const variants = {
      new: 'bg-blue-100 text-blue-800',
      contacted: 'bg-yellow-100 text-yellow-800',
      processed: 'bg-green-100 text-green-800',
      closed: 'bg-gray-100 text-gray-800'
    };
    return <Badge className={variants[status as keyof typeof variants]}>{status}</Badge>;
  };

  const getPriorityBadge = (priority: string) => {
    const variants = {
      low: 'bg-gray-100 text-gray-800',
      normal: 'bg-blue-100 text-blue-800',
      high: 'bg-orange-100 text-orange-800',
      urgent: 'bg-red-100 text-red-800'
    };
    return <Badge className={variants[priority as keyof typeof variants]}>{priority}</Badge>;
  };

  const getFormTypeIcon = (type: string) => {
    switch (type) {
      case 'contact': return <Mail className="h-4 w-4" />;
      case 'collaborator': return <User className="h-4 w-4" />;
      case 'newsletter': return <Mail className="h-4 w-4" />;
      case 'calendar': return <Calendar className="h-4 w-4" />;
      default: return <Mail className="h-4 w-4" />;
    }
  };

  const handleUpdateStatus = (submission: FormSubmission, newStatus: string) => {
    updateSubmissionMutation.mutate({
      id: submission.id,
      updates: { 
        status: newStatus as any,
        processed_at: newStatus !== 'new' ? new Date().toISOString() : null
      }
    });
  };

  const handleUpdatePriority = (submission: FormSubmission, newPriority: string) => {
    updateSubmissionMutation.mutate({
      id: submission.id,
      updates: { priority: newPriority as any }
    });
  };

  const handleAddNotes = (submission: FormSubmission, notes: string) => {
    updateSubmissionMutation.mutate({
      id: submission.id,
      updates: { notes }
    });
  };

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{stats?.total || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-orange-600" />
              <div>
                <p className="text-sm text-muted-foreground">Hoy</p>
                <p className="text-2xl font-bold">{stats?.today || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <div>
                <p className="text-sm text-muted-foreground">Nuevos</p>
                <p className="text-2xl font-bold">{stats?.new || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Procesados</p>
                <p className="text-2xl font-bold">{stats?.processed || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Input
              placeholder="Buscar por email, nombre o empresa..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            />
            <Select value={filters.form_type} onValueChange={(value) => setFilters(prev => ({ ...prev, form_type: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Tipo de formulario" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos</SelectItem>
                <SelectItem value="contact">Contacto</SelectItem>
                <SelectItem value="collaborator">Colaborador</SelectItem>
                <SelectItem value="newsletter">Newsletter</SelectItem>
                <SelectItem value="calendar">Calendario</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos</SelectItem>
                <SelectItem value="new">Nuevo</SelectItem>
                <SelectItem value="contacted">Contactado</SelectItem>
                <SelectItem value="processed">Procesado</SelectItem>
                <SelectItem value="closed">Cerrado</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filters.priority} onValueChange={(value) => setFilters(prev => ({ ...prev, priority: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Prioridad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todas</SelectItem>
                <SelectItem value="low">Baja</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="high">Alta</SelectItem>
                <SelectItem value="urgent">Urgente</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={() => setFilters({ form_type: '', status: '', priority: '', search: '' })}
            >
              Limpiar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Submissions List */}
      <Card>
        <CardHeader>
          <CardTitle>Submissions de Formularios</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Cargando submissions...</div>
          ) : !submissions || submissions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No se encontraron submissions con los filtros actuales.
            </div>
          ) : (
            <div className="space-y-4">
              {submissions.map((submission) => (
                <div 
                  key={submission.id}
                  className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getFormTypeIcon(submission.form_type)}
                        <span className="font-medium">{submission.form_type}</span>
                        {getStatusBadge(submission.status)}
                        {getPriorityBadge(submission.priority)}
                        {submission.email_sent && (
                          <Badge variant="outline" className="text-green-600">
                            Email enviado
                          </Badge>
                        )}
                        {submission.email_opened && (
                          <Badge variant="outline" className="text-blue-600">
                            Email abierto
                          </Badge>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {submission.full_name || 'Sin nombre'}
                        </div>
                        <div className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {submission.email}
                        </div>
                        {submission.phone && (
                          <div className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {submission.phone}
                          </div>
                        )}
                        {submission.company && (
                          <div className="flex items-center gap-1">
                            <Building2 className="h-3 w-3" />
                            {submission.company}
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(submission.created_at).toLocaleDateString('es-ES')}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" onClick={() => setSelectedSubmission(submission)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Detalles del Submission</DialogTitle>
                          </DialogHeader>
                          {selectedSubmission && (
                            <div className="space-y-4">
                              <Tabs defaultValue="details">
                                <TabsList>
                                  <TabsTrigger value="details">Detalles</TabsTrigger>
                                  <TabsTrigger value="actions">Acciones</TabsTrigger>
                                </TabsList>
                                
                                <TabsContent value="details" className="space-y-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <label className="text-sm font-medium">Tipo</label>
                                      <p>{selectedSubmission.form_type}</p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium">Estado</label>
                                      <p>{getStatusBadge(selectedSubmission.status)}</p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium">Email</label>
                                      <p>{selectedSubmission.email}</p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium">Nombre</label>
                                      <p>{selectedSubmission.full_name || 'No especificado'}</p>
                                    </div>
                                  </div>
                                  
                                  <div>
                                    <label className="text-sm font-medium">Datos del formulario</label>
                                    <pre className="bg-muted p-2 rounded text-xs overflow-auto">
                                      {JSON.stringify(selectedSubmission.form_data, null, 2)}
                                    </pre>
                                  </div>
                                  
                                  {selectedSubmission.notes && (
                                    <div>
                                      <label className="text-sm font-medium">Notas</label>
                                      <p className="bg-muted p-2 rounded">{selectedSubmission.notes}</p>
                                    </div>
                                  )}
                                </TabsContent>
                                
                                <TabsContent value="actions" className="space-y-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <label className="text-sm font-medium">Estado</label>
                                      <Select 
                                        value={selectedSubmission.status}
                                        onValueChange={(value) => handleUpdateStatus(selectedSubmission, value)}
                                      >
                                        <SelectTrigger>
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="new">Nuevo</SelectItem>
                                          <SelectItem value="contacted">Contactado</SelectItem>
                                          <SelectItem value="processed">Procesado</SelectItem>
                                          <SelectItem value="closed">Cerrado</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    
                                    <div>
                                      <label className="text-sm font-medium">Prioridad</label>
                                      <Select 
                                        value={selectedSubmission.priority}
                                        onValueChange={(value) => handleUpdatePriority(selectedSubmission, value)}
                                      >
                                        <SelectTrigger>
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="low">Baja</SelectItem>
                                          <SelectItem value="normal">Normal</SelectItem>
                                          <SelectItem value="high">Alta</SelectItem>
                                          <SelectItem value="urgent">Urgente</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                  </div>
                                  
                                  <div>
                                    <label className="text-sm font-medium">Agregar notas</label>
                                    <Textarea 
                                      placeholder="Notas internas..."
                                      defaultValue={selectedSubmission.notes || ''}
                                      onBlur={(e) => {
                                        if (e.target.value !== (selectedSubmission.notes || '')) {
                                          handleAddNotes(selectedSubmission, e.target.value);
                                        }
                                      }}
                                    />
                                  </div>
                                </TabsContent>
                              </Tabs>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FormSubmissionsManager;