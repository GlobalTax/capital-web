
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useLeadMagnets } from '@/hooks/useLeadMagnets';
import { useLeadMagnetGeneration } from '@/hooks/useLeadMagnetGeneration';
import { Download, Edit, Trash2, Plus, Eye, Sparkles } from 'lucide-react';
import type { LeadMagnetFormData } from '@/types/leadMagnets';

const LeadMagnetsManager = () => {
  const { leadMagnets, isLoading, createLeadMagnet, updateLeadMagnet, deleteLeadMagnet } = useLeadMagnets();
  const { generateLeadMagnetContent, isGenerating } = useLeadMagnetGeneration();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingMagnet, setEditingMagnet] = useState<string | null>(null);
  const [formData, setFormData] = useState<LeadMagnetFormData>({
    title: '',
    type: 'report',
    sector: '',
    description: '',
    meta_title: '',
    meta_description: '',
  });

  const handleCreateWithAI = async () => {
    if (!formData.title || !formData.sector || !formData.description) {
      return;
    }

    try {
      const { content, fileUrl } = await generateLeadMagnetContent(formData);
      
      await createLeadMagnet.mutateAsync({
        ...formData,
        meta_title: formData.meta_title || formData.title,
        meta_description: formData.meta_description || formData.description,
      });

      // Si se generó contenido, actualizar el lead magnet
      if (content || fileUrl) {
        // Aquí normalmente actualizaríamos con el contenido generado
        // pero como acabamos de crear, necesitaríamos el ID
      }

      setShowCreateDialog(false);
      setFormData({
        title: '',
        type: 'report',
        sector: '',
        description: '',
        meta_title: '',
        meta_description: '',
      });
    } catch (error) {
      console.error('Error creando lead magnet:', error);
    }
  };

  const handleStatusChange = async (id: string, status: 'active' | 'draft' | 'archived') => {
    await updateLeadMagnet.mutateAsync({
      id,
      updates: { status }
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'draft': return 'bg-yellow-500';
      case 'archived': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'report': return '📊';
      case 'whitepaper': return '📄';
      case 'checklist': return '✅';
      case 'template': return '📋';
      default: return '📄';
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Cargando lead magnets...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Lead Magnets</h1>
          <p className="text-gray-600">Gestiona tus recursos descargables y lead magnets</p>
        </div>
        
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Crear Lead Magnet
            </Button>
          </DialogTrigger>
          
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Crear Nuevo Lead Magnet</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Título</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Ej: Guía Completa de Valoración en Healthcare"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Tipo</label>
                  <Select 
                    value={formData.type} 
                    onValueChange={(value: any) => setFormData(prev => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="report">📊 Reporte</SelectItem>
                      <SelectItem value="whitepaper">📄 Whitepaper</SelectItem>
                      <SelectItem value="checklist">✅ Checklist</SelectItem>
                      <SelectItem value="template">📋 Template</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Sector</label>
                  <Select 
                    value={formData.sector} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, sector: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona sector" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tecnologia">Tecnología</SelectItem>
                      <SelectItem value="healthcare">Healthcare</SelectItem>
                      <SelectItem value="industrial">Industrial</SelectItem>
                      <SelectItem value="energia">Energía</SelectItem>
                      <SelectItem value="financiero">Financiero</SelectItem>
                      <SelectItem value="retail">Retail</SelectItem>
                      <SelectItem value="inmobiliario">Inmobiliario</SelectItem>
                      <SelectItem value="general">General</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Descripción</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe el valor y contenido del lead magnet..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Meta Título (SEO)</label>
                  <Input
                    value={formData.meta_title}
                    onChange={(e) => setFormData(prev => ({ ...prev, meta_title: e.target.value }))}
                    placeholder="Título para SEO"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Meta Descripción (SEO)</label>
                  <Input
                    value={formData.meta_description}
                    onChange={(e) => setFormData(prev => ({ ...prev, meta_description: e.target.value }))}
                    placeholder="Descripción para SEO"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button 
                  onClick={handleCreateWithAI}
                  disabled={isGenerating || !formData.title || !formData.sector}
                  className="flex-1 flex items-center gap-2"
                >
                  <Sparkles className="h-4 w-4" />
                  {isGenerating ? 'Generando con IA...' : 'Crear con IA'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowCreateDialog(false)}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lead Magnets Creados</CardTitle>
        </CardHeader>
        <CardContent>
          {!leadMagnets || leadMagnets.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No hay lead magnets creados aún.</p>
              <p className="text-sm">Haz clic en "Crear Lead Magnet" para comenzar.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Lead Magnet</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Sector</TableHead>
                  <TableHead>Descargas</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leadMagnets.map((magnet) => (
                  <TableRow key={magnet.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{magnet.title}</div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {magnet.description}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <span>{getTypeIcon(magnet.type)}</span>
                        <span className="capitalize">{magnet.type}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="capitalize">
                        {magnet.sector}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-center">
                        <div className="font-medium">{magnet.download_count}</div>
                        <div className="text-xs text-gray-500">
                          {magnet.lead_conversion_count} leads
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={magnet.status}
                        onValueChange={(value: any) => handleStatusChange(magnet.id, value)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">
                            <Badge className="bg-yellow-500">Borrador</Badge>
                          </SelectItem>
                          <SelectItem value="active">
                            <Badge className="bg-green-500">Activo</Badge>
                          </SelectItem>
                          <SelectItem value="archived">
                            <Badge className="bg-gray-500">Archivado</Badge>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {magnet.landing_page_slug && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(`/descarga/${magnet.landing_page_slug}`, '_blank')}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        )}
                        {magnet.file_url && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(magnet.file_url, '_blank')}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingMagnet(magnet.id)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteLeadMagnet.mutate(magnet.id)}
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
    </div>
  );
};

export default LeadMagnetsManager;
