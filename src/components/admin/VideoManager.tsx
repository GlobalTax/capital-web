import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Upload, Play, Trash2, Edit, Eye, EyeOff } from 'lucide-react';
import { useVideoUpload } from '@/hooks/useVideoUpload';
import { useAdminVideos, AdminVideo } from '@/hooks/useAdminVideos';
import { useToast } from '@/hooks/use-toast';
import { devLogger } from '@/utils/devLogger';
import { VideoErrorBoundary } from './VideoErrorBoundary';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const VideoManager = () => {
  const { uploadVideo, deleteVideo, updateVideo, isUploading } = useVideoUpload();
  const { videos, isLoading } = useAdminVideos();
  const { toast } = useToast();

  // Log component initialization with proper async handling
  React.useEffect(() => {
    // Use requestAnimationFrame to avoid setState during render warnings
    requestAnimationFrame(() => {
      devLogger.info('VideoManager initialized', { videoCount: videos?.length }, 'component');
    });
  }, [videos?.length]);

  const [uploadData, setUploadData] = useState({
    title: '',
    description: '',
    category: 'general',
    file: null as File | null
  });

  const [editingVideo, setEditingVideo] = useState<AdminVideo | null>(null);

  const categories = [
    { value: 'general', label: 'General' },
    { value: 'company-story', label: 'Historia de la Empresa' },
    { value: 'testimonials', label: 'Testimonios' },
    { value: 'services', label: 'Servicios' },
    { value: 'tutorials', label: 'Tutoriales' }
  ];

  const displayLocations = [
    { value: 'home', label: 'Página Principal' },
    { value: 'about', label: 'Sobre Nosotros' },
    { value: 'services', label: 'Servicios' },
    { value: 'company-story', label: 'Historia de la Empresa' }
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadData(prev => ({ ...prev, file }));
    }
  };

  const handleUpload = async () => {
    if (!uploadData.file || !uploadData.title) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos requeridos.",
        variant: "destructive",
      });
      return;
    }

    const result = await uploadVideo(
      uploadData.file,
      uploadData.title,
      uploadData.description,
      uploadData.category
    );

    if (result) {
      setUploadData({
        title: '',
        description: '',
        category: 'general',
        file: null
      });
      // Reset file input
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    }
  };

  const handleDelete = async (videoId: string) => {
    await deleteVideo(videoId);
  };

  const handleToggleActive = async (video: AdminVideo) => {
    await updateVideo(video.id, { is_active: !video.is_active });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (isLoading) {
    return <div className="p-6">Cargando videos...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Subir Nuevo Video
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título *</Label>
              <Input
                id="title"
                value={uploadData.title}
                onChange={(e) => setUploadData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Título del video"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Categoría</Label>
              <Select
                value={uploadData.category}
                onValueChange={(value) => setUploadData(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar categoría" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={uploadData.description}
              onChange={(e) => setUploadData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Descripción del video (opcional)"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="video-file">Archivo de Video *</Label>
            <Input
              id="video-file"
              type="file"
              accept="video/mp4,video/webm,video/mov,video/quicktime"
              onChange={handleFileChange}
              className="cursor-pointer"
            />
            <p className="text-sm text-muted-foreground">
              Formatos soportados: MP4, WebM, MOV. Tamaño máximo: 50MB
            </p>
          </div>

          <Button 
            onClick={handleUpload} 
            disabled={isUploading || !uploadData.file || !uploadData.title}
            className="w-full"
          >
            {isUploading ? 'Subiendo...' : 'Subir Video'}
          </Button>
        </CardContent>
      </Card>

      {/* Videos List */}
      <Card>
        <CardHeader>
          <CardTitle>Videos Disponibles ({videos?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {videos?.map((video) => (
              <div key={video.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold">{video.title}</h3>
                      <Badge variant={video.is_active ? "default" : "secondary"}>
                        {video.is_active ? 'Activo' : 'Inactivo'}
                      </Badge>
                      <Badge variant="outline">{video.category}</Badge>
                    </div>
                    {video.description && (
                      <p className="text-sm text-muted-foreground mb-2">{video.description}</p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>{video.file_size_bytes ? formatFileSize(video.file_size_bytes) : 'N/A'}</span>
                      <span>{video.view_count} visualizaciones</span>
                      <span>Creado: {new Date(video.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Play className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl">
                        <DialogHeader>
                          <DialogTitle>{video.title}</DialogTitle>
                          <DialogDescription>{video.description}</DialogDescription>
                        </DialogHeader>
                        <VideoErrorBoundary>
                          <div className="aspect-video">
                            <video 
                              src={video.file_url} 
                              controls 
                              className="w-full h-full rounded-lg"
                              preload="metadata"
                              onError={(e) => {
                                console.error('Error loading video:', video.file_url);
                                devLogger.error('Video load error', { videoId: video.id, url: video.file_url });
                              }}
                            >
                              <p className="text-muted-foreground p-4">
                                Error cargando el video. 
                                <a 
                                  href={video.file_url} 
                                  className="text-primary underline ml-1"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  Abrir directamente
                                </a>
                              </p>
                            </video>
                          </div>
                        </VideoErrorBoundary>
                      </DialogContent>
                    </Dialog>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleActive(video)}
                    >
                      {video.is_active ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>¿Eliminar video?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta acción no se puede deshacer. El video será eliminado permanentemente.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(video.id)}>
                            Eliminar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </div>
            ))}
            
            {videos?.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No hay videos disponibles. Sube tu primer video usando el formulario de arriba.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VideoManager;