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
}

export type CoverBlockKey = keyof CoverTemplate;

export const COVER_BLOCK_LABELS: Record<CoverBlockKey, string> = {
  background: 'Fondo',
  logo: 'Logo',
  title: 'Título Principal',
  subtitle: 'Subtítulo',
  quarter: 'Trimestre',
  divider: 'Línea Separadora',
  footer: 'Footer',
};

export const COVER_BLOCK_COLORS: Record<CoverBlockKey, string> = {
  background: '#374151',
  logo: '#10b981',
  title: '#3b82f6',
  subtitle: '#8b5cf6',
  quarter: '#f59e0b',
  divider: '#6b7280',
  footer: '#6b7280',
};

// ─── INDEX SLIDE ───

export interface IndexTemplate {
  background: { color: string };
  title: BlockConfig;
  cardsStartX: number;
  cardsStartY: number;
  cardW: number;
  cardH: number;
  cardGap: number;
  cardBgColor: string;
  cardRadius: number;
  sectionColors: [string, string, string, string];
}

export type IndexBlockKey = 'background' | 'title';

export const INDEX_BLOCK_LABELS: Record<IndexBlockKey, string> = {
  background: 'Fondo',
  title: 'Título',
};

export const INDEX_BLOCK_COLORS: Record<IndexBlockKey, string> = {
  background: '#374151',
  title: '#3b82f6',
};

// ─── SEPARATOR SLIDE ───

export interface SeparatorTemplate {
  background: { color: string };
  number: BlockConfig;
  title: BlockConfig;
  subtitle: BlockConfig;
  accentColor: string;
}

export type SeparatorBlockKey = keyof Omit<SeparatorTemplate, 'accentColor'>;

export const SEPARATOR_BLOCK_LABELS: Record<SeparatorBlockKey, string> = {
  background: 'Fondo',
  number: 'Número',
  title: 'Título',
  subtitle: 'Subtítulo',
};

export const SEPARATOR_BLOCK_COLORS: Record<SeparatorBlockKey, string> = {
  background: '#374151',
  number: '#2563eb',
  title: '#3b82f6',
  subtitle: '#6b7280',
};

// ─── FULL TEMPLATE ───

export interface FullSlideTemplate {
  cover: CoverTemplate;
  index: IndexTemplate;
  separator: SeparatorTemplate;
  operation: SlideTemplate;
}

export type SlideType = keyof FullSlideTemplate;

// ─── DEFAULTS ───

export const DEFAULT_COVER_TEMPLATE: CoverTemplate = {
  background: { color: '161B22' },
  logo: {
    x: 0.6, y: 0.5, w: 2.5, h: 1.2,
    visible: true,
    imageUrl: '',
  },
  title: {
    x: 0.6, y: 2.2, w: 12.13, h: 1,
    fontSize: 40, color: 'FFFFFF', bold: true, visible: true,
    text: 'Capittal Dealhub',
  },
  subtitle: {
    x: 0.6, y: 3.1, w: 12.13, h: 0.7,
    fontSize: 28, color: 'FFFFFF', bold: false, visible: true,
    text: 'Open Deals',
  },
  quarter: {
    x: 0.6, y: 4.2, w: 3, h: 0.5,
    fontSize: 16, color: '8B919B', visible: true,
  },
  divider: {
    x: 0.6, y: 6.7, w: 12.13, h: 0.02,
    visible: true, bgColor: '8B919B',
  },
  footer: {
    x: 0.6, y: 6.9, w: 12.13, h: 0.4,
    fontSize: 9, color: '8B919B', visible: true,
    text: 'CAPITTAL — Información Confidencial',
  },
};

export const DEFAULT_INDEX_TEMPLATE: IndexTemplate = {
  background: { color: 'FFFFFF' },
  title: {
    x: 0.6, y: 0.5, w: 12.13, h: 0.8,
    fontSize: 28, color: '161B22', bold: true, visible: true,
  },
  cardsStartX: 1.265,
  cardsStartY: 2.5,
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
    x: 0.6, y: 2.0, w: 2, h: 0.8,
    fontSize: 48, color: '2563EB', bold: true, visible: true,
  },
  title: {
    x: 0.6, y: 2.9, w: 12.13, h: 0.8,
    fontSize: 32, color: 'FFFFFF', bold: true, visible: true,
  },
  subtitle: {
    x: 0.6, y: 3.7, w: 12.13, h: 0.5,
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

export const DEFAULT_FULL_TEMPLATE: FullSlideTemplate = {
  cover: DEFAULT_COVER_TEMPLATE,
  index: DEFAULT_INDEX_TEMPLATE,
  separator: DEFAULT_SEPARATOR_TEMPLATE,
  operation: DEFAULT_SLIDE_TEMPLATE,
};

// Slide dimensions in inches (LAYOUT_WIDE)
export const SLIDE_WIDTH = 13.33;
export const SLIDE_HEIGHT = 7.5;
