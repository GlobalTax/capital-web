import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UnifiedContact, ContactOrigin } from '@/hooks/useUnifiedContacts';
import { ContactUpdateData } from '@/hooks/useContactUpdate';

interface ContactEditFormProps {
  contact: UnifiedContact;
  formData: ContactUpdateData;
  onChange: (data: ContactUpdateData) => void;
}

const EMPLOYEE_RANGES = [
  '1-10',
  '11-50',
  '51-200',
  '201-500',
  '501-1000',
  '+1000',
];

const SERVICE_TYPES = [
  { value: 'vender', label: 'Venta de empresa' },
  { value: 'comprar', label: 'Compra de empresa' },
  { value: 'otros', label: 'Otros servicios' },
];

const ContactEditForm: React.FC<ContactEditFormProps> = ({
  contact,
  formData,
  onChange,
}) => {
  const updateField = (field: keyof ContactUpdateData, value: any) => {
    onChange({ ...formData, [field]: value });
  };

  return (
    <div className="space-y-4">
      {/* Common fields */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nombre</Label>
          <Input
            id="name"
            value={formData.name || ''}
            onChange={(e) => updateField('name', e.target.value)}
            placeholder="Nombre completo"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email || ''}
            onChange={(e) => updateField('email', e.target.value)}
            placeholder="email@ejemplo.com"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="phone">Teléfono</Label>
          <Input
            id="phone"
            value={formData.phone || ''}
            onChange={(e) => updateField('phone', e.target.value)}
            placeholder="+34 600 000 000"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="company">Empresa</Label>
          <Input
            id="company"
            value={formData.company || ''}
            onChange={(e) => updateField('company', e.target.value)}
            placeholder="Nombre de la empresa"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="cif">CIF</Label>
          <Input
            id="cif"
            value={formData.cif || ''}
            onChange={(e) => updateField('cif', e.target.value)}
            placeholder="B12345678"
            maxLength={32}
          />
        </div>
      </div>

      {/* Origin-specific fields */}
      {contact.origin === 'valuation' && (
        <>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="industry">Sector</Label>
              <Input
                id="industry"
                value={formData.industry || ''}
                onChange={(e) => updateField('industry', e.target.value)}
                placeholder="Sector de actividad"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="employee_range">Empleados</Label>
              <Select
                value={formData.employee_range || ''}
                onValueChange={(value) => updateField('employee_range', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar rango" />
                </SelectTrigger>
                <SelectContent>
                  {EMPLOYEE_RANGES.map((range) => (
                    <SelectItem key={range} value={range}>
                      {range} empleados
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="revenue">Facturación (€)</Label>
              <Input
                id="revenue"
                type="number"
                value={formData.revenue || ''}
                onChange={(e) => updateField('revenue', e.target.value ? Number(e.target.value) : undefined)}
                placeholder="1000000"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ebitda">EBITDA (€)</Label>
              <Input
                id="ebitda"
                type="number"
                value={formData.ebitda || ''}
                onChange={(e) => updateField('ebitda', e.target.value ? Number(e.target.value) : undefined)}
                placeholder="200000"
              />
            </div>
          </div>
        </>
      )}

      {contact.origin === 'collaborator' && (
        <>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="profession">Profesión</Label>
              <Input
                id="profession"
                value={formData.profession || ''}
                onChange={(e) => updateField('profession', e.target.value)}
                placeholder="Profesión"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="experience">Experiencia</Label>
              <Input
                id="experience"
                value={formData.experience || ''}
                onChange={(e) => updateField('experience', e.target.value)}
                placeholder="Años de experiencia"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="motivation">Motivación</Label>
            <Textarea
              id="motivation"
              value={formData.motivation || ''}
              onChange={(e) => updateField('motivation', e.target.value)}
              placeholder="¿Por qué quiere colaborar?"
              rows={3}
            />
          </div>
        </>
      )}

      {(contact.origin === 'contact' || contact.origin === 'general') && (
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="service_type">Tipo de servicio</Label>
            <Select
              value={formData.service_type || ''}
              onValueChange={(value) => updateField('service_type', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar servicio" />
              </SelectTrigger>
              <SelectContent>
                {SERVICE_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="company_size">Tamaño empresa</Label>
            <Select
              value={formData.company_size || ''}
              onValueChange={(value) => updateField('company_size', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar tamaño" />
              </SelectTrigger>
              <SelectContent>
                {EMPLOYEE_RANGES.map((range) => (
                  <SelectItem key={range} value={range}>
                    {range} empleados
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {(contact.origin === 'acquisition' || contact.origin === 'company_acquisition') && (
        <>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sectors_of_interest">Sectores de interés</Label>
              <Input
                id="sectors_of_interest"
                value={formData.sectors_of_interest || ''}
                onChange={(e) => updateField('sectors_of_interest', e.target.value)}
                placeholder="Sectores de interés"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="investment_budget">Presupuesto</Label>
              <Input
                id="investment_budget"
                value={formData.investment_budget || ''}
                onChange={(e) => updateField('investment_budget', e.target.value)}
                placeholder="Rango de inversión"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="target_timeline">Timeline</Label>
              <Input
                id="target_timeline"
                value={formData.target_timeline || ''}
                onChange={(e) => updateField('target_timeline', e.target.value)}
                placeholder="Plazo objetivo"
              />
            </div>
            {contact.origin === 'company_acquisition' && (
              <div className="space-y-2">
                <Label htmlFor="preferred_location">Ubicación preferida</Label>
                <Input
                  id="preferred_location"
                  value={formData.preferred_location || ''}
                  onChange={(e) => updateField('preferred_location', e.target.value)}
                  placeholder="Ubicación"
                />
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ContactEditForm;
