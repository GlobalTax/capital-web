import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Phone, Building2, Link2, Settings2, Plus, GripVertical, Trash2, Edit2, ExternalLink, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTopBarAdmin, TopBarLink, GroupCompany } from '@/hooks/useTopBarConfig';
import { toast } from 'sonner';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

// Preview component
const TopBarPreview = ({ 
  config, 
  links, 
  companies 
}: { 
  config: any; 
  links: TopBarLink[]; 
  companies: GroupCompany[];
}) => {
  const activeLinks = links.filter(l => l.is_active);
  const currentCompany = companies.find(c => c.is_current);
  
  return (
    <div className="bg-muted/50 border rounded-lg p-4">
      <p className="text-xs text-muted-foreground mb-2">Vista previa</p>
      <div className="bg-background border rounded-md px-4 py-2 flex items-center gap-4 text-sm overflow-x-auto">
        {companies.length > 0 && (
          <span className="font-medium flex items-center gap-1 whitespace-nowrap">
            {currentCompany?.name || 'Grupo'} ▾
          </span>
        )}
        {companies.length > 0 && activeLinks.length > 0 && (
          <span className="text-muted-foreground">|</span>
        )}
        {activeLinks.map((link, i) => (
          <React.Fragment key={link.id}>
            <span className="text-muted-foreground whitespace-nowrap flex items-center gap-1">
              {link.label}
              {link.is_external && <ExternalLink className="h-3 w-3" />}
            </span>
            {i < activeLinks.length - 1 && <span className="text-muted-foreground/50">|</span>}
          </React.Fragment>
        ))}
        <div className="ml-auto flex items-center gap-3">
          {config?.show_language_selector && <span className="text-xs text-muted-foreground">ES ▾</span>}
          <span className="flex items-center gap-1 whitespace-nowrap">
            <Phone className="h-3 w-3" />
            {config?.phone_number || '695 717 490'}
          </span>
          {config?.show_search && <span className="text-muted-foreground">🔍</span>}
        </div>
      </div>
    </div>
  );
};

