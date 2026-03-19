// ─── SLIDE TEMPLATE TYPES ───

export interface BlockConfig {
  x: number;
  y: number;
  w: number;
  h: number;
  fontSize?: number;
  color?: string;
  bold?: boolean;
  visible: boolean;
}

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

// Matches current hardcoded values from generateDealhubPptx.ts
export const DEFAULT_SLIDE_TEMPLATE: SlideTemplate = {
  title: {
    x: 0.6, y: 0.4, w: 6.7, h: 0.8,
    fontSize: 26, color: '161B22', bold: true, visible: true,
  },
  description: {
    x: 0.6, y: 1.3, w: 6.7, h: 2.8,
    fontSize: 11, color: '58606E', bold: false, visible: true,
  },
  highlights: {
    x: 0.6, y: 5.2, w: 6.7, h: 1.55,
    fontSize: 11, color: '161B22', bold: true, visible: true,
  },
  summaryCard: {
    x: 7.7, y: 0.4, w: 5.0, h: 6.2,
    color: '161B22', visible: true,
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
  },
  footer: {
    x: 0.6, y: 7.0, w: 12.13, h: 0.3,
    fontSize: 8, color: '8B919B', visible: true,
    text: 'CAPITTAL — Información Confidencial',
  },
};

// Slide dimensions in inches (LAYOUT_WIDE)
export const SLIDE_WIDTH = 13.33;
export const SLIDE_HEIGHT = 7.5;
