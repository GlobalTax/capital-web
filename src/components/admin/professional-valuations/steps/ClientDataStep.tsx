// =============================================
// PASO 1: Datos del Cliente
// =============================================

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
import { ProfessionalValuationData, VALUATION_SECTORS } from '@/types/professionalValuation';
import { User, Building2, Mail, Phone, FileText, Briefcase, ImageIcon } from 'lucide-react';
import { LogoUploader } from '../LogoUploader';

interface ClientDataStepProps {
  data: ProfessionalValuationData;
  updateField: <K extends keyof ProfessionalValuationData>(
    field: K,
    value: ProfessionalValuationData[K]
  ) => void;
}

export function ClientDataStep({ data, updateField }: ClientDataStepProps) {
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
          <Input
            id="clientEmail"
            type="email"
            value={data.clientEmail || ''}
            onChange={(e) => updateField('clientEmail', e.target.value)}
            placeholder="email@empresa.com"
          />
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
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <ImageIcon className="w-4 h-4" />
          Logo del cliente (opcional)
        </Label>
        <LogoUploader
          currentLogoUrl={data.clientLogoUrl || undefined}
          onLogoChange={(url) => updateField('clientLogoUrl', url || '')}
        />
        <p className="text-xs text-muted-foreground">
          El logo aparecerá en la portada del PDF
        </p>
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
    </div>
  );
}
