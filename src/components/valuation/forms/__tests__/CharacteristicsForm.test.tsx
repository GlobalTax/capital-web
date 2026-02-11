import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('@/shared/i18n/I18nProvider', () => ({
  useI18n: () => ({ t: (key: string) => key, lang: 'es', setLang: vi.fn(), managed: false }),
}));

import CharacteristicsForm from '../CharacteristicsForm';

const mockCompanyData = {
  location: '',
  ownershipParticipation: '',
  competitiveAdvantage: '',
};

describe('CharacteristicsForm', () => {
  it('renders location field', () => {
    render(<CharacteristicsForm companyData={mockCompanyData} updateField={vi.fn()} />);
    expect(screen.getByLabelText('label.location')).toBeInTheDocument();
  });

  it('renders ownership participation selector', () => {
    render(<CharacteristicsForm companyData={mockCompanyData} updateField={vi.fn()} />);
    expect(screen.getByLabelText('label.ownership')).toBeInTheDocument();
  });

  it('renders competitive advantage textarea', () => {
    render(<CharacteristicsForm companyData={mockCompanyData} updateField={vi.fn()} />);
    expect(screen.getByLabelText('label.competitive_advantage')).toBeInTheDocument();
  });

  it('renders green info box', () => {
    render(<CharacteristicsForm companyData={mockCompanyData} updateField={vi.fn()} />);
    expect(screen.getByText('help.characteristics_title')).toBeInTheDocument();
  });

  it('renders form title', () => {
    render(<CharacteristicsForm companyData={mockCompanyData} updateField={vi.fn()} />);
    expect(screen.getByText('form.characteristics.title')).toBeInTheDocument();
  });

  it('renders tips in info box', () => {
    const { container } = render(<CharacteristicsForm companyData={mockCompanyData} updateField={vi.fn()} />);
    const listItems = container.querySelectorAll('.bg-green-50 li');
    expect(listItems.length).toBe(3);
  });
});
