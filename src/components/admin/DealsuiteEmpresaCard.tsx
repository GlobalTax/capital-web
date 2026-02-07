import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { 
  Building2, MapPin, Globe, Users, FileText, 
  ArrowLeft, ExternalLink, Mail, Phone, Briefcase,
  Pencil, Save, X, Plus, Trash2, Loader2
} from 'lucide-react';
import type { DealsuiteEmpresa, DealsuiteContacto } from '@/hooks/useDealsuiteEmpresas';
import { useDealsuiteContactos, useUpdateEmpresa, useCreateEmpresa, useCreateContacto, useUpdateContacto, useDeleteContacto } from '@/hooks/useDealsuiteEmpresas';
import { DealsuiteContactoDialog } from './DealsuiteContactoDialog';

interface Props {
  empresa: DealsuiteEmpresa;
  onBack: () => void;
  isNew?: boolean;
  onCreated?: () => void;
}

export const DealsuiteEmpresaCard = ({ empresa, onBack, isNew, onCreated }: Props) => {
  const { data: contactos } = useDealsuiteContactos(isNew ? undefined : empresa.id);
  const updateEmpresa = useUpdateEmpresa();
  const createEmpresa = useCreateEmpresa();
  const createContacto = useCreateContacto();
  const updateContacto = useUpdateContacto();
  const deleteContacto = useDeleteContacto();

  const [isEditing, setIsEditing] = useState(!!isNew);
  const [form, setForm] = useState<Partial<DealsuiteEmpresa>>({ ...empresa });
  const [contactDialog, setContactDialog] = useState<{ open: boolean; contacto?: DealsuiteContacto | null }>({ open: false });

  const set = (field: string, value: any) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSave = async () => {
    if (isNew) {
      createEmpresa.mutate(form, {
        onSuccess: () => {
          onCreated?.();
          onBack();
        },
      });
    } else {
      updateEmpresa.mutate({ id: empresa.id, ...form });
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    if (isNew) {
      onBack();
    } else {
      setForm({ ...empresa });
      setIsEditing(false);
    }
  };

  const handleSaveContacto = (data: Partial<DealsuiteContacto> & { empresa_id: string }) => {
    if (data.id) {
      updateContacto.mutate(data as any, { onSuccess: () => setContactDialog({ open: false }) });
    } else {
      createContacto.mutate(data, { onSuccess: () => setContactDialog({ open: false }) });
    }
  };

  const handleDeleteContacto = (c: DealsuiteContacto) => {
    if (!confirm(`¿Eliminar el contacto "${c.nombre}"?`)) return;
    deleteContacto.mutate({ id: c.id, empresa_id: c.empresa_id });
  };

  const isSaving = updateEmpresa.isPending || createEmpresa.isPending;

  // Tags helper
  const tagsToString = (arr: string[] | undefined) => (arr || []).join(', ');
  const stringToTags = (str: string) => str.split(',').map(s => s.trim()).filter(Boolean);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={onBack} className="gap-1.5">
          <ArrowLeft className="h-4 w-4" /> Volver al directorio
        </Button>
        {!isNew && !isEditing && (
          <Button variant="outline" size="sm" onClick={() => setIsEditing(true)} className="gap-1.5">
            <Pencil className="h-3.5 w-3.5" /> Editar
          </Button>
        )}
        {isEditing && (
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={handleCancel} className="gap-1.5">
              <X className="h-3.5 w-3.5" /> Cancelar
            </Button>
            <Button size="sm" onClick={handleSave} disabled={isSaving} className="gap-1.5">
              {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
              {isNew ? 'Crear empresa' : 'Guardar'}
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Main info */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            {isEditing ? (
              <div className="space-y-3">
                <div>
                  <Label>Nombre *</Label>
                  <Input value={form.nombre || ''} onChange={e => set('nombre', e.target.value)} placeholder="Nombre de la empresa" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Ubicación</Label>
                    <Input value={form.ubicacion || ''} onChange={e => set('ubicacion', e.target.value)} placeholder="País / Ciudad" />
                  </div>
                  <div>
                    <Label>Tipo de empresa</Label>
                    <Input value={form.tipo_empresa || ''} onChange={e => set('tipo_empresa', e.target.value)} placeholder="Ej: Asesoramiento M&A" />
                  </div>
                </div>
                <div>
                  <Label>Parte de</Label>
                  <Input value={form.parte_de || ''} onChange={e => set('parte_de', e.target.value)} placeholder="Grupo al que pertenece" />
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-4">
                {empresa.imagen_url ? (
                  <img src={empresa.imagen_url} alt="" className="w-14 h-14 rounded-lg object-cover border" />
                ) : (
                  <div className="w-14 h-14 rounded-lg bg-muted flex items-center justify-center">
                    <Building2 className="h-6 w-6 text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-lg">{empresa.nombre}</CardTitle>
                  <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground flex-wrap">
                    {empresa.ubicacion && (
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" /> {empresa.ubicacion}
                      </span>
                    )}
                    {empresa.tipo_empresa && (
                      <span className="inline-flex items-center gap-1">
                        <Briefcase className="h-3.5 w-3.5" /> {empresa.tipo_empresa}
                      </span>
                    )}
                  </div>
                  {empresa.parte_de && (
                    <p className="text-xs text-muted-foreground mt-1">Parte de: {empresa.parte_de}</p>
                  )}
                  {(empresa.email || empresa.telefono) && (
                    <div className="flex items-center gap-3 mt-1.5 text-sm flex-wrap">
                      {empresa.email && (
                        <a href={`mailto:${empresa.email}`} className="inline-flex items-center gap-1 text-primary hover:underline">
                          <Mail className="h-3.5 w-3.5" /> {empresa.email}
                        </a>
                      )}
                      {empresa.telefono && (
                        <a href={`tel:${empresa.telefono}`} className="inline-flex items-center gap-1 text-muted-foreground hover:underline">
                          <Phone className="h-3.5 w-3.5" /> {empresa.telefono}
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            {isEditing ? (
              <>
                <div>
                  <Label>Descripción</Label>
                  <Textarea value={form.descripcion || ''} onChange={e => set('descripcion', e.target.value)} rows={3} placeholder="Acerca de la empresa..." />
                </div>
                <div>
                  <Label>Experiencia M&A (separar por coma)</Label>
                  <Input value={tagsToString(form.experiencia_ma)} onChange={e => set('experiencia_ma', stringToTags(e.target.value))} placeholder="Ej: Compras, Ventas, MBI" />
                </div>
                <div>
                  <Label>Sectores (separar por coma)</Label>
                  <Input value={tagsToString(form.experiencia_sector)} onChange={e => set('experiencia_sector', stringToTags(e.target.value))} placeholder="Ej: Tecnología, Salud, Industria" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Tamaño proy. mín (€)</Label>
                    <Input type="number" value={form.tamano_proyectos_min ?? ''} onChange={e => set('tamano_proyectos_min', e.target.value ? Number(e.target.value) : null)} />
                  </div>
                  <div>
                    <Label>Tamaño proy. máx (€)</Label>
                    <Input type="number" value={form.tamano_proyectos_max ?? ''} onChange={e => set('tamano_proyectos_max', e.target.value ? Number(e.target.value) : null)} />
                  </div>
                </div>
                <div>
                  <Label>Enfoque consultivo</Label>
                  <Input value={form.enfoque_consultivo || ''} onChange={e => set('enfoque_consultivo', e.target.value)} placeholder="En venta, Para comprar..." />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Email</Label>
                    <Input type="email" value={form.email || ''} onChange={e => set('email', e.target.value)} placeholder="contacto@empresa.com" />
                  </div>
                  <div>
                    <Label>Teléfono</Label>
                    <Input type="tel" value={form.telefono || ''} onChange={e => set('telefono', e.target.value)} placeholder="+34 600 000 000" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Sitio web</Label>
                    <Input value={form.sitio_web || ''} onChange={e => set('sitio_web', e.target.value)} placeholder="https://..." />
                  </div>
                  <div>
                    <Label>URL imagen/logo</Label>
                    <Input value={form.imagen_url || ''} onChange={e => set('imagen_url', e.target.value)} placeholder="https://..." />
                  </div>
                </div>
                <div>
                  <Label>Notas internas</Label>
                  <Textarea value={form.notas || ''} onChange={e => set('notas', e.target.value)} rows={2} />
                </div>
              </>
            ) : (
              <>
                {empresa.descripcion && (
                  <div>
                    <h4 className="text-sm font-medium mb-1">Acerca de</h4>
                    <p className="text-sm text-muted-foreground whitespace-pre-line">{empresa.descripcion}</p>
                  </div>
                )}
                {empresa.experiencia_ma.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-1.5">Experiencia M&A</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {empresa.experiencia_ma.map(tag => (
                        <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                {empresa.experiencia_sector.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-1.5">Sectores</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {empresa.experiencia_sector.map(tag => (
                        <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                {(empresa.tamano_proyectos_min || empresa.tamano_proyectos_max) && (
                  <div>
                    <h4 className="text-sm font-medium mb-1">Tamaño de proyectos</h4>
                    <p className="text-sm text-muted-foreground">
                      {empresa.tamano_proyectos_min ? `€${(empresa.tamano_proyectos_min / 1e6).toFixed(1)}M` : '?'}
                      {' – '}
                      {empresa.tamano_proyectos_max ? `€${(empresa.tamano_proyectos_max / 1e6).toFixed(1)}M` : '?'}
                    </p>
                  </div>
                )}
                {empresa.enfoque_consultivo && (
                  <div>
                    <h4 className="text-sm font-medium mb-1">Enfoque consultivo</h4>
                    <p className="text-sm text-muted-foreground">{empresa.enfoque_consultivo}</p>
                  </div>
                )}
                {empresa.sitio_web && (
                  <a 
                    href={empresa.sitio_web.startsWith('http') ? empresa.sitio_web : `https://${empresa.sitio_web}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
                  >
                    <Globe className="h-3.5 w-3.5" /> {empresa.sitio_web}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
                {empresa.deal_ids.length > 0 && (
                  <div className="pt-2">
                    <Separator className="mb-3" />
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <FileText className="h-3.5 w-3.5" />
                      {empresa.deal_ids.length} deal{empresa.deal_ids.length !== 1 ? 's' : ''} vinculado{empresa.deal_ids.length !== 1 ? 's' : ''}
                    </div>
                  </div>
                )}
                {empresa.notas && (
                  <div className="pt-2">
                    <Separator className="mb-3" />
                    <h4 className="text-sm font-medium mb-1">Notas internas</h4>
                    <p className="text-sm text-muted-foreground whitespace-pre-line">{empresa.notas}</p>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Contacts sidebar */}
        {!isNew && (
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-1.5">
                  <Users className="h-4 w-4" /> Contactos ({contactos?.length || 0})
                </CardTitle>
                <Button variant="outline" size="sm" onClick={() => setContactDialog({ open: true, contacto: null })} className="gap-1 h-7 text-xs">
                  <Plus className="h-3 w-3" /> Añadir
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {!contactos?.length ? (
                <p className="text-sm text-muted-foreground">Sin contactos registrados.</p>
              ) : (
                <div className="space-y-3">
                  {contactos.map(c => (
                    <div key={c.id} className="flex items-start gap-3 p-2 rounded-lg bg-muted/30 group">
                      {c.imagen_url ? (
                        <img src={c.imagen_url} alt="" className="w-9 h-9 rounded-full object-cover" />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-xs font-medium text-muted-foreground">
                          {(c.nombre || '?')[0].toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">{c.nombre || 'Sin nombre'}</p>
                        {c.cargo && <p className="text-xs text-muted-foreground">{c.cargo}</p>}
                        {c.email && (
                          <a href={`mailto:${c.email}`} className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-0.5">
                            <Mail className="h-3 w-3" /> {c.email}
                          </a>
                        )}
                        {c.telefono && (
                          <p className="inline-flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                            <Phone className="h-3 w-3" /> {c.telefono}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setContactDialog({ open: true, contacto: c })}>
                          <Pencil className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDeleteContacto(c)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {contactDialog.open && (
        <DealsuiteContactoDialog
          open={contactDialog.open}
          onOpenChange={(open) => setContactDialog({ open, contacto: null })}
          contacto={contactDialog.contacto}
          empresaId={empresa.id}
          onSave={handleSaveContacto}
          isSaving={createContacto.isPending || updateContacto.isPending}
        />
      )}
    </div>
  );
};
