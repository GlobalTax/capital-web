import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowRight, ArrowLeft, Shield, Eye, Monitor, Flame, ShieldCheck, Layers, Bell } from 'lucide-react';
import { SUBSECTOR_CONFIGS, type SubsectorConfig } from './subsectorFields';
import type { SecuritySubsector, SecurityInputData } from '@/utils/securityValuation';

const ICON_MAP: Record<string, React.ElementType> = {
  Bell, Eye, Monitor, Flame, ShieldCheck, Layers, Shield,
};

interface SecuritySimulatorFormProps {
  onSubmit: (data: SecurityInputData & { contactName: string; contactEmail: string; contactCompany: string; contactPhone?: string }) => void;
  isSubmitting?: boolean;
}

type Step = 'subsector' | 'metrics' | 'contact';

const SecuritySimulatorForm: React.FC<SecuritySimulatorFormProps> = ({ onSubmit, isSubmitting }) => {
  const [step, setStep] = useState<Step>('subsector');
  const [selectedSubsector, setSelectedSubsector] = useState<SecuritySubsector | null>(null);
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [licenses, setLicenses] = useState({ hasSecurityLicense: false, hasCRALicense: false, hasFireLicense: false });
  const [contact, setContact] = useState({ name: '', email: '', company: '', phone: '' });

  const selectedConfig = SUBSECTOR_CONFIGS.find(s => s.id === selectedSubsector);

  const handleFieldChange = (id: string, value: string) => {
    // Only allow numbers and dots
    const cleaned = value.replace(/[^0-9.]/g, '');
    setFormValues(prev => ({ ...prev, [id]: cleaned }));
  };

  const canProceedToMetrics = selectedSubsector !== null;
  const canProceedToContact = selectedConfig?.fields
    .filter(f => f.required)
    .every(f => formValues[f.id] && parseFloat(formValues[f.id]) > 0) ?? false;
  const canSubmit = contact.name.trim() && contact.email.trim() && contact.company.trim();

  const handleSubmit = () => {
    if (!selectedSubsector || !selectedConfig) return;

    const data: SecurityInputData = {
      subsector: selectedSubsector,
      annualRevenue: parseFloat(formValues.annualRevenue || '0'),
      ebitda: parseFloat(formValues.ebitda || '0'),
      employeeCount: parseInt(formValues.employeeCount || '0'),
      craConnections: formValues.craConnections ? parseInt(formValues.craConnections) : undefined,
      contractsOver24Months: formValues.contractsOver24Months ? parseFloat(formValues.contractsOver24Months) : undefined,
      churnRate: formValues.churnRate ? parseFloat(formValues.churnRate) : undefined,
      topClientConcentration: formValues.topClientConcentration ? parseFloat(formValues.topClientConcentration) : undefined,
      publicContracts: formValues.publicContracts ? parseFloat(formValues.publicContracts) : undefined,
      maintenanceMRR: formValues.maintenanceMRR ? parseFloat(formValues.maintenanceMRR) : undefined,
      installationBacklog: formValues.installationBacklog ? parseFloat(formValues.installationBacklog) : undefined,
      revenueGrowthRate: formValues.revenueGrowthRate ? parseFloat(formValues.revenueGrowthRate) : undefined,
      ...licenses,
    };

    onSubmit({
      ...data,
      contactName: contact.name,
      contactEmail: contact.email,
      contactCompany: contact.company,
      contactPhone: contact.phone || undefined,
    });
  };

  // --- Step 1: Subsector selection ---
  if (step === 'subsector') {
    return (
      <Card className="p-6 md:p-8 border border-border">
        <div className="mb-6">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground mb-2">
            <span className="w-6 h-6 rounded-full bg-foreground text-background flex items-center justify-center text-xs">1</span>
            <span>Paso 1 de 3</span>
          </div>
          <h2 className="text-2xl font-bold text-foreground">¿Qué tipo de empresa de seguridad es?</h2>
          <p className="text-muted-foreground mt-1">Selecciona el subsector principal para ajustar los parámetros de valoración.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {SUBSECTOR_CONFIGS.map((sub) => {
            const IconComp = ICON_MAP[sub.icon] || Shield;
            const isSelected = selectedSubsector === sub.id;
            return (
              <button
                key={sub.id}
                type="button"
                onClick={() => setSelectedSubsector(sub.id)}
                className={`text-left p-5 rounded-xl border-2 transition-all ${
                  isSelected
                    ? 'border-foreground bg-muted/50 shadow-sm'
                    : 'border-border hover:border-muted-foreground/40'
                }`}
              >
                <IconComp className={`w-6 h-6 mb-3 ${isSelected ? 'text-foreground' : 'text-muted-foreground'}`} />
                <h3 className="font-semibold text-foreground text-sm">{sub.label}</h3>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{sub.description}</p>
              </button>
            );
          })}
        </div>

        <div className="flex justify-end mt-8">
          <Button
            onClick={() => setStep('metrics')}
            disabled={!canProceedToMetrics}
            className="bg-foreground text-background hover:bg-foreground/90"
          >
            Siguiente
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </Card>
    );
  }

  // --- Step 2: Metrics ---
  if (step === 'metrics' && selectedConfig) {
    return (
      <Card className="p-6 md:p-8 border border-border">
        <div className="mb-6">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground mb-2">
            <span className="w-6 h-6 rounded-full bg-foreground text-background flex items-center justify-center text-xs">2</span>
            <span>Paso 2 de 3 · {selectedConfig.label}</span>
          </div>
          <h2 className="text-2xl font-bold text-foreground">Datos clave de tu empresa</h2>
          <p className="text-muted-foreground mt-1">Introduce las métricas financieras y operativas para calcular la valoración.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {selectedConfig.fields.map((field) => (
            <div key={field.id}>
              <Label htmlFor={field.id} className="text-sm font-medium text-foreground">
                {field.label} {field.required && <span className="text-destructive">*</span>}
              </Label>
              <Input
                id={field.id}
                type="text"
                inputMode="decimal"
                placeholder={field.placeholder}
                value={formValues[field.id] || ''}
                onChange={(e) => handleFieldChange(field.id, e.target.value)}
                className="mt-1.5"
              />
              {field.helpText && (
                <p className="text-xs text-muted-foreground mt-1">{field.helpText}</p>
              )}
            </div>
          ))}
        </div>

        {/* Licenses */}
        <div className="mt-8 pt-6 border-t border-border">
          <h3 className="text-sm font-semibold text-foreground mb-4">Licencias y certificaciones</h3>
          <div className="flex flex-wrap gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox
                checked={licenses.hasSecurityLicense}
                onCheckedChange={(v) => setLicenses(l => ({ ...l, hasSecurityLicense: !!v }))}
              />
              <span className="text-sm text-foreground">Licencia seguridad privada</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox
                checked={licenses.hasCRALicense}
                onCheckedChange={(v) => setLicenses(l => ({ ...l, hasCRALicense: !!v }))}
              />
              <span className="text-sm text-foreground">Licencia CRA</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox
                checked={licenses.hasFireLicense}
                onCheckedChange={(v) => setLicenses(l => ({ ...l, hasFireLicense: !!v }))}
              />
              <span className="text-sm text-foreground">Habilitación contra incendios</span>
            </label>
          </div>
        </div>

        <div className="flex justify-between mt-8">
          <Button variant="outline" onClick={() => setStep('subsector')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Anterior
          </Button>
          <Button
            onClick={() => setStep('contact')}
            disabled={!canProceedToContact}
            className="bg-foreground text-background hover:bg-foreground/90"
          >
            Siguiente
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </Card>
    );
  }

  // --- Step 3: Contact ---
  return (
    <Card className="p-6 md:p-8 border border-border">
      <div className="mb-6">
        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground mb-2">
          <span className="w-6 h-6 rounded-full bg-foreground text-background flex items-center justify-center text-xs">3</span>
          <span>Paso 3 de 3</span>
        </div>
        <h2 className="text-2xl font-bold text-foreground">Datos de contacto</h2>
        <p className="text-muted-foreground mt-1">Información necesaria para enviarte el informe de valoración.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <Label htmlFor="contact-name" className="text-sm font-medium">Nombre completo <span className="text-destructive">*</span></Label>
          <Input
            id="contact-name"
            value={contact.name}
            onChange={(e) => setContact(c => ({ ...c, name: e.target.value }))}
            placeholder="Tu nombre"
            className="mt-1.5"
          />
        </div>
        <div>
          <Label htmlFor="contact-email" className="text-sm font-medium">Email profesional <span className="text-destructive">*</span></Label>
          <Input
            id="contact-email"
            type="email"
            value={contact.email}
            onChange={(e) => setContact(c => ({ ...c, email: e.target.value }))}
            placeholder="tu@empresa.com"
            className="mt-1.5"
          />
        </div>
        <div>
          <Label htmlFor="contact-company" className="text-sm font-medium">Empresa <span className="text-destructive">*</span></Label>
          <Input
            id="contact-company"
            value={contact.company}
            onChange={(e) => setContact(c => ({ ...c, company: e.target.value }))}
            placeholder="Nombre de tu empresa"
            className="mt-1.5"
          />
        </div>
        <div>
          <Label htmlFor="contact-phone" className="text-sm font-medium">Teléfono</Label>
          <Input
            id="contact-phone"
            type="tel"
            value={contact.phone}
            onChange={(e) => setContact(c => ({ ...c, phone: e.target.value }))}
            placeholder="+34 600 000 000"
            className="mt-1.5"
          />
        </div>
      </div>

      <p className="text-xs text-muted-foreground mt-6">
        Al enviar este formulario aceptas nuestra política de privacidad. Tus datos serán tratados de forma confidencial 
        y solo se utilizarán para enviarte el resultado de la simulación.
      </p>

      <div className="flex justify-between mt-8">
        <Button variant="outline" onClick={() => setStep('metrics')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Anterior
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={!canSubmit || isSubmitting}
          className="bg-foreground text-background hover:bg-foreground/90"
        >
          {isSubmitting ? 'Calculando...' : 'Obtener valoración'}
          {!isSubmitting && <ArrowRight className="w-4 h-4 ml-2" />}
        </Button>
      </div>
    </Card>
  );
};

export default SecuritySimulatorForm;
