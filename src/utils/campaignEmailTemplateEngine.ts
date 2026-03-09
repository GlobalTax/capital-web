import { CampaignCompany } from '@/hooks/useCampaignCompanies';
import { ValuationCampaign } from '@/hooks/useCampaigns';
import { formatCurrencyEUR } from '@/utils/professionalValuationCalculation';

export interface TemplateVariable {
  key: string;
  label: string;
  category: string;
}

const VARIABLE_DEFINITIONS: TemplateVariable[] = [
  { key: 'first_name', label: 'Nombre', category: 'Contacto' },
  { key: 'last_name', label: 'Apellido', category: 'Contacto' },
  { key: 'company', label: 'Empresa', category: 'Contacto' },
  { key: 'cargo', label: 'Cargo', category: 'Contacto' },
  { key: 'sector', label: 'Sector', category: 'Valoración' },
  { key: 'valoracion_min', label: 'Valoración mín.', category: 'Valoración' },
  { key: 'valoracion_max', label: 'Valoración máx.', category: 'Valoración' },
];

type VariableResolver = (company: CampaignCompany, campaign: ValuationCampaign) => string;

const RESOLVERS: Record<string, VariableResolver> = {
  first_name: (c) => c.client_name?.split(' ')[0] || '',
  last_name: (c) => c.client_name?.split(' ').slice(1).join(' ') || '',
  company: (c) => c.client_company || '',
  cargo: () => '',
  sector: (_, camp) => camp.sector || '',
  valoracion_min: (c) => formatCurrencyEUR(c.valuation_low || 0),
  valoracion_max: (c) => formatCurrencyEUR(c.valuation_high || 0),
  firmante_nombre: (_, camp) => camp.advisor_name || '',
  firmante_cargo: (_, camp) => camp.advisor_role || '',
  firmante_email: (_, camp) => camp.advisor_email || '',
  firmante_telefono: (_, camp) => camp.advisor_phone || '',
};

export function getAvailableVariables(): TemplateVariable[] {
  return VARIABLE_DEFINITIONS;
}

export function replaceVariables(
  template: string,
  company: CampaignCompany,
  campaign: ValuationCampaign
): string {
  if (!template) return '';
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    const resolver = RESOLVERS[key];
    if (!resolver) return match;
    return resolver(company, campaign);
  });
}
