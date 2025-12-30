// =============================================
// PASO 1: Datos del Cliente
// =============================================

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ProfessionalValuationData, VALUATION_SECTORS } from '@/types/professionalValuation';
import { User, Building2, Mail, Phone, FileText, Briefcase, ImageIcon, Users, PenTool, Search, CheckCircle2, AlertCircle } from 'lucide-react';
import { LogoUploader } from '../LogoUploader';
import { LogoFinder } from '../LogoFinder';
import { useTeamAdvisors } from '@/hooks/useTeamAdvisors';

const LEAD_SOURCES = [
  'Meta Ads',
  'Google Ads',
  'LinkedIn',
  'Referido',
  'Web orgánico',
  'Email',
  'Evento',
  'Otro',
] as const;

const SERVICE_TYPES = [
  { value: 'vender', label: 'Vender empresa' },
  { value: 'comprar', label: 'Comprar empresa' },
  { value: 'otros', label: 'Otros servicios' },
] as const;

interface ClientDataStepProps {
  data: ProfessionalValuationData;
  updateField: <K extends keyof ProfessionalValuationData>(
    field: K,
    value: ProfessionalValuationData[K]
  ) => void;
}

export function ClientDataStep({ data, updateField }: ClientDataStepProps) {
  const { data: teamAdvisors = [] } = useTeamAdvisors();

  // Validación de email
  const isValidEmail = (email: string): boolean => {
    if (!email) return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const emailValue = data.clientEmail || '';
  const showEmailValidation = emailValue.length > 0;
  const emailIsValid = isValidEmail(emailValue);

  const handleAdvisorSelect = (value: string) => {
    if (value === 'custom') {
      updateField('advisorName', '');
      updateField('advisorEmail', '');
      updateField('advisorPhone', '');
    } else {
      const advisor = teamAdvisors.find((a) => a.id === value);
      if (advisor) {
        updateField('advisorName', advisor.name);
        updateField('advisorEmail', advisor.email);
        updateField('advisorPhone', advisor.phone || '');
      }
    }
  };

  // Encontrar el asesor seleccionado actual
  const selectedAdvisorId = teamAdvisors.find(
    (a) => a.name === data.advisorName && a.email === data.advisorEmail
  )?.id;

  return (
    <div className="space-y-6">
      {/* Datos de contacto */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="clientName" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            Nombre del contacto *
          </Label>
          <Input
            id="clientName"
            value={data.clientName}
            onChange={(e) => updateField('clientName', e.target.value)}
            placeholder="Nombre completo"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="clientCompany" className="flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            Nombre de la empresa *
          </Label>
          <Input
            id="clientCompany"
            value={data.clientCompany}
            onChange={(e) => updateField('clientCompany', e.target.value)}
            placeholder="Razón social"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="clientEmail" className="flex items-center gap-2">
            <Mail className="w-4 h-4" />
            Email
          </Label>
          <div className="relative">
            <Input
              id="clientEmail"
              type="email"
              value={data.clientEmail || ''}
              onChange={(e) => updateField('clientEmail', e.target.value)}
              placeholder="email@empresa.com"
              className={showEmailValidation ? (
                emailIsValid 
                  ? 'pr-10 border-green-500 focus-visible:ring-green-500' 
                  : 'pr-10 border-amber-500 focus-visible:ring-amber-500'
              ) : ''}
            />
            {showEmailValidation && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {emailIsValid ? (
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-amber-500" />
                )}
              </div>
            )}
          </div>
          {showEmailValidation && !emailIsValid && (
            <p className="text-xs text-amber-600">
              Introduce un email válido para poder enviar la valoración
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="clientPhone" className="flex items-center gap-2">
            <Phone className="w-4 h-4" />
            Teléfono
          </Label>
          <Input
            id="clientPhone"
            type="tel"
            value={data.clientPhone || ''}
            onChange={(e) => updateField('clientPhone', e.target.value)}
            placeholder="+34 600 000 000"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="clientCif" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            CIF
          </Label>
          <Input
            id="clientCif"
            value={data.clientCif || ''}
            onChange={(e) => updateField('clientCif', e.target.value.toUpperCase())}
            placeholder="B12345678"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="sector" className="flex items-center gap-2">
            <Briefcase className="w-4 h-4" />
            Sector *
          </Label>
          <Select
            value={data.sector}
            onValueChange={(value) => updateField('sector', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar sector" />
            </SelectTrigger>
            <SelectContent>
              {VALUATION_SECTORS.map((sector) => (
                <SelectItem key={sector} value={sector}>
                  {sector}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Descripción del sector (si es "Otro") */}
      {data.sector === 'Otro' && (
        <div className="space-y-2">
          <Label htmlFor="sectorDescription">Descripción del sector</Label>
          <Input
            id="sectorDescription"
            value={data.sectorDescription || ''}
            onChange={(e) => updateField('sectorDescription', e.target.value)}
            placeholder="Describe el sector de actividad"
          />
        </div>
      )}

      {/* Logo del cliente (opcional) */}
      <div className="space-y-4">
        <Label className="flex items-center gap-2">
          <ImageIcon className="w-4 h-4" />
          Logo del cliente (opcional)
        </Label>
        <LogoUploader
          currentLogoUrl={data.clientLogoUrl || undefined}
          onLogoChange={(url) => updateField('clientLogoUrl', url || '')}
        />
        <div className="border-t pt-4">
          <Label className="flex items-center gap-2 mb-2 text-sm text-muted-foreground">
            <Search className="w-4 h-4" />
            O buscar automáticamente
          </Label>
          <LogoFinder
            companyName={data.clientCompany}
            cif={data.clientCif}
            onLogoFound={(url) => updateField('clientLogoUrl', url)}
          />
        </div>
      </div>

      {/* Contexto de la valoración */}
      <div className="space-y-2">
        <Label htmlFor="valuationContext">Contexto de la valoración</Label>
        <Textarea
          id="valuationContext"
          value={data.valuationContext || ''}
          onChange={(e) => updateField('valuationContext', e.target.value)}
          placeholder="Describe el motivo de la valoración (venta, financiación, planificación sucesoria...)"
          rows={3}
        />
      </div>

      {/* Sincronización con CRM */}
      <div className="border-t pt-6 mt-6 space-y-4">
        <div className="flex items-center gap-2 text-muted-foreground mb-2">
          <Users className="w-4 h-4" />
          <span className="text-sm font-medium">Sincronización con CRM</span>
        </div>

        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
          <div className="space-y-0.5">
            <Label htmlFor="syncToContacts" className="text-base">
              Añadir a Contactos
            </Label>
            <p className="text-sm text-muted-foreground">
              Crea automáticamente un contacto en el CRM con estos datos
            </p>
          </div>
          <Switch
            id="syncToContacts"
            checked={data.syncToContacts ?? true}
            onCheckedChange={(checked) => updateField('syncToContacts', checked)}
          />
        </div>

        {(data.syncToContacts ?? true) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-4 border-l-2 border-primary/20">
            <div className="space-y-2">
              <Label htmlFor="serviceType">Tipo de servicio</Label>
              <Select
                value={data.serviceType || 'vender'}
                onValueChange={(value) => updateField('serviceType', value as 'vender' | 'comprar' | 'otros')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar tipo" />
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
              <Label htmlFor="leadSource">Origen del lead</Label>
              <Select
                value={data.leadSource || 'Meta Ads'}
                onValueChange={(value) => updateField('leadSource', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar origen" />
                </SelectTrigger>
                <SelectContent>
                  {LEAD_SOURCES.map((source) => (
                    <SelectItem key={source} value={source}>
                      {source}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </div>

      {/* Firma del Informe */}
      <div className="border-t pt-6 mt-6 space-y-4">
        <div className="flex items-center gap-2 text-muted-foreground mb-2">
          <PenTool className="w-4 h-4" />
          <span className="text-sm font-medium">Firma del Informe</span>
        </div>

        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
          <div className="space-y-0.5">
            <Label htmlFor="useCustomAdvisor" className="text-base">
              Usar firma personalizada
            </Label>
            <p className="text-sm text-muted-foreground">
              Por defecto: Equipo Capittal
            </p>
          </div>
          <Switch
            id="useCustomAdvisor"
            checked={data.useCustomAdvisor ?? false}
            onCheckedChange={(checked) => {
              updateField('useCustomAdvisor', checked);
              if (!checked) {
                updateField('advisorName', undefined);
                updateField('advisorEmail', undefined);
                updateField('advisorRole', undefined);
              }
            }}
          />
        </div>

        {data.useCustomAdvisor && (
          <div className="space-y-4 pl-4 border-l-2 border-primary/20">
            <div className="space-y-2">
              <Label htmlFor="advisorSelect">Seleccionar asesor</Label>
              <Select
                value={selectedAdvisorId || (data.advisorName ? 'custom' : '')}
                onValueChange={handleAdvisorSelect}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar asesor del equipo" />
                </SelectTrigger>
                <SelectContent>
                  {teamAdvisors.map((advisor) => (
                    <SelectItem key={advisor.id} value={advisor.id}>
                      {advisor.name}
                    </SelectItem>
                  ))}
                  <SelectItem value="custom">Personalizado...</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="advisorName">Nombre del asesor *</Label>
                <Input
                  id="advisorName"
                  value={data.advisorName || ''}
                  onChange={(e) => updateField('advisorName', e.target.value)}
                  placeholder="Nombre completo"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="advisorEmail">Email del asesor</Label>
                <Input
                  id="advisorEmail"
                  type="email"
                  value={data.advisorEmail || ''}
                  onChange={(e) => updateField('advisorEmail', e.target.value)}
                  placeholder="email@capittal.es"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="advisorPhone">Teléfono del asesor</Label>
                <Input
                  id="advisorPhone"
                  type="tel"
                  value={data.advisorPhone || ''}
                  onChange={(e) => updateField('advisorPhone', e.target.value)}
                  placeholder="+34 600 000 000"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="advisorRole">Cargo</Label>
              <Input
                id="advisorRole"
                value={data.advisorRole || ''}
                onChange={(e) => updateField('advisorRole', e.target.value)}
                placeholder="Consultor de M&A"
              />
              <p className="text-xs text-muted-foreground">
                Si se deja vacío, se usará "Consultor de M&A"
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
