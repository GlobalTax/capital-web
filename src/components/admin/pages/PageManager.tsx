import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Eye, 
  Edit, 
  AlertTriangle, 
  CheckCircle, 
  Search,
  MoreHorizontal,
  ExternalLink,
  Settings,
  Activity,
  BarChart3
} from 'lucide-react';

interface PageInfo {
  id: string;
  name: string;
  route: string;
  status: 'active' | 'error' | 'redirect' | 'maintenance';
  lastModified: string;
  visits: number;
  conversionRate: number;
  hasErrors: boolean;
  description: string;
}

const SITE_PAGES: PageInfo[] = [
  {
    id: 'home',
    name: 'Página Principal',
    route: '/',
    status: 'active',
    lastModified: '2024-01-15',
    visits: 15420,
    conversionRate: 3.2,
    hasErrors: false,
    description: 'Página de inicio con hero, servicios y contacto'
  },
  {
    id: 'venta-empresas',
    name: 'Venta de Empresas',
    route: '/venta-empresas',
    status: 'active',
    lastModified: '2024-01-14',
    visits: 8930,
    conversionRate: 5.8,
    hasErrors: false,
    description: 'Landing principal para servicios de M&A'
  },
  {
    id: 'valoraciones',
    name: 'Valoraciones',
    route: '/valoraciones',
    status: 'active',
    lastModified: '2024-01-13',
    visits: 12340,
    conversionRate: 8.4,
    hasErrors: false,
    description: 'Calculadora de valoración empresarial'
  },
  {
    id: 'programa-colaboradores',
    name: 'Programa de Colaboradores',
    route: '/programa-colaboradores',
    status: 'error',
    lastModified: '2024-01-12',
    visits: 2340,
    conversionRate: 4.1,
    hasErrors: true,
    description: 'Página de captación de colaboradores - ERROR: companies undefined'
  },
  {
    id: 'servicios',
    name: 'Servicios',
    route: '/servicios',
    status: 'redirect',
    lastModified: '2024-01-10',
    visits: 4560,
    conversionRate: 0,
    hasErrors: false,
    description: 'Redirige a /venta-empresas - Página temporal'
  },
  {
    id: 'sectores',
    name: 'Sectores',
    route: '/sectores',
    status: 'redirect',
    lastModified: '2024-01-10',
    visits: 3210,
    conversionRate: 0,
    hasErrors: false,
    description: 'Redirige a /venta-empresas - Página temporal'
  },
  {
    id: 'oportunidades',
    name: 'Oportunidades',
    route: '/oportunidades',
    status: 'active',
    lastModified: '2024-01-11',
    visits: 1890,
    conversionRate: 2.1,
    hasErrors: false,
    description: 'Listado de empresas en venta'
  }
];

export const PageManager = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const filteredPages = SITE_PAGES.filter(page => {
    const matchesSearch = page.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         page.route.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || page.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: PageInfo['status']) => {
    const configs = {
      active: { variant: 'default' as const, color: 'bg-green-500', text: 'Activa' },
      error: { variant: 'destructive' as const, color: 'bg-red-500', text: 'Error' },
      redirect: { variant: 'secondary' as const, color: 'bg-yellow-500', text: 'Redirección' },
      maintenance: { variant: 'outline' as const, color: 'bg-orange-500', text: 'Mantenimiento' }
    };
    
    const config = configs[status];
    return (
      <Badge variant={config.variant} className="gap-1">
        <div className={`w-2 h-2 rounded-full ${config.color}`} />
        {config.text}
      </Badge>
    );
  };

  const getConversionColor = (rate: number) => {
    if (rate >= 6) return 'text-green-600';
    if (rate >= 3) return 'text-yellow-600';
    return 'text-red-600';
  };

  const errorPages = SITE_PAGES.filter(p => p.hasErrors || p.status === 'error');
  const activePages = SITE_PAGES.filter(p => p.status === 'active');
  const totalVisits = SITE_PAGES.reduce((sum, p) => sum + p.visits, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Páginas</h1>
          <p className="text-gray-600 mt-1">
            Administra todas las páginas del sitio web
          </p>
        </div>
        <Button className="gap-2">
          <Edit className="h-4 w-4" />
          Nuevo Contenido
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Páginas</p>
                <p className="text-2xl font-bold">{SITE_PAGES.length}</p>
              </div>
              <Activity className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Páginas Activas</p>
                <p className="text-2xl font-bold text-green-600">{activePages.length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Con Errores</p>
                <p className="text-2xl font-bold text-red-600">{errorPages.length}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Visitas Totales</p>
                <p className="text-2xl font-bold">{totalVisits.toLocaleString()}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Error Alert */}
      {errorPages.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>{errorPages.length} página(s) con errores:</strong>{' '}
            {errorPages.map(p => p.name).join(', ')}. 
            Revisa los errores de consola para más detalles.
          </AlertDescription>
        </Alert>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <CardTitle>Páginas del Sitio</CardTitle>
            <div className="flex gap-2 w-full md:w-auto">
              <div className="relative flex-1 md:w-80">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar páginas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    Estado: {selectedStatus === 'all' ? 'Todos' : selectedStatus}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setSelectedStatus('all')}>
                    Todos
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSelectedStatus('active')}>
                    Activas
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSelectedStatus('error')}>
                    Con Errores
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSelectedStatus('redirect')}>
                    Redirecciones
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Página</TableHead>
                <TableHead>Ruta</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Visitas</TableHead>
                <TableHead>Conversión</TableHead>
                <TableHead>Última Modificación</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPages.map((page) => (
                <TableRow key={page.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{page.name}</div>
                      <div className="text-sm text-gray-500">{page.description}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                      {page.route}
                    </code>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(page.status)}
                  </TableCell>
                  <TableCell>{page.visits.toLocaleString()}</TableCell>
                  <TableCell>
                    <span className={getConversionColor(page.conversionRate)}>
                      {page.conversionRate}%
                    </span>
                  </TableCell>
                  <TableCell className="text-gray-500">
                    {new Date(page.lastModified).toLocaleDateString('es-ES')}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" />
                          Ver Página
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          Editar Contenido
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <BarChart3 className="mr-2 h-4 w-4" />
                          Ver Analytics
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <ExternalLink className="mr-2 h-4 w-4" />
                          Abrir en Nueva Pestaña
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Settings className="mr-2 h-4 w-4" />
                          Configuración SEO
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};