import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLeadMagnets } from '@/hooks/useLeadMagnets';
import { useLeadMagnetGeneration } from '@/hooks/useLeadMagnetGeneration';
import { 
  Download, 
  Edit, 
  Trash2, 
  Plus, 
  Eye, 
  Sparkles,
  TrendingUp,
  Users,
  Target,
  BarChart3,
  ExternalLink,
  Copy,
  Share
} from 'lucide-react';
import type { LeadMagnetFormData } from '@/types/leadMagnets';
import { STANDARD_SECTORS } from '@/components/admin/shared/sectorOptions';

const LeadMagnetsManagerV2 = () => {
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

  // Calcular métricas
  const totalDownloads = leadMagnets?.reduce((sum, magnet) => sum + magnet.download_count, 0) || 0;
  const totalLeads = leadMagnets?.reduce((sum, magnet) => sum + magnet.lead_conversion_count, 0) || 0;
  const activeContent = leadMagnets?.filter(m => m.status === 'active').length || 0;
  const conversionRate = totalDownloads > 0 ? (totalLeads / totalDownloads) * 100 : 0;

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

  const copyLandingPageUrl = (slug: string) => {
    const url = `${window.location.origin}/descarga/${slug}`;
    navigator.clipboard.writeText(url);
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
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-light text-foreground tracking-tight">Lead Magnets</h1>
          <p className="text-muted-foreground font-light mt-1">
            Recursos descargables para generar leads
          </p>
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
              <DialogTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Crear Nuevo Lead Magnet
              </DialogTitle>
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
                      {STANDARD_SECTORS.map((sector) => (
                        <SelectItem key={sector} value={sector.toLowerCase()}>
                          {sector}
                        </SelectItem>
                      ))}
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

      {/* Métricas Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Descargas</p>
                <p className="text-2xl font-light">{totalDownloads.toLocaleString()}</p>
              </div>
              <Download className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Leads Generados</p>
                <p className="text-2xl font-light">{totalLeads.toLocaleString()}</p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tasa Conversión</p>
                <p className="text-2xl font-light">{conversionRate.toFixed(1)}%</p>
              </div>
              <Target className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Contenido Activo</p>
                <p className="text-2xl font-light">{activeContent}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">Todos ({leadMagnets?.length || 0})</TabsTrigger>
          <TabsTrigger value="active">Activos ({activeContent})</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Lead Magnets Creados</CardTitle>
            </CardHeader>
            <CardContent>
              {!leadMagnets || leadMagnets.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="font-medium">No hay lead magnets creados aún</p>
                  <p className="text-sm">Haz clic en "Crear Lead Magnet" para comenzar</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Lead Magnet</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Performance</TableHead>
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
                            <div className="text-sm text-muted-foreground truncate max-w-xs">
                              {magnet.description}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="secondary" className="text-xs capitalize">
                                {magnet.sector}
                              </Badge>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{getTypeIcon(magnet.type)}</span>
                            <span className="capitalize text-sm">{magnet.type}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Download className="h-3 w-3" />
                              <span className="text-sm font-medium">{magnet.download_count}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Users className="h-3 w-3" />
                              <span className="text-sm text-muted-foreground">{magnet.lead_conversion_count} leads</span>
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
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => window.open(`/descarga/${magnet.landing_page_slug}`, '_blank')}
                                >
                                  <ExternalLink className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => copyLandingPageUrl(magnet.landing_page_slug!)}
                                >
                                  <Copy className="h-4 w-4" />
                                </Button>
                              </>
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
        </TabsContent>

        <TabsContent value="active" className="space-y-4">
          <Card>
            <CardContent className="p-6">
              <div className="text-center py-8">
                <p className="text-muted-foreground">Vista de contenido activo - En desarrollo</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardContent className="p-6">
              <div className="text-center py-8">
                <TrendingUp className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">Analytics detallados - Próximamente</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LeadMagnetsManagerV2;