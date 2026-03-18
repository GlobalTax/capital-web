import pptxgen from 'pptxgenjs';
import type { Operation } from '../types/operations';

// ─── DESIGN TOKENS ───
const BLACK = '000000';
const NAVY = '161B22';
const WHITE = 'FFFFFF';
const TEXT_SECONDARY = '58606E';
const TEXT_MUTED = '8B919B';
const BORDER = 'E2E4E8';
const BG_CARD = 'F3F4F5';
const ACCENT = '2563EB';
const FONT = 'Plus Jakarta Sans';

const SW = 13.33;
const SH = 7.5;
const M = 0.6;

// ─── TYPES ───
export type QuarterType = 'Q1' | 'Q2' | 'Q3' | 'Q4';

export interface DealhubSection {
  key: string;
  label: string;
  subtitle: string;
  filter: (op: Operation) => boolean;
}

export const DEALHUB_SECTIONS: DealhubSection[] = [
  {
    key: 'sale_active',
    label: 'Mandatos de Venta',
    subtitle: 'Empresas en proceso de venta',
    filter: (op) => op.project_status === 'active' && (op.deal_type === 'sale' || !op.deal_type),
  },
  {
    key: 'upcoming',
    label: 'Fase de Preparación',
    subtitle: 'Próximamente en mercado',
    filter: (op) => op.project_status === 'upcoming',
  },
  {
    key: 'acquisition',
    label: 'Mandatos de Compra',
    subtitle: 'Empresas en búsqueda de adquisición',
    filter: (op) => op.deal_type === 'acquisition',
  },
  {
    key: 'exclusive',
    label: 'En Exclusividad',
    subtitle: 'Procesos en fase de exclusividad',
    filter: (op) => op.project_status === 'exclusive',
  },
];

// ─── HELPERS ───
const fmtCurrency = (amount: number | undefined): string => {
  if (!amount || amount <= 0) return 'N/D';
  const normalized = amount < 10000 ? amount * 1_000_000 : amount;
  if (normalized >= 1_000_000) return `€${(normalized / 1_000_000).toFixed(1)}M`;
  if (normalized >= 1_000) return `€${(normalized / 1_000).toFixed(0)}K`;
  return `€${normalized.toFixed(0)}`;
};

const fmtMargin = (ebitda: number | undefined, revenue: number | undefined): string => {
  if (!ebitda || !revenue || revenue <= 0) return 'N/D';
  return `${((ebitda / revenue) * 100).toFixed(1)}%`;
};

// ─── SLIDE BUILDERS ───

function addCoverSlide(pptx: pptxgen, quarter: QuarterType, year: number) {
  const slide = pptx.addSlide();
  slide.background = { color: NAVY };

  // Title
  slide.addText('Capittal Dealhub', {
    x: M, y: 2.2, w: SW - M * 2, h: 1,
    fontSize: 40, fontFace: FONT, color: WHITE, bold: true,
  });
  slide.addText('Open Deals', {
    x: M, y: 3.1, w: SW - M * 2, h: 0.7,
    fontSize: 28, fontFace: FONT, color: WHITE, bold: false,
  });

  // Quarter badge
  slide.addText(`${quarter} — ${year}`, {
    x: M, y: 4.2, w: 3, h: 0.5,
    fontSize: 16, fontFace: FONT, color: TEXT_MUTED,
  });

  // Bottom line
  slide.addShape(pptx.ShapeType.rect, {
    x: M, y: SH - 0.8, w: SW - M * 2, h: 0.02, fill: { color: TEXT_MUTED },
  });
  slide.addText('CAPITTAL — Información Confidencial', {
    x: M, y: SH - 0.6, w: SW - M * 2, h: 0.4,
    fontSize: 9, fontFace: FONT, color: TEXT_MUTED,
  });
}

