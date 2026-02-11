import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

vi.mock('@/shared/i18n/I18nProvider', () => ({
  useI18n: () => ({ t: (key: string) => key, lang: 'es', setLang: vi.fn(), managed: false }),
}));

import FinancialDataForm from '../FinancialDataForm';

const mockCompanyData = {
  revenue: 0,
  ebitda: 0,
  hasAdjustments: false,
  adjustmentAmount: 0,
};

describe('FinancialDataForm', () => {
  it('renders revenue field', () => {
    render(<FinancialDataForm companyData={mockCompanyData} updateField={vi.fn()} />);
    expect(screen.getByLabelText(/form\.revenue/)).toBeInTheDocument();
  });

  it('renders EBITDA field', () => {
    render(<FinancialDataForm companyData={mockCompanyData} updateField={vi.fn()} />);
    expect(screen.getByPlaceholderText('200000')).toBeInTheDocument();
  });

  it('renders adjustments checkbox', () => {
    render(<FinancialDataForm companyData={mockCompanyData} updateField={vi.fn()} />);
    expect(screen.getByLabelText('form.ebitda_adjustments')).toBeInTheDocument();
  });

  it('does not show adjustment amount when hasAdjustments is false', () => {
    render(<FinancialDataForm companyData={mockCompanyData} updateField={vi.fn()} />);
    expect(screen.queryByLabelText('form.adjustment_amount')).not.toBeInTheDocument();
  });

  it('shows adjustment amount when hasAdjustments is true', () => {
    render(<FinancialDataForm companyData={{ ...mockCompanyData, hasAdjustments: true }} updateField={vi.fn()} />);
    expect(screen.getByLabelText('form.adjustment_amount')).toBeInTheDocument();
  });

  it('renders info box with tips', () => {
    render(<FinancialDataForm companyData={mockCompanyData} updateField={vi.fn()} />);
    expect(screen.getByText('help.financial_title')).toBeInTheDocument();
  });

  it('renders form title', () => {
    render(<FinancialDataForm companyData={mockCompanyData} updateField={vi.fn()} />);
    expect(screen.getByText('form.financial_data_title')).toBeInTheDocument();
  });
});
