import React, { useState } from 'react';
import { useContactLists } from '@/hooks/useContactLists';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  ListPlus, 
  Tag, 
  Users, 
  Target,
  Filter,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Plus
} from 'lucide-react';
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
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { CreateListModal } from './lists/CreateListModal';
import { CreateTagModal } from './lists/CreateTagModal';
import { CreateSegmentModal } from './lists/CreateSegmentModal';

export const ContactListsManager = () => {
  const { 
    lists, 
    tags, 
    segments, 
    isLoading,
    createList,
    createTag,
    createSegment,
    refetch 
  } = useContactLists();

  const [selectedTab, setSelectedTab] = useState('lists');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateListModal, setShowCreateListModal] = useState(false);
  const [showCreateTagModal, setShowCreateTagModal] = useState(false);
  const [showCreateSegmentModal, setShowCreateSegmentModal] = useState(false);

  const filteredLists = lists.filter(list =>
    list.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    list.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredTags = tags.filter(tag =>
    tag.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tag.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredSegments = segments.filter(segment =>
    segment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    segment.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-admin-text-primary">
            Listas y Segmentación
          </h1>
          <p className="text-admin-text-secondary">
            Organiza y segmenta tus contactos con listas estáticas y dinámicas
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={() => setShowCreateListModal(true)}
          >
            <ListPlus className="h-4 w-4 mr-2" />
            Nueva Lista
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setShowCreateTagModal(true)}
          >
            <Tag className="h-4 w-4 mr-2" />
            Nueva Etiqueta
          </Button>
          <Button onClick={() => setShowCreateSegmentModal(true)}>
            <Target className="h-4 w-4 mr-2" />
            Nuevo Segmento
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-admin-text-secondary">
                  Listas Activas
                </p>
                <p className="text-2xl font-bold text-admin-text-primary">
                  {lists.length}
                </p>
              </div>
              <ListPlus className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-admin-text-secondary">
                  Etiquetas
                </p>
                <p className="text-2xl font-bold text-admin-text-primary">
                  {tags.length}
                </p>
              </div>
              <Tag className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-admin-text-secondary">
                  Segmentos
                </p>
                <p className="text-2xl font-bold text-admin-text-primary">
                  {segments.length}
                </p>
              </div>
              <Target className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar listas, etiquetas o segmentos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="lists">
            Listas
            <Badge variant="secondary" className="ml-2">
              {lists.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="tags">
            Etiquetas
            <Badge variant="secondary" className="ml-2">
              {tags.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="segments">
            Segmentos
            <Badge variant="secondary" className="ml-2">
              {segments.length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        {/* Lists Tab */}
        <TabsContent value="lists">
          <Card>
            <CardHeader>
              <CardTitle>Listas de Contactos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Contactos</TableHead>
                      <TableHead>Creada</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLists.map((list) => (
                      <TableRow key={list.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{list.name}</p>
                            {list.description && (
                              <p className="text-sm text-admin-text-secondary">
                                {list.description}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={list.list_type === 'static' ? 'secondary' : 'default'}>
                            {list.list_type === 'static' ? 'Estática' : 'Dinámica'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4 text-admin-text-secondary" />
                            {list.contact_count}
                          </div>
                        </TableCell>
                        <TableCell>
                          {new Date(list.created_at).toLocaleDateString('es-ES')}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Edit className="h-4 w-4 mr-2" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Users className="h-4 w-4 mr-2" />
                                Ver Contactos
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Eliminar
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {filteredLists.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-admin-text-secondary">
                    No se encontraron listas
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tags Tab */}
        <TabsContent value="tags">
          <Card>
            <CardHeader>
              <CardTitle>Etiquetas de Contactos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Etiqueta</TableHead>
                      <TableHead>Uso</TableHead>
                      <TableHead>Creada</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTags.map((tag) => (
                      <TableRow key={tag.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: tag.color }}
                            />
                            <div>
                              <p className="font-medium">{tag.name}</p>
                              {tag.description && (
                                <p className="text-sm text-admin-text-secondary">
                                  {tag.description}
                                </p>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4 text-admin-text-secondary" />
                            {tag.usage_count} contactos
                          </div>
                        </TableCell>
                        <TableCell>
                          {new Date(tag.created_at).toLocaleDateString('es-ES')}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Edit className="h-4 w-4 mr-2" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Users className="h-4 w-4 mr-2" />
                                Ver Contactos
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Eliminar
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {filteredTags.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-admin-text-secondary">
                    No se encontraron etiquetas
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Segments Tab */}
        <TabsContent value="segments">
          <Card>
            <CardHeader>
              <CardTitle>Segmentos Dinámicos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Contactos</TableHead>
                      <TableHead>Auto-actualización</TableHead>
                      <TableHead>Creado</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSegments.map((segment) => (
                      <TableRow key={segment.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{segment.name}</p>
                            {segment.description && (
                              <p className="text-sm text-admin-text-secondary">
                                {segment.description}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4 text-admin-text-secondary" />
                            {segment.contact_count}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={segment.auto_update ? 'default' : 'secondary'}>
                            {segment.auto_update ? 'Activa' : 'Inactiva'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(segment.created_at).toLocaleDateString('es-ES')}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Edit className="h-4 w-4 mr-2" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Filter className="h-4 w-4 mr-2" />
                                Ver Criterios
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Users className="h-4 w-4 mr-2" />
                                Ver Contactos
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Eliminar
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {filteredSegments.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-admin-text-secondary">
                    No se encontraron segmentos
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <CreateListModal
        isOpen={showCreateListModal}
        onClose={() => setShowCreateListModal(false)}
        onCreateList={createList}
      />
      
      <CreateTagModal
        isOpen={showCreateTagModal}
        onClose={() => setShowCreateTagModal(false)}
        onCreateTag={createTag}
      />
      
      <CreateSegmentModal
        isOpen={showCreateSegmentModal}
        onClose={() => setShowCreateSegmentModal(false)}
        onCreateSegment={createSegment}
      />
    </div>
  );
};