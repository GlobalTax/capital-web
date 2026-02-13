import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

vi.mock('@/shared/i18n/I18nProvider', () => ({
  useI18n: () => ({ t: (key: string) => key, lang: 'es', setLang: vi.fn(), managed: false }),
}));

vi.mock('@/utils/phoneUtils', () => ({
  normalizePhoneToE164: (val: string) => val ? `+34${val.replace(/\D/g, '').slice(-9)}` : null,
}));

import BasicInfoForm from '../BasicInfoForm';

const mockCompanyData = {
  contactName: '',
  companyName: '',
  email: '',
  phone: '',
  phone_e164: '',
  cif: '',
  industry: '',
  activityDescription: '',
  location: '',
  employeeRange: '',
  whatsapp_opt_in: false,
};

describe('BasicInfoForm', () => {
  it('renders contact name field', () => {
    const updateField = vi.fn();
    render(<BasicInfoForm companyData={mockCompanyData} updateField={updateField} />);
    expect(screen.getByLabelText('label.contactName')).toBeInTheDocument();
  });

  it('renders company name field', () => {
    render(<BasicInfoForm companyData={mockCompanyData} updateField={vi.fn()} />);
    expect(screen.getByLabelText('label.companyName')).toBeInTheDocument();
  });

  it('renders email field', () => {
    render(<BasicInfoForm companyData={mockCompanyData} updateField={vi.fn()} />);
    expect(screen.getByLabelText('label.email')).toBeInTheDocument();
  });

  it('renders CIF field', () => {
    render(<BasicInfoForm companyData={mockCompanyData} updateField={vi.fn()} />);
    expect(screen.getByLabelText('label.cif')).toBeInTheDocument();
  });

  it('renders industry selector', () => {
    render(<BasicInfoForm companyData={mockCompanyData} updateField={vi.fn()} />);
    expect(screen.getByLabelText('label.industry')).toBeInTheDocument();
  });

  it('renders activity description field', () => {
    render(<BasicInfoForm companyData={mockCompanyData} updateField={vi.fn()} />);
    expect(screen.getByLabelText('label.activityDescription')).toBeInTheDocument();
  });

  it('renders location field', () => {
    render(<BasicInfoForm companyData={mockCompanyData} updateField={vi.fn()} />);
    expect(screen.getByLabelText('label.location')).toBeInTheDocument();
  });

  it('renders employee range selector', () => {
    render(<BasicInfoForm companyData={mockCompanyData} updateField={vi.fn()} />);
    expect(screen.getByLabelText('label.employeeRange')).toBeInTheDocument();
  });

  it('renders WhatsApp checkbox', () => {
    render(<BasicInfoForm companyData={mockCompanyData} updateField={vi.fn()} />);
    expect(screen.getByLabelText('consent.whatsapp_title')).toBeInTheDocument();
  });

  it('calls updateField when typing in contactName', async () => {
    const updateField = vi.fn();
    render(<BasicInfoForm companyData={mockCompanyData} updateField={updateField} />);
    const input = screen.getByLabelText('label.contactName');
    await userEvent.type(input, 'J');
    expect(updateField).toHaveBeenCalledWith('contactName', 'J');
  });

  it('renders form title', () => {
    render(<BasicInfoForm companyData={mockCompanyData} updateField={vi.fn()} />);
    expect(screen.getByText('form.basic.title')).toBeInTheDocument();
  });
});
