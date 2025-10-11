import React, { useState } from 'react';
import { Download, Star, ExternalLink, Mail, Phone, Linkedin, Calendar, FileText, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useJobApplications } from '@/hooks/useJobApplications';
import { useJobPosts } from '@/hooks/useJobPosts';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import type { JobApplication, ApplicationStatus } from '@/types/jobs';

export const JobApplicationsManager = () => {
  const { toast } = useToast();
  const [jobFilter, setJobFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedApplication, setSelectedApplication] = useState<JobApplication | null>(null);
  const [notes, setNotes] = useState('');

  const { applications, isLoading, updateApplicationStatus, rateApplication } = useJobApplications(
    jobFilter !== 'all' ? jobFilter : undefined
  );

  const { jobPosts } = useJobPosts({});

  const filteredApplications = applications?.filter((app) => {
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    const matchesSearch =
      app.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const stats = {
    total: applications?.length || 0,
    new: applications?.filter((a) => a.status === 'new').length || 0,
    reviewing: applications?.filter((a) => a.status === 'reviewing').length || 0,
    interview: applications?.filter((a) => a.status === 'interview').length || 0,
    accepted: applications?.filter((a) => a.status === 'accepted').length || 0,
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
      new: 'default',
      reviewing: 'secondary',
      interview: 'outline',
      accepted: 'default',
      rejected: 'destructive',
    };
    return variants[status] || 'outline';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      new: 'Nueva',
      reviewing: 'En revisión',
      interview: 'Entrevista',
      accepted: 'Aceptada',
      rejected: 'Rechazada',
    };
    return labels[status] || status;
  };

  const handleStatusChange = async (applicationId: string, newStatus: ApplicationStatus) => {
    await updateApplicationStatus({
      id: applicationId,
      status: newStatus,
      notes: notes || undefined,
    });
    setNotes('');
  };

  const handleRating = async (applicationId: string, rating: number) => {
    await rateApplication({ id: applicationId, rating });
  };

  const downloadCV = async (cvUrl: string, candidateName: string) => {
    try {
      const cvPath = cvUrl.replace('/storage/v1/object/public/job-applications/', '');
      const { data, error } = await supabase.storage
        .from('job-applications')
        .download(cvPath);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `CV_${candidateName.replace(/\s+/g, '_')}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "CV descargado",
        description: `CV de ${candidateName} descargado correctamente`,
      });
    } catch (error) {
      console.error('Error downloading CV:', error);
      toast({
        title: "Error",
        description: "No se pudo descargar el CV",
        variant: "destructive",
      });
    }
  };

  const viewCV = async (cvUrl: string) => {
    try {
      const cvPath = cvUrl.replace('/storage/v1/object/public/job-applications/', '');
      const { data, error } = await supabase.storage
        .from('job-applications')
        .createSignedUrl(cvPath, 3600);

      if (error) throw error;

      window.open(data.signedUrl, '_blank');
    } catch (error) {
      console.error('Error viewing CV:', error);
      toast({
        title: "Error",
        description: "No se pudo abrir el CV",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return <div className="p-8">Cargando aplicaciones...</div>;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Aplicaciones de Empleo</h1>
          <p className="text-muted-foreground">Gestiona las candidaturas recibidas</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-5 gap-4">
        <Card className="p-4">
          <div className="text-2xl font-bold">{stats.total}</div>
          <div className="text-sm text-muted-foreground">Total</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold">{stats.new}</div>
          <div className="text-sm text-muted-foreground">Nuevas</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold">{stats.reviewing}</div>
          <div className="text-sm text-muted-foreground">En revisión</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold">{stats.interview}</div>
          <div className="text-sm text-muted-foreground">Entrevistas</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold">{stats.accepted}</div>
          <div className="text-sm text-muted-foreground">Aceptadas</div>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <Input
          placeholder="Buscar por nombre o email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
        <Select value={jobFilter} onValueChange={setJobFilter}>
          <SelectTrigger className="w-[250px]">
            <SelectValue placeholder="Filtrar por oferta" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las ofertas</SelectItem>
            {jobPosts?.map((job) => (
              <SelectItem key={job.id} value={job.id}>
                {job.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="new">Nuevas</SelectItem>
            <SelectItem value="reviewing">En revisión</SelectItem>
            <SelectItem value="interview">Entrevistas</SelectItem>
            <SelectItem value="accepted">Aceptadas</SelectItem>
            <SelectItem value="rejected">Rechazadas</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Applications List */}
      <div className="grid gap-4">
        {filteredApplications?.map((application) => (
          <Card key={application.id} className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-3">
                  <h3 className="text-xl font-semibold">{application.full_name}</h3>
                  <Badge variant={getStatusBadge(application.status)}>
                    {getStatusLabel(application.status)}
                  </Badge>
                  {application.job_post && (
                    <Badge variant="outline">{application.job_post.title}</Badge>
                  )}
                </div>

                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Mail className="h-4 w-4" />
                    {application.email}
                  </div>
                  {application.phone && (
                    <div className="flex items-center gap-1">
                      <Phone className="h-4 w-4" />
                      {application.phone}
                    </div>
                  )}
                  {application.linkedin_url && (
                    <a
                      href={application.linkedin_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 hover:text-primary"
                    >
                      <Linkedin className="h-4 w-4" />
                      LinkedIn
                    </a>
                  )}
                  {application.cv_url && (
                    <Badge variant="success" className="flex items-center gap-1 w-fit">
                      <FileText className="h-3 w-3" />
                      CV adjunto
                    </Badge>
                  )}
                </div>

                {application.current_position && (
                  <div className="text-sm">
                    <strong>Posición actual:</strong> {application.current_position}
                    {application.current_company && ` en ${application.current_company}`}
                  </div>
                )}

                {application.years_of_experience && (
                  <div className="text-sm">
                    <strong>Experiencia:</strong> {application.years_of_experience} años
                  </div>
                )}

                {/* Rating */}
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => handleRating(application.id, star)}
                      className="focus:outline-none"
                    >
                      <Star
                        className={`h-5 w-5 ${
                          application.rating && star <= application.rating
                            ? 'fill-yellow-500 text-yellow-500'
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>

                <div className="text-sm text-muted-foreground">
                  Aplicó {formatDistanceToNow(new Date(application.created_at), {
                    addSuffix: true,
                    locale: es,
                  })}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                {application.cv_url && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => viewCV(application.cv_url!)}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      Ver CV
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadCV(application.cv_url!, application.full_name)}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Descargar CV
                    </Button>
                  </>
                )}

                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" onClick={() => setSelectedApplication(application)}>
                      Ver Detalles
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Detalles de la Aplicación</DialogTitle>
                      <DialogDescription>
                        {application.full_name} - {application.email}
                      </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                      {application.cover_letter && (
                        <div>
                          <Label>Carta de presentación</Label>
                          <div className="mt-2 p-4 bg-muted rounded-md whitespace-pre-wrap">
                            {application.cover_letter}
                          </div>
                        </div>
                      )}

                      <div>
                        <Label>Cambiar estado</Label>
                        <Select
                          value={application.status}
                          onValueChange={(value) => handleStatusChange(application.id, value as ApplicationStatus)}
                        >
                          <SelectTrigger className="mt-2">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="new">Nueva</SelectItem>
                            <SelectItem value="reviewing">En revisión</SelectItem>
                            <SelectItem value="interview">Entrevista</SelectItem>
                            <SelectItem value="accepted">Aceptada</SelectItem>
                            <SelectItem value="rejected">Rechazada</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Notas internas</Label>
                        <Textarea
                          value={notes || application.notes || ''}
                          onChange={(e) => setNotes(e.target.value)}
                          placeholder="Añadir notas sobre el candidato..."
                          className="mt-2"
                          rows={4}
                        />
                      </div>

                      {application.expected_salary_min && application.expected_salary_max && (
                        <div>
                          <Label>Expectativas salariales</Label>
                          <div className="mt-2 text-sm">
                            €{application.expected_salary_min.toLocaleString()} - €
                            {application.expected_salary_max.toLocaleString()}
                          </div>
                        </div>
                      )}

                      {application.availability && (
                        <div>
                          <Label>Disponibilidad</Label>
                          <div className="mt-2 text-sm">{application.availability}</div>
                        </div>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>

                <Select
                  value={application.status}
                  onValueChange={(value) => handleStatusChange(application.id, value as ApplicationStatus)}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">Nueva</SelectItem>
                    <SelectItem value="reviewing">En revisión</SelectItem>
                    <SelectItem value="interview">Entrevista</SelectItem>
                    <SelectItem value="accepted">Aceptada</SelectItem>
                    <SelectItem value="rejected">Rechazada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredApplications?.length === 0 && (
        <div className="text-center py-12">
          <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No hay aplicaciones</h3>
          <p className="text-muted-foreground">
            No se encontraron aplicaciones con los filtros seleccionados
          </p>
        </div>
      )}
    </div>
  );
};