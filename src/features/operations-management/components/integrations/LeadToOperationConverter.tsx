import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowRight, Briefcase } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import SectorSelect from '@/components/admin/shared/SectorSelect';

interface LeadData {
  id: string;
  origin: 'contact' | 'valuation' | 'collaborator' | 'acquisition' | 'accountex';
  name: string;
  email: string;
  phone?: string;
  company?: string;
  [key: string]: any;
}

interface LeadToOperationConverterProps {
  lead: LeadData;
}

export const LeadToOperationConverter: React.FC<LeadToOperationConverterProps> = ({
  lead,
}) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    company_name: lead.company || '',
    sector: '',
    valuation_amount: '',
    description: '',
    conversion_notes: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Validar un campo individual
  const validateField = (fieldName: string, value: any): string => {
    switch (fieldName) {
      case 'company_name':
        if (!value || value.trim().length < 2) {
          return 'El nombre de la empresa debe tener al menos 2 caracteres';
        }
        break;
      case 'sector':
        if (!value || value.trim() === '') {
          return 'El sector es requerido';
        }
        break;
      case 'valuation_amount':
        const amount = parseFloat(value);
        if (!value || isNaN(amount) || amount <= 0) {
          return 'El monto de valoración debe ser mayor a 0';
        }
        break;
      case 'description':
        if (!value || value.trim().length < 10) {
          return 'La descripción debe tener al menos 10 caracteres';
        }
        break;
    }
    return '';
  };

  // Validar todo el formulario
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    newErrors.company_name = validateField('company_name', formData.company_name);
    newErrors.sector = validateField('sector', formData.sector);
    newErrors.valuation_amount = validateField('valuation_amount', formData.valuation_amount);
    newErrors.description = validateField('description', formData.description);

    // Filtrar errores vacíos
    const filteredErrors = Object.fromEntries(
      Object.entries(newErrors).filter(([_, v]) => v !== '')
    );

    setErrors(filteredErrors);
    return Object.keys(filteredErrors).length === 0;
  };

  // Manejar cambios en los campos
  const handleFieldChange = (fieldName: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldName]: value }));
    
    // Limpiar error del campo cuando el usuario empieza a escribir
    if (errors[fieldName]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }
  };

  const isFormValid = !formData.company_name || 
                      !formData.sector || 
                      !formData.valuation_amount || 
                      !formData.description ||
                      formData.company_name.trim().length < 2 ||
                      formData.description.trim().length < 10 ||
                      parseFloat(formData.valuation_amount) <= 0 ||
                      isNaN(parseFloat(formData.valuation_amount));

  const convertMutation = useMutation({
    mutationFn: async () => {
      // Validar antes de enviar
      if (!validateForm()) {
        throw new Error('Por favor, completa todos los campos requeridos correctamente');
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No autenticado');

      // Parsing seguro de números
      const valuationAmount = parseFloat(formData.valuation_amount);
      if (isNaN(valuationAmount) || valuationAmount <= 0) {
        throw new Error('El monto de valoración debe ser un número válido mayor a 0');
      }

      // 1. Crear operación
      const { data: operation, error: opError } = await supabase
        .from('company_operations')
        .insert({
          company_name: formData.company_name.trim(),
          sector: formData.sector.trim(),
          valuation_amount: valuationAmount,
          valuation_currency: 'EUR',
          year: new Date().getFullYear(),
          description: formData.description.trim(),
          status: 'prospecting',
          source_lead_id: lead.id,
          source_lead_type: lead.origin,
          assigned_to: user.id,
          assigned_by: user.id,
          assigned_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (opError) throw opError;

      // 2. Registrar conversión
      const { error: convError } = await supabase
        .from('lead_to_operation_conversions')
        .insert({
          lead_id: lead.id,
          lead_type: lead.origin,
          operation_id: operation.id,
          converted_by: user.id,
          conversion_notes: formData.conversion_notes,
          metadata: {
            original_lead_data: {
              name: lead.name,
              email: lead.email,
              phone: lead.phone,
              company: lead.company,
            },
          },
        });

      if (convError) throw convError;

      return operation;
    },
    onSuccess: (operation) => {
      queryClient.invalidateQueries({ queryKey: ['operations'] });
      queryClient.invalidateQueries({ queryKey: ['lead-detail'] });
      toast({
        title: '¡Operación creada!',
        description: `Se ha creado la operación para ${formData.company_name}`,
      });
      setOpen(false);
      navigate(`/admin/operations/${operation.id}`);
    },
    onError: (error: any) => {
      console.error('Error al crear operación:', error);
      
      // Parsear mensajes de error específicos de Supabase
      let errorMessage = error.message;
      
      if (error.message?.includes('valuation_amount')) {
        errorMessage = 'El monto de valoración es requerido y debe ser mayor a 0';
      } else if (error.message?.includes('sector')) {
        errorMessage = 'El sector es requerido';
      } else if (error.message?.includes('description')) {
        errorMessage = 'La descripción es requerida';
      } else if (error.message?.includes('company_name')) {
        errorMessage = 'El nombre de la empresa es requerido';
      }
      
      toast({
        title: 'Error al crear operación',
        description: errorMessage,
        variant: 'destructive',
      });
    },
  });

  return (
    <>
      <Button onClick={() => setOpen(true)} variant="default">
        <Briefcase className="h-4 w-4 mr-2" />
        Convertir en Operación
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Crear Operación desde Lead</DialogTitle>
            <DialogDescription>
              Convierte este lead en una operación activa. Los datos del lead se
              vincularán automáticamente.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Información del lead */}
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">Datos del Lead</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Nombre:</span>
                  <span className="ml-2 font-medium">{lead.name}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Email:</span>
                  <span className="ml-2">{lead.email}</span>
                </div>
                {lead.company && (
                  <div>
                    <span className="text-muted-foreground">Empresa:</span>
                    <span className="ml-2">{lead.company}</span>
                  </div>
                )}
                {lead.phone && (
                  <div>
                    <span className="text-muted-foreground">Teléfono:</span>
                    <span className="ml-2">{lead.phone}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Formulario de operación */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="company_name">
                  Nombre de la Empresa <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="company_name"
                  value={formData.company_name}
                  onChange={(e) => handleFieldChange('company_name', e.target.value)}
                  placeholder="Ej: Tech Solutions S.L."
                  className={errors.company_name ? 'border-destructive' : ''}
                />
                {errors.company_name && (
                  <p className="text-sm text-destructive">{errors.company_name}</p>
                )}
              </div>

              <div>
                <Label htmlFor="sector">
                  Sector <span className="text-destructive">*</span>
                </Label>
                <SectorSelect
                  value={formData.sector}
                  onChange={(value) => handleFieldChange('sector', value)}
                  placeholder="Selecciona un sector"
                  required
                  className={errors.sector ? 'border-destructive' : ''}
                />
                {errors.sector && (
                  <p className="text-sm text-destructive">{errors.sector}</p>
                )}
              </div>

              <div>
                <Label htmlFor="valuation_amount">
                  Valoración Estimada (EUR) <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="valuation_amount"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={formData.valuation_amount}
                  onChange={(e) => handleFieldChange('valuation_amount', e.target.value)}
                  placeholder="Ej: 500000"
                  className={errors.valuation_amount ? 'border-destructive' : ''}
                />
                {errors.valuation_amount && (
                  <p className="text-sm text-destructive">{errors.valuation_amount}</p>
                )}
              </div>

              <div>
                <Label htmlFor="description">
                  Descripción de la Operación <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleFieldChange('description', e.target.value)}
                  placeholder="Describe brevemente la operación, el tipo de negocio, situación actual... (mínimo 10 caracteres)"
                  rows={4}
                  className={errors.description ? 'border-destructive' : ''}
                />
                {errors.description && (
                  <p className="text-sm text-destructive">{errors.description}</p>
                )}
              </div>

              <div>
                <Label htmlFor="conversion_notes">Notas de Conversión (Opcional)</Label>
                <Textarea
                  id="conversion_notes"
                  value={formData.conversion_notes}
                  onChange={(e) => handleFieldChange('conversion_notes', e.target.value)}
                  placeholder="Información adicional sobre la conversión..."
                  rows={3}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={() => convertMutation.mutate()}
              disabled={convertMutation.isPending || isFormValid}
            >
              {convertMutation.isPending ? (
                'Creando...'
              ) : (
                <>
                  Crear Operación
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
