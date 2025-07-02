import React, { useState } from 'react';
import { ContactList } from '@/hooks/useContactLists';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface CreateListModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateList: (listData: Omit<ContactList, 'id' | 'created_at' | 'updated_at' | 'contact_count'>) => Promise<any>;
}

export const CreateListModal: React.FC<CreateListModalProps> = ({
  isOpen,
  onClose,
  onCreateList
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    list_type: 'static' as 'static' | 'dynamic',
    is_active: true
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setIsLoading(true);
    try {
      await onCreateList(formData);
      setFormData({
        name: '',
        description: '',
        list_type: 'static',
        is_active: true
      });
      onClose();
    } catch (error) {
      console.error('Error creating list:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      description: '',
      list_type: 'static',
      is_active: true
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Crear Nueva Lista</DialogTitle>
          <DialogDescription>
            Crea una nueva lista para organizar tus contactos
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre de la lista *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Ej. Clientes Premium"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Descripción opcional de la lista"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="list_type">Tipo de lista</Label>
            <Select 
              value={formData.list_type} 
              onValueChange={(value: 'static' | 'dynamic') => 
                setFormData(prev => ({ ...prev, list_type: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="static">
                  Estática - Los contactos se añaden manualmente
                </SelectItem>
                <SelectItem value="dynamic">
                  Dinámica - Los contactos se añaden automáticamente según criterios
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="flex gap-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading || !formData.name.trim()}>
              {isLoading ? 'Creando...' : 'Crear Lista'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};