function addIndexSlide(pptx: pptxgen, sectionCounts: Record<string, number>) {
  const slide = pptx.addSlide();
  slide.background = { color: WHITE };

  slide.addText('Índice de Oportunidades', {
    x: M, y: 0.5, w: SW - M * 2, h: 0.8,
    fontSize: 28, fontFace: FONT, color: NAVY, bold: true,
  });

  const cardW = 2.8;
  const cardH = 2.2;
  const gap = 0.3;
  const startX = (SW - (cardW * 4 + gap * 3)) / 2;
  const startY = 2.5;

  const sectionColors = ['2563EB', '7C3AED', 'EA580C', '059669'];

  DEALHUB_SECTIONS.forEach((section, i) => {
    const x = startX + i * (cardW + gap);
    const count = sectionCounts[section.key] || 0;
    const sectionNum = String(i + 1).padStart(2, '0');

    // Card background
    slide.addShape(pptx.ShapeType.roundRect, {
      x, y: startY, w: cardW, h: cardH,
      fill: { color: BG_CARD }, rectRadius: 0.1,
    });

    // Section number
    slide.addText(sectionNum, {
      x: x + 0.2, y: startY + 0.2, w: cardW - 0.4, h: 0.4,
      fontSize: 14, fontFace: FONT, color: sectionColors[i], bold: true,
    });

    // Section label
    slide.addText(section.label, {
      x: x + 0.2, y: startY + 0.7, w: cardW - 0.4, h: 0.5,
      fontSize: 13, fontFace: FONT, color: NAVY, bold: true,
    });

    // Count
    slide.addText(`${count} operaciones`, {
      x: x + 0.2, y: startY + 1.3, w: cardW - 0.4, h: 0.4,
      fontSize: 11, fontFace: FONT, color: TEXT_SECONDARY,
    });

    // Subtitle
    slide.addText(section.subtitle, {
      x: x + 0.2, y: startY + 1.6, w: cardW - 0.4, h: 0.4,
      fontSize: 9, fontFace: FONT, color: TEXT_MUTED, wrap: true,
    });
  });
}

function addSectionSeparator(pptx: pptxgen, sectionNum: string, title: string, subtitle: string) {
  const slide = pptx.addSlide();
  slide.background = { color: NAVY };

  slide.addText(sectionNum, {
    x: M, y: 2.0, w: 2, h: 0.8,
    fontSize: 48, fontFace: FONT, color: ACCENT, bold: true,
  });
  slide.addText(title, {
    x: M, y: 2.9, w: SW - M * 2, h: 0.8,
    fontSize: 32, fontFace: FONT, color: WHITE, bold: true,
  });
  slide.addText(subtitle, {
    x: M, y: 3.7, w: SW - M * 2, h: 0.5,
    fontSize: 14, fontFace: FONT, color: TEXT_MUTED,
  });
}

