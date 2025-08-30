import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Edit, Trash2, Eye, BarChart3, Settings, Users } from 'lucide-react';
import { 
  useAdminSectorCalculators, 
  useCreateSectorCalculator, 
  useUpdateSectorCalculator, 
  useDeleteSectorCalculator,
  useCalculatorResults,
  SectorCalculator 
} from '@/hooks/useSectorCalculators';
import { toast } from 'sonner';

export const SectorCalculatorManager: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState('calculators');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingCalculator, setEditingCalculator] = useState<SectorCalculator | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    sector: '',
    slug: '',
    description: '',
    is_active: true,
    configuration: '{}',
    fields_config: '[]',
    results_config: '{}',
    display_order: 0,
  });

  const { data: calculators, isLoading } = useAdminSectorCalculators();
  const { data: results, isLoading: resultsLoading } = useCalculatorResults();
  const createCalculator = useCreateSectorCalculator();
  const updateCalculator = useUpdateSectorCalculator();
  const deleteCalculator = useDeleteSectorCalculator();

  const handleSubmit = async () => {
    try {
      const data = {
        ...formData,
        configuration: JSON.parse(formData.configuration),
        fields_config: JSON.parse(formData.fields_config),
        results_config: JSON.parse(formData.results_config),
      };

      if (editingCalculator) {
        await updateCalculator.mutateAsync({ ...data, id: editingCalculator.id });
      } else {
        await createCalculator.mutateAsync(data);
      }

      resetForm();
      setIsCreateDialogOpen(false);
      setEditingCalculator(null);
    } catch (error) {
      console.error('Error saving calculator:', error);
      toast.error('Error al guardar la calculadora. Verifica el formato JSON.');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      sector: '',
      slug: '',
      description: '',
      is_active: true,
      configuration: '{}',
      fields_config: '[]',
      results_config: '{}',
      display_order: 0,
    });
  };

  const handleEdit = (calculator: SectorCalculator) => {
    setEditingCalculator(calculator);
    setFormData({
      name: calculator.name,
      sector: calculator.sector,
      slug: calculator.slug,
      description: calculator.description || '',
      is_active: calculator.is_active,
      configuration: JSON.stringify(calculator.configuration, null, 2),
      fields_config: JSON.stringify(calculator.fields_config, null, 2),
      results_config: JSON.stringify(calculator.results_config, null, 2),
      display_order: calculator.display_order,
    });
    setIsCreateDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar esta calculadora?')) {
      await deleteCalculator.mutateAsync(id);
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[áäâà]/g, 'a')
      .replace(/[éëêè]/g, 'e')
      .replace(/[íïîì]/g, 'i')
      .replace(/[óöôò]/g, 'o')
      .replace(/[úüûù]/g, 'u')
      .replace(/[ñ]/g, 'n')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  if (isLoading) {
    return <div className="flex items-center justify-center p-8">Cargando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Gestión de Calculadoras Sectoriales</h2>
          <p className="text-muted-foreground">
            Administra las calculadoras especializadas por sector
          </p>
        </div>
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { resetForm(); setEditingCalculator(null); setIsCreateDialogOpen(true); }}>
              <Plus className="h-4 w-4 mr-2" />
              Nueva Calculadora
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingCalculator ? 'Editar Calculadora' : 'Nueva Calculadora'}
              </DialogTitle>
              <DialogDescription>
                Configura los parámetros y campos de la calculadora sectorial
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Nombre</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => {
                      const name = e.target.value;
                      setFormData(prev => ({
                        ...prev,
                        name,
                        slug: generateSlug(name)
                      }));
                    }}
                    placeholder="ej: Calculadora Tech/SaaS"
                  />
                </div>
                
                <div>
                  <Label htmlFor="sector">Sector</Label>
                  <Select 
                    value={formData.sector} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, sector: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un sector" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Tecnología">Tecnología</SelectItem>
                      <SelectItem value="Salud">Salud</SelectItem>
                      <SelectItem value="Retail">Retail</SelectItem>
                      <SelectItem value="Manufactura">Manufactura</SelectItem>
                      <SelectItem value="Servicios">Servicios</SelectItem>
                      <SelectItem value="Inmobiliario">Inmobiliario</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="slug">Slug (URL)</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                    placeholder="tech-saas"
                  />
                </div>
                
                <div>
                  <Label htmlFor="description">Descripción</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe la calculadora y su propósito"
                    rows={3}
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                  />
                  <Label htmlFor="is_active">Activa</Label>
                </div>
                
                <div>
                  <Label htmlFor="display_order">Orden de visualización</Label>
                  <Input
                    id="display_order"
                    type="number"
                    value={formData.display_order}
                    onChange={(e) => setFormData(prev => ({ ...prev, display_order: parseInt(e.target.value) }))}
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="configuration">Configuración (JSON)</Label>
                  <Textarea
                    id="configuration"
                    value={formData.configuration}
                    onChange={(e) => setFormData(prev => ({ ...prev, configuration: e.target.value }))}
                    rows={4}
                    className="font-mono text-sm"
                  />
                </div>
                
                <div>
                  <Label htmlFor="fields_config">Campos (JSON)</Label>
                  <Textarea
                    id="fields_config"
                    value={formData.fields_config}
                    onChange={(e) => setFormData(prev => ({ ...prev, fields_config: e.target.value }))}
                    rows={8}
                    className="font-mono text-sm"
                  />
                </div>
                
                <div>
                  <Label htmlFor="results_config">Configuración de Resultados (JSON)</Label>
                  <Textarea
                    id="results_config"
                    value={formData.results_config}
                    onChange={(e) => setFormData(prev => ({ ...prev, results_config: e.target.value }))}
                    rows={4}
                    className="font-mono text-sm"
                  />
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSubmit}>
                {editingCalculator ? 'Actualizar' : 'Crear'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList>
          <TabsTrigger value="calculators" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Calculadoras
          </TabsTrigger>
          <TabsTrigger value="results" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Resultados
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="calculators">
          <Card>
            <CardHeader>
              <CardTitle>Calculadoras Activas</CardTitle>
              <CardDescription>
                {calculators?.length || 0} calculadoras configuradas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Sector</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Orden</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {calculators?.map((calculator) => (
                    <TableRow key={calculator.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{calculator.name}</div>
                          <div className="text-sm text-muted-foreground">
                            /{calculator.slug}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{calculator.sector}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={calculator.is_active ? 'default' : 'secondary'}>
                          {calculator.is_active ? 'Activa' : 'Inactiva'}
                        </Badge>
                      </TableCell>
                      <TableCell>{calculator.display_order}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(calculator)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(calculator.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results">
          <Card>
            <CardHeader>
              <CardTitle>Resultados de Calculaciones</CardTitle>
              <CardDescription>
                Historial de valoraciones realizadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              {resultsLoading ? (
                <div>Cargando resultados...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Empresa</TableHead>
                      <TableHead>Sector</TableHead>
                      <TableHead>Valoración</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Lead</TableHead>
                      <TableHead>Fecha</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {results?.slice(0, 10).map((result: any) => (
                      <TableRow key={result.id}>
                        <TableCell>{result.company_name || 'N/A'}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{result.sector}</Badge>
                        </TableCell>
                        <TableCell>
                          {result.valuation_amount ? 
                            `${result.valuation_amount.toLocaleString('es-ES')}€` : 
                            'N/A'
                          }
                        </TableCell>
                        <TableCell>{result.contact_email || 'N/A'}</TableCell>
                        <TableCell>
                          <Badge variant={result.lead_captured ? 'default' : 'secondary'}>
                            {result.lead_captured ? 'Sí' : 'No'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(result.created_at).toLocaleDateString('es-ES')}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Total Cálculos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">
                  {results?.length || 0}
                </div>
                <p className="text-sm text-muted-foreground">
                  Valoraciones realizadas
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Tasa de Conversión</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">
                  {results ? 
                    `${Math.round((results.filter((r: any) => r.lead_captured).length / results.length) * 100)}%` : 
                    '0%'
                  }
                </div>
                <p className="text-sm text-muted-foreground">
                  Leads capturados
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Valoración Promedio</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">
                  {results && results.length > 0 ? 
                    `${Math.round(
                      results.reduce((sum: number, r: any) => sum + (r.valuation_amount || 0), 0) / 
                      results.filter((r: any) => r.valuation_amount).length
                    ).toLocaleString('es-ES')}€` : 
                    '0€'
                  }
                </div>
                <p className="text-sm text-muted-foreground">
                  Por empresa valorada
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};