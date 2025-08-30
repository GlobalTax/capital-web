import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Users, 
  Calendar, 
  Clock,
  Star,
  Eye,
  Video,
  Download
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  useWebinarsAdmin, 
  useWebinarRegistrations, 
  useWebinarMutations,
  Webinar 
} from '@/hooks/useWebinars';

const CATEGORIES = [
  'Fundamentos M&A',
  'Sectores Específicos', 
  'Estrategia y Preparación',
  'Mercado y Tendencias'
];

const STATUSES = [
  { value: 'scheduled', label: 'Programado' },
  { value: 'completed', label: 'Completado' },
  { value: 'cancelled', label: 'Cancelado' }
];

export const WebinarManager = () => {
  const [selectedWebinar, setSelectedWebinar] = useState<Webinar | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const { webinars, isLoading } = useWebinarsAdmin();
  const { registrations } = useWebinarRegistrations();
  const { createWebinar, updateWebinar, deleteWebinar, isCreating, isUpdating, isDeleting } = useWebinarMutations();

  const handleEdit = (webinar: Webinar) => {
    setSelectedWebinar(webinar);
    setIsEditDialogOpen(true);
  };

  const handleDelete = async (webinarId: string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este webinar?')) {
      deleteWebinar(webinarId);
    }
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "d MMM yyyy, HH:mm", { locale: es });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      scheduled: "default",
      completed: "secondary", 
      cancelled: "destructive"
    };
    
    const labels: Record<string, string> = {
      scheduled: "Programado",
      completed: "Completado",
      cancelled: "Cancelado"
    };

    return (
      <Badge variant={variants[status] || "secondary"}>
        {labels[status] || status}
      </Badge>
    );
  };

  const getTotalRegistrations = (webinarId: string) => {
    return registrations?.filter(reg => reg.webinar_id === webinarId).length || 0;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestión de Webinars</h1>
          <p className="text-muted-foreground">
            Administra webinars, registros y contenido educativo
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Webinar
            </Button>
          </DialogTrigger>
          <WebinarForm 
            isOpen={isCreateDialogOpen}
            onClose={() => setIsCreateDialogOpen(false)}
            onSubmit={createWebinar}
            isSubmitting={isCreating}
          />
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Webinars</CardTitle>
            <Video className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{webinars?.length || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Registros</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{registrations?.length || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Asistentes Totales</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {webinars?.reduce((sum, w) => sum + w.attendee_count, 0) || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Promedio Asistencia</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {webinars?.length ? Math.round(webinars.reduce((sum, w) => sum + w.attendee_count, 0) / webinars.length) : 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="webinars" className="space-y-6">
        <TabsList>
          <TabsTrigger value="webinars">Webinars</TabsTrigger>
          <TabsTrigger value="registrations">Registros</TabsTrigger>
        </TabsList>

        <TabsContent value="webinars" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Lista de Webinars</CardTitle>
              <CardDescription>
                Gestiona el contenido y configuración de todos los webinars
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-4 text-muted-foreground">Cargando webinars...</p>
                </div>
              ) : !webinars?.length ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No hay webinars creados aún.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Título</TableHead>
                      <TableHead>Speaker</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Categoría</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Asistentes</TableHead>
                      <TableHead>Registros</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {webinars.map((webinar) => (
                      <TableRow key={webinar.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {webinar.is_featured && <Star className="h-4 w-4 text-yellow-500" />}
                            <span className="font-medium">{webinar.title}</span>
                          </div>
                        </TableCell>
                        <TableCell>{webinar.speaker_name}</TableCell>
                        <TableCell>{formatDate(webinar.webinar_date)}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{webinar.category}</Badge>
                        </TableCell>
                        <TableCell>{getStatusBadge(webinar.status)}</TableCell>
                        <TableCell>{webinar.attendee_count}</TableCell>
                        <TableCell>{getTotalRegistrations(webinar.id)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(webinar)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(webinar.id)}
                              disabled={isDeleting}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="registrations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Registros de Webinars</CardTitle>
              <CardDescription>
                Vista de todos los registros y seguimiento de asistencia
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!registrations?.length ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No hay registros aún.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Empresa</TableHead>
                      <TableHead>Webinar</TableHead>
                      <TableHead>Registro</TableHead>
                      <TableHead>Asistió</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {registrations.slice(0, 100).map((registration) => {
                      const webinar = webinars?.find(w => w.id === registration.webinar_id);
                      return (
                        <TableRow key={registration.id}>
                          <TableCell className="font-medium">{registration.full_name}</TableCell>
                          <TableCell>{registration.email}</TableCell>
                          <TableCell>{registration.company}</TableCell>
                          <TableCell>{webinar?.title || 'N/A'}</TableCell>
                          <TableCell>{formatDate(registration.created_at)}</TableCell>
                          <TableCell>
                            <Badge variant={registration.attended ? "default" : "secondary"}>
                              {registration.attended ? "Sí" : "No"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <WebinarForm 
          isOpen={isEditDialogOpen}
          onClose={() => {
            setIsEditDialogOpen(false);
            setSelectedWebinar(null);
          }}
          onSubmit={(data) => updateWebinar({ id: selectedWebinar!.id, ...data })}
          isSubmitting={isUpdating}
          initialData={selectedWebinar}
        />
      </Dialog>
    </div>
  );
};

// Webinar Form Component
interface WebinarFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  isSubmitting: boolean;
  initialData?: Webinar | null;
}

const WebinarForm: React.FC<WebinarFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
  initialData
}) => {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    short_description: initialData?.short_description || '',
    speaker_name: initialData?.speaker_name || '',
    speaker_title: initialData?.speaker_title || '',
    speaker_company: initialData?.speaker_company || '',
    webinar_date: initialData?.webinar_date ? new Date(initialData.webinar_date).toISOString().slice(0, 16) : '',
    duration_minutes: initialData?.duration_minutes || 60,
    status: initialData?.status || 'scheduled',
    category: initialData?.category || '',
    sector: initialData?.sector || '',
    attendee_count: initialData?.attendee_count || 0,
    is_featured: initialData?.is_featured || false,
    is_active: initialData?.is_active !== false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      webinar_date: new Date(formData.webinar_date).toISOString(),
    });
    onClose();
  };

  return (
    <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>
          {initialData ? 'Editar Webinar' : 'Crear Nuevo Webinar'}
        </DialogTitle>
        <DialogDescription>
          {initialData ? 'Modifica la información del webinar' : 'Completa los datos para crear un nuevo webinar'}
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 gap-4">
          <div>
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="short_description">Descripción corta</Label>
            <Textarea
              id="short_description"
              value={formData.short_description}
              onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
              rows={2}
            />
          </div>

          <div>
            <Label htmlFor="description">Descripción completa *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="speaker_name">Speaker *</Label>
            <Input
              id="speaker_name"
              value={formData.speaker_name}
              onChange={(e) => setFormData({ ...formData, speaker_name: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="speaker_title">Cargo del Speaker *</Label>
            <Input
              id="speaker_title"
              value={formData.speaker_title}
              onChange={(e) => setFormData({ ...formData, speaker_title: e.target.value })}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="speaker_company">Empresa del Speaker</Label>
            <Input
              id="speaker_company"
              value={formData.speaker_company}
              onChange={(e) => setFormData({ ...formData, speaker_company: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="webinar_date">Fecha y Hora *</Label>
            <Input
              id="webinar_date"
              type="datetime-local"
              value={formData.webinar_date}
              onChange={(e) => setFormData({ ...formData, webinar_date: e.target.value })}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="duration_minutes">Duración (min)</Label>
            <Input
              id="duration_minutes"
              type="number"
              value={formData.duration_minutes}
              onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) || 60 })}
            />
          </div>

          <div>
            <Label htmlFor="category">Categoría *</Label>
            <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="status">Estado</Label>
            <Select value={formData.status} onValueChange={(value: 'scheduled' | 'completed' | 'cancelled') => setFormData({ ...formData, status: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUSES.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="sector">Sector</Label>
            <Input
              id="sector"
              value={formData.sector}
              onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="attendee_count">Número de Asistentes</Label>
            <Input
              id="attendee_count"
              type="number"
              value={formData.attendee_count}
              onChange={(e) => setFormData({ ...formData, attendee_count: parseInt(e.target.value) || 0 })}
            />
          </div>
        </div>

        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <Switch
              id="is_featured"
              checked={formData.is_featured}
              onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked })}
            />
            <Label htmlFor="is_featured">Destacado</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
            />
            <Label htmlFor="is_active">Activo</Label>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Guardando...' : (initialData ? 'Actualizar' : 'Crear')}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
};