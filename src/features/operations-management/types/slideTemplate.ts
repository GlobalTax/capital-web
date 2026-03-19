// ─── SLIDE TEMPLATE TYPES ───

export type TextAlign = 'left' | 'center' | 'right';
export type TextValign = 'top' | 'middle' | 'bottom';

export interface BlockConfig {
  x: number;
  y: number;
  w: number;
  h: number;
  fontSize?: number;
  color?: string;
  bold?: boolean;
  italic?: boolean;
  visible: boolean;
  align?: TextAlign;
  valign?: TextValign;
  lineSpacing?: number;
  bgColor?: string;
  rectRadius?: number;
}

// ─── OPERATION SLIDE (existing) ───

export interface SlideTemplate {
  title: BlockConfig;
  description: BlockConfig;
  highlights: BlockConfig;
  summaryCard: BlockConfig;
  summaryHeader: BlockConfig;
  infoRows: BlockConfig;
  financialData: BlockConfig;
  cta: BlockConfig & { text?: string };
  footer: BlockConfig & { text?: string };
}

export type SlideBlockKey = keyof SlideTemplate;

export const BLOCK_LABELS: Record<SlideBlockKey, string> = {
  title: 'Título (Empresa)',
  description: 'Descripción',
  highlights: 'Aspectos Destacados',
  summaryCard: 'Tarjeta Resumen',
  summaryHeader: 'Header Resumen',
  infoRows: 'Info (Ubicación/Sector)',
  financialData: 'Datos Clave',
  cta: 'CTA "Más Información"',
  footer: 'Footer Confidencial',
};

export const BLOCK_COLORS: Record<SlideBlockKey, string> = {
  title: '#3b82f6',
  description: '#8b5cf6',
  highlights: '#f59e0b',
  summaryCard: '#161B22',
  summaryHeader: '#10b981',
  infoRows: '#06b6d4',
  financialData: '#ef4444',
  cta: '#ec4899',
  footer: '#6b7280',
};

// ─── COVER SLIDE ───

export interface CoverTemplate {
  background: { color: string };
  logo: BlockConfig & { imageUrl?: string };
  title: BlockConfig & { text?: string };
  subtitle: BlockConfig & { text?: string };
  quarter: BlockConfig;
  divider: BlockConfig;
  footer: BlockConfig & { text?: string };
  yearBlock?: BlockConfig;
  branding?: BlockConfig & { text?: string };
}

export type CoverBlockKey = keyof CoverTemplate;

export const COVER_BLOCK_LABELS: Record<string, string> = {
  background: 'Fondo',
  logo: 'Logo',
  title: 'Título Principal',
  subtitle: 'Subtítulo',
  quarter: 'Trimestre',
  divider: 'Línea Separadora',
  footer: 'Footer',
  yearBlock: 'Año (grande)',
  branding: 'Branding texto',
};

export const COVER_BLOCK_COLORS: Record<string, string> = {
  background: '#374151',
  logo: '#10b981',
  title: '#3b82f6',
  subtitle: '#8b5cf6',
  quarter: '#f59e0b',
  divider: '#6b7280',
  footer: '#6b7280',
  yearBlock: '#ef4444',
  branding: '#06b6d4',
};

// ─── INDEX SLIDE ───

export interface IndexTemplate {
  background: { color: string };
  title: BlockConfig;
  introText?: BlockConfig & { text?: string };
  cardsStartX: number;
  cardsStartY: number;
  cardW: number;
  cardH: number;
  cardGap: number;
  cardBgColor: string;
  cardRadius: number;
  sectionColors: [string, string, string, string];
}

export type IndexBlockKey = 'background' | 'title' | 'introText';

export const INDEX_BLOCK_LABELS: Record<IndexBlockKey, string> = {
  background: 'Fondo',
  title: 'Título',
  introText: 'Texto introductorio',
};

export const INDEX_BLOCK_COLORS: Record<IndexBlockKey, string> = {
  background: '#374151',
  title: '#3b82f6',
  introText: '#8b5cf6',
};

// ─── SEPARATOR SLIDE ───

