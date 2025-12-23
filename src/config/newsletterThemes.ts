// Newsletter Theme System - 4 predefined themes

export interface NewsletterTheme {
  id: string;
  name: string;
  description: string;
  preview: string;
  colors: {
    primary: string;
    primaryText: string;
    secondary: string;
    secondaryText: string;
    background: string;
    surface: string;
    text: string;
    textMuted: string;
    border: string;
    accent: string;
  };
  fonts: {
    heading: string;
    body: string;
  };
}

export const newsletterThemes: NewsletterTheme[] = [
  {
    id: 'capittal-classic',
    name: 'Capittal Classic',
    description: 'Elegante y profesional con tonos azules corporativos',
    preview: 'linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%)',
    colors: {
      primary: '#1e3a5f',
      primaryText: '#ffffff',
      secondary: '#2563eb',
      secondaryText: '#ffffff',
      background: '#f8fafc',
      surface: '#ffffff',
      text: '#1e293b',
      textMuted: '#64748b',
      border: '#e2e8f0',
      accent: '#3b82f6',
    },
    fonts: {
      heading: 'Georgia, serif',
      body: 'Arial, Helvetica, sans-serif',
    },
  },
  {
    id: 'dark-professional',
    name: 'Dark Professional',
    description: 'Moderno y sofisticado con fondo oscuro',
    preview: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
    colors: {
      primary: '#0f172a',
      primaryText: '#f8fafc',
      secondary: '#6366f1',
      secondaryText: '#ffffff',
      background: '#1e293b',
      surface: '#0f172a',
      text: '#f1f5f9',
      textMuted: '#94a3b8',
      border: '#334155',
      accent: '#818cf8',
    },
    fonts: {
      heading: 'Arial Black, sans-serif',
      body: 'Arial, Helvetica, sans-serif',
    },
  },
  {
    id: 'vibrant-modern',
    name: 'Vibrant Modern',
    description: 'Colorido y dinámico con gradientes llamativos',
    preview: 'linear-gradient(135deg, #7c3aed 0%, #ec4899 100%)',
    colors: {
      primary: '#7c3aed',
      primaryText: '#ffffff',
      secondary: '#ec4899',
      secondaryText: '#ffffff',
      background: '#faf5ff',
      surface: '#ffffff',
      text: '#1e1b4b',
      textMuted: '#6b7280',
      border: '#e9d5ff',
      accent: '#a855f7',
    },
    fonts: {
      heading: 'Trebuchet MS, sans-serif',
      body: 'Verdana, sans-serif',
    },
  },
  {
    id: 'minimal-clean',
    name: 'Minimal Clean',
    description: 'Minimalista con mucho espacio en blanco',
    preview: 'linear-gradient(135deg, #ffffff 0%, #f3f4f6 100%)',
    colors: {
      primary: '#111827',
      primaryText: '#ffffff',
      secondary: '#6b7280',
      secondaryText: '#ffffff',
      background: '#ffffff',
      surface: '#f9fafb',
      text: '#111827',
      textMuted: '#9ca3af',
      border: '#e5e7eb',
      accent: '#374151',
    },
    fonts: {
      heading: 'Helvetica Neue, Helvetica, Arial, sans-serif',
      body: 'Helvetica, Arial, sans-serif',
    },
  },
];

export const getThemeById = (id: string): NewsletterTheme => {
  return newsletterThemes.find(t => t.id === id) || newsletterThemes[0];
};

export const getThemeCSS = (theme: NewsletterTheme): string => {
  return `
    --nl-primary: ${theme.colors.primary};
    --nl-primary-text: ${theme.colors.primaryText};
    --nl-secondary: ${theme.colors.secondary};
    --nl-secondary-text: ${theme.colors.secondaryText};
    --nl-background: ${theme.colors.background};
    --nl-surface: ${theme.colors.surface};
    --nl-text: ${theme.colors.text};
    --nl-text-muted: ${theme.colors.textMuted};
    --nl-border: ${theme.colors.border};
    --nl-accent: ${theme.colors.accent};
    --nl-font-heading: ${theme.fonts.heading};
    --nl-font-body: ${theme.fonts.body};
  `;
};

// Header variants
export interface HeaderVariant {
  id: string;
  name: string;
  description: string;
}

export const headerVariants: HeaderVariant[] = [
  { id: 'centered', name: 'Centrado', description: 'Logo centrado con línea inferior' },
  { id: 'left-aligned', name: 'Alineado Izquierda', description: 'Logo a la izquierda' },
  { id: 'minimal', name: 'Mínimo', description: 'Solo texto, sin logo' },
  { id: 'no-header', name: 'Sin Header', description: 'Iniciar directamente con contenido' },
];

// Footer variants
export interface FooterVariant {
  id: string;
  name: string;
  description: string;
}

export const footerVariants: FooterVariant[] = [
  { id: 'complete', name: 'Completo', description: 'Redes sociales + legal + unsubscribe' },
  { id: 'minimal', name: 'Mínimo', description: 'Solo unsubscribe y legal básico' },
  { id: 'legal-only', name: 'Solo Legal', description: 'Solo información legal requerida' },
  { id: 'social-only', name: 'Solo Redes', description: 'Redes sociales sin texto legal extenso' },
];
