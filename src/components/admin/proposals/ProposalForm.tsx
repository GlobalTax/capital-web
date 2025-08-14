import React, { useState, useEffect } from 'react';
import { useProposals } from '@/hooks/useProposals';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CreateProposalData, ServiceType, SERVICE_TYPE_LABELS } from '@/types/proposals';
import { Calculator, Save, Send } from 'lucide-react';

interface ProposalFormProps {
  isOpen: boolean;
  onClose: () => void;
  proposalId?: string;
}

export const ProposalForm = ({ isOpen, onClose, proposalId }: ProposalFormProps) => {
  const { templates, createProposal, sendProposal } = useProposals();
  const [formData, setFormData] = useState<CreateProposalData>({
    client_name: '',
    client_email: '',
    client_company: '',
    client_phone: '',
    service_type: 'venta_empresas',
    proposal_title: '',
    transaction_value: undefined,
    base_fee_percentage: 3.5,
    success_fee_percentage: 1.5,
    minimum_fee: 25000,
    valid_until: ''
  });
  const [estimatedFee, setEstimatedFee] = useState<number>(0);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');

  // Filter templates by selected service type
  const availableTemplates = templates.filter(t => t.service_type === formData.service_type);

  // Calculate estimated fee
  useEffect(() => {
    if (formData.transaction_value && formData.base_fee_percentage) {
      const baseFee = (formData.transaction_value * formData.base_fee_percentage) / 100;
      const successFee = formData.success_fee_percentage 
        ? (formData.transaction_value * formData.success_fee_percentage) / 100 
        : 0;
      const totalFee = baseFee + successFee;
      const finalFee = Math.max(totalFee, formData.minimum_fee || 0);
      setEstimatedFee(finalFee);
    } else {
      setEstimatedFee(formData.minimum_fee || 0);
    }
  }, [formData.transaction_value, formData.base_fee_percentage, formData.success_fee_percentage, formData.minimum_fee]);

  // Load template data when selected
  useEffect(() => {
    if (selectedTemplate) {
      const template = templates.find(t => t.id === selectedTemplate);
      if (template) {
        setFormData(prev => ({
          ...prev,
          template_id: template.id,
          base_fee_percentage: template.base_fee_percentage,
          success_fee_percentage: template.success_fee_percentage,
          minimum_fee: template.minimum_fee
        }));
      }
    }
  }, [selectedTemplate, templates]);

  // Auto-generate proposal title
  useEffect(() => {
    if (formData.client_company && formData.service_type) {
      const serviceLabel = SERVICE_TYPE_LABELS[formData.service_type];
      setFormData(prev => ({
        ...prev,
        proposal_title: `Propuesta de ${serviceLabel} - ${formData.client_company}`
      }));
    }
  }, [formData.client_company, formData.service_type]);

  const handleSubmit = async (action: 'save' | 'send') => {
    const proposalData = {
      ...formData,
      estimated_fee: estimatedFee
    };

    const newProposal = await createProposal(proposalData);
    
    if (newProposal && action === 'send') {
      await sendProposal(newProposal.id);
    }

    onClose();
  };

  const handleServiceTypeChange = (value: ServiceType) => {
    setFormData(prev => ({ ...prev, service_type: value }));
    setSelectedTemplate(''); // Reset template selection
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nueva Propuesta de Honorarios</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Client Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Información del Cliente</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="client_name">Nombre del Cliente *</Label>
                    <Input
                      id="client_name"
                      value={formData.client_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, client_name: e.target.value }))}
                      placeholder="Nombre completo"
                    />
                  </div>
                  <div>
                    <Label htmlFor="client_email">Email *</Label>
                    <Input
                      id="client_email"
                      type="email"
                      value={formData.client_email}
                      onChange={(e) => setFormData(prev => ({ ...prev, client_email: e.target.value }))}
                      placeholder="email@empresa.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="client_company">Empresa</Label>
                    <Input
                      id="client_company"
                      value={formData.client_company || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, client_company: e.target.value }))}
                      placeholder="Nombre de la empresa"
                    />
                  </div>
                  <div>
                    <Label htmlFor="client_phone">Teléfono</Label>
                    <Input
                      id="client_phone"
                      value={formData.client_phone || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, client_phone: e.target.value }))}
                      placeholder="600 000 000"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Service Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Información del Servicio</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="service_type">Tipo de Servicio *</Label>
                  <Select value={formData.service_type} onValueChange={handleServiceTypeChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(SERVICE_TYPE_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {availableTemplates.length > 0 && (
                  <div>
                    <Label htmlFor="template">Plantilla (Opcional)</Label>
                    <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar plantilla" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableTemplates.map((template) => (
                          <SelectItem key={template.id} value={template.id}>
                            {template.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div>
                  <Label htmlFor="proposal_title">Título de la Propuesta *</Label>
                  <Input
                    id="proposal_title"
                    value={formData.proposal_title}
                    onChange={(e) => setFormData(prev => ({ ...prev, proposal_title: e.target.value }))}
                    placeholder="Título descriptivo de la propuesta"
                  />
                </div>

                <div>
                  <Label htmlFor="valid_until">Válida Hasta</Label>
                  <Input
                    id="valid_until"
                    type="date"
                    value={formData.valid_until || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, valid_until: e.target.value }))}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Fee Structure */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Estructura de Honorarios
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="transaction_value">Valor de la Transacción (€)</Label>
                  <Input
                    id="transaction_value"
                    type="number"
                    value={formData.transaction_value || ''}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      transaction_value: e.target.value ? Number(e.target.value) : undefined 
                    }))}
                    placeholder="Valor estimado de la transacción"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="base_fee_percentage">Honorario Base (%)</Label>
                    <Input
                      id="base_fee_percentage"
                      type="number"
                      step="0.1"
                      value={formData.base_fee_percentage}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        base_fee_percentage: Number(e.target.value) 
                      }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="success_fee_percentage">Honorario Éxito (%)</Label>
                    <Input
                      id="success_fee_percentage"
                      type="number"
                      step="0.1"
                      value={formData.success_fee_percentage}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        success_fee_percentage: Number(e.target.value) 
                      }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="minimum_fee">Honorario Mínimo (€)</Label>
                    <Input
                      id="minimum_fee"
                      type="number"
                      value={formData.minimum_fee}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        minimum_fee: Number(e.target.value) 
                      }))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Fee Calculator Sidebar */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Calculadora de Honorarios</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Honorario Base:</span>
                    <span className="font-medium">
                      €{formData.transaction_value ? 
                        ((formData.transaction_value * formData.base_fee_percentage) / 100).toLocaleString() : 
                        '0'
                      }
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Honorario Éxito:</span>
                    <span className="font-medium">
                      €{formData.transaction_value && formData.success_fee_percentage ? 
                        ((formData.transaction_value * formData.success_fee_percentage) / 100).toLocaleString() : 
                        '0'
                      }
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Mínimo:</span>
                    <span className="font-medium">€{formData.minimum_fee?.toLocaleString()}</span>
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex justify-between">
                      <span className="font-semibold">Total Estimado:</span>
                      <span className="font-bold text-lg text-primary">
                        €{estimatedFee.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="space-y-2">
              <Button 
                onClick={() => handleSubmit('save')}
                className="w-full"
                variant="outline"
              >
                <Save className="h-4 w-4 mr-2" />
                Guardar Borrador
              </Button>
              <Button 
                onClick={() => handleSubmit('send')}
                className="w-full"
              >
                <Send className="h-4 w-4 mr-2" />
                Crear y Enviar
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};