export interface SeparatorTemplate {
  background: { color: string };
  number: BlockConfig;
  title: BlockConfig;
  subtitle: BlockConfig;
  accentColor: string;
  branding?: BlockConfig & { text?: string };
}

export type SeparatorBlockKey = keyof Omit<SeparatorTemplate, 'accentColor'>;

export const SEPARATOR_BLOCK_LABELS: Record<string, string> = {
  background: 'Fondo',
  number: 'Número',
  title: 'Título',
  subtitle: 'Subtítulo',
  branding: 'Branding texto',
};

export const SEPARATOR_BLOCK_COLORS: Record<string, string> = {
  background: '#374151',
  number: '#2563eb',
  title: '#3b82f6',
  subtitle: '#6b7280',
  branding: '#06b6d4',
};

// ─── CLOSING SLIDE ───

export interface ClosingTemplate {
  background: { color: string };
  logo?: BlockConfig & { imageUrl?: string };
  thanksText?: BlockConfig & { text?: string };
  email?: BlockConfig & { text?: string };
  docTitle?: BlockConfig;
  bottomBgColor?: string;
}

// ─── FULL TEMPLATE ───

export interface FullSlideTemplate {
  cover: CoverTemplate;
  index: IndexTemplate;
  separator: SeparatorTemplate;
  operation: SlideTemplate;
  closing?: ClosingTemplate;
}

export type SlideType = keyof FullSlideTemplate;

// ─── DEFAULTS ───

export const DEFAULT_COVER_TEMPLATE: CoverTemplate = {
  background: { color: '161B22' },
  logo: {
    x: 9.5, y: 0.4, w: 3.23, h: 1.0,
    visible: true, // logo image top-right per template
    imageUrl: '',
  },
  yearBlock: {
    x: 0.6, y: 0.4, w: 4, h: 1.2,
    fontSize: 80, color: 'FFFFFF', bold: true, visible: true,
  },
  branding: {
    x: 9.5, y: 1.4, w: 3.23, h: 0.4,
    fontSize: 12, color: '8B919B', bold: false, visible: true,
    text: 'M&A · Consulting',
    align: 'right',
  },
  title: {
    x: 0.6, y: 4.8, w: 12.13, h: 1,
    fontSize: 44, color: 'FFFFFF', bold: true, visible: true,
    text: 'Capittal Dealhub — Open Deals',
  },
  subtitle: {
    x: 0.6, y: 5.7, w: 12.13, h: 0.7,
    fontSize: 16, color: '8B919B', bold: false, visible: true,
    text: 'Relación de Oportunidades de Inversión',
  },
  quarter: {
    x: 0.6, y: 6.4, w: 3, h: 0.5,
    fontSize: 14, color: '8B919B', visible: true,
  },
  divider: {
    x: 0.6, y: 6.7, w: 12.13, h: 0.02,
    visible: false, bgColor: '8B919B',
  },
  footer: {
    x: 0.6, y: 6.9, w: 12.13, h: 0.4,
    fontSize: 9, color: '8B919B', visible: false,
    text: 'CAPITTAL — Información Confidencial',
  },
};

export const DEFAULT_INDEX_TEMPLATE: IndexTemplate = {
  background: { color: 'FFFFFF' },
  title: {
    x: 0.6, y: 0.5, w: 12.13, h: 0.8,
    fontSize: 28, color: '161B22', bold: true, visible: true,
  },
  introText: {
    x: 0.6, y: 1.3, w: 10, h: 1.2,
    fontSize: 11, color: '58606E', visible: true,
    text: 'Apreciado lector,\n\nA continuación presentamos nuestra selección de oportunidades de inversión vigentes, organizadas por tipología de mandato. Cada operación incluye un resumen ejecutivo con los datos financieros más relevantes.',
  },
  cardsStartX: 1.265,
  cardsStartY: 3.2,
  cardW: 2.8,
  cardH: 2.2,
  cardGap: 0.3,
  cardBgColor: 'F3F4F5',
  cardRadius: 0.1,
  sectionColors: ['2563EB', '7C3AED', 'EA580C', '059669'],
};

