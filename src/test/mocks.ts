import { vi } from 'vitest';

// ============= useI18n mock =============
export const mockT = (key: string) => key;
export const mockUseI18n = () => ({
  lang: 'es' as const,
  setLang: vi.fn(),
  t: mockT,
  managed: false,
});

// ============= Supabase client mock =============
export const mockSupabaseClient = {
  from: vi.fn(() => ({
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: null, error: null }),
    maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
    order: vi.fn().mockResolvedValue({ data: [], error: null }),
  })),
  auth: {
    getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
    getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
  },
};

// ============= react-router-dom mock =============
export const mockNavigate = vi.fn();
export const mockUseNavigate = () => mockNavigate;

// ============= Setup common mocks =============
export function setupCommonMocks() {
  vi.mock('@/shared/i18n/I18nProvider', () => ({
    useI18n: () => mockUseI18n(),
  }));

  vi.mock('@/integrations/supabase/client', () => ({
    supabase: mockSupabaseClient,
  }));

  vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
      ...actual,
      useNavigate: () => mockNavigate,
    };
  });
}
