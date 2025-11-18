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

  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const convertMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No autenticado');

      // 1. Crear operación
      const { data: operation, error: opError } = await supabase
        .from('company_operations')
        .insert({
          company_name: formData.company_name,
          sector: formData.sector || 'Sin especificar',
          valuation_amount: parseFloat(formData.valuation_amount) || 0,
          valuation_currency: 'EUR',
          year: new Date().getFullYear(),
          description: formData.description,
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
      toast({
        title: 'Error al crear operación',
        description: error.message,
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
                <Label htmlFor="company_name">Nombre de la Empresa *</Label>
                <Input
                  id="company_name"
                  value={formData.company_name}
                  onChange={(e) =>
                    setFormData({ ...formData, company_name: e.target.value })
                  }
                  placeholder="Acme Corp"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="sector">Sector</Label>
                  <Input
                    id="sector"
                    value={formData.sector}
                    onChange={(e) =>
                      setFormData({ ...formData, sector: e.target.value })
                    }
                    placeholder="Tecnología"
                  />
                </div>
                <div>
                  <Label htmlFor="valuation">Valoración Estimada (€)</Label>
                  <Input
                    id="valuation"
                    type="number"
                    value={formData.valuation_amount}
                    onChange={(e) =>
                      setFormData({ ...formData, valuation_amount: e.target.value })
                    }
                    placeholder="1000000"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Descripción de la Operación</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Describe los detalles de la operación..."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="notes">Notas de Conversión (Opcional)</Label>
                <Textarea
                  id="notes"
                  value={formData.conversion_notes}
                  onChange={(e) =>
                    setFormData({ ...formData, conversion_notes: e.target.value })
                  }
                  placeholder="Información adicional sobre la conversión..."
                  rows={2}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={() => convertMutation.mutate()}
              disabled={!formData.company_name || convertMutation.isPending}
            >
              <ArrowRight className="h-4 w-4 mr-2" />
              {convertMutation.isPending ? 'Creando...' : 'Crear Operación'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