// Link form dialog
const LinkFormDialog = ({
  open,
  onOpenChange,
  link,
  onSave,
  isLoading,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  link?: TopBarLink | null;
  onSave: (data: Omit<TopBarLink, 'id'>) => void;
  isLoading: boolean;
}) => {
  const [label, setLabel] = useState(link?.label || '');
  const [href, setHref] = useState(link?.href || '');
  const [isExternal, setIsExternal] = useState(link?.is_external || false);
  const [isActive, setIsActive] = useState(link?.is_active ?? true);

  React.useEffect(() => {
    if (link) {
      setLabel(link.label);
      setHref(link.href);
      setIsExternal(link.is_external);
      setIsActive(link.is_active);
    } else {
      setLabel('');
      setHref('');
      setIsExternal(false);
      setIsActive(true);
    }
  }, [link, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      label,
      href,
      is_external: isExternal,
      is_active: isActive,
      position: link?.position || 999,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{link ? 'Editar enlace' : 'Nuevo enlace'}</DialogTitle>
          <DialogDescription>
            {link ? 'Modifica los datos del enlace' : 'Añade un nuevo enlace al TopBar'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="label">Texto del enlace</Label>
            <Input
              id="label"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Ej: Marketplace"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="href">URL destino</Label>
            <Input
              id="href"
              value={href}
              onChange={(e) => setHref(e.target.value)}
              placeholder="Ej: /marketplace o https://..."
              required
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="external">Abrir en nueva pestaña</Label>
            <Switch
              id="external"
              checked={isExternal}
              onCheckedChange={setIsExternal}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="active">Enlace activo</Label>
            <Switch
              id="active"
              checked={isActive}
              onCheckedChange={setIsActive}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {link ? 'Guardar cambios' : 'Crear enlace'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// Company form dialog
const CompanyFormDialog = ({
  open,
  onOpenChange,
  company,
  onSave,
  isLoading,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  company?: GroupCompany | null;
  onSave: (data: Omit<GroupCompany, 'id'>) => void;
  isLoading: boolean;
}) => {
  const [name, setName] = useState(company?.name || '');
  const [url, setUrl] = useState(company?.url || '');
  const [logoUrl, setLogoUrl] = useState(company?.logo_url || '');
  const [isCurrent, setIsCurrent] = useState(company?.is_current || false);
  const [isActive, setIsActive] = useState(company?.is_active ?? true);

  React.useEffect(() => {
    if (company) {
      setName(company.name);
      setUrl(company.url);
      setLogoUrl(company.logo_url || '');
      setIsCurrent(company.is_current);
      setIsActive(company.is_active);
    } else {
      setName('');
      setUrl('');
      setLogoUrl('');
      setIsCurrent(false);
      setIsActive(true);
    }
  }, [company, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name,
      url,
      logo_url: logoUrl || null,
      is_current: isCurrent,
      is_active: isActive,
      position: company?.position || 999,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{company ? 'Editar empresa' : 'Nueva empresa del grupo'}</DialogTitle>
          <DialogDescription>
            {company ? 'Modifica los datos de la empresa' : 'Añade una empresa al desplegable del grupo'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre de la empresa</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Capittal Legal"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="url">URL de la web</Label>
            <Input
              id="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Ej: https://capittallegal.es"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="logo">URL del logo (opcional)</Label>
            <Input
              id="logo"
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              placeholder="Ej: https://..."
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="current">Es la empresa actual</Label>
              <p className="text-xs text-muted-foreground">Se mostrará destacada y sin enlace</p>
            </div>
            <Switch
              id="current"
              checked={isCurrent}
              onCheckedChange={setIsCurrent}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="company-active">Empresa activa</Label>
            <Switch
              id="company-active"
              checked={isActive}
              onCheckedChange={setIsActive}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {company ? 'Guardar cambios' : 'Crear empresa'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default function TopBarSettings() {
  const navigate = useNavigate();
  const {
    config,
    links,
    companies,
    isLoading,
    updateConfig,
    createLink,
    updateLink,
    deleteLink,
    reorderLinks,
    createCompany,
    updateCompany,
    deleteCompany,
    reorderCompanies,
  } = useTopBarAdmin();

  // Dialog states
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [companyDialogOpen, setCompanyDialogOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<TopBarLink | null>(null);
  const [editingCompany, setEditingCompany] = useState<GroupCompany | null>(null);

  // Phone form state
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneLink, setPhoneLink] = useState('');
  
  React.useEffect(() => {
    if (config) {
      setPhoneNumber(config.phone_number);
      setPhoneLink(config.phone_link);
    }
  }, [config]);

  // Handlers
  const handleSavePhone = async () => {
    try {
      await updateConfig.mutateAsync({ phone_number: phoneNumber, phone_link: phoneLink });
      toast.success('Teléfono actualizado');
    } catch (error) {
      toast.error('Error al guardar');
    }
  };

  const handleToggleOption = async (key: 'show_search' | 'show_language_selector', value: boolean) => {
    try {
      await updateConfig.mutateAsync({ [key]: value });
      toast.success('Configuración actualizada');
    } catch (error) {
      toast.error('Error al guardar');
    }
  };

  const handleSaveLink = async (data: Omit<TopBarLink, 'id'>) => {
    try {
      if (editingLink) {
        await updateLink.mutateAsync({ id: editingLink.id, data });
        toast.success('Enlace actualizado');
      } else {
        await createLink.mutateAsync(data);
        toast.success('Enlace creado');
      }
      setLinkDialogOpen(false);
      setEditingLink(null);
    } catch (error) {
      toast.error('Error al guardar');
    }
  };

  const handleDeleteLink = async (id: string) => {
    if (!confirm('¿Eliminar este enlace?')) return;
    try {
      await deleteLink.mutateAsync(id);
      toast.success('Enlace eliminado');
    } catch (error) {
      toast.error('Error al eliminar');
    }
  };

  const handleSaveCompany = async (data: Omit<GroupCompany, 'id'>) => {
    try {
      if (editingCompany) {
        await updateCompany.mutateAsync({ id: editingCompany.id, data });
        toast.success('Empresa actualizada');
      } else {
        await createCompany.mutateAsync(data);
        toast.success('Empresa creada');
      }
      setCompanyDialogOpen(false);
      setEditingCompany(null);
    } catch (error) {
      toast.error('Error al guardar');
    }
  };

  const handleDeleteCompany = async (id: string) => {
    if (!confirm('¿Eliminar esta empresa?')) return;
    try {
      await deleteCompany.mutateAsync(id);
      toast.success('Empresa eliminada');
    } catch (error) {
      toast.error('Error al eliminar');
    }
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    
    const { source, destination, type } = result;
    
    if (type === 'links') {
      const reordered = Array.from(links);
      const [removed] = reordered.splice(source.index, 1);
      reordered.splice(destination.index, 0, removed);
      reorderLinks.mutate(reordered.map(l => l.id));
    } else if (type === 'companies') {
      const reordered = Array.from(companies);
      const [removed] = reordered.splice(source.index, 1);
      reordered.splice(destination.index, 0, removed);
      reorderCompanies.mutate(reordered.map(c => c.id));
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse text-muted-foreground">Cargando configuración...</div>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/admin/settings')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Configuración del TopBar</h1>
          <p className="text-muted-foreground">Personaliza la barra superior de la web</p>
        </div>
      </div>

      {/* Preview */}
      <TopBarPreview config={config} links={links} companies={companies} />

      {/* Phone Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Teléfono de contacto
          </CardTitle>
          <CardDescription>El número que aparece en la barra superior</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone-display">Número visible</Label>
              <Input
                id="phone-display"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="695 717 490"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone-link">Enlace tel: (sin espacios)</Label>
              <Input
                id="phone-link"
                value={phoneLink}
                onChange={(e) => setPhoneLink(e.target.value)}
                placeholder="+34695717490"
              />
            </div>
          </div>
          <Button 
            onClick={handleSavePhone} 
            disabled={updateConfig.isPending}
            size="sm"
          >
            Guardar teléfono
          </Button>
        </CardContent>
      </Card>

      {/* Group Companies Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Empresas del grupo
              </CardTitle>
              <CardDescription>Desplegable con las empresas hermanas</CardDescription>
            </div>
            <Button 
              size="sm" 
              onClick={() => {
                setEditingCompany(null);
                setCompanyDialogOpen(true);
              }}
            >
              <Plus className="h-4 w-4 mr-1" />
              Añadir empresa
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="companies" type="companies">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                  {companies.map((company, index) => (
                    <Draggable key={company.id} draggableId={company.id} index={index}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg border"
                        >
                          <div {...provided.dragHandleProps} className="cursor-grab">
                            <GripVertical className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-medium truncate">{company.name}</span>
                              {company.is_current && (
                                <Badge variant="secondary" className="text-xs">Actual</Badge>
                              )}
                              {!company.is_active && (
                                <Badge variant="outline" className="text-xs">Oculta</Badge>
                              )}
                            </div>
                            <span className="text-sm text-muted-foreground truncate block">{company.url}</span>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setEditingCompany(company);
                              setCompanyDialogOpen(true);
                            }}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteCompany(company.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
          {companies.length === 0 && (
            <p className="text-center text-muted-foreground py-8">
              No hay empresas del grupo. El desplegable no se mostrará.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Links Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Link2 className="h-5 w-5" />
                Enlaces secundarios
              </CardTitle>
              <CardDescription>Los enlaces que aparecen en la barra</CardDescription>
            </div>
            <Button 
              size="sm" 
              onClick={() => {
                setEditingLink(null);
                setLinkDialogOpen(true);
              }}
            >
              <Plus className="h-4 w-4 mr-1" />
              Añadir enlace
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="links" type="links">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                  {links.map((link, index) => (
                    <Draggable key={link.id} draggableId={link.id} index={index}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg border"
                        >
                          <div {...provided.dragHandleProps} className="cursor-grab">
                            <GripVertical className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-medium truncate">{link.label}</span>
                              {link.is_external && (
                                <ExternalLink className="h-3 w-3 text-muted-foreground" />
                              )}
                              {link.is_active ? (
                                <Badge variant="default" className="text-xs bg-green-600">Activo</Badge>
                              ) : (
                                <Badge variant="outline" className="text-xs">Oculto</Badge>
                              )}
                            </div>
                            <span className="text-sm text-muted-foreground truncate block">{link.href}</span>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setEditingLink(link);
                              setLinkDialogOpen(true);
                            }}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteLink(link.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
          {links.length === 0 && (
            <p className="text-center text-muted-foreground py-8">
              No hay enlaces configurados.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Options Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings2 className="h-5 w-5" />
            Opciones adicionales
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Mostrar selector de idioma</Label>
              <p className="text-sm text-muted-foreground">Permite cambiar entre ES, CA, VAL, GL</p>
            </div>
            <Switch
              checked={config?.show_language_selector ?? true}
              onCheckedChange={(v) => handleToggleOption('show_language_selector', v)}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>Mostrar icono de búsqueda</Label>
              <p className="text-sm text-muted-foreground">Icono de lupa en la esquina derecha</p>
            </div>
            <Switch
              checked={config?.show_search ?? true}
              onCheckedChange={(v) => handleToggleOption('show_search', v)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Dialogs */}
      <LinkFormDialog
        open={linkDialogOpen}
        onOpenChange={setLinkDialogOpen}
        link={editingLink}
        onSave={handleSaveLink}
        isLoading={createLink.isPending || updateLink.isPending}
      />
      <CompanyFormDialog
        open={companyDialogOpen}
        onOpenChange={setCompanyDialogOpen}
        company={editingCompany}
        onSave={handleSaveCompany}
        isLoading={createCompany.isPending || updateCompany.isPending}
      />
    </div>
  );
}