function addOperationSlide(pptx: pptxgen, op: Operation) {
  const slide = pptx.addSlide();
  slide.background = { color: WHITE };

  const leftW = 6.7;
  const rightX = 7.7;
  const rightW = 5.0;
  const pad = 0.3;
  const innerW = rightW - pad * 2;

  // ─── LEFT COLUMN ───
  // Company name
  slide.addText(op.company_name, {
    x: M, y: 0.4, w: leftW, h: 0.8,
    fontSize: 26, fontFace: FONT, color: NAVY, bold: true,
  });

  // Description (max 600 chars + auto-shrink to prevent overflow)
  const rawDesc = op.description || '';
  const desc = rawDesc.length > 600 ? rawDesc.substring(0, 597) + '...' : rawDesc;
  slide.addText(desc, {
    x: M, y: 1.3, w: leftW, h: 2.8,
    fontSize: 11, fontFace: FONT, color: TEXT_SECONDARY,
    lineSpacingMultiple: 1.4, valign: 'top', wrap: true,
    shrinkText: true,
  });

  // Highlights bullets — positioned well below description box (y=1.3+h=2.8 = 4.1)
  const highlights = op.highlights || [];
  if (highlights.length > 0) {
    slide.addText('Aspectos Destacados', {
      x: M, y: 5.2, w: leftW, h: 0.35,
      fontSize: 11, fontFace: FONT, color: NAVY, bold: true,
    });

    const bulletText = highlights.map(h => ({
      text: h,
      options: { fontSize: 10, fontFace: FONT, color: TEXT_SECONDARY, bullet: { code: '2022' }, lineSpacingMultiple: 1.3 },
    }));
    slide.addText(bulletText as any, {
      x: M + 0.2, y: 5.6, w: leftW - 0.4, h: 1.2,
      valign: 'top',
    });
  }

  // ─── RIGHT COLUMN — Dark card ───
  const cardY = 0.4;
  const cardH = 6.2;

  slide.addShape(pptx.ShapeType.roundRect, {
    x: rightX, y: cardY, w: rightW, h: cardH,
    fill: { color: NAVY }, rectRadius: 0.15,
  });

  // "Resumen" header
  slide.addText('Resumen', {
    x: rightX + pad, y: cardY + 0.25, w: innerW, h: 0.4,
    fontSize: 13, fontFace: FONT, color: WHITE, bold: true,
  });

  // Info rows — Ubicación & Sector side-by-side label:value
  const simpleRows = [
    { label: 'Ubicación', value: 'España' },
    { label: 'Sector', value: op.sector || 'N/D' },
  ];

  let infoY = cardY + 0.8;
  simpleRows.forEach((row) => {
    slide.addText(row.label, {
      x: rightX + pad, y: infoY, w: 1.5, h: 0.3,
      fontSize: 9, fontFace: FONT, color: TEXT_MUTED,
    });
    slide.addText(row.value, {
      x: rightX + pad + 1.5, y: infoY, w: innerW - 1.5, h: 0.3,
      fontSize: 10, fontFace: FONT, color: WHITE, bold: true, wrap: true,
    });
    infoY += 0.45;
  });

  // Oportunidad — label stacked above value for full width
  const oportunidadText = op.short_description || op.deal_type || 'Venta';
  slide.addText('Oportunidad', {
    x: rightX + pad, y: infoY, w: innerW, h: 0.25,
    fontSize: 9, fontFace: FONT, color: TEXT_MUTED,
  });
  infoY += 0.25;
  slide.addText(oportunidadText, {
    x: rightX + pad, y: infoY, w: innerW, h: 0.7,
    fontSize: 10, fontFace: FONT, color: WHITE, bold: true, wrap: true, valign: 'top',
  });
  infoY += 0.7;

  // Separator line
  const sepY = infoY + 0.15;
  slide.addShape(pptx.ShapeType.rect, {
    x: rightX + pad, y: sepY, w: innerW, h: 0.01,
    fill: { color: TEXT_MUTED },
  });

  // "Datos Clave" header
  slide.addText('Datos Clave', {
    x: rightX + pad, y: sepY + 0.15, w: innerW, h: 0.4,
    fontSize: 13, fontFace: FONT, color: WHITE, bold: true,
  });

  // Financial data
  const financialRows = [
    { label: 'Facturación', value: fmtCurrency(op.revenue_amount) },
    { label: 'EBITDA', value: fmtCurrency(op.ebitda_amount) },
    { label: 'Margen EBITDA', value: fmtMargin(op.ebitda_amount, op.revenue_amount) },
    { label: 'Empleados', value: op.company_size_employees || 'N/D' },
  ];

  financialRows.forEach((row, i) => {
    const rowY = sepY + 0.65 + i * 0.55;
    slide.addText(row.label, {
      x: rightX + pad, y: rowY, w: 1.8, h: 0.3,
      fontSize: 9, fontFace: FONT, color: TEXT_MUTED,
    });
    slide.addText(row.value, {
      x: rightX + pad + 1.8, y: rowY, w: innerW - 1.8, h: 0.3,
      fontSize: 12, fontFace: FONT, color: WHITE, bold: true, align: 'right',
    });
  });

  // "Más Información" CTA
  slide.addShape(pptx.ShapeType.roundRect, {
    x: rightX + pad, y: cardY + cardH - 0.8, w: innerW, h: 0.45,
    fill: { color: '3A3F47' }, rectRadius: 0.05,
  });
  slide.addText('Más Información →', {
    x: rightX + pad, y: cardY + cardH - 0.8, w: innerW, h: 0.45,
    fontSize: 11, fontFace: FONT, color: WHITE, bold: true, align: 'center', valign: 'middle',
  });

  // Footer
  slide.addText('CAPITTAL — Información Confidencial', {
    x: M, y: SH - 0.5, w: SW - M * 2, h: 0.3,
    fontSize: 8, fontFace: FONT, color: TEXT_MUTED,
  });
}

// ─── MAIN EXPORT ───

export async function generateDealhubPptx(
  operations: Operation[],
  selectedSections: string[],
  quarter: QuarterType,
  year?: number,
) {
  const currentYear = year || new Date().getFullYear();
  const activeOps = operations.filter(op => op.is_active && !op.is_deleted);

  const pptx = new pptxgen();
  pptx.layout = 'LAYOUT_WIDE';
  pptx.author = 'Capittal';
  pptx.title = `Capittal Dealhub - Open Deals ${quarter} ${currentYear}`;

  // Compute section counts
  const sectionCounts: Record<string, number> = {};
  DEALHUB_SECTIONS.forEach(s => {
    sectionCounts[s.key] = activeOps.filter(s.filter).length;
  });

  // 1. Cover
  addCoverSlide(pptx, quarter, currentYear);

  // 2. Index
  addIndexSlide(pptx, sectionCounts);

  // 3. Sections
  DEALHUB_SECTIONS.forEach((section, i) => {
    if (!selectedSections.includes(section.key)) return;
    const ops = activeOps.filter(section.filter);
    if (ops.length === 0) return;

    const sectionNum = String(i + 1).padStart(2, '0');
    addSectionSeparator(pptx, sectionNum, section.label, section.subtitle);

    ops.forEach(op => addOperationSlide(pptx, op));
  });

  await pptx.writeFile({ fileName: `Capittal_Dealhub_${quarter}_${currentYear}.pptx` });
}
