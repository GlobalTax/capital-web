
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useImageUpload } from '@/hooks/useImageUpload';
import ImageUploadField from './ImageUploadField';
import { Trash2, Edit, Plus, ArrowUp, ArrowDown } from 'lucide-react';

interface TeamMember {
  id: string;
  name: string;
  position?: string;
  bio?: string;
  image_url?: string;
  display_order: number;
  is_active: boolean;
}

const TeamMembersManager = () => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    position: '',
    bio: '',
    image_url: '',
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
        .order('display_order', { ascending: true });

      if (error) throw error;
      setTeamMembers(data || []);
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
            is_active: formData.is_active
          })
          .eq('id', editingMember.id);

        if (error) throw error;
        
        toast({
          title: "Éxito",
          description: "Miembro del equipo actualizado correctamente.",
        });
      } else {
        const maxOrder = Math.max(...teamMembers.map(m => m.display_order), 0);
        
        const { error } = await supabase
          .from('team_members')
          .insert({
            name: formData.name,
            position: formData.position || null,
            bio: formData.bio || null,
            image_url: formData.image_url || null,
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

  const handleDelete = async (id: string, imageUrl?: string) => {
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

  const moveTeamMember = async (id: string, direction: 'up' | 'down') => {
    const currentIndex = teamMembers.findIndex(m => m.id === id);
    if (currentIndex === -1) return;
    
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= teamMembers.length) return;

    const updatedMembers = [...teamMembers];
    [updatedMembers[currentIndex], updatedMembers[newIndex]] = [updatedMembers[newIndex], updatedMembers[currentIndex]];

    try {
      for (let i = 0; i < updatedMembers.length; i++) {
        await supabase
          .from('team_members')
          .update({ display_order: i + 1 })
          .eq('id', updatedMembers[i].id);
      }
      
      fetchTeamMembers();
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Error al reordenar: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (member: TeamMember) => {
    setEditingMember(member);
    setFormData({
      name: member.name,
      position: member.position || '',
      bio: member.bio || '',
      image_url: member.image_url || '',
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
      is_active: true
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-0.5 border-black"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-black">Gestión del Equipo</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              onClick={resetForm}
              className="bg-black text-white border-0.5 border-black rounded-lg hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
            >
              <Plus className="w-4 h-4 mr-2" />
              Agregar Miembro
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl bg-white border-0.5 border-black rounded-lg">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold text-black">
                {editingMember ? 'Editar Miembro' : 'Nuevo Miembro'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name" className="text-sm font-medium text-black">Nombre *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                  className="border-0.5 border-black rounded-lg focus:ring-2 focus:ring-black/20"
                />
              </div>

              <div>
                <Label htmlFor="position" className="text-sm font-medium text-black">Posición</Label>
                <Input
                  id="position"
                  value={formData.position}
                  onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
                  className="border-0.5 border-black rounded-lg focus:ring-2 focus:ring-black/20"
                />
              </div>

              <div>
                <Label htmlFor="bio" className="text-sm font-medium text-black">Biografía</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                  rows={3}
                  className="border-0.5 border-black rounded-lg focus:ring-2 focus:ring-black/20"
                />
              </div>

              <ImageUploadField
                label="Foto del Miembro"
                value={formData.image_url}
                onChange={(url) => setFormData(prev => ({ ...prev, image_url: url || '' }))}
                folder="team"
                placeholder="URL de la imagen del miembro del equipo"
              />

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                  className="w-4 h-4"
                />
                <Label htmlFor="is_active" className="text-sm font-medium text-black">
                  Miembro activo
                </Label>
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  type="submit"
                  className="bg-black text-white border-0.5 border-black rounded-lg hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                >
                  {editingMember ? 'Actualizar' : 'Crear'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  className="border-0.5 border-black rounded-lg hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {teamMembers.map((member, index) => (
          <Card key={member.id} className="bg-white border-0.5 border-black rounded-lg shadow-sm hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {member.image_url && (
                    <img 
                      src={member.image_url} 
                      alt={member.name}
                      className="w-16 h-16 rounded-lg object-cover border-0.5 border-gray-300"
                    />
                  )}
                  <div>
                    <h3 className="font-bold text-black">{member.name}</h3>
                    {member.position && (
                      <p className="text-sm text-gray-600">{member.position}</p>
                    )}
                    {member.bio && (
                      <p className="text-xs text-gray-500 mt-1 max-w-md truncate">{member.bio}</p>
                    )}
                    <span className={`inline-block px-2 py-1 rounded text-xs mt-2 ${
                      member.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {member.is_active ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => moveTeamMember(member.id, 'up')}
                    disabled={index === 0}
                    className="border-0.5 border-gray-300 rounded-lg hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => moveTeamMember(member.id, 'down')}
                    disabled={index === teamMembers.length - 1}
                    className="border-0.5 border-gray-300 rounded-lg hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditDialog(member)}
                    className="border-0.5 border-gray-300 rounded-lg hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(member.id, member.image_url)}
                    className="border-0.5 border-red-300 rounded-lg hover:shadow-lg hover:-translate-y-1 transition-all duration-300 text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {teamMembers.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-600">No hay miembros del equipo registrados.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamMembersManager;