export const DEFAULT_SEPARATOR_TEMPLATE: SeparatorTemplate = {
  background: { color: '161B22' },
  number: {
    x: 0.6, y: 0.4, w: 3, h: 1.8,
    fontSize: 120, color: '2563EB', bold: true, visible: true,
  },
  branding: {
    x: 9.5, y: 0.5, w: 3.23, h: 0.6,
    fontSize: 14, color: '8B919B', bold: false, visible: true,
    text: 'Capittal M&A · Consulting',
    align: 'right',
  },
  title: {
    x: 0.6, y: 5.0, w: 12.13, h: 0.8,
    fontSize: 36, color: 'FFFFFF', bold: true, visible: true,
  },
  subtitle: {
    x: 0.6, y: 5.8, w: 12.13, h: 0.5,
    fontSize: 14, color: '8B919B', visible: true,
  },
  accentColor: '2563EB',
};

// Matches current hardcoded values from generateDealhubPptx.ts
export const DEFAULT_SLIDE_TEMPLATE: SlideTemplate = {
  title: {
    x: 0.6, y: 0.4, w: 6.7, h: 0.8,
    fontSize: 26, color: '161B22', bold: true, visible: true,
  },
  description: {
    x: 0.6, y: 1.3, w: 6.7, h: 2.8,
    fontSize: 11, color: '58606E', bold: false, visible: true,
    lineSpacing: 1.4, valign: 'top',
  },
  highlights: {
    x: 0.6, y: 5.2, w: 6.7, h: 1.55,
    fontSize: 11, color: '161B22', bold: true, visible: true,
  },
  summaryCard: {
    x: 7.7, y: 0.4, w: 5.0, h: 6.2,
    color: '161B22', visible: true, rectRadius: 0.15,
  },
  summaryHeader: {
    x: 8.0, y: 0.65, w: 4.4, h: 0.4,
    fontSize: 13, color: 'FFFFFF', bold: true, visible: true,
  },
  infoRows: {
    x: 8.0, y: 1.2, w: 4.4, h: 1.5,
    fontSize: 10, color: 'FFFFFF', visible: true,
  },
  financialData: {
    x: 8.0, y: 3.2, w: 4.4, h: 2.4,
    fontSize: 12, color: 'FFFFFF', bold: true, visible: true,
  },
  cta: {
    x: 8.0, y: 5.8, w: 4.4, h: 0.45,
    fontSize: 11, color: 'FFFFFF', bold: true, visible: true,
    text: 'Más Información →',
    align: 'center', valign: 'middle',
    rectRadius: 0.05, bgColor: '3A3F47',
  },
  footer: {
    x: 0.6, y: 7.0, w: 12.13, h: 0.3,
    fontSize: 8, color: '8B919B', visible: true,
    text: 'CAPITTAL — Información Confidencial',
  },
};

export const DEFAULT_CLOSING_TEMPLATE: ClosingTemplate = {
  background: { color: 'FFFFFF' },
  logo: {
    x: 10.0, y: 0.5, w: 2.5, h: 1.0,
    visible: true,
    imageUrl: '',
  },
  thanksText: {
    x: 0.8, y: 4.2, w: 6, h: 1,
    fontSize: 40, color: 'FFFFFF', bold: true, visible: true,
    text: 'Gracias',
  },
  email: {
    x: 0.8, y: 5.3, w: 6, h: 0.5,
    fontSize: 14, color: '8B919B', visible: true,
    text: 'lluis@capittal.es',
  },
  docTitle: {
    x: 7, y: 6.0, w: 5.5, h: 0.5,
    fontSize: 12, color: '8B919B', visible: true,
    align: 'right',
  },
  bottomBgColor: '161B22',
};

export const DEFAULT_FULL_TEMPLATE: FullSlideTemplate = {
  cover: DEFAULT_COVER_TEMPLATE,
  index: DEFAULT_INDEX_TEMPLATE,
  separator: DEFAULT_SEPARATOR_TEMPLATE,
  operation: DEFAULT_SLIDE_TEMPLATE,
  closing: DEFAULT_CLOSING_TEMPLATE,
};

// Slide dimensions in inches (LAYOUT_WIDE)
export const SLIDE_WIDTH = 13.33;
export const SLIDE_HEIGHT = 7.5;
