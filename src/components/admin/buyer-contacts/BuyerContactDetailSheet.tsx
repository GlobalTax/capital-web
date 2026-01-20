// ============= BUYER CONTACT DETAIL SHEET =============
// Panel lateral para ver/editar un contacto de campaña compras

import React, { useState, useEffect } from 'react';
import { BuyerContact, BuyerContactStatus } from '@/types/buyer-contacts';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Mail, Phone, Building2, Briefcase, FileText, Calendar, Save } from 'lucide-react';

interface BuyerContactDetailSheetProps {
  contact: BuyerContact | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (id: string, updates: Partial<BuyerContact>) => void;
  isSaving?: boolean;
}

export const BuyerContactDetailSheet: React.FC<BuyerContactDetailSheetProps> = ({
  contact,
  open,
  onOpenChange,
  onSave,
  isSaving = false,
}) => {
  const [formData, setFormData] = useState<Partial<BuyerContact>>({});
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (contact) {
      setFormData({
        first_name: contact.first_name,
        last_name: contact.last_name,
        email: contact.email,
        phone: contact.phone,
        company: contact.company,
        position: contact.position,
        internal_notes: contact.internal_notes,
        status: contact.status,
      });
      setHasChanges(false);
    }
  }, [contact]);

  const handleChange = (field: keyof BuyerContact, value: string | null) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSave = () => {
    if (contact && hasChanges) {
      onSave(contact.id, formData);
      setHasChanges(false);
    }
  };

  if (!contact) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[450px] sm:max-w-[450px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            {contact.full_name}
            <Badge variant="outline" className="ml-2">
              Campaña Compras
            </Badge>
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Estado */}
          <div className="space-y-2">
            <Label>Estado</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => handleChange('status', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="nuevo">Nuevo</SelectItem>
                <SelectItem value="contactado">Contactado</SelectItem>
                <SelectItem value="calificado">Calificado</SelectItem>
                <SelectItem value="descartado">Descartado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Datos personales */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-muted-foreground">Datos del contacto</h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first_name">Nombre</Label>
                <Input
                  id="first_name"
                  value={formData.first_name || ''}
                  onChange={(e) => handleChange('first_name', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name">Apellidos</Label>
                <Input
                  id="last_name"
                  value={formData.last_name || ''}
                  onChange={(e) => handleChange('last_name', e.target.value || null)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email || ''}
                onChange={(e) => handleChange('email', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Teléfono
              </Label>
              <Input
                id="phone"
                value={formData.phone || ''}
                onChange={(e) => handleChange('phone', e.target.value || null)}
              />
            </div>
          </div>

          <Separator />

          {/* Datos empresa */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-muted-foreground">Empresa</h4>
            
            <div className="space-y-2">
              <Label htmlFor="company" className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Nombre empresa
              </Label>
              <Input
                id="company"
                value={formData.company || ''}
                onChange={(e) => handleChange('company', e.target.value || null)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="position" className="flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                Cargo
              </Label>
              <Input
                id="position"
                value={formData.position || ''}
                onChange={(e) => handleChange('position', e.target.value || null)}
              />
            </div>
          </div>

          <Separator />

          {/* Notas */}
          <div className="space-y-2">
            <Label htmlFor="internal_notes" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Notas internas
            </Label>
            <Textarea
              id="internal_notes"
              rows={4}
              value={formData.internal_notes || ''}
              onChange={(e) => handleChange('internal_notes', e.target.value || null)}
              placeholder="Añadir notas sobre este contacto..."
            />
          </div>

          <Separator />

          {/* Metadatos */}
          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>Fecha de alta: {format(new Date(contact.created_at), 'dd MMM yyyy HH:mm', { locale: es })}</span>
            </div>
            {contact.import_filename && (
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <span>Importado desde: {contact.import_filename}</span>
              </div>
            )}
          </div>

          {/* Botón guardar */}
          <Button 
            onClick={handleSave} 
            disabled={!hasChanges || isSaving}
            className="w-full"
          >
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? 'Guardando...' : 'Guardar cambios'}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};
