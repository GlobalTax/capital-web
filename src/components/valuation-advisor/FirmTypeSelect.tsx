import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useI18n } from '@/shared/i18n/I18nProvider';

interface FirmTypeSelectProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export const FirmTypeSelect: React.FC<FirmTypeSelectProps> = ({ value, onChange, error }) => {
  const { t } = useI18n();

  const firmTypes = [
    { value: 'tax_advisory', label: t('firm_types.tax_advisory') },
    { value: 'accounting_advisory', label: t('firm_types.accounting_advisory') },
    { value: 'legal_advisory', label: t('firm_types.legal_advisory') },
    { value: 'labor_advisory', label: t('firm_types.labor_advisory') },
    { value: 'audit', label: t('firm_types.audit') },
    { value: 'multidisciplinary', label: t('firm_types.multidisciplinary') },
    { value: 'consultancy', label: t('firm_types.consultancy') },
    { value: 'financial_advisory', label: t('firm_types.financial_advisory') },
  ];

  return (
    <div className="space-y-2">
      <Label htmlFor="firmType">{t('form.firm_type')}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id="firmType" className={error ? 'border-destructive' : ''}>
          <SelectValue placeholder={t('placeholder.firm_type')} />
        </SelectTrigger>
        <SelectContent>
          {firmTypes.map((type) => (
            <SelectItem key={type.value} value={type.value}>
              {type.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
};
