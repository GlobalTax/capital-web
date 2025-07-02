import React, { useState } from 'react';
import { ContactSegment } from '@/hooks/useContactLists';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
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

interface CreateSegmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateSegment: (segmentData: Omit<ContactSegment, 'id' | 'created_at' | 'contact_count'>) => Promise<any>;
}

export const CreateSegmentModal: React.FC<CreateSegmentModalProps> = ({
  isOpen,
  onClose,
  onCreateSegment
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    criteria: {
      score_min: 0,
      score_max: 100,
      source: 'all',
      tags: [],
      created_days_ago: 30
    },
    auto_update: true,
    is_active: true
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setIsLoading(true);
    try {
      await onCreateSegment(formData);
      setFormData({
        name: '',
        description: '',
        criteria: {
          score_min: 0,
          score_max: 100,
          source: 'all',
          tags: [],
          created_days_ago: 30
        },
        auto_update: true,
        is_active: true
      });
      onClose();
    } catch (error) {
      console.error('Error creating segment:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      description: '',
      criteria: {
        score_min: 0,
        score_max: 100,
        source: 'all',
        tags: [],
        created_days_ago: 30
      },
      auto_update: true,
      is_active: true
    });
    onClose();
  };

  const updateCriteria = (key: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      criteria: {
        ...prev.criteria,
        [key]: value
      }
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Crear Nuevo Segmento</DialogTitle>
          <DialogDescription>
            Crea un segmento dinámico que se actualiza automáticamente según criterios
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre del segmento *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Ej. Leads de Alta Calidad"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Descripción del segmento"
              rows={2}
            />
          </div>

          <div className="space-y-4 border-t pt-4">
            <h4 className="font-medium">Criterios de Segmentación</h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Puntuación mínima</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.criteria.score_min}
                  onChange={(e) => updateCriteria('score_min', parseInt(e.target.value) || 0)}
                />
              </div>
              <div className="space-y-2">
                <Label>Puntuación máxima</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.criteria.score_max}
                  onChange={(e) => updateCriteria('score_max', parseInt(e.target.value) || 100)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Fuente de contactos</Label>
              <Select 
                value={formData.criteria.source}
                onValueChange={(value) => updateCriteria('source', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las fuentes</SelectItem>
                  <SelectItem value="contact_lead">Formulario Web</SelectItem>
                  <SelectItem value="apollo">Apollo</SelectItem>
                  <SelectItem value="lead_score">Tracking Web</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Contactos creados en los últimos (días)</Label>
              <Input
                type="number"
                min="1"
                value={formData.criteria.created_days_ago}
                onChange={(e) => updateCriteria('created_days_ago', parseInt(e.target.value) || 30)}
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="auto_update"
              checked={formData.auto_update}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, auto_update: checked }))}
            />
            <Label htmlFor="auto_update">
              Actualización automática
            </Label>
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
              {isLoading ? 'Creando...' : 'Crear Segmento'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};