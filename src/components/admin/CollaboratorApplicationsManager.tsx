
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, Mail, Phone, Building, User } from 'lucide-react';

interface CollaboratorApplication {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  company?: string;
  profession: string;
  experience?: string;
  motivation?: string;
  status: string;
  created_at: string;
}

const CollaboratorApplicationsManager = () => {
  const [applications, setApplications] = useState<CollaboratorApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState<CollaboratorApplication | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const { data, error } = await supabase
        .from('collaborator_applications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setApplications(data || []);
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las solicitudes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateApplicationStatus = async (applicationId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('collaborator_applications')
        .update({ status: newStatus })
        .eq('id', applicationId);

      if (error) throw error;
      
      setApplications(applications.map(app => 
        app.id === applicationId ? { ...app, status: newStatus } : app
      ));
      
      toast({
        title: "Estado actualizado",
        description: "El estado de la solicitud ha sido actualizado",
      });
    } catch (error) {
      console.error('Error updating application status:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      pending: { label: 'Pendiente', variant: 'default' as const },
      reviewing: { label: 'En Revisión', variant: 'secondary' as const },
      approved: { label: 'Aprobado', variant: 'default' as const },
      rejected: { label: 'Rechazado', variant: 'destructive' as const },
    };
    
    const statusInfo = statusMap[status as keyof typeof statusMap] || statusMap.pending;
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Solicitudes de Colaboradores</h1>
          <p className="text-gray-600">Gestiona las solicitudes del programa de colaboradores</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Solicitudes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{applications.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {applications.filter(a => a.status === 'pending').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">En Revisión</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {applications.filter(a => a.status === 'reviewing').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Aprobados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {applications.filter(a => a.status === 'approved').length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Solicitudes del Programa de Colaboradores</CardTitle>
          <CardDescription>
            Lista de todas las solicitudes para el programa de colaboradores
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Profesión</TableHead>
                  <TableHead>Empresa</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {applications.map((application) => (
                  <TableRow key={application.id}>
                    <TableCell className="font-medium">{application.full_name}</TableCell>
                    <TableCell>{application.email}</TableCell>
                    <TableCell>{application.profession}</TableCell>
                    <TableCell>{application.company || '-'}</TableCell>
                    <TableCell>{getStatusBadge(application.status)}</TableCell>
                    <TableCell>
                      {new Date(application.created_at).toLocaleDateString('es-ES')}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedApplication(application)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Select
                          value={application.status}
                          onValueChange={(value) => updateApplicationStatus(application.id, value)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pendiente</SelectItem>
                            <SelectItem value="reviewing">En Revisión</SelectItem>
                            <SelectItem value="approved">Aprobado</SelectItem>
                            <SelectItem value="rejected">Rechazado</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {selectedApplication && (
        <Card>
          <CardHeader>
            <CardTitle>Detalles de la Solicitud</CardTitle>
            <CardDescription>Información completa del candidato</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-gray-500" />
                <span className="font-medium">Nombre:</span>
                <span>{selectedApplication.full_name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-gray-500" />
                <span className="font-medium">Email:</span>
                <span>{selectedApplication.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-gray-500" />
                <span className="font-medium">Teléfono:</span>
                <span>{selectedApplication.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Building className="h-4 w-4 text-gray-500" />
                <span className="font-medium">Profesión:</span>
                <span>{selectedApplication.profession}</span>
              </div>
              {selectedApplication.company && (
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">Empresa:</span>
                  <span>{selectedApplication.company}</span>
                </div>
              )}
            </div>
            
            {selectedApplication.experience && (
              <div>
                <span className="font-medium">Experiencia:</span>
                <p className="mt-1 text-gray-600">{selectedApplication.experience}</p>
              </div>
            )}
            
            {selectedApplication.motivation && (
              <div>
                <span className="font-medium">Motivación:</span>
                <p className="mt-1 text-gray-600">{selectedApplication.motivation}</p>
              </div>
            )}
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => setSelectedApplication(null)}
              >
                Cerrar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CollaboratorApplicationsManager;
