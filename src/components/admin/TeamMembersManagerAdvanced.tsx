import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import ImageUploadField from './ImageUploadField';
import { Trash2, Edit, Plus, GripVertical, Users } from 'lucide-react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';

interface TeamMember {
  id: string;
  name: string;
  position?: string;
  bio?: string;
  image_url?: string;
  phone?: string;
  email?: string;
  linkedin_url?: string;
  section?: string;
  display_order: number;
  is_active: boolean;
}

const TeamMembersManagerAdvanced = () => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [sections, setSections] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSectionDialogOpen, setIsSectionDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [newSectionName, setNewSectionName] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    position: '',
    bio: '',
    image_url: '',
    phone: '',
    email: '',
    linkedin_url: '',
    section: 'Equipo Principal',
    is_active: true
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  const fetchTeamMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .order('section', { ascending: true })
        .order('display_order', { ascending: true });

      if (error) throw error;
      
      const members = data || [];
      setTeamMembers(members);
      
      // Extract unique sections
      const uniqueSections = Array.from(new Set(members.map(m => m.section || 'Equipo Principal')));
      setSections(uniqueSections);
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Error al cargar miembros del equipo: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const { source, destination } = result;
    
    // Get members from the source section
    const sourceSection = sections[parseInt(source.droppableId)];
    const sectionMembers = teamMembers.filter(m => (m.section || 'Equipo Principal') === sourceSection);
    
    const reordered = Array.from(sectionMembers);
    const [removed] = reordered.splice(source.index, 1);
    reordered.splice(destination.index, 0, removed);

    // Update display_order for all members in this section
    try {
      for (let i = 0; i < reordered.length; i++) {
        await supabase
          .from('team_members')
          .update({ display_order: i + 1 })
          .eq('id', reordered[i].id);
      }
      
      fetchTeamMembers();
      toast({
        title: "Éxito",
        description: "Orden actualizado correctamente.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Error al reordenar: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingMember) {
        const { error } = await supabase
          .from('team_members')
          .update({
            name: formData.name,
            position: formData.position || null,
            bio: formData.bio || null,
            image_url: formData.image_url || null,
            phone: formData.phone || null,
            email: formData.email || null,
            linkedin_url: formData.linkedin_url || null,
            section: formData.section,
            is_active: formData.is_active
          })
          .eq('id', editingMember.id);

        if (error) throw error;
        
        toast({
          title: "Éxito",
          description: "Miembro del equipo actualizado correctamente.",
        });
      } else {
        const sectionMembers = teamMembers.filter(m => m.section === formData.section);
        const maxOrder = Math.max(...sectionMembers.map(m => m.display_order), 0);
        
        const { error } = await supabase
          .from('team_members')
          .insert({
            name: formData.name,
            position: formData.position || null,
            bio: formData.bio || null,
            image_url: formData.image_url || null,
            phone: formData.phone || null,
            email: formData.email || null,
            linkedin_url: formData.linkedin_url || null,
            section: formData.section,
            is_active: formData.is_active,
            display_order: maxOrder + 1
          });

        if (error) throw error;
        
        toast({
          title: "Éxito",
          description: "Miembro del equipo creado correctamente.",
        });
      }

      setIsDialogOpen(false);
      resetForm();
      fetchTeamMembers();
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Error al guardar: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este miembro del equipo?')) return;

    try {
      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Éxito",
        description: "Miembro del equipo eliminado correctamente.",
      });
      
      fetchTeamMembers();
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Error al eliminar: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const handleAddSection = async () => {
    if (!newSectionName.trim()) {
      toast({
        title: "Error",
        description: "El nombre de la sección no puede estar vacío.",
        variant: "destructive",
      });
      return;
    }

    if (sections.includes(newSectionName)) {
      toast({
        title: "Error",
        description: "Esta sección ya existe.",
        variant: "destructive",
      });
      return;
    }

    setSections([...sections, newSectionName]);
    setNewSectionName('');
    setIsSectionDialogOpen(false);
    
    toast({
      title: "Éxito",
      description: `Sección "${newSectionName}" creada correctamente.`,
    });
  };

  const openEditDialog = (member: TeamMember) => {
    setEditingMember(member);
    setFormData({
      name: member.name,
      position: member.position || '',
      bio: member.bio || '',
      image_url: member.image_url || '',
      phone: member.phone || '',
      email: member.email || '',
      linkedin_url: member.linkedin_url || '',
      section: member.section || 'Equipo Principal',
      is_active: member.is_active
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setEditingMember(null);
    setFormData({
      name: '',
      position: '',
      bio: '',
      image_url: '',
      phone: '',
      email: '',
      linkedin_url: '',
      section: 'Equipo Principal',
      is_active: true
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-foreground">Gestión Avanzada del Equipo</h2>
        <div className="flex gap-2">
          <Dialog open={isSectionDialogOpen} onOpenChange={setIsSectionDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Users className="w-4 h-4 mr-2" />
                Nueva Sección
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Crear Nueva Sección</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="section_name">Nombre de la Sección</Label>
                  <Input
                    id="section_name"
                    value={newSectionName}
                    onChange={(e) => setNewSectionName(e.target.value)}
                    placeholder="Ej: Directivos, Consultores..."
                  />
                </div>
                <Button onClick={handleAddSection} className="w-full">
                  Crear Sección
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="w-4 h-4 mr-2" />
                Agregar Miembro
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingMember ? 'Editar Miembro' : 'Nuevo Miembro'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Nombre *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="position">Posición</Label>
                  <Input
                    id="position"
                    value={formData.position}
                    onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
                  />
                </div>

                <div>
                  <Label htmlFor="section">Sección</Label>
                  <select
                    id="section"
                    value={formData.section}
                    onChange={(e) => setFormData(prev => ({ ...prev, section: e.target.value }))}
                    className="w-full border rounded-lg p-2"
                  >
                    {sections.map(section => (
                      <option key={section} value={section}>{section}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="bio">Biografía</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                    rows={3}
                  />
                </div>

                <ImageUploadField
                  label="Foto del Miembro"
                  value={formData.image_url}
                  onChange={(url) => setFormData(prev => ({ ...prev, image_url: url || '' }))}
                  folder="team"
                  placeholder="URL de la imagen"
                />

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone">Teléfono</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="+34 600 000 000"
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="nombre@capittal.es"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="linkedin_url">URL de LinkedIn</Label>
                  <Input
                    id="linkedin_url"
                    type="url"
                    value={formData.linkedin_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, linkedin_url: e.target.value }))}
                    placeholder="https://linkedin.com/in/perfil"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                    className="w-4 h-4"
                  />
                  <Label htmlFor="is_active">
                    Miembro activo (visible en la web)
                  </Label>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button type="submit">
                    {editingMember ? 'Actualizar' : 'Crear'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Drag & Drop Sections */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="space-y-8">
          {sections.map((section, sectionIndex) => {
            const sectionMembers = teamMembers.filter(
              m => (m.section || 'Equipo Principal') === section
            );

            if (sectionMembers.length === 0) return null;

            return (
              <div key={section} className="space-y-4">
                <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  {section}
                  <span className="text-sm text-muted-foreground font-normal">
                    ({sectionMembers.length})
                  </span>
                </h3>

                <Droppable droppableId={sectionIndex.toString()}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`space-y-3 min-h-[100px] p-4 rounded-lg border-2 border-dashed transition-colors ${
                        snapshot.isDraggingOver ? 'border-primary bg-primary/5' : 'border-border'
                      }`}
                    >
                      {sectionMembers.map((member, index) => (
                        <Draggable
                          key={member.id}
                          draggableId={member.id}
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <Card
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className={`transition-shadow ${
                                snapshot.isDragging ? 'shadow-xl' : ''
                              }`}
                            >
                              <CardContent className="p-4">
                                <div className="flex items-center gap-4">
                                  {/* Drag Handle */}
                                  <div
                                    {...provided.dragHandleProps}
                                    className="cursor-grab active:cursor-grabbing"
                                  >
                                    <GripVertical className="w-5 h-5 text-muted-foreground" />
                                  </div>

                                  {/* Image */}
                                  {member.image_url && (
                                    <img 
                                      src={member.image_url} 
                                      alt={member.name}
                                      className="w-16 h-16 rounded-lg object-cover border"
                                    />
                                  )}

                                  {/* Info */}
                                  <div className="flex-1">
                                    <h4 className="font-bold text-foreground">{member.name}</h4>
                                    {member.position && (
                                      <p className="text-sm text-muted-foreground">{member.position}</p>
                                    )}
                                    <div className="flex gap-4 mt-1 text-xs text-muted-foreground">
                                      {member.phone && <span>📞 {member.phone}</span>}
                                      {member.email && <span>✉️ {member.email}</span>}
                                    </div>
                                    <span className={`inline-block px-2 py-1 rounded text-xs mt-2 ${
                                      member.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                    }`}>
                                      {member.is_active ? 'Activo' : 'Inactivo'}
                                    </span>
                                  </div>
                                  
                                  {/* Actions */}
                                  <div className="flex gap-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => openEditDialog(member)}
                                    >
                                      <Edit className="w-4 h-4" />
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleDelete(member.id)}
                                      className="text-red-600 hover:text-red-700"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </div>
      </DragDropContext>

      {teamMembers.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No hay miembros del equipo registrados.</p>
          <Button onClick={() => setIsDialogOpen(true)} className="mt-4">
            Agregar el primer miembro
          </Button>
        </div>
      )}
    </div>
  );
};

export default TeamMembersManagerAdvanced